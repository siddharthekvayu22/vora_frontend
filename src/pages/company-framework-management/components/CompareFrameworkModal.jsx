import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import Icon from "../../../components/Icon";
import { Button } from "@/components/ui/button";
import { getAllOfficialFrameworks } from "../../../services/officialFrameworkService";
import { compareFrameworks } from "../../../services/companyFrameworkService";

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

export default function CompareFrameworkModal({
  isOpen,
  onClose,
  onSuccess,
  companyFramework,
}) {
  const [officialFrameworks, setOfficialFrameworks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchOfficialFrameworks();
    }
  }, [isOpen, currentPage]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchValue) => {
      setIsSearching(true);
      setCurrentPage(1); // Reset to first page on search
      fetchOfficialFrameworks(searchValue);
    }, 1000), // 1000ms delay
    [],
  );

  // Reset searching state when loading changes
  useEffect(() => {
    if (!loading) {
      setIsSearching(false);
    }
  }, [loading]);

  const fetchOfficialFrameworks = async (search = searchTerm) => {
    try {
      setLoading(true);
      const response = await getAllOfficialFrameworks({
        page: currentPage,
        limit: 5,
        search: search,
      });

      if (response.success) {
        setOfficialFrameworks(response.data);
        setPagination(response.pagination);
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch official frameworks");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleCompare = async () => {
    if (!selectedFramework) {
      toast.error("Please select an official framework to compare");
      return;
    }

    if (!companyFramework?.aiUpload?.job_id) {
      toast.error("Company framework job ID not found");
      return;
    }

    if (!selectedFramework?.aiUpload?.job_id) {
      toast.error("Official framework job ID not found");
      return;
    }

    try {
      setComparing(true);
      const response = await compareFrameworks(
        companyFramework.aiUpload.job_id,
        selectedFramework.aiUpload.job_id,
      );

      if (response.success) {
        toast.success(
          response.message || "Framework comparison started successfully",
        );

        // Call onSuccess if provided, otherwise call handleClose
        if (onSuccess) {
          await onSuccess();
        } else {
          handleClose();
        }
      }
    } catch (error) {
      toast.error(error.message || "Failed to start comparison");
    } finally {
      setComparing(false);
    }
  };

  const handleClose = () => {
    setSelectedFramework(null);
    setSearchTerm("");
    setCurrentPage(1);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10000 animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="bg-background rounded-2xl shadow-2xl max-w-[700px] w-[90%] max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-300 border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-linear-to-br from-primary to-primary/80 text-white p-6 relative overflow-hidden min-h-[80px]">
          <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-white/10 rounded-full transform translate-x-[40%] -translate-y-[40%]"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon name="shield-check" size="24px" />
              <div>
                <h2 className="text-xl font-bold text-white drop-shadow-sm">
                  Compare Framework
                </h2>
                <p className="text-xs text-white/80 mt-0.5">
                  Select an official framework to compare with{" "}
                  {companyFramework?.frameworkName}
                </p>
              </div>
            </div>
            <Button
              className="bg-white/10 border border-white/20 text-white backdrop-blur-sm rounded-full w-9 h-9 flex items-center justify-center hover:bg-white/20 hover:border-white/40 hover:scale-105 transition-all duration-200 cursor-pointer"
              onClick={handleClose}
              disabled={comparing}
              title="Close"
            >
              <Icon name="x" size="20px" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <div className="relative flex items-center gap-3 bg-background border border-border rounded-lg px-3 py-2.5 transition-all duration-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 focus-within:shadow-sm">
            <Icon
              name="search"
              size="14px"
              className="text-muted-foreground shrink-0"
            />
            <input
              type="text"
              placeholder="Search official frameworks..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="flex-1 border-none bg-transparent text-foreground text-sm outline-none placeholder:text-muted-foreground"
            />
            {isSearching && (
              <div className="flex items-center justify-center shrink-0">
                <div className="w-3 h-3 border-2 border-border border-t-primary rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>

        {/* Framework List */}
        <div className="flex-1 overflow-y-auto px-4 py-3 sidebar-scroll">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                <p className="text-sm text-muted-foreground">
                  Loading frameworks...
                </p>
              </div>
            </div>
          ) : officialFrameworks.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Icon
                  name="document"
                  size="48px"
                  className="text-muted-foreground/50 mx-auto mb-3"
                />
                <p className="text-sm font-medium text-foreground">
                  No official frameworks found
                </p>
                {searchTerm && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Try adjusting your search criteria
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {officialFrameworks.map((framework) => {
                const isSelected = selectedFramework?.id === framework.id;
                const canCompare =
                  framework.aiUpload?.status === "completed" &&
                  framework.aiUpload?.job_id;

                return (
                  <button
                    key={framework.id}
                    onClick={() =>
                      canCompare && setSelectedFramework(framework)
                    }
                    className={`p-3 w-full cursor-pointer rounded-xl border-2 transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : canCompare
                          ? "border-border hover:border-primary/50 hover:bg-muted/50 cursor-pointer"
                          : "border-border bg-muted/30 cursor-not-allowed opacity-60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <h3 className="font-semibold text-sm text-foreground truncate">
                            {framework.frameworkName}
                          </h3>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-secondary/15 text-secondary uppercase">
                            {framework.frameworkCode}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap mb-2">
                          <span className="inline-flex items-center gap-1">
                            <Icon name="tag" size="12px" />v
                            {framework.currentVersion}
                          </span>
                          <span>•</span>
                          <span className="truncate">
                            {framework.fileInfo?.originalFileName}
                          </span>
                          <span>•</span>
                          <span>{framework.fileInfo?.fileSize}</span>
                        </div>
                        {framework.aiUpload && (
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                framework.aiUpload.status === "completed"
                                  ? "bg-green-500/15 text-green-600 dark:text-green-400"
                                  : framework.aiUpload.status === "processing"
                                    ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                                    : "bg-gray-500/15 text-gray-600 dark:text-gray-400"
                              }`}
                            >
                              {framework.aiUpload.status}
                            </span>
                            {framework.aiUpload.controls?.total_controls && (
                              <span className="text-[10px] text-muted-foreground">
                                {framework.aiUpload.controls.total_controls}{" "}
                                controls
                              </span>
                            )}
                          </div>
                        )}
                        {!canCompare && (
                          <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                            <Icon name="warning" size="12px" />
                            AI processing not completed
                          </p>
                        )}
                      </div>
                      {isSelected && (
                        <div className="shrink-0">
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <Icon
                              name="check"
                              size="14px"
                              className="text-white"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-4 py-2 border-t border-border bg-muted/30">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Page {pagination.currentPage} of {pagination.totalPages} (
                {pagination.totalItems} total)
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={!pagination.hasPrevPage || loading}
                  className="h-8 px-3"
                >
                  <Icon name="arrow-left" size="14px" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={!pagination.hasNextPage || loading}
                  className="h-8 px-3"
                >
                  <Icon name="arrow-right" size="14px" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-2 justify-end p-3 border-t border-border">
          <Button
            type="button"
            variant="outline"
            className="flex-1 rounded-lg"
            onClick={handleClose}
            disabled={comparing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCompare}
            disabled={!selectedFramework || comparing}
            className="flex-1 inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {comparing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Comparing...
              </>
            ) : (
              <>
                <Icon name="shield-check" size="16px" />
                Compare Frameworks
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
