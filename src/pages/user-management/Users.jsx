import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import DataTable from "../../components/data-table/DataTable";
import UserModal from "./components/UserModal";
import UserViewModal from "./components/UserViewModal";
import DeleteUserModal from "./components/DeleteUserModal";
import Icon from "../../components/Icon";
import {
  getAllUsers,
  createUser,
  deleteUser,
  updateUserByAdmin,
} from "../../services/userService";
import { formatDate } from "../../utils/dateFormatter";

function Users() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const [viewModalState, setViewModalState] = useState({
    isOpen: false,
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
        await createUser(data);
        toast.success("User created");
      } else {
        // Handle both _id and id fields for user identification
        const userId = modalState.user?._id || modalState.user?.id;

        if (!userId) {
          toast.error("User ID not found. Cannot update user.");
          console.error("User object:", modalState.user);
          return;
        }

        await updateUserByAdmin(userId, data);
        toast.success("User updated");
      }
      setModalState({ isOpen: false, mode: "view", user: null });
      fetchUsers();
    } catch (e) {
      toast.error(e.message || "Failed to save user");
      console.error("Save user error:", e);
    }
  };

  const handleDeleteUser = async (deleteData) => {
    try {
      // Handle both _id and id fields for user identification
      const userId = deleteModalState.user?._id || deleteModalState.user?.id;

      if (!userId) {
        toast.error("User ID not found. Cannot delete user.");
        console.error("User object:", deleteModalState.user);
        return;
      }

      await deleteUser(userId, deleteData);
      toast.success(
        deleteData
          ? "User and all data deleted successfully"
          : "User deleted successfully"
      );
      setDeleteModalState({ isOpen: false, user: null });
      fetchUsers();
    } catch (e) {
      toast.error(e.message || "Failed to delete user");
      console.error("Delete user error:", e);
    }
  };

  /* ---------------- TABLE CONFIG ---------------- */
  const columns = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary border border-primary/20">
            <Icon name="user" size="18px" />
          </div>
          <div>
            <span className="font-semibold text-foreground block whitespace-nowrap">
              {value}
            </span>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              User Profile
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <Icon name="mail" size="14px" className="text-muted-foreground" />
          <span className="text-foreground">{value}</span>
        </div>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      sortable: true,
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
        const getRoleStyles = (role) => {
          switch (role?.toLowerCase()) {
            case "admin":
              return {
                bg: "bg-red-100 dark:bg-red-900/30",
                text: "text-red-700 dark:text-red-400",
                border: "border-red-200 dark:border-red-800",
                dot: "bg-red-500",
              };
            case "expert":
              return {
                bg: "bg-blue-100 dark:bg-blue-900/30",
                text: "text-blue-700 dark:text-blue-400",
                border: "border-blue-200 dark:border-blue-800",
                dot: "bg-blue-500",
              };
            case "user":
              return {
                bg: "bg-green-100 dark:bg-green-900/30",
                text: "text-green-700 dark:text-green-400",
                border: "border-green-200 dark:border-green-800",
                dot: "bg-green-500",
              };
            default:
              return {
                bg: "bg-gray-100 dark:bg-gray-900/30",
                text: "text-gray-700 dark:text-gray-400",
                border: "border-gray-200 dark:border-gray-800",
                dot: "bg-gray-500",
              };
          }
        };

        const styles = getRoleStyles(v);

        return (
          <span
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${styles.bg} ${styles.text} border ${styles.border}`}
          >
            <div className={`w-2 h-2 rounded-full ${styles.dot}`}></div>
            {v}
          </span>
        );
      },
    },
    {
      key: "isEmailVerified",
      label: "Status",
      sortable: true,
      render: (v) => (
        <span
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
            v
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800"
              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800"
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full ${
              v ? "bg-green-500" : "bg-yellow-500"
            }`}
          ></div>
          {v ? "Verified" : "Pending"}
        </span>
      ),
    },
    {
      key: "createdByAdmin",
      label: "Created By",
      sortable: true,
      render: (value, row) => {
        // If createdBy is "self", show self-created
        if (row.createdBy === "self") {
          return (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/20 flex items-center justify-center text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800">
                <Icon name="user-check" size="18px" />
              </div>
              <div>
                <span className="font-semibold text-foreground block whitespace-nowrap">
                  Self Created
                </span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  User Registration
                </span>
              </div>
            </div>
          );
        }

        // If createdByAdmin exists, show admin info
        if (value && value.name) {
          return (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <Icon name="user" size="18px" />
              </div>
              <div>
                <span className="font-semibold text-foreground block whitespace-nowrap">
                  {value.name}
                </span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {value.email}
                </span>
              </div>
            </div>
          );
        }

        // Fallback for unknown cases
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-900/30 dark:to-gray-800/20 flex items-center justify-center text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800">
              <Icon name="help-circle" size="18px" />
            </div>
            <div>
              <span className="font-semibold text-foreground block whitespace-nowrap">
                Unknown
              </span>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                Creator Unknown
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: "createdAt",
      label: "Created At",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <Icon name="calendar" size="14px" className="text-muted-foreground" />
          <span className="text-foreground whitespace-nowrap">
            {formatDate(value)}
          </span>
        </div>
      ),
    },
  ];

  const renderActions = (row) => (
    <div className="flex gap-1 justify-center">
      <button
        onClick={() => {
          const userId = row._id || row.id;
          navigate(`/users/${userId}/statistics`);
        }}
        className="px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full transition-all duration-200 hover:scale-105"
        title="View Statistics"
      >
        <Icon name="eye" size="16px" />
      </button>
      <button
        onClick={() => setModalState({ isOpen: true, mode: "edit", user: row })}
        className="px-3 py-2 hover:bg-primary/10 text-primary rounded-full transition-all duration-200 hover:scale-105"
        title="Edit User"
      >
        <Icon name="edit" size="16px" />
      </button>
      <button
        onClick={() => setDeleteModalState({ isOpen: true, user: row })}
        className="px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full transition-all duration-200 hover:scale-105"
        title="Delete User"
      >
        <Icon name="trash" size="16px" />
      </button>
    </div>
  );

  /* ---------------- UI ---------------- */
  return (
    <div className="mt-5 pb-5 space-y-8">
      {/* Header Section */}
      <div className="flex flex-wrap justify-between items-start gap-6 p-6 bg-gradient-to-r from-card to-muted/30 rounded-xl border border-border shadow-sm">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon name="users" size="20px" className="text-primary" />
            </div>
            User Management
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage system users and their permissions
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              Total Users:{" "}
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

        <button
          onClick={() =>
            setModalState({ isOpen: true, mode: "create", user: null })
          }
          className="flex items-center gap-3 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium"
        >
          <Icon name="plus" size="18px" />
          Add New User
        </button>
      </div>

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
        searchPlaceholder="Search users by name, email, or phone..."
        emptyMessage="No users found"
      />

      {viewModalState.isOpen && (
        <UserViewModal
          user={viewModalState.user}
          onClose={() => setViewModalState({ isOpen: false, user: null })}
          onEdit={(u) => {
            setViewModalState({ isOpen: false, user: null });
            setModalState({ isOpen: true, mode: "edit", user: u });
          }}
        />
      )}

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
