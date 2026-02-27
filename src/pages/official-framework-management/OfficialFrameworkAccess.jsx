import { useState } from "react";
import { toast } from "sonner";
import { formatDate } from "../../utils/dateFormatter";
import Icon from "../../components/Icon";
import DataTable from "../../components/data-table/DataTable";
import { getOfficialFrameworkCategoryAccess } from "../../services/officialFrameworkService";
import RequestAccessModal from "./components/RequestAccessModal";
import CustomBadge from "../../components/custom/CustomBadge";
import UserMiniCard from "../../components/custom/UserMiniCard";
import FrameworkMiniCard from "../../components/custom/FrameworkMiniCard";
import ActionDropdown from "../../components/custom/ActionDropdown";
import { useTableData } from "../../components/data-table/hooks/useTableData";

function OfficialFrameworkAccess() {
  const [requestModalState, setRequestModalState] = useState({
    isOpen: false,
    framework: null,
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
    refetch,
  } = useTableData(getOfficialFrameworkCategoryAccess, {
    defaultLimit: 10,
    defaultSortBy: "createdAt",
    defaultSortOrder: "desc",
    emptyMessage: "No official framework access found",
  });

  /* ---------------- REQUEST ACCESS HANDLERS ---------------- */
  const handleRequestAccessSuccess = () => {
    setRequestModalState({ isOpen: false, framework: null });
    refetch();
  };

  /* ---------------- TABLE CONFIG ---------------- */
  const columns = [
    {
      key: "frameworkCategory.code",
      label: "Framework Code",
      sortable: false,
      render: (_, row) => (
        <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
          {row?.frameworkCategory?.code}
        </span>
      ),
    },
    {
      key: "frameworkCategory.frameworkCategoryName",
      label: "Framework Name",
      sortable: false,
      render: (_, row) => (
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
      render: (value) => (
        <CustomBadge
          label={value?.charAt(0).toUpperCase() + value?.slice(1)}
          color={
            value === "revoked" || value === "rejected"
              ? "red"
              : value === "approved"
                ? "green"
                : "yellow"
          }
        />
      ),
    },
    {
      key: "actionBy",
      label: "Action By",
      sortable: false,
      render: (_, row) => {
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
        } else {
          return <span className="text-muted-foreground text-sm">—</span>;
        }
      },
    },
    {
      key: "createdAt",
      label: "Created At",
      sortable: false,
      render: (value) => (
        <span className="text-sm whitespace-nowrap">{formatDate(value)}</span>
      ),
    },
  ];

  const renderActions = (row) => {
    const isPending = row.status === "pending";
    const isApproved = row.status === "approved";
    const isRevokedOrRejected =
      row.status === "revoked" || row.status === "rejected";
    const isDisabled = isPending || isApproved;

    let actionLabel = "Request Access";
    let actionIcon = "plus";

    if (isPending) {
      actionLabel = "Pending";
      actionIcon = "clock";
    } else if (isApproved) {
      actionLabel = "Approved";
      actionIcon = "check";
    } else if (isRevokedOrRejected) {
      actionLabel = "Re-request Access";
      actionIcon = "refresh";
    }

    const actions = [
      {
        id: `request-${row.id}`,
        label: actionLabel,
        icon: actionIcon,
        className: isDisabled
          ? "text-muted-foreground"
          : isRevokedOrRejected
            ? "text-orange-600 hover:text-orange-600"
            : "text-primary hover:text-primary",
        disabled: isDisabled,
        onClick: () => {
          if (!isDisabled) {
            setRequestModalState({ isOpen: true, framework: row });
          }
        },
      },
    ];

    return (
      <div className="flex justify-center">
        <ActionDropdown actions={actions} />
      </div>
    );
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="mt-5 pb-5">
      {/* Data Table */}
      <DataTable
        columns={columns}
        data={frameworkAccess}
        loading={loading}
        onSearch={handleSearch}
        onSort={handleSort}
        sortConfig={sortConfig}
        renderActions={renderActions}
        searchTerm={searchTerm}
        pagination={pagination}
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
