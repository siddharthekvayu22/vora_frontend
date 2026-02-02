import { useEffect } from "react";
import { useCallback } from "react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getAdminFrameworkAccessRejected } from "../../../services/adminService";
import DataTable from "../../../components/data-table/DataTable";
import Icon from "../../../components/Icon";
import { formatDate } from "../../../utils/dateFormatter";
import AccessViewModal from "./components/AccessViewModal";

function AccessRejected() {
  const [accessRejected, setAccessRejected] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [emptyMessage, setEmptyMessage] = useState("No rejected access found");

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

  const [viewModalState, setViewModalState] = useState({
    isOpen: false,
    accessRecord: null,
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

  /* ---------------- FETCH ACCESS REJECTED ---------------- */
  const fetchAccessRejected = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminFrameworkAccessRejected({
        page: pagination.currentPage,
        limit: pagination.limit,
        search: searchTerm,
        sortBy: sortConfig.sortBy,
        sortOrder: sortConfig.sortOrder,
      });

      setAccessRejected(res.data || []);

      // Set the message from backend response, especially for empty results
      if (res.message && res.data?.length === 0) {
        setEmptyMessage(res.message);
      } else if (
        searchTerm &&
        (res.users?.length === 0 || res.data?.length === 0)
      ) {
        setEmptyMessage(`No rejected access for "${searchTerm}"`);
      } else {
        setEmptyMessage("No rejected access");
      }

      setPagination((p) => ({
        ...p,
        totalPages: res.pagination?.totalPages || 1,
        totalItems: res.pagination?.totalItems || 0,
        hasPrevPage: pagination.currentPage > 1,
        hasNextPage: pagination.currentPage < (res.pagination?.totalPages || 1),
      }));
    } catch (err) {
      toast.error(err.message || "Failed to load rejected access");
      setAccessRejected([]);
      setEmptyMessage("Failed to load rejected access");
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.limit, searchTerm, sortConfig]);

  useEffect(() => {
    fetchAccessRejected();
  }, [fetchAccessRejected]);

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
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Icon
              name="user"
              size="16px"
              className="text-blue-600 dark:text-blue-400"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-foreground">
              {row.expert?.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {row.expert?.email}
            </span>
          </div>
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
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Icon
              name="shield"
              size="16px"
              className="text-purple-600 dark:text-purple-400"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-foreground">
              {row.frameworkCategory?.frameworkCategoryName}
            </span>
            <span className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
              {row.frameworkCategory?.description}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
          Rejected
        </span>
      ),
    },
    {
      key: "rejection.rejectedBy.name",
      label: "Rejected By",
      sortable: false,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <Icon
              name="user-x"
              size="16px"
              className="text-red-600 dark:text-red-400"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-foreground text-sm">
              {row.rejection?.rejectedBy?.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {row.rejection?.rejectedBy?.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "rejection.rejectedAt",
      label: "Rejected At",
      sortable: true,
      render: (value, row) => (
        <span className="text-sm whitespace-nowrap">
          {formatDate(row.rejection?.rejectedAt)}
        </span>
      ),
    },
  ];

  const renderActions = (row) => (
    <div className="flex gap-1 justify-center">
      {/* View button - always shown */}
      <button
        onClick={() => setViewModalState({ isOpen: true, accessRecord: row })}
        className="px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full transition-all duration-200 hover:scale-105 cursor-pointer"
        title="View Details"
      >
        <Icon name="eye" size="16px" />
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
              <Icon name="x-circle" size="20px" className="text-primary" />
            </div>
            <div className="">
              <h1 className="text-xl font-bold text-foreground flex items-center gap-3">
                Access Rejected
              </h1>
              <p className="text-muted-foreground text-xs">
                Manage rejected access requests
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-3">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              Total Rejected Access:{" "}
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
        data={accessRejected}
        loading={loading}
        onSearch={handleSearch}
        onSort={handleSort}
        sortConfig={sortConfig}
        pagination={{ ...pagination, onPageChange: handlePageChange }}
        renderActions={renderActions}
        searchPlaceholder="Search rejected access..."
        emptyMessage={emptyMessage}
      />

      {viewModalState.isOpen && (
        <AccessViewModal
          accessRecord={viewModalState.accessRecord}
          onClose={() =>
            setViewModalState({ isOpen: false, accessRecord: null })
          }
        />
      )}
    </div>
  );
}

export default AccessRejected;
