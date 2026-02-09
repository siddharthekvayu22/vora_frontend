import { useEffect, useCallback, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getAdminFrameworkAccess,
  approveFrameworkAccessRequest,
  rejectFrameworkAccessRequest,
  revokeFrameworkAccess,
} from "../../../services/adminService";
import DataTable from "../../../components/data-table/DataTable";
import Icon from "../../../components/Icon";
import { formatDate } from "../../../utils/dateFormatter";
import AccessViewModal from "./components/AccessViewModal";
import ApproveAccessModal from "./components/ApproveAccessModal";
import RejectAccessModal from "./components/RejectAccessModal";
import RevokeAccessModal from "./components/RevokeAccessModal";
import GiveFrameworkAccessModal from "./components/GiveFrameworkAccessModal";
import UserMiniCard from "../../../components/custom/UserMiniCard";
import CustomBadge from "../../../components/custom/CustomBadge";
import FrameworkMiniCard from "../../../components/custom/FrameworkMiniCard";
import ActionDropdown from "../../../components/custom/ActionDropdown";

function FrameworkAccess() {
  const [frameworkAccess, setFrameworkAccess] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [emptyMessage, setEmptyMessage] = useState(
    "No framework access records found",
  );

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

  const [revokeModalState, setRevokeModalState] = useState({
    isOpen: false,
    accessRecord: null,
  });

  const [giveAccessModalState, setGiveAccessModalState] = useState({
    isOpen: false,
  });

  /* ---------------- URL SYNC ---------------- */
  useEffect(() => {
    const page = parseInt(searchParams.get("page")) || 1;
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "updatedAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    setPagination((p) => ({ ...p, currentPage: page }));
    setSearchTerm(search);
    setSortConfig({ sortBy, sortOrder });
  }, [searchParams]);

  /* ---------------- FETCH FRAMEWORK ACCESS ---------------- */
  const fetchFrameworkAccess = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminFrameworkAccess({
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
        setEmptyMessage("No framework access records found");
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
    fetchFrameworkAccess();
  }, [fetchFrameworkAccess]);

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

  /* ---------------- APPROVE ACCESS ---------------- */
  const handleApproveAccess = async () => {
    try {
      const accessRecord = approveModalState.accessRecord;
      const requestId = accessRecord?.id;

      if (!requestId) {
        toast.error("Invalid access record. Cannot approve access.");
        return;
      }

      const response = await approveFrameworkAccessRequest(requestId);
      toast.success(
        response.message || "Framework access approved successfully",
      );
      setApproveModalState({ isOpen: false, accessRecord: null });
      fetchFrameworkAccess();
    } catch (e) {
      toast.error(e.message || "Failed to approve framework access");
      throw e;
    }
  };

  /* ---------------- REJECT ACCESS ---------------- */
  const handleRejectAccess = async () => {
    try {
      const accessRecord = rejectModalState.accessRecord;
      const requestId = accessRecord?.id;

      if (!requestId) {
        toast.error("Invalid access record. Cannot reject access.");
        return;
      }

      const response = await rejectFrameworkAccessRequest(requestId);
      toast.success(
        response.message || "Framework access rejected successfully",
      );
      setRejectModalState({ isOpen: false, accessRecord: null });
      fetchFrameworkAccess();
    } catch (e) {
      toast.error(e.message || "Failed to reject framework access");
      throw e;
    }
  };

  /* ---------------- REVOKE ACCESS ---------------- */
  const handleRevokeAccess = async () => {
    try {
      const accessRecord = revokeModalState.accessRecord;
      const expertId = accessRecord?.expert?.id;
      const frameworkId = accessRecord?.frameworkCategory?.frameworkId;

      if (!expertId || !frameworkId) {
        toast.error("Invalid access record. Cannot revoke access.");
        return;
      }

      const response = await revokeFrameworkAccess(expertId, frameworkId);
      toast.success(
        response.message || "Framework access revoked successfully",
      );
      setRevokeModalState({ isOpen: false, accessRecord: null });
      fetchFrameworkAccess();
    } catch (e) {
      toast.error(e.message || "Failed to revoke framework access");
      throw e;
    }
  };

  /* ---------------- GIVE ACCESS SUCCESS ---------------- */
  const handleGiveAccessSuccess = () => {
    setGiveAccessModalState({ isOpen: false });
    fetchFrameworkAccess();
  };

  /* ---------------- TABLE CONFIG ---------------- */
  const columns = [
    {
      key: "expert.name",
      label: "Expert Name",
      sortable: false,
      render: (value, row) => (
        <UserMiniCard name={row.expert?.name} email={row.expert?.email} />
      ),
    },
    {
      key: "frameworkCategory.frameworkCode",
      label: "Framework Code",
      sortable: false,
      render: (value, row) => (
        <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
          {row.frameworkCategory?.frameworkCode}
        </span>
      ),
    },
    {
      key: "frameworkCategory.frameworkCategoryName",
      label: "Framework Name",
      sortable: false,
      render: (value, row) => (
        <FrameworkMiniCard
          name={row.frameworkCategory?.frameworkCategoryName}
          description={row.frameworkCategory?.description}
        />
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: false,
      render: (value) => {
        const statusColors = {
          pending: "yellow",
          approved: "green",
          rejected: "red",
          revoked: "red",
        };

        return (
          <CustomBadge
            label={value?.charAt(0).toUpperCase() + value?.slice(1)}
            color={statusColors[value] || "gray"}
          />
        );
      },
    },
    {
      key: "actionBy",
      label: "Action By",
      sortable: false,
      render: (value, row) => {
        if (row.status === "approved" && row.approval?.approvedBy) {
          return (
            <UserMiniCard
              name={row.approval.approvedBy.name}
              email={row.approval.approvedBy.email}
            />
          );
        } else if (row.status === "rejected" && row.rejection?.rejectedBy) {
          return (
            <UserMiniCard
              name={row.rejection.rejectedBy.name}
              email={row.rejection.rejectedBy.email}
            />
          );
        } else if (row.status === "revoked" && row.revocation?.revokedBy) {
          return (
            <UserMiniCard
              name={row.revocation.revokedBy.name}
              email={row.revocation.revokedBy.email}
            />
          );
        } else if (row.status === "pending") {
          return (
            <UserMiniCard
              name="Pending"
              email="Awaiting admin action"
              icon="clock"
            />
          );
        }
        return <span className="text-muted-foreground text-sm">—</span>;
      },
    },
    {
      key: "actionDate",
      label: "Action Date",
      sortable: false,
      render: (value, row) => {
        let date = null;
        if (row.status === "approved" && row.approval?.approvedAt) {
          date = row.approval.approvedAt;
        } else if (row.status === "rejected" && row.rejection?.rejectedAt) {
          date = row.rejection.rejectedAt;
        } else if (row.status === "revoked" && row.revocation?.revokedAt) {
          date = row.revocation.revokedAt;
        } else if (row.status === "pending") {
          date = row.createdAt;
        }

        return (
          <span className="text-sm whitespace-nowrap">
            {date ? formatDate(date) : "—"}
          </span>
        );
      },
    },
  ];

  const renderActions = (row) => {
    const actions = [
      {
        id: `view-${row.id}`,
        label: "View Details",
        icon: "eye",
        onClick: () => setViewModalState({ isOpen: true, accessRecord: row }),
      },
    ];

    // Add status-specific actions
    if (row.status === "pending") {
      actions.push(
        {
          id: `approve-${row.id}`,
          label: "Approve Request",
          icon: "check",
          className: "text-green-600 dark:text-green-400",
          onClick: () =>
            setApproveModalState({ isOpen: true, accessRecord: row }),
        },
        {
          id: `reject-${row.id}`,
          label: "Reject Request",
          icon: "x",
          className: "text-destructive",
          onClick: () =>
            setRejectModalState({ isOpen: true, accessRecord: row }),
        },
      );
    } else if (row.status === "approved") {
      actions.push({
        id: `revoke-${row.id}`,
        label: "Revoke Access",
        icon: "trash",
        className: "text-destructive",
        onClick: () => setRevokeModalState({ isOpen: true, accessRecord: row }),
      });
    }

    return (
      <div className="flex justify-center">
        <ActionDropdown actions={actions} />
      </div>
    );
  };

  const renderHeaderButtons = () => (
    <button
      onClick={() => setGiveAccessModalState({ isOpen: true })}
      className="flex items-center gap-3 px-5 py-3 bg-primary text-primary-foreground rounded-lg hover:shadow-lg hover:scale-[102%] transition-all duration-200 font-medium text-xs cursor-pointer"
    >
      <Icon name="plus" size="18px" />
      Give Framework Access
    </button>
  );

  /* ---------------- UI ---------------- */
  return (
    <div className="mt-5 pb-5 space-y-8">
      {/* Data Table */}
      <DataTable
        columns={columns}
        data={frameworkAccess}
        loading={loading}
        onSearch={handleSearch}
        onSort={handleSort}
        sortConfig={sortConfig}
        pagination={{ ...pagination, onPageChange: handlePageChange }}
        renderActions={renderActions}
        renderHeaderActions={renderHeaderButtons}
        searchPlaceholder="Search framework access..."
        emptyMessage={emptyMessage}
      />

      {/* View Modal */}
      {viewModalState.isOpen && (
        <AccessViewModal
          accessRecord={viewModalState.accessRecord}
          onClose={() =>
            setViewModalState({ isOpen: false, accessRecord: null })
          }
        />
      )}

      {/* Approve Modal */}
      {approveModalState.isOpen && (
        <ApproveAccessModal
          accessRecord={approveModalState.accessRecord}
          onConfirm={handleApproveAccess}
          onCancel={() =>
            setApproveModalState({ isOpen: false, accessRecord: null })
          }
        />
      )}

      {/* Reject Modal */}
      {rejectModalState.isOpen && (
        <RejectAccessModal
          accessRecord={rejectModalState.accessRecord}
          onConfirm={handleRejectAccess}
          onCancel={() =>
            setRejectModalState({ isOpen: false, accessRecord: null })
          }
        />
      )}

      {/* Revoke Modal */}
      {revokeModalState.isOpen && (
        <RevokeAccessModal
          accessRecord={revokeModalState.accessRecord}
          onConfirm={handleRevokeAccess}
          onCancel={() =>
            setRevokeModalState({ isOpen: false, accessRecord: null })
          }
        />
      )}

      {/* Give Access Modal */}
      {giveAccessModalState.isOpen && (
        <GiveFrameworkAccessModal
          onSuccess={handleGiveAccessSuccess}
          onClose={() => setGiveAccessModalState({ isOpen: false })}
        />
      )}
    </div>
  );
}

export default FrameworkAccess;
