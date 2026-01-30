import { useEffect } from "react";
import { useCallback } from "react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getAdminFrameworkAccessRequests } from "../../../services/adminService";
import DataTable from "../../../components/data-table/DataTable";
import Icon from "../../../components/Icon";

function AccessRequests() {
  const [accessRequests, setAccessRequests] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [emptyMessage, setEmptyMessage] = useState("No access requests found");

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

  /* ---------------- FETCH ACCESS REQUESTS ---------------- */
  const fetchAccessRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminFrameworkAccessRequests({
        page: pagination.currentPage,
        limit: pagination.limit,
        search: searchTerm,
        sortBy: sortConfig.sortBy,
        sortOrder: sortConfig.sortOrder,
      });

      setAccessRequests(res.data || []);

      // Set the message from backend response, especially for empty results
      if (res.message && res.data?.length === 0) {
        setEmptyMessage(res.message);
      } else if (
        searchTerm &&
        (res.users?.length === 0 || res.data?.length === 0)
      ) {
        setEmptyMessage(`No access requests for "${searchTerm}"`);
      } else {
        setEmptyMessage("No access requests");
      }

      setPagination((p) => ({
        ...p,
        totalPages: res.pagination?.totalPages || 1,
        totalItems: res.pagination?.totalItems || 0,
        hasPrevPage: pagination.currentPage > 1,
        hasNextPage: pagination.currentPage < (res.pagination?.totalPages || 1),
      }));
    } catch (err) {
      toast.error(err.message || "Failed to load access requests");
      setAccessRequests([]);
      setEmptyMessage("Failed to load access requests");
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.limit, searchTerm, sortConfig]);

  useEffect(() => {
    fetchAccessRequests();
  }, [fetchAccessRequests]);

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

  /* ---------------- TABLE CONFIG ---------------- */
  const columns = [];

  const renderActions = (row) => (
    <div className="flex gap-1 justify-center">
      <button
        className="px-3 py-2 hover:bg-green-50 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full transition-all duration-200 hover:scale-105 cursor-pointer"
        title="Approve Request"
      >
        <Icon name="check" size="16px" />
      </button>
      <button
        className="px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full transition-all duration-200 hover:scale-105 cursor-pointer"
        title="Reject Request"
      >
        <Icon name="x" size="16px" />
      </button>
    </div>
  );

  /* ---------------- UI ---------------- */
  return (
    <div className="mt-5 pb-5 space-y-8">
      {/* Header Section */}
      <div className="flex flex-wrap justify-between items-start gap-6 p-6 bg-gradient-to-r from-card to-muted/30 rounded-xl border border-border shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon name="clock" size="20px" className="text-primary" />
            </div>
            <div className="">
              <h1 className="text-xl font-bold text-foreground flex items-center gap-3">
                Access Requests
              </h1>
              <p className="text-muted-foreground text-xs">
                Manage access requests
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-3">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              Total Pending Requests:{" "}
              <span className="font-medium text-foreground">
                {pagination.totalItems}
              </span>
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-secondary"></div>
              Active Page:{" "}
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
        data={accessRequests}
        loading={loading}
        onSearch={handleSearch}
        onSort={handleSort}
        sortConfig={sortConfig}
        pagination={{ ...pagination, onPageChange: handlePageChange }}
        renderActions={renderActions}
        searchPlaceholder="Search access requests..."
        emptyMessage={emptyMessage}
      />
    </div>
  );
}

export default AccessRequests;
