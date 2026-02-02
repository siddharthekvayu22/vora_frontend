import { useEffect, useCallback, useState } from "react";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import { formatDate } from "../../utils/dateFormatter";
import Icon from "../../components/Icon";
import DataTable from "../../components/data-table/DataTable";
import { getOfficialFrameworkCategoryAccess } from "../../services/officialFrameworkService";
import RequestAccessModal from "./components/RequestAccessModal";

function OfficialFrameworkAccess() {
  const [frameworkAccess, setFrameworkAccess] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emptyMessage, setEmptyMessage] = useState(
    "No official framework access found",
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
  const fetchOfficialFrameworkAccess = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getOfficialFrameworkCategoryAccess({
        page: pagination.currentPage,
        limit: pagination.limit,
        search: searchTerm,
        sortBy: sortConfig.sortBy,
        sortOrder: sortConfig.sortOrder,
      });

      setFrameworkAccess(res.data || []);

      if (res.message && res.data?.length === 0) {
        setEmptyMessage(res.message);
      } else if (searchTerm && res.data?.length === 0) {
        setEmptyMessage(`No framework access found for "${searchTerm}"`);
      } else {
        setEmptyMessage("No official framework access found");
      }

      setPagination((p) => ({
        ...p,
        totalPages: res.pagination?.totalPages || 1,
        totalItems: res.pagination?.totalItems || 0,
        hasPrevPage: pagination.currentPage > 1,
        hasNextPage: pagination.currentPage < (res.pagination?.totalPages || 1),
      }));
    } catch (err) {
      toast.error(err.message || "Failed to load framework access");
      setFrameworkAccess([]);
      setEmptyMessage("Failed to load framework access");
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.limit, searchTerm, sortConfig]);

  useEffect(() => {
    fetchOfficialFrameworkAccess();
  }, [fetchOfficialFrameworkAccess]);

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
    // Refresh the table data to show the new pending request
    fetchOfficialFrameworkAccess();
  };

  /* ---------------- TABLE CONFIG ---------------- */
  const columns = [
    {
      key: "frameworkCategory.code",
      label: "Framework Code",
      sortable: true,
      render: (_, row) => (
        <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
          {row?.frameworkCategory?.code}
        </span>
      ),
    },
    {
      key: "frameworkCategory.frameworkCategoryName",
      label: "Framework Name",
      sortable: true,
      render: (_, row) => (
        <span className="font-medium text-foreground">
          {row?.frameworkCategory?.frameworkCategoryName}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            value === "approved"
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : value === "rejected" || value === "revoked"
                ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: "actionBy",
      label: "Action By",
      sortable: false,
      render: (_, row) => {
        // Handle different statuses and their corresponding admin actions
        if (row.status === "approved" && row.approval?.approvedBy) {
          return (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Icon
                  name="user-check"
                  size="16px"
                  className="text-green-600 dark:text-green-400"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-foreground text-sm">
                  {row.approval.approvedBy.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {row.approval.approvedBy.email}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(row.approval.approvedAt)}
                </span>
              </div>
            </div>
          );
        } else if (row.status === "rejected" && row.rejection?.rejectedBy) {
          return (
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
                  {row.rejection.rejectedBy.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {row.rejection.rejectedBy.email}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(row.rejection.rejectedAt)}
                </span>
              </div>
            </div>
          );
        } else if (row.status === "revoked" && row.revocation?.revokedBy) {
          return (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Icon
                  name="user-minus"
                  size="16px"
                  className="text-orange-600 dark:text-orange-400"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-foreground text-sm">
                  {row.revocation.revokedBy.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {row.revocation.revokedBy.email}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(row.revocation.revokedAt)}
                </span>
              </div>
            </div>
          );
        } else if (row.status === "pending") {
          return (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Icon
                  name="clock"
                  size="16px"
                  className="text-yellow-600 dark:text-yellow-400"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-foreground text-sm">
                  Pending
                </span>
                <span className="text-xs text-muted-foreground">
                  Awaiting admin action
                </span>
              </div>
            </div>
          );
        } else {
          return <span className="text-muted-foreground text-sm">—</span>;
        }
      },
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

  const renderActions = (row) => {
    const isPending = row.status === "pending";

    return (
      <div className="flex gap-1 justify-center">
        <button
          onClick={() =>
            !isPending && setRequestModalState({ isOpen: true, framework: row })
          }
          disabled={isPending}
          className={`px-3 py-2 rounded-full transition-all duration-200 inline-flex items-center justify-center gap-2 ${
            isPending
              ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
              : "bg-primary/20 hover:bg-primary/10 dark:hover:bg-primary/30 text-primary cursor-pointer"
          }`}
          title={isPending ? "Request already pending" : "Request Access"}
        >
          <Icon name="plus" size="12px" />
          {isPending ? "Pending" : "Request"}
        </button>
      </div>
    );
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="mt-5 pb-5 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-6 p-6 bg-gradient-to-r from-card to-muted/30 rounded-xl border border-border shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon name="shield-check" size="20px" className="text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Official Framework Access
              </h1>
              <p className="text-muted-foreground text-xs">
                View framework access requests and approvals
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-3">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              Total Requests:
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
        data={frameworkAccess}
        loading={loading}
        onSearch={handleSearch}
        onSort={handleSort}
        sortConfig={sortConfig}
        renderActions={renderActions}
        pagination={{ ...pagination, onPageChange: handlePageChange }}
        searchPlaceholder="Search framework, expert, status..."
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

export default OfficialFrameworkAccess;
