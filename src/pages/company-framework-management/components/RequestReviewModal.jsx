import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import Icon from "@/components/Icon";
import { getAllUsers } from "@/services/userService";
import CustomBadge from "@/components/custom/CustomBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requestExpertReview } from "@/services/companyFrameworkService";

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function RequestReviewModal({
  frameworkId,
  frameworkName,
  onSuccess,
  onClose,
}) {
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [requesting, setRequesting] = useState(false);

  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 5,
    hasPrevPage: false,
    hasNextPage: false,
  });
  const [searchTerm, setSearchTerm] = useState("");

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchExperts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.currentPage,
        limit: pagination.limit,
        search: debouncedSearchTerm,
        role: "expert",
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      const res = await getAllUsers(params);

      setExperts(res.data || []);
      setPagination((p) => ({
        ...p,
        totalPages: res.pagination?.totalPages || 1,
        totalItems: res.pagination?.totalItems || 0,
        hasPrevPage: pagination.currentPage > 1,
        hasNextPage: pagination.currentPage < (res.pagination?.totalPages || 1),
      }));
    } catch (err) {
      toast.error(err.message || "Failed to load experts");
      setExperts([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.limit, debouncedSearchTerm]);

  useEffect(() => {
    fetchExperts();
  }, [fetchExperts]);

  const handlePageChange = (page) => {
    setPagination((p) => ({ ...p, currentPage: page }));
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setPagination((p) => ({ ...p, currentPage: 1 }));
  };

  const handleExpertSelect = (expert) => {
    setSelectedExpert(selectedExpert?.id === expert.id ? null : expert);
  };

  const handleRequestReview = async () => {
    if (!selectedExpert) {
      toast.error("Please select an expert");
      return;
    }

    setRequesting(true);
    try {
      const response = await requestExpertReview(frameworkId, {
        expertId: selectedExpert.id,
      });
      toast.success(response.message || "Review requested successfully");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to request review");
    } finally {
      setRequesting(false);
    }
  };

  const renderExpertRow = (expert) => (
    <tr
      key={expert.id}
      onClick={() => handleExpertSelect(expert)}
      className={`cursor-pointer transition-all duration-200 hover:bg-muted/80 ${
        selectedExpert?.id === expert.id
          ? "bg-primary/10 border-l-4 border-primary"
          : "border-l-4 border-transparent"
      }`}
    >
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
            <Icon name="user" size="14px" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-foreground text-sm line-clamp-1">
              {expert.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {expert.email}
            </span>
          </div>
        </div>
      </td>
      <td className="px-3 py-2">
        <div className="flex justify-end">
          <CustomBadge label={expert.role} color="green">
            {expert.role}
          </CustomBadge>
        </div>
      </td>
    </tr>
  );

  const renderPagination = () => (
    <div className="flex items-center justify-between px-3 py-2 border-t border-border">
      <div className="text-xs text-muted-foreground">
        Showing {(pagination.currentPage - 1) * pagination.limit + 1} to{" "}
        {Math.min(
          pagination.currentPage * pagination.limit,
          pagination.totalItems,
        )}{" "}
        of {pagination.totalItems} results
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => handlePageChange(pagination.currentPage - 1)}
          disabled={!pagination.hasPrevPage}
          className="px-2 py-1 text-xs border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          Previous
        </button>
        <span className="text-xs text-muted-foreground px-2">
          Page {pagination.currentPage} of {pagination.totalPages}
        </span>
        <button
          onClick={() => handlePageChange(pagination.currentPage + 1)}
          disabled={!pagination.hasNextPage}
          className="px-2 py-1 text-xs border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          Next
        </button>
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10000 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-background rounded shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-5 duration-300 sidebar-scroll border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-linear-to-br from-primary to-primary/80 text-white p-4 relative overflow-hidden min-h-17.5">
          <div className="absolute top-0 right-0 w-30 h-30 bg-white/10 rounded-full transform translate-x-[40%] -translate-y-[40%]"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="user-check" size="22px" />
              <div>
                <h2 className="text-lg font-bold text-white drop-shadow-sm">
                  Request Expert Review
                </h2>
                <p className="text-xs text-white/80">
                  Select an expert to review: {frameworkName}
                </p>
              </div>
            </div>
            <Button
              size="icon"
              className="bg-white/10 border border-white/20 text-white backdrop-blur-sm rounded-full w-9 h-9 flex items-center justify-center hover:bg-white/20 hover:border-white/40 hover:scale-105 transition-all duration-200 cursor-pointer"
              onClick={onClose}
              title="Close"
            >
              <Icon name="x" size="20px" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-160px)]">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Icon
                  name="users"
                  size="16px"
                  className="text-purple-600 dark:text-purple-400"
                />
                Select Expert
              </h3>
              {selectedExpert && (
                <span className="text-xs text-green-800 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">
                  Selected: {selectedExpert.name}
                </span>
              )}
            </div>

            <div className="border border-border rounded bg-background">
              {/* Search */}
              <div className="p-3 border-b border-border bg-muted/30">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none">
                    <Icon
                      name="search"
                      size="14px"
                      className="text-muted-foreground"
                    />
                  </div>
                  <Input
                    type="text"
                    placeholder="Search experts..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/80 border-b border-border">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Expert
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider pr-12">
                        Role
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loading ? (
                      <tr>
                        <td colSpan="2" className="px-3 py-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-muted-foreground text-sm">
                              Loading experts...
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : experts.length === 0 ? (
                      <tr>
                        <td
                          colSpan="2"
                          className="px-3 py-6 text-center text-muted-foreground text-sm"
                        >
                          No experts found
                        </td>
                      </tr>
                    ) : (
                      experts.map(renderExpertRow)
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {!loading && experts.length > 0 && renderPagination()}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 justify-end p-3 border-t border-border">
          <Button
            onClick={onClose}
            type="button"
            variant="outline"
            className="flex-1 rounded"
          >
            Cancel
          </Button>
          <Button
            onClick={handleRequestReview}
            disabled={!selectedExpert || requesting}
            className="flex-1 inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {requesting ? (
              <>
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Requesting...
              </>
            ) : (
              <>
                <Icon name="check" size="14px" />
                Request Review
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
