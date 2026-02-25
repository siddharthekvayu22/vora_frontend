import { useState } from "react";
import toast from "react-hot-toast";
import DataTable from "../../components/data-table/DataTable";
import UserModal from "./components/UserModal";
import DeleteUserModal from "./components/DeleteUserModal";
import Icon from "../../components/Icon";
import {
  getAllUsers,
  createUser,
  deleteUser,
  updateUserByAdmin,
  toggleUserStatus,
  syncUsersToAllServices,
} from "../../services/userService";
import { formatDate } from "../../utils/dateFormatter";
import CustomBadge from "../../components/custom/CustomBadge";
import UserMiniCard from "../../components/custom/UserMiniCard";
import ActionDropdown from "../../components/custom/ActionDropdown";
import SelectDropdown from "../../components/custom/SelectDropdown";
import { useAuth } from "../../context/useAuth";
import { Button } from "@/components/ui/button";
import { useTableData } from "../../components/data-table/hooks/useTableData";

function Users() {
  const { user } = useAuth();

  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: "view",
    user: null,
  });

  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    user: null,
  });

  const [syncLoading, setSyncLoading] = useState(false);

  // Use custom hook for table data management
  const {
    data: users,
    loading,
    emptyMessage,
    pagination,
    searchTerm,
    sortConfig,
    onSearch: handleSearch,
    onSort: handleSort,
    onFilterChange,
    refetch,
  } = useTableData(getAllUsers, {
    defaultLimit: 10,
    defaultSortBy: "createdAt",
    defaultSortOrder: "desc",
    emptyMessage: "No users found",
  });

  /* ---------------- HANDLERS ---------------- */
  const handleRoleFilter = (role) => {
    onFilterChange("role", role);
  };

  const handleStatusFilter = (status) => {
    onFilterChange("isActive", status);
  };

  /* ---------------- CRUD ---------------- */
  const handleSaveUser = async (data) => {
    try {
      if (modalState.mode === "create") {
        const response = await createUser(data);
        toast.success(response.message || "User created successfully");
      } else {
        const userId = modalState.user?._id || modalState.user?.id;
        const response = await updateUserByAdmin(userId, data);
        toast.success(response.message || "User updated successfully");
      }
      setModalState({ isOpen: false, mode: "view", user: null });
      refetch();
    } catch (e) {
      toast.error(e.message || "Failed to save user");
      console.error("Save user error:", e);
    }
  };

  const handleDeleteUser = async () => {
    try {
      const userId = deleteModalState.user?._id || deleteModalState.user?.id;

      if (!userId) {
        toast.error("User ID not found. Cannot delete user.");
        console.error("User object:", deleteModalState.user);
        return;
      }

      await deleteUser(userId);
      toast.success("User deleted successfully");
      setDeleteModalState({ isOpen: false, user: null });
      refetch();
    } catch (e) {
      toast.error(e.message || "Failed to delete user");
      console.error("Delete user error:", e);
    }
  };

  const handleToggleStatus = async (row) => {
    try {
      const userId = row?._id || row?.id;

      if (!userId) {
        toast.error("User ID not found. Cannot toggle status.");
        return;
      }

      const response = await toggleUserStatus(userId);
      toast.success(response.message || "User status updated successfully");
      refetch();
    } catch (e) {
      toast.error(e.message || "Failed to toggle user status");
      console.error("Toggle status error:", e);
      throw e;
    }
  };

  const handleSyncUsers = async () => {
    setSyncLoading(true);
    try {
      const response = await syncUsersToAllServices();
      toast.success(response.message || "Users synced successfully");
      refetch();
    } catch (e) {
      toast.error(e.message || "Failed to sync users");
      console.error("Sync users error:", e);
    } finally {
      setSyncLoading(false);
    }
  };

  /* ---------------- TABLE CONFIG ---------------- */
  const columns = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (value, row) => (
        <UserMiniCard
          name={value}
          email={row.email}
          isEmailVerified={row.isEmailVerified}
        />
      ),
    },
    {
      key: "phone",
      label: "Phone",
      sortable: false,
      render: (value) => (
        <div className="flex items-center gap-2">
          <Icon name="phone" size="14px" className="text-muted-foreground" />
          <span className="text-foreground">{value}</span>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      sortable: true,
      render: (v) => {
        const ROLE_COLOR = {
          admin: "red",
          expert: "blue",
          company: "green",
          user: "yellow",
        };

        return (
          <CustomBadge
            label={v}
            color={ROLE_COLOR[v?.toLowerCase()] || "gray"}
          />
        );
      },
    },
    {
      key: "isActive",
      label: "Status",
      sortable: false,
      render: (v) => (
        <CustomBadge
          label={v ? "Active" : "Inactive"}
          color={v ? "green" : "red"}
        />
      ),
    },
    {
      key: "createdBy",
      label: "Created By",
      sortable: false,
      render: (value, row) => {
        if (row.createdBy === "self") {
          return <UserMiniCard isSelf />;
        }

        if (row.createdBy?.user) {
          return (
            <UserMiniCard
              name={row.createdBy.user.name}
              email={row.createdBy.user.email}
            />
          );
        }

        return "-";
      },
    },
    {
      key: "createdAt",
      label: "Created At",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <Icon name="calendar" size="14px" className="text-muted-foreground" />
          <span className="text-sm whitespace-nowrap">{formatDate(value)}</span>
        </div>
      ),
    },
  ];

  const renderActions = (row) => {
    const actions = [
      {
        id: `toggle-${row._id || row.id}`,
        label: row.isActive ? "Deactivate User" : "Activate User",
        icon: "power",
        className: row.isActive
          ? "text-destructive hover:text-destructive"
          : "text-green-600 hover:text-green-600",
        onClick: () => handleToggleStatus(row),
      },
      {
        id: `edit-${row._id || row.id}`,
        label: "Edit User",
        icon: "edit",
        className: "text-primary hover:text-primary",
        onClick: () => setModalState({ isOpen: true, mode: "edit", user: row }),
      },
      {
        id: `delete-${row._id || row.id}`,
        label: "Delete User",
        icon: "trash",
        className: "text-destructive hover:text-destructive",
        onClick: () => setDeleteModalState({ isOpen: true, user: row }),
      },
    ];

    return (
      <div className="flex justify-center">
        <ActionDropdown actions={actions} />
      </div>
    );
  };

  const renderHeaderButtons = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const roleFilter = urlParams.get("role") || "";
    const statusFilter = urlParams.get("isActive") || "";

    return (
      <>
        {/* Role Filter */}
        {user.role === "admin" && (
          <SelectDropdown
            value={roleFilter}
            onChange={handleRoleFilter}
            options={[
              { value: "", label: "All Roles" },
              { value: "admin", label: "Admin" },
              { value: "expert", label: "Expert" },
              { value: "company", label: "Company" },
              { value: "user", label: "User" },
            ]}
            placeholder="All Roles"
            size="lg"
            variant="default"
          />
        )}

        {/* Status Filter */}
        <SelectDropdown
          value={statusFilter}
          onChange={handleStatusFilter}
          options={[
            { value: "", label: "All Status" },
            { value: "true", label: "Active" },
            { value: "false", label: "Inactive" },
          ]}
          placeholder="All Status"
          size="lg"
          variant="default"
        />

        {/* Sync users to all services  */}
        {user.role === "admin" && (
          <Button
            size="lg"
            onClick={handleSyncUsers}
            disabled={syncLoading}
            className="flex items-center gap-3 transition-all duration-200"
            title="Sync all users to services"
          >
            <Icon
              name={syncLoading ? "refresh" : "refresh"}
              size="18px"
              className={syncLoading ? "animate-spin" : ""}
            />
            {syncLoading ? "Syncing..." : "Sync Users"}
          </Button>
        )}

        <Button
          size="lg"
          onClick={() =>
            setModalState({ isOpen: true, mode: "create", user: null })
          }
          className="flex items-center gap-3"
        >
          <Icon name="plus" size="18px" />
          Add New User
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
        data={users}
        loading={loading}
        onSearch={handleSearch}
        onSort={handleSort}
        sortConfig={sortConfig}
        searchTerm={searchTerm}
        pagination={pagination}
        renderActions={renderActions}
        renderHeaderActions={renderHeaderButtons}
        searchPlaceholder="Search users by name, email, or phone..."
        emptyMessage={emptyMessage}
      />

      {modalState.isOpen && (
        <UserModal
          mode={modalState.mode}
          user={modalState.user}
          onSave={handleSaveUser}
          onClose={() =>
            setModalState({ isOpen: false, mode: "view", user: null })
          }
        />
      )}

      {deleteModalState.isOpen && (
        <DeleteUserModal
          user={deleteModalState.user}
          onConfirm={handleDeleteUser}
          onCancel={() => setDeleteModalState({ isOpen: false, user: null })}
        />
      )}
    </div>
  );
}

export default Users;
