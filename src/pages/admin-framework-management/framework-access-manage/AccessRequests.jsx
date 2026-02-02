import { useEffect } from "react";
import { useCallback } from "react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getAdminFrameworkAccessRequests,
  approveFrameworkAccessRequest,
  rejectFrameworkAccessRequest,
} from "../../../services/adminService";
import DataTable from "../../../components/data-table/DataTable";
import Icon from "../../../components/Icon";
import { formatDate } from "../../../utils/dateFormatter";
import AccessViewModal from "./components/AccessViewModal";
import ApproveAccessModal from "./components/ApproveAccessModal";
import RejectAccessModal from "./components/RejectAccessModal";

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

  const [viewModalState, setViewModalState] = useState({
    isOpen: false,
    accessRecord: null,
  });

  const [approveModalState, setApproveModalState] = useState({
    isOpen: false,
    accessRecord: null,
  });

  const [rejectModalState, setRejectModalState] = useState({
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

  /* ---------------- APPROVE/REJECT ACCESS ---------------- */
  const handleApproveAccess = async () => {
    try {
      const accessRecord = approveModalState.accessRecord;
      const requestId = accessRecord?.id;

      if (!requestId) {
        toast.error("Invalid access record. Cannot approve access.");
        console.error("Access record:", accessRecord);
        return;
      }

      const response = await approveFrameworkAccessRequest(requestId);
      toast.success(
        response.message || "Framework access approved successfully",
      );
      setApproveModalState({ isOpen: false, accessRecord: null });
      fetchAccessRequests();
    } catch (e) {
      toast.error(e.message || "Failed to approve framework access");
      console.error("Approve access error:", e);
    }
  };

  const handleRejectAccess = async () => {
    try {
      const accessRecord = rejectModalState.accessRecord;
      const requestId = accessRecord?.id;

      if (!requestId) {
        toast.error("Invalid access record. Cannot reject access.");
        console.error("Access record:", accessRecord);
        return;
      }

      const response = await rejectFrameworkAccessRequest(requestId);
      toast.success(
        response.message || "Framework access rejected successfully",
      );
      setRejectModalState({ isOpen: false, accessRecord: null });
      fetchAccessRequests();
    } catch (e) {
      toast.error(e.message || "Failed to reject framework access");
      console.error("Reject access error:", e);
    }
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
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
          {value?.charAt(0).toUpperCase() + value?.slice(1)}
        </span>
      ),
    },
    {
      key: "actionBy",
      label: "Action By",
      sortable: false,
      render: (value, row) => {
        if (row.status === "revoked" && row.revocation?.revokedBy) {
          return (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Icon
                  name="user-x"
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
                <span className="text-xs whitespace-nowrap">
                  {formatDate(row.revocation.revokedAt)}
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
                <span className="text-xs whitespace-nowrap">
                  {formatDate(row.rejection.rejectedAt)}
                </span>
              </div>
            </div>
          );
        } else if (row.status === "approved" && row.approval?.approvedBy) {
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
                <span className="text-xs whitespace-nowrap">
                  {formatDate(row.approval.approvedAt)}
                </span>
              </div>
            </div>
          );
        } else {
          return <span className="text-sm text-muted-foreground">-</span>;
        }
      },
    },
    {
      key: "createdAt",
      label: "Created At",
      sortable: true,
      render: (value) => (
        <span className="text-sm whitespace-nowrap">
          {formatDate(value)}
        </span>
      ),
    },
  ];

  const renderActions = (row) => {
    return (
      <div className="flex gap-1 justify-center">
        <button
          onClick={() => setViewModalState({ isOpen: true, accessRecord: row })}
          className="px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full transition-all duration-200 hover:scale-105 cursor-pointer"
          title="View Details"
        >
          <Icon name="eye" size="16px" />
        </button>

        <button
          onClick={() =>
            setApproveModalState({ isOpen: true, accessRecord: row })
          }
          className="px-3 py-2 hover:bg-green-50 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full transition-all duration-200 hover:scale-105 cursor-pointer"
          title="Approve Request"
        >
          <Icon name="check" size="16px" />
        </button>
        <button
          onClick={() =>
            setRejectModalState({ isOpen: true, accessRecord: row })
          }
          className="px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full transition-all duration-200 hover:scale-105 cursor-pointer"
          title="Reject Request"
        >
          <Icon name="x" size="16px" />
        </button>
      </div>
    );
  };

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
              Total Access Requests:{" "}
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

      {viewModalState.isOpen && (
        <AccessViewModal
          accessRecord={viewModalState.accessRecord}
          onClose={() =>
            setViewModalState({ isOpen: false, accessRecord: null })
          }
        />
      )}

      {approveModalState.isOpen && (
        <ApproveAccessModal
          accessRecord={approveModalState.accessRecord}
          onConfirm={handleApproveAccess}
          onCancel={() =>
            setApproveModalState({ isOpen: false, accessRecord: null })
          }
        />
      )}

      {rejectModalState.isOpen && (
        <RejectAccessModal
          accessRecord={rejectModalState.accessRecord}
          onConfirm={handleRejectAccess}
          onCancel={() =>
            setRejectModalState({ isOpen: false, accessRecord: null })
          }
        />
      )}
    </div>
  );
}

export default AccessRequests;
