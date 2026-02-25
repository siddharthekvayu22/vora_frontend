import { useState } from "react";
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
import SelectDropdown from "../../../components/custom/SelectDropdown";
import { Button } from "@/components/ui/button";
import { useTableData } from "../../../components/data-table/hooks/useTableData";

function FrameworkAccess() {
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

  // Use custom hook for table data management
  const {
    data: frameworkAccess,
    loading,
    emptyMessage,
    pagination,
    searchTerm,
    sortConfig,
    onSearch: handleSearch,
    onSort: handleSort,
    onFilterChange,
    refetch,
  } = useTableData(getAdminFrameworkAccess, {
    defaultLimit: 10,
    defaultSortBy: "updatedAt",
    defaultSortOrder: "desc",
    emptyMessage: "No framework access records found",
  });

  /* ---------------- HANDLERS ---------------- */
  const handleStatusFilter = (status) => {
    onFilterChange("status", status);
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
      refetch();
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
      refetch();
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
      refetch();
    } catch (e) {
      toast.error(e.message || "Failed to revoke framework access");
      throw e;
    }
  };

  /* ---------------- GIVE ACCESS SUCCESS ---------------- */
  const handleGiveAccessSuccess = () => {
    setGiveAccessModalState({ isOpen: false });
    refetch();
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

        return date ? (
          <span className="text-sm whitespace-nowrap">{formatDate(date)}</span>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        );
      },
    },
  ];

  const renderActions = (row) => {
    const isPending = row.status === "pending";
    const isApproved = row.status === "approved";

    const actions = [
      {
        id: `view-${row.id}`,
        label: "View Details",
        icon: "eye",
        className: "text-blue-600 hover:text-blue-600",
        onClick: () => setViewModalState({ isOpen: true, accessRecord: row }),
      },
    ];

    if (isPending) {
      actions.push(
        {
          id: `approve-${row.id}`,
          label: "Approve Access",
          icon: "check",
          className: "text-green-600 hover:text-green-600",
          onClick: () =>
            setApproveModalState({ isOpen: true, accessRecord: row }),
        },
        {
          id: `reject-${row.id}`,
          label: "Reject Access",
          icon: "x",
          className: "text-red-600 hover:text-red-600",
          onClick: () =>
            setRejectModalState({ isOpen: true, accessRecord: row }),
        },
      );
    }

    if (isApproved) {
      actions.push({
        id: `revoke-${row.id}`,
        label: "Revoke Access",
        icon: "ban",
        className: "text-orange-600 hover:text-orange-600",
        onClick: () => setRevokeModalState({ isOpen: true, accessRecord: row }),
      });
    }

    return (
      <div className="flex justify-center">
        <ActionDropdown actions={actions} />
      </div>
    );
  };

  const renderHeaderButtons = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const statusFilter = urlParams.get("status") || "";

    return (
      <>
        <SelectDropdown
          value={statusFilter}
          onChange={handleStatusFilter}
          options={[
            { value: "", label: "All Status" },
            { value: "pending", label: "Pending" },
            { value: "approved", label: "Approved" },
            { value: "rejected", label: "Rejected" },
            { value: "revoked", label: "Revoked" },
          ]}
          placeholder="All Status"
          size="lg"
          variant="default"
        />
        <Button
          size="lg"
          className="flex items-center gap-3"
          onClick={() => setGiveAccessModalState({ isOpen: true })}
        >
          <Icon name="plus" size="18px" />
          Give Framework Access
        </Button>
      </>
    );
  };

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
        searchTerm={searchTerm}
        pagination={pagination}
        renderActions={renderActions}
        renderHeaderActions={renderHeaderButtons}
        searchPlaceholder="Search expert, framework, status..."
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

      {revokeModalState.isOpen && (
        <RevokeAccessModal
          accessRecord={revokeModalState.accessRecord}
          onConfirm={handleRevokeAccess}
          onCancel={() =>
            setRevokeModalState({ isOpen: false, accessRecord: null })
          }
        />
      )}

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
