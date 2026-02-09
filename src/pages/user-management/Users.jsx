import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
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
} from "../../services/userService";
import { formatDate } from "../../utils/dateFormatter";
import CustomBadge from "../../components/custom/CustomBadge";
import UserMiniCard from "../../components/custom/UserMiniCard";
import ActionDropdown from "../../components/custom/ActionDropdown";

function Users() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emptyMessage, setEmptyMessage] = useState("No users found");

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

  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: "view",
    user: null,
  });

  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    user: null,
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

  /* ---------------- FETCH USERS ---------------- */
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllUsers({
        page: pagination.currentPage,
        limit: pagination.limit,
        search: searchTerm,
        sortBy: sortConfig.sortBy,
        sortOrder: sortConfig.sortOrder,
      });

      setUsers(res.data || res.users || []);

      // Set the message from backend response, especially for empty results
      if (res.message && (res.users?.length === 0 || res.data?.length === 0)) {
        setEmptyMessage(res.message);
      } else if (
        searchTerm &&
        (res.users?.length === 0 || res.data?.length === 0)
      ) {
        setEmptyMessage(`No users found for "${searchTerm}"`);
      } else {
        setEmptyMessage("No users found");
      }

      setPagination((p) => ({
        ...p,
        totalPages: res.pagination?.totalPages || 1,
        totalItems: res.pagination?.totalItems || 0,
        hasPrevPage: pagination.currentPage > 1,
        hasNextPage: pagination.currentPage < (res.pagination?.totalPages || 1),
      }));
    } catch (err) {
      toast.error(err.message || "Failed to load users");
      setUsers([]);
      setEmptyMessage("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.limit, searchTerm, sortConfig]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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
      fetchUsers();
    } catch (e) {
      toast.error(e.message || "Failed to save user");
      console.error("Save user error:", e);
    }
  };

  const handleDeleteUser = async () => {
    try {
      // Handle both _id and id fields for user identification
      const userId = deleteModalState.user?._id || deleteModalState.user?.id;

      if (!userId) {
        toast.error("User ID not found. Cannot delete user.");
        console.error("User object:", deleteModalState.user);
        return;
      }

      await deleteUser(userId);
      toast.success("User deleted successfully");
      setDeleteModalState({ isOpen: false, user: null });
      fetchUsers();
    } catch (e) {
      toast.error(e.message || "Failed to delete user");
      console.error("Delete user error:", e);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      const userId = user?._id || user?.id;

      if (!userId) {
        toast.error("User ID not found. Cannot toggle status.");
        return;
      }

      const response = await toggleUserStatus(userId);
      toast.success(response.message || "User status updated successfully");
      fetchUsers();
    } catch (e) {
      toast.error(e.message || "Failed to toggle user status");
      console.error("Toggle status error:", e);
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
        label: row.isActive ? "Deactivate User" : "Activate User",
        icon: "power",
        className: row.isActive ? "text-destructive" : "text-green-600",
        onClick: () => handleToggleStatus(row),
      },
      {
        label: "Edit User",
        icon: "edit",
        className: "text-primary",
        onClick: () => setModalState({ isOpen: true, mode: "edit", user: row }),
      },
      {
        label: "Delete User",
        icon: "trash",
        className: "text-destructive",
        onClick: () => setDeleteModalState({ isOpen: true, user: row }),
      },
    ];

    return (
      <div className="flex justify-center">
        <ActionDropdown actions={actions} />
      </div>
    );
  };

  const renderHeaderButtons = () => (
    <button
      onClick={() =>
        setModalState({ isOpen: true, mode: "create", user: null })
      }
      className="flex items-center gap-3 px-5 py-3 bg-primary text-primary-foreground rounded-lg hover:shadow-lg hover:scale-[102%] transition-all duration-200 font-medium text-xs cursor-pointer"
    >
      <Icon name="plus" size="18px" />
      Add New User
    </button>
  );

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
        pagination={{ ...pagination, onPageChange: handlePageChange }}
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
