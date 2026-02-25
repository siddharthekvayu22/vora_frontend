import { useState } from "react";
import toast from "react-hot-toast";
import Icon from "../../components/Icon";
import DataTable from "../../components/data-table/DataTable";
import { getOfficialFrameworkCategory } from "../../services/officialFrameworkService";
import { formatDate } from "../../utils/dateFormatter";
import RequestAccessModal from "./components/RequestAccessModal";
import CustomBadge from "../../components/custom/CustomBadge";
import ActionDropdown from "../../components/custom/ActionDropdown";
import UserMiniCard from "@/components/custom/UserMiniCard";
import { useTableData } from "../../components/data-table/hooks/useTableData";

function OfficialFrameworkCategory() {
  const [requestModalState, setRequestModalState] = useState({
    isOpen: false,
    framework: null,
  });

  // Use custom hook for table data management
  const {
    data: officialFrameworkCategory,
    loading,
    emptyMessage,
    pagination,
    searchTerm,
    sortConfig,
    onSearch: handleSearch,
    onSort: handleSort,
    refetch,
  } = useTableData(getOfficialFrameworkCategory, {
    defaultLimit: 10,
    defaultSortBy: "createdAt",
    defaultSortOrder: "desc",
    emptyMessage: "No official framework category found",
  });

  /* ---------------- REQUEST ACCESS HANDLERS ---------------- */
  const handleRequestAccessSuccess = () => {
    refetch();
    setRequestModalState({ isOpen: false, framework: null });
  };

  /* ---------------- TABLE CONFIG ---------------- */
  const columns = [
    {
      key: "code",
      label: "Code",
      sortable: false,
      render: (value) => (
        <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
          {value}
        </span>
      ),
    },
    {
      key: "frameworkCategoryName",
      label: "Category Name",
      sortable: false,
      render: (value) => (
        <span
          className="font-medium text-foreground line-clamp-1"
          title={value}
        >
          {value}
        </span>
      ),
    },
    {
      key: "description",
      label: "Description",
      sortable: false,
      render: (value) => (
        <span
          className="text-muted-foreground text-sm line-clamp-2 max-w-xs"
          title={value}
        >
          {value}
        </span>
      ),
    },
    {
      key: "isActive",
      label: "Status",
      sortable: false,
      render: (value) => (
        <CustomBadge
          label={value ? "Active" : "Inactive"}
          color={value ? "green" : "red"}
        />
      ),
    },
    {
      key: "createdBy",
      label: "Created By",
      sortable: false,
      render: (value, row) => (
        <UserMiniCard name={value.name} email={value.email} />
      ),
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
    const isActive = row.isActive;
    const hasRequested = row.hasRequested;
    const isDisabled = !isActive || hasRequested;

    const actions = [
      {
        id: `request-${row.id}`,
        label: hasRequested ? "Requested" : "Request Access",
        icon: hasRequested ? "check" : "plus",
        className: hasRequested
          ? "text-muted-foreground"
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
        data={officialFrameworkCategory}
        loading={loading}
        onSearch={handleSearch}
        onSort={handleSort}
        sortConfig={sortConfig}
        searchTerm={searchTerm}
        pagination={pagination}
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
