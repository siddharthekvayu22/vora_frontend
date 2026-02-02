import { useEffect, useCallback, useState } from "react";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import Icon from "../../components/Icon";
import DataTable from "../../components/data-table/DataTable";
import { getOfficialFrameworkCategory } from "../../services/officialFrameworkService";
import { formatDate } from "../../utils/dateFormatter";
import RequestAccessModal from "./components/RequestAccessModal";

function OfficialFrameworkCategory() {
  const [officialFrameworkCategory, setOfficialFrameworkCategory] = useState(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [emptyMessage, setEmptyMessage] = useState(
    "No official framework category found",
  );

  const [searchParams, setSearchParams] = useSearchParams();

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
    hasPrevPage: false,
    hasNextPage: false,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const [requestModalState, setRequestModalState] = useState({
    isOpen: false,
    framework: null,
  });

  /* ---------------- URL SYNC ---------------- */
  useEffect(() => {
    const page = parseInt(searchParams.get("page")) || 1;
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    setPagination((p) => ({ ...p, currentPage: page }));
    setSearchTerm(search);
    setSortConfig({ sortBy, sortOrder });
  }, [searchParams]);

  /* ---------------- FETCH DATA ---------------- */
  const fetchOfficialFrameworkCategory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getOfficialFrameworkCategory({
        page: pagination.currentPage,
        limit: pagination.limit,
        search: searchTerm,
        sortBy: sortConfig.sortBy,
        sortOrder: sortConfig.sortOrder,
      });

      setOfficialFrameworkCategory(res.data || []);

      if (res.message && res.data?.length === 0) {
        setEmptyMessage(res.message);
      } else if (searchTerm && res.data?.length === 0) {
        setEmptyMessage(
          `No official framework category found for "${searchTerm}"`,
        );
      } else {
        setEmptyMessage("No official framework category found");
      }

      setPagination((p) => ({
        ...p,
        totalPages: res.pagination?.totalPages || 1,
        totalItems: res.pagination?.totalItems || 0,
        hasPrevPage: pagination.currentPage > 1,
        hasNextPage: pagination.currentPage < (res.pagination?.totalPages || 1),
      }));
    } catch (err) {
      toast.error(err.message || "Failed to load official framework category");
      setOfficialFrameworkCategory([]);
      setEmptyMessage("Failed to load official framework category");
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.limit, searchTerm, sortConfig]);

  useEffect(() => {
    fetchOfficialFrameworkCategory();
  }, [fetchOfficialFrameworkCategory]);

  /* ---------------- HANDLERS ---------------- */
  const handlePageChange = (page) => {
    const p = new URLSearchParams(searchParams);
    p.set("page", page);
    setSearchParams(p);
  };

  const handleSearch = (term) => {
    const p = new URLSearchParams(searchParams);
    term ? p.set("search", term) : p.delete("search");
    p.set("page", "1");
    setSearchParams(p);
  };

  const handleSort = (key) => {
    const order =
      sortConfig.sortBy === key && sortConfig.sortOrder === "asc"
        ? "desc"
        : "asc";

    const p = new URLSearchParams(searchParams);
    p.set("sortBy", key);
    p.set("sortOrder", order);
    p.set("page", "1");
    setSearchParams(p);

    setSortConfig({ sortBy: key, sortOrder: order });
  };

  /* ---------------- REQUEST ACCESS HANDLERS ---------------- */
  const handleRequestAccessSuccess = () => {
    setRequestModalState({ isOpen: false, framework: null });
    // Optionally refresh data or show success message
  };

  /* ---------------- TABLE CONFIG ---------------- */
  const columns = [
    {
      key: "code",
      label: "Code",
      sortable: true,
      render: (value) => (
        <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
          {value}
        </span>
      ),
    },
    {
      key: "frameworkCategoryName",
      label: "Category Name",
      sortable: true,
      render: (value) => (
        <span className="font-medium text-foreground">{value}</span>
      ),
    },
    {
      key: "description",
      label: "Description",
      sortable: false,
      render: (value) => (
        <span className="text-muted-foreground text-sm line-clamp-2 max-w-xs">
          {value}
        </span>
      ),
    },
    {
      key: "isActive",
      label: "Status",
      sortable: true,
      render: (value) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            value
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {value ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created At",
      sortable: true,
      render: (value) => (
        <span className="text-sm whitespace-nowrap">{formatDate(value)}</span>
      ),
    },
  ];

  const renderActions = (row) => (
    <div className="flex gap-1 justify-center">
      <button
        onClick={() => setRequestModalState({ isOpen: true, framework: row })}
        className="px-3 py-2 bg-primary/20 hover:bg-primary/10 dark:hover:bg-primary/30 text-primary rounded-full transition-all duration-200 cursor-pointer inline-flex items-center justify-center gap-2"
        title="Request Access"
      >
        <Icon name="plus" size="12px" /> Request
      </button>
    </div>
  );

  /* ---------------- UI ---------------- */
  return (
    <div className="mt-5 pb-5 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-6 p-6 bg-gradient-to-r from-card to-muted/30 rounded-xl border border-border shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon name="layers" size="20px" className="text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Official Framework Category
              </h1>
              <p className="text-muted-foreground text-xs">
                View official framework categories
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-3">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              Total Categories:
              <span className="font-medium text-foreground">
                {pagination.totalItems}
              </span>
            </span>

            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-secondary" />
              Active Page:
              <span className="font-medium text-foreground">
                {pagination.currentPage}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={officialFrameworkCategory}
        loading={loading}
        onSearch={handleSearch}
        onSort={handleSort}
        sortConfig={sortConfig}
        pagination={{ ...pagination, onPageChange: handlePageChange }}
        renderActions={renderActions}
        searchPlaceholder="Search official category..."
        emptyMessage={emptyMessage}
      />

      {/* Request Access Modal */}
      {requestModalState.isOpen && (
        <RequestAccessModal
          framework={requestModalState.framework}
          onSuccess={handleRequestAccessSuccess}
          onClose={() =>
            setRequestModalState({ isOpen: false, framework: null })
          }
        />
      )}
    </div>
  );
}

export default OfficialFrameworkCategory;
