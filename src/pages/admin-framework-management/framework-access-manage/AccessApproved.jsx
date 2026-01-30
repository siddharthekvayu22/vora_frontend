import { useEffect } from "react";
import { useCallback } from "react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getAdminFrameworkAccess } from "../../../services/adminService";
import DataTable from "../../../components/data-table/DataTable";
import Icon from "../../../components/Icon";
import { formatDate } from "../../../utils/dateFormatter";

function AccessApproved() {
  const [accessApproved, setAccessApproved] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [emptyMessage, setEmptyMessage] = useState("No approved access found");

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

  /* ---------------- FETCH ACCESS APPROVED ---------------- */
  const fetchAccessApproved = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminFrameworkAccess({
        page: pagination.currentPage,
        limit: pagination.limit,
        search: searchTerm,
        sortBy: sortConfig.sortBy,
        sortOrder: sortConfig.sortOrder,
      });

      setAccessApproved(res.data || []);

      // Set the message from backend response, especially for empty results
      if (res.message && res.data?.length === 0) {
        setEmptyMessage(res.message);
      } else if (
        searchTerm &&
        (res.users?.length === 0 || res.data?.length === 0)
      ) {
        setEmptyMessage(`No approved access for "${searchTerm}"`);
      } else {
        setEmptyMessage("No approved access");
      }

      setPagination((p) => ({
        ...p,
        totalPages: res.pagination?.totalPages || 1,
        totalItems: res.pagination?.totalItems || 0,
        hasPrevPage: pagination.currentPage > 1,
        hasNextPage: pagination.currentPage < (res.pagination?.totalPages || 1),
      }));
    } catch (err) {
      toast.error(err.message || "Failed to load approved access");
      setAccessApproved([]);
      setEmptyMessage("Failed to load approved access");
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.limit, searchTerm, sortConfig]);

  useEffect(() => {
    fetchAccessApproved();
  }, [fetchAccessApproved]);

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
  const columns = [
    {
      key: "expert.name",
      label: "Expert Name",
      sortable: true,
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">
            {row.expert?.name}
          </span>
          <span className="text-xs text-muted-foreground">
            {row.expert?.email}
          </span>
        </div>
      ),
    },
    {
      key: "frameworkCategory.frameworkCode",
      label: "Framework Code",
      sortable: true,
      render: (value, row) => (
        <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
          {row.frameworkCategory?.frameworkCode}
        </span>
      ),
    },
    {
      key: "frameworkCategory.frameworkCategoryName",
      label: "Framework Name",
      sortable: true,
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">
            {row.frameworkCategory?.frameworkCategoryName}
          </span>
          <span className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
            {row.frameworkCategory?.description}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          {value?.charAt(0).toUpperCase() + value?.slice(1)}
        </span>
      ),
    },
    {
      key: "approval.approvedBy.name",
      label: "Approved By",
      sortable: false,
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground text-sm">
            {row.approval?.approvedBy?.name}
          </span>
          <span className="text-xs text-muted-foreground">
            {row.approval?.approvedBy?.email}
          </span>
        </div>
      ),
    },
    {
      key: "approval.approvedAt",
      label: "Approved At",
      sortable: true,
      render: (value, row) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {formatDate(row.approval?.approvedAt)}
        </span>
      ),
    },
  ];

  const renderActions = (row) => (
    <div className="flex gap-1 justify-center">
      <button
        className="px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full transition-all duration-200 hover:scale-105 cursor-pointer"
        title="View Details"
      >
        <Icon name="eye" size="16px" />
      </button>
      <button
        className="px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full transition-all duration-200 hover:scale-105 cursor-pointer"
        title="Revoke Access"
      >
        <Icon name="x-circle" size="16px" />
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
              <Icon name="check-circle" size="20px" className="text-primary" />
            </div>
            <div className="">
              <h1 className="text-xl font-bold text-foreground flex items-center gap-3">
                Access Approved
              </h1>
              <p className="text-muted-foreground text-xs">
                Manage approved access
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-3">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              Total Approved Framework Access:{" "}
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

        <button className="flex items-center gap-3 px-5 py-3 bg-primary text-primary-foreground rounded-lg hover:shadow-lg hover:scale-[102%] transition-all duration-200 font-medium text-xs cursor-pointer">
          <Icon name="plus" size="18px" />
          Give Framework Access
        </button>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={accessApproved}
        loading={loading}
        onSearch={handleSearch}
        onSort={handleSort}
        sortConfig={sortConfig}
        pagination={{ ...pagination, onPageChange: handlePageChange }}
        renderActions={renderActions}
        searchPlaceholder="Search approved access..."
        emptyMessage={emptyMessage}
      />
    </div>
  );
}

export default AccessApproved;
