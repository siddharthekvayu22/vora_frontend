import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import Icon from "../../../../components/Icon";
import { getAllUsers } from "../../../../services/userService";
import {
  getAdminFrameworkCategory,
  assignFrameworkAccess,
} from "../../../../services/adminService";

/**
 * GiveFrameworkAccessModal Component - Allows admin to assign framework access to users
 * Features two side-by-side tables for user and framework selection
 *
 * @param {Function} onSuccess - Success handler after assignment
 * @param {Function} onClose - Close handler
 */
export default function GiveFrameworkAccessModal({ onSuccess, onClose }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedFramework, setSelectedFramework] = useState(null);
  const [assigning, setAssigning] = useState(false);

  // Users state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersPagination, setUsersPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 5,
    hasPrevPage: false,
    hasNextPage: false,
  });
  const [usersSearchTerm, setUsersSearchTerm] = useState("");

  // Framework categories state
  const [frameworks, setFrameworks] = useState([]);
  const [frameworksLoading, setFrameworksLoading] = useState(false);
  const [frameworksPagination, setFrameworksPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 5,
    hasPrevPage: false,
    hasNextPage: false,
  });
  const [frameworksSearchTerm, setFrameworksSearchTerm] = useState("");

  /* ---------------- FETCH USERS ---------------- */
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await getAllUsers({
        page: usersPagination.currentPage,
        limit: usersPagination.limit,
        search: usersSearchTerm,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      setUsers(res.users || []);
      setUsersPagination((p) => ({
        ...p,
        totalPages: res.pagination?.totalPages || 1,
        totalItems: res.pagination?.totalItems || 0,
        hasPrevPage: usersPagination.currentPage > 1,
        hasNextPage:
          usersPagination.currentPage < (res.pagination?.totalPages || 1),
      }));
    } catch (err) {
      toast.error(err.message || "Failed to load users");
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  }, [usersPagination.currentPage, usersPagination.limit, usersSearchTerm]);

  /* ---------------- FETCH FRAMEWORK CATEGORIES ---------------- */
  const fetchFrameworks = useCallback(async () => {
    setFrameworksLoading(true);
    try {
      const res = await getAdminFrameworkCategory();

      // Apply client-side pagination and search since the API doesn't support it
      let filteredFrameworks = res.categories || [];

      // Apply search filter
      if (frameworksSearchTerm) {
        filteredFrameworks = filteredFrameworks.filter(
          (framework) =>
            framework.frameworkCategoryName
              ?.toLowerCase()
              .includes(frameworksSearchTerm.toLowerCase()) ||
            framework.frameworkCode
              ?.toLowerCase()
              .includes(frameworksSearchTerm.toLowerCase()) ||
            framework.description
              ?.toLowerCase()
              .includes(frameworksSearchTerm.toLowerCase()),
        );
      }

      // Apply pagination
      const totalItems = filteredFrameworks.length;
      const totalPages = Math.ceil(totalItems / frameworksPagination.limit);
      const startIndex =
        (frameworksPagination.currentPage - 1) * frameworksPagination.limit;
      const endIndex = startIndex + frameworksPagination.limit;
      const paginatedFrameworks = filteredFrameworks.slice(
        startIndex,
        endIndex,
      );

      setFrameworks(paginatedFrameworks);
      setFrameworksPagination((p) => ({
        ...p,
        totalPages,
        totalItems,
        hasPrevPage: frameworksPagination.currentPage > 1,
        hasNextPage: frameworksPagination.currentPage < totalPages,
      }));
    } catch (err) {
      toast.error(err.message || "Failed to load framework categories");
      setFrameworks([]);
    } finally {
      setFrameworksLoading(false);
    }
  }, [
    frameworksPagination.currentPage,
    frameworksPagination.limit,
    frameworksSearchTerm,
  ]);

  /* ---------------- EFFECTS ---------------- */
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchFrameworks();
  }, [fetchFrameworks]);

  /* ---------------- HANDLERS ---------------- */
  const handleUserPageChange = (page) => {
    setUsersPagination((p) => ({ ...p, currentPage: page }));
  };

  const handleFrameworkPageChange = (page) => {
    setFrameworksPagination((p) => ({ ...p, currentPage: page }));
  };

  const handleUserSearch = (term) => {
    setUsersSearchTerm(term);
    setUsersPagination((p) => ({ ...p, currentPage: 1 }));
  };

  const handleFrameworkSearch = (term) => {
    setFrameworksSearchTerm(term);
    setFrameworksPagination((p) => ({ ...p, currentPage: 1 }));
  };

  const handleUserSelect = (user) => {
    setSelectedUser(selectedUser?.id === user.id ? null : user);
  };

  const handleFrameworkSelect = (framework) => {
    setSelectedFramework(
      selectedFramework?.id === framework.id ? null : framework,
    );
  };

  const handleAssignAccess = async () => {
    if (!selectedUser || !selectedFramework) {
      toast.error("Please select both a user and a framework category");
      return;
    }

    setAssigning(true);
    try {
      const response = await assignFrameworkAccess(
        selectedUser.id,
        selectedFramework.id,
      );
      toast.success(
        response.message || "Framework access assigned successfully",
      );
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to assign framework access");
    } finally {
      setAssigning(false);
    }
  };

  /* ---------------- RENDER HELPERS ---------------- */
  const renderUserRow = (user) => (
    <tr
      key={user.id}
      onClick={() => handleUserSelect(user)}
      className={`cursor-pointer transition-all duration-200 hover:bg-muted/50 ${
        selectedUser?.id === user.id
          ? "bg-primary/10 border-l-4 border-primary"
          : "border-l-4 border-transparent"
      }`}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Icon
              name="user"
              size="16px"
              className="text-blue-600 dark:text-blue-400"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-foreground text-sm">
              {user.name}
            </span>
            <span className="text-xs text-muted-foreground">{user.email}</span>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
          {user.role}
        </span>
      </td>
    </tr>
  );

  const renderFrameworkRow = (framework) => (
    <tr
      key={framework.id}
      onClick={() => handleFrameworkSelect(framework)}
      className={`cursor-pointer transition-all duration-200 hover:bg-muted/50 ${
        selectedFramework?.id === framework.id
          ? "bg-primary/10 border-l-4 border-primary"
          : "border-l-4 border-transparent"
      }`}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Icon
              name="shield"
              size="16px"
              className="text-purple-600 dark:text-purple-400"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-foreground text-sm">
              {framework.frameworkCategoryName}
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              {framework.frameworkCode}
            </span>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="text-xs text-muted-foreground line-clamp-2 max-w-xs">
          {framework.description}
        </span>
      </td>
    </tr>
  );

  const renderPagination = (pagination, onPageChange) => (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
      <div className="text-xs text-muted-foreground">
        Showing {(pagination.currentPage - 1) * pagination.limit + 1} to{" "}
        {Math.min(
          pagination.currentPage * pagination.limit,
          pagination.totalItems,
        )}{" "}
        of {pagination.totalItems} results
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(pagination.currentPage - 1)}
          disabled={!pagination.hasPrevPage}
          className="px-3 py-1 text-xs border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span className="text-xs text-muted-foreground">
          Page {pagination.currentPage} of {pagination.totalPages}
        </span>
        <button
          onClick={() => onPageChange(pagination.currentPage + 1)}
          disabled={!pagination.hasNextPage}
          className="px-3 py-1 text-xs border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );

  /* ---------------- UI ---------------- */
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon name="user-plus" size="20px" className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                Give Framework Access
              </h2>
              <p className="text-sm text-muted-foreground">
                Select a user and framework category to assign access
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <Icon name="x" size="20px" className="text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Users Table */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Icon name="users" size="18px" className="text-blue-600" />
                  Select User
                </h3>
                {selectedUser && (
                  <span className="text-xs text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                    Selected: {selectedUser.name}
                  </span>
                )}
              </div>

              <div className="border border-border rounded-lg overflow-hidden">
                {/* Search */}
                <div className="p-4 border-b border-border">
                  <div className="relative">
                    <Icon
                      name="search"
                      size="16px"
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                    />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={usersSearchTerm}
                      onChange={(e) => handleUserSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/30">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Role
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {usersLoading ? (
                        <tr>
                          <td colSpan="2" className="px-4 py-8 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-muted-foreground">
                                Loading users...
                              </span>
                            </div>
                          </td>
                        </tr>
                      ) : users.length === 0 ? (
                        <tr>
                          <td
                            colSpan="2"
                            className="px-4 py-8 text-center text-muted-foreground"
                          >
                            No users found
                          </td>
                        </tr>
                      ) : (
                        users.map(renderUserRow)
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {!usersLoading &&
                  users.length > 0 &&
                  renderPagination(usersPagination, handleUserPageChange)}
              </div>
            </div>

            {/* Framework Categories Table */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Icon name="shield" size="18px" className="text-purple-600" />
                  Select Framework Category
                </h3>
                {selectedFramework && (
                  <span className="text-xs text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                    Selected: {selectedFramework.frameworkCategoryName}
                  </span>
                )}
              </div>

              <div className="border border-border rounded-lg overflow-hidden">
                {/* Search */}
                <div className="p-4 border-b border-border">
                  <div className="relative">
                    <Icon
                      name="search"
                      size="16px"
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                    />
                    <input
                      type="text"
                      placeholder="Search frameworks..."
                      value={frameworksSearchTerm}
                      onChange={(e) => handleFrameworkSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/30">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Framework
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {frameworksLoading ? (
                        <tr>
                          <td colSpan="2" className="px-4 py-8 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-muted-foreground">
                                Loading frameworks...
                              </span>
                            </div>
                          </td>
                        </tr>
                      ) : frameworks.length === 0 ? (
                        <tr>
                          <td
                            colSpan="2"
                            className="px-4 py-8 text-center text-muted-foreground"
                          >
                            No framework categories found
                          </td>
                        </tr>
                      ) : (
                        frameworks.map(renderFrameworkRow)
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {!frameworksLoading &&
                  frameworks.length > 0 &&
                  renderPagination(
                    frameworksPagination,
                    handleFrameworkPageChange,
                  )}
              </div>
            </div>
          </div>

          {/* Selection Summary */}
          {(selectedUser || selectedFramework) && (
            <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
              <h4 className="text-sm font-medium text-foreground mb-3">
                Selection Summary
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Icon name="user" size="16px" className="text-blue-600" />
                  <span className="text-sm text-muted-foreground">User:</span>
                  <span className="text-sm font-medium text-foreground">
                    {selectedUser ? selectedUser.name : "Not selected"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Icon name="shield" size="16px" className="text-purple-600" />
                  <span className="text-sm text-muted-foreground">
                    Framework:
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {selectedFramework
                      ? selectedFramework.frameworkCategoryName
                      : "Not selected"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAssignAccess}
            disabled={!selectedUser || !selectedFramework || assigning}
            className="px-6 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {assigning ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                Assigning...
              </>
            ) : (
              <>
                <Icon name="check" size="16px" />
                Continue
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
