import { useEffect, useCallback, useState } from "react";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import { formatDate } from "../../utils/dateFormatter";
import Icon from "../../components/Icon";
import DataTable from "../../components/data-table/DataTable";
import { getOfficialFrameworkCategoryAccess } from "../../services/officialFrameworkService";
import RequestAccessModal from "./components/RequestAccessModal";
import CustomBadge from "../../components/custom/CustomBadge";
import UserMiniCard from "../../components/custom/UserMiniCard";
import FrameworkMiniCard from "../../components/custom/FrameworkMiniCard";
import ActionDropdown from "../../components/custom/ActionDropdown";

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
        // Handle different statuses and their corresponding admin actions
        if (row.status === "approved" && row.approval?.approvedBy) {
          return (
            <UserMiniCard
              name={row.approval.approvedBy.name}
              email={row.approval.approvedBy.email}
              date={row.approval.approvedAt}
            />
          );
        } else if (row.status === "rejected" && row.rejection?.rejectedBy) {
          return (
            <UserMiniCard
              name={row.rejection.rejectedBy.name}
              email={row.rejection.rejectedBy.email}
              date={row.rejection.rejectedAt}
            />
          );
        } else if (row.status === "revoked" && row.revocation?.revokedBy) {
          return (
            <UserMiniCard
              name={row.revocation.revokedBy.name}
              email={row.revocation.revokedBy.email}
              date={row.revocation.revokedAt}
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
            ? "text-orange-600 dark:text-orange-400"
            : "text-primary dark:text-primary",
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
