import { useState, useCallback, useEffect } from "react";
import Icon from "../Icon";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Reusable DataTable Component
 * Features: sorting, pagination, search/filtering, loading states, empty states
 *
 * @param {Array} columns - Column configuration array [{key, label, sortable, render}]
 * @param {Array} data - Array of data objects
 * @param {Object} pagination - Pagination config {currentPage, totalPages, totalItems, limit, onPageChange}
 * @param {Function} onSearch - Search handler function
 * @param {Function} onSort - Sort handler function (for server-side sorting)
 * @param {Object} sortConfig - Current sort configuration {sortBy, sortOrder}
 * @param {boolean} loading - Loading state
 * @param {string} emptyMessage - Message to show when no data
 * @param {Function} renderActions - Function to render action buttons for each row
 * @param {string} searchPlaceholder - Placeholder text for search input
 * @param {Function} renderHeaderActions - Function to render custom actions in table header
 */
export default function DataTable({
  columns = [],
  data = [],
  pagination = null,
  onSearch,
  onSort,
  sortConfig = { sortBy: null, sortOrder: "asc" },
  loading = false,
  emptyMessage = "No data found",
  renderActions,
  searchPlaceholder = "Search...",
  onRefresh,
  searchTerm: externalSearchTerm = "",
  onClearSearch,
  renderHeaderActions,
}) {
  const [searchTerm, setSearchTerm] = useState(externalSearchTerm);
  const [isSearching, setIsSearching] = useState(false);

  // Sync external search term with internal state
  useEffect(() => {
    setSearchTerm(externalSearchTerm);
    setIsSearching(false); // Reset searching state when external term changes
  }, [externalSearchTerm]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchValue) => {
      if (onSearch) {
        setIsSearching(true);
        onSearch(searchValue);
      }
    }, 1000), // 1000ms delay
    [onSearch],
  );

  // Reset searching state when loading changes
  useEffect(() => {
    if (!loading) {
      setIsSearching(false);
    }
  }, [loading]);

  // Handle sorting
  const handleSort = (key) => {
    if (!columns.find((col) => col.key === key)?.sortable) return;

    // Use server-side sorting if onSort function is provided
    if (onSort) {
      onSort(key);
    } else {
      // Fallback to client-side sorting (legacy behavior)
      console.warn(
        "Client-side sorting with server-side pagination is not recommended",
      );
    }
  };

  // Ensure data is always an array
  const sortedData = Array.isArray(data) ? data : [];

  // Handle search with debouncing
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    // Use debounced search instead of immediate API call
    debouncedSearch(value);
  };

  const getSerialNumber = (index, pagination) => {
    if (!pagination) return index + 1;
    return (pagination.currentPage - 1) * pagination.limit + index + 1;
  };

  // Render sort indicator
  const renderSortIndicator = (column) => {
    if (!column.sortable) return null;

    if (sortConfig.sortBy === column.key) {
      return (
        <span className="opacity-100 text-blue-500">
          <Icon
            name={sortConfig.sortOrder === "asc" ? "arrow-up" : "arrow-down"}
            size="12px"
          />
        </span>
      );
    }
    return (
      <span className="opacity-30 transition-opacity duration-200">
        <Icon name="arrow-up" size="12px" />
      </span>
    );
  };

  return (
    <div className="bg-card border border-border rounded overflow-hidden shadow-sm">
      {/* Table Header with Search */}
      <div className="flex justify-between items-center p-4 border-b border-border bg-linear-to-r from-card to-muted/30">
        <div className="relative flex items-center gap-3 flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Icon name="search" size="14px" className="text-muted-foreground" />
          </div>
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-9 pr-20"
          />
          <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-3">
            {isSearching && (
              <div className="flex items-center justify-center">
                <div className="w-3 h-3 border-2 border-border border-t-primary rounded-full animate-spin"></div>
              </div>
            )}
            {searchTerm && !isSearching && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSearchTerm("");
                  // Clear search should be immediate, not debounced
                  if (onClearSearch) {
                    onClearSearch();
                  } else if (onSearch) {
                    onSearch("");
                  }
                }}
                className="h-5 w-5 hover:bg-accent rounded-full"
                title="Clear search"
              >
                <Icon name="x" size="12px" />
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {renderHeaderActions && renderHeaderActions()}
          {onRefresh && (
            <Button
              size="lg"
              className="flex items-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onRefresh}
              disabled={loading}
            >
              <Icon name="refresh" size="16px" />
              Refresh
            </Button>
          )}
        </div>
      </div>

      {/* Table Container with Scrollable Body and Sticky Header */}
      <div
        className="overflow-auto sidebar-scroll"
        style={{ maxHeight: "calc(100vh - 250px)" }}
      >
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-muted">
            <tr className="bg-linear-to-r from-muted to-muted/50">
              <th className="w-16 px-4 py-2.5 text-left border-b border-border font-semibold text-xs text-muted-foreground uppercase tracking-wider whitespace-nowrap bg-muted">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                    #
                  </span>
                </div>
              </th>
              {columns.map((column) => (
                <th
                  key={column.key}
                  onClick={() => handleSort(column.key)}
                  className={`px-4 py-2.5 text-left border-b border-border font-semibold text-xs text-muted-foreground uppercase tracking-wider whitespace-nowrap bg-muted ${
                    column.sortable
                      ? "cursor-pointer select-none transition-all duration-200 hover:bg-accent/50 hover:text-primary"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.label}</span>
                    {renderSortIndicator(column)}
                  </div>
                </th>
              ))}
              {renderActions && (
                <th className="w-20 px-2 py-2.5 text-center border-b border-border font-semibold text-xs text-muted-foreground uppercase tracking-wider whitespace-nowrap bg-muted">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + 1 + (renderActions ? 1 : 0)}
                  className="text-center py-12 px-4"
                >
                  <div className="flex flex-col items-center gap-4 text-muted-foreground">
                    <div className="relative">
                      <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin"></div>
                      <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-primary/30 rounded-full animate-spin animation-delay-150"></div>
                    </div>
                    <div className="text-center">
                      <p className="font-medium">Loading data...</p>
                      <p className="text-sm text-muted-foreground/70">
                        Please wait while we fetch the information
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : sortedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1 + (renderActions ? 1 : 0)}
                  className="text-center py-12 px-4"
                >
                  <div className="flex flex-col items-center gap-4 text-muted-foreground">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                      <Icon name="folder" size="32px" className="opacity-50" />
                    </div>
                    <div className="text-center">
                      <p className="text-base font-medium text-muted-foreground">
                        {emptyMessage}
                      </p>
                      <p className="text-sm text-muted-foreground/70 mt-1">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              sortedData.map((row, index) => (
                <tr
                  key={row.id || index}
                  className="transition-all duration-200 hover:bg-accent/30 group"
                >
                  {/* SR NO */}
                  <td className="w-16 px-4 py-2.5 text-sm text-foreground align-middle">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs font-medium group-hover:bg-primary/10 group-hover:text-primary transition-all duration-200">
                      {getSerialNumber(index, pagination)}
                    </div>
                  </td>
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-4 py-2.5 text-sm text-foreground align-middle"
                    >
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key]}
                    </td>
                  ))}
                  {renderActions && (
                    <td className="w-20 px-2 py-2.5 text-center align-middle">
                      {renderActions(row)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 0 && (
        <div className="flex justify-between items-center px-4 py-3 border-t border-border bg-muted flex-wrap gap-4 text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="text-sm">
              Showing {(pagination.currentPage - 1) * pagination.limit + 1} to{" "}
              {Math.min(
                pagination.currentPage * pagination.limit,
                pagination.totalItems,
              )}{" "}
              of {pagination.totalItems} entries
            </div>
            {pagination.onLimitChange && (
              <div className="flex items-center gap-2">
                <Label className="text-sm whitespace-nowrap">Per page:</Label>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="xs"
                      className="justify-between rounded min-w-12.5 select-none"
                      disabled={loading}
                    >
                      <span>{pagination.limit}</span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="center"
                    className="min-w-12.5 p-0 rounded"
                  >
                    {["5", "10", "25", "50", "100"].map((value) => (
                      <DropdownMenuItem
                        key={value}
                        className="justify-center cursor-pointer"
                        onClick={() => pagination.onLimitChange(Number(value))}
                      >
                        {value}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded"
              onClick={() => pagination.onPageChange(1)}
              disabled={!pagination.hasPrevPage || loading}
              title="First page"
            >
              <Icon name="left-dubble-arrow" size="14px" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="rounded"
              onClick={() =>
                pagination.onPageChange(pagination.currentPage - 1)
              }
              disabled={!pagination.hasPrevPage || loading}
              title="Previous page"
            >
              <Icon name="arrow-left" size="14px" />
            </Button>

            <div className="flex items-center gap-2 select-none">
              {generatePageNumbers(
                pagination.currentPage,
                pagination.totalPages,
              ).map((page, idx) =>
                page === "..." ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="text-muted-foreground px-2"
                  >
                    ...
                  </span>
                ) : (
                  <Button
                    key={page}
                    variant={
                      page === pagination.currentPage ? "default" : "ghost"
                    }
                    size="sm"
                    onClick={() => pagination.onPageChange(page)}
                    disabled={loading}
                    className={
                      page === pagination.currentPage
                        ? "font-semibold rounded"
                        : "border-transparent"
                    }
                  >
                    {page}
                  </Button>
                ),
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="rounded"
              onClick={() =>
                pagination.onPageChange(pagination.currentPage + 1)
              }
              disabled={!pagination.hasNextPage || loading}
              title="Next page"
            >
              <Icon name="arrow-right" size="14px" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="rounded disabled:cursor-not-allowed"
              onClick={() => pagination.onPageChange(pagination.totalPages)}
              disabled={!pagination.hasNextPage || loading}
              title="Last page"
            >
              <Icon name="right-dubble-arrow" size="14px" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to generate page numbers with ellipsis
function generatePageNumbers(currentPage, totalPages) {
  const pages = [];
  const delta = 2;

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);

    if (currentPage > delta + 2) {
      pages.push("...");
    }

    const start = Math.max(2, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - delta - 1) {
      pages.push("...");
    }

    pages.push(totalPages);
  }

  return pages;
}
