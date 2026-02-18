import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import Icon from "../../../../components/Icon";
import SelectDropdown from "../../../../components/custom/SelectDropdown";
import { getAllUsers } from "../../../../services/userService";
import {
  getAdminFrameworkCategory,
  assignFrameworkAccess,
} from "../../../../services/adminService";
import CustomBadge from "../../../../components/custom/CustomBadge";
import { Button } from "@/components/ui/button";

// Debounce utility function
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

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
  const [usersRoleFilter, setUsersRoleFilter] = useState("expert"); // Default to expert role
  const [frameworksSearchTerm, setFrameworksSearchTerm] = useState("");

  // Debounced search terms to reduce API calls
  const debouncedUsersSearchTerm = useDebounce(usersSearchTerm, 500);
  const debouncedFrameworksSearchTerm = useDebounce(frameworksSearchTerm, 500);

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

  /* ---------------- FETCH USERS ---------------- */
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const params = {
        page: usersPagination.currentPage,
        limit: usersPagination.limit,
        search: debouncedUsersSearchTerm,
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      // Add role filter if selected
      if (usersRoleFilter) {
        params.role = usersRoleFilter;
      }

      const res = await getAllUsers(params);

      setUsers(res.data || []);
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
  }, [
    usersPagination.currentPage,
    usersPagination.limit,
    debouncedUsersSearchTerm,
    usersRoleFilter,
  ]);

  /* ---------------- FETCH FRAMEWORK CATEGORIES ---------------- */
  const fetchFrameworks = useCallback(async () => {
    setFrameworksLoading(true);
    try {
      const res = await getAdminFrameworkCategory();

      // Apply client-side pagination and search since the API doesn't support it
      let filteredFrameworks = res.data || [];

      // Apply search filter
      if (debouncedFrameworksSearchTerm) {
        filteredFrameworks = filteredFrameworks.filter(
          (framework) =>
            framework.frameworkCategoryName
              ?.toLowerCase()
              .includes(debouncedFrameworksSearchTerm.toLowerCase()) ||
            framework.code
              ?.toLowerCase()
              .includes(debouncedFrameworksSearchTerm.toLowerCase()) ||
            framework.description
              ?.toLowerCase()
              .includes(debouncedFrameworksSearchTerm.toLowerCase()),
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
    debouncedFrameworksSearchTerm,
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

  const handleUserRoleFilter = (role) => {
    setUsersRoleFilter(role);
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
  const getRoleStyle = (role) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "expert":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case "company":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

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
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-6 h-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary border border-primary/20`}
          >
            <Icon name="user" size="14px" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-foreground text-sm">
              {user.name}
            </span>
            <span className="text-xs text-muted-foreground">{user.email}</span>
          </div>
        </div>
      </td>
      <td className="px-3 py-2">
        <CustomBadge
          label={user.role}
          color={
            user.role === "admin"
              ? "blue"
              : user.role === "expert"
                ? "green"
                : "gray"
          }
        >
          {user.role}
        </CustomBadge>
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
      <td className="px-3 py-2 align-top">
        <div className="flex items-start gap-2">
          <div className="">
            <div
              className="w-7 h-7 rounded-full 
                  bg-purple-100 dark:bg-purple-900/40
                  flex items-center justify-center
                  border border-purple-200 dark:border-purple-800"
            >
              <Icon
                name="shield"
                size="16px"
                className="text-purple-600 dark:text-purple-400"
              />
            </div>
          </div>

          <div className="flex flex-col min-w-0">
            <span className="font-medium text-foreground text-sm line-clamp-1">
              {framework.frameworkCategoryName}
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              {framework.code}
            </span>
          </div>
        </div>
      </td>

      <td className="px-3 py-2 align-top">
        <span className="text-xs text-muted-foreground line-clamp-2 max-w-xs">
          {framework.description}
        </span>
      </td>
    </tr>
  );

  const renderPagination = (pagination, onPageChange) => (
    <div className="flex items-center justify-between px-3 py-2 border-t border-border">
      <div className="text-xs text-muted-foreground">
        Showing {(pagination.currentPage - 1) * pagination.limit + 1} to{" "}
        {Math.min(
          pagination.currentPage * pagination.limit,
          pagination.totalItems,
        )}{" "}
        of {pagination.totalItems} results
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(pagination.currentPage - 1)}
          disabled={!pagination.hasPrevPage}
          className="px-2 py-1 text-xs border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span className="text-xs text-muted-foreground px-2">
          Page {pagination.currentPage} of {pagination.totalPages}
        </span>
        <button
          onClick={() => onPageChange(pagination.currentPage + 1)}
          disabled={!pagination.hasNextPage}
          className="px-2 py-1 text-xs border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );

  /* ---------------- UI ---------------- */
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10000] animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-background rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-5 duration-300 sidebar-scroll border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-primary to-primary/80 text-white p-4 relative overflow-hidden min-h-[70px]">
          <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-white/10 rounded-full transform translate-x-[40%] -translate-y-[40%]"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="user-plus" size="22px" />
              <div>
                <h2 className="text-lg font-bold text-white drop-shadow-sm">
                  Give Framework Access
                </h2>
                <p className="text-xs text-white/80">
                  Select a user and framework category to assign access
                </p>
              </div>
            </div>
               <Button
              size="icon"
              variant="outline"
              className="bg-white/10 border border-white/20 text-white backdrop-blur-sm rounded-full w-9 h-9 flex items-center justify-center hover:bg-white/20 hover:border-white/40 hover:scale-105 transition-all duration-200 cursor-pointer"
              onClick={onClose}
              title="Close"
            >
              <Icon name="x" size="20px" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-160px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Users Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Icon
                    name="users"
                    size="16px"
                    className="text-blue-600 dark:text-blue-400"
                  />
                  Select User
                  {usersRoleFilter && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400`}
                    >
                      {usersRoleFilter}
                    </span>
                  )}
                </h3>
                {selectedUser && (
                  <span className="text-xs text-green-800 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">
                    Selected: {selectedUser.name}
                  </span>
                )}
              </div>

              <div className="border border-border rounded-xl bg-background">
                {/* Search and Filter */}
                <div className="p-3 border-b border-border bg-muted/30">
                  <div className="flex gap-2">
                    {/* Search Input */}
                    <div className="relative flex-1">
                      <Icon
                        name="search"
                        size="14px"
                        className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                      />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={usersSearchTerm}
                        onChange={(e) => handleUserSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                      />
                    </div>

                    {/* Role Filter */}
                    <SelectDropdown
                      value={usersRoleFilter}
                      onChange={handleUserRoleFilter}
                      options={[
                        { value: "", label: "All Roles" },
                        { value: "admin", label: "Admin" },
                        { value: "expert", label: "Expert" },
                        { value: "company", label: "Company" },
                      ]}
                      placeholder="All Roles"
                      size="md"
                      variant="default"
                    />
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/30">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Role
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {usersLoading ? (
                        <tr>
                          <td colSpan="2" className="px-3 py-6 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-muted-foreground text-sm">
                                Loading users...
                              </span>
                            </div>
                          </td>
                        </tr>
                      ) : users.length === 0 ? (
                        <tr>
                          <td
                            colSpan="2"
                            className="px-3 py-6 text-center text-muted-foreground text-sm"
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
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Icon
                    name="shield"
                    size="16px"
                    className="text-purple-600 dark:text-purple-400"
                  />
                  Select Framework Category
                </h3>
                {selectedFramework && (
                  <span className="text-xs text-green-800 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">
                    Selected: {selectedFramework.frameworkCategoryName}
                  </span>
                )}
              </div>

              <div className="border border-border rounded-xl overflow-hidden bg-background">
                {/* Search */}
                <div className="p-3 border-b border-border bg-muted/30">
                  <div className="relative">
                    <Icon
                      name="search"
                      size="14px"
                      className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                    />
                    <input
                      type="text"
                      placeholder="Search frameworks..."
                      value={frameworksSearchTerm}
                      onChange={(e) => handleFrameworkSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                    />
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/30">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Framework
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {frameworksLoading ? (
                        <tr>
                          <td colSpan="2" className="px-3 py-6 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-muted-foreground text-sm">
                                Loading frameworks...
                              </span>
                            </div>
                          </td>
                        </tr>
                      ) : frameworks.length === 0 ? (
                        <tr>
                          <td
                            colSpan="2"
                            className="px-3 py-6 text-center text-muted-foreground text-sm"
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
            <div className="mt-4 p-3 bg-muted/50 rounded-xl border border-border">
              <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Icon name="info" size="14px" className="text-primary" />
                Selection Summary
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Icon
                    name="user"
                    size="14px"
                    className="text-blue-600 dark:text-blue-400"
                  />
                  <span className="text-sm text-muted-foreground">User:</span>
                  <span className="text-sm font-medium text-foreground">
                    {selectedUser ? selectedUser.name : "Not selected"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon
                    name="shield"
                    size="14px"
                    className="text-purple-600 dark:text-purple-400"
                  />
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
        <div className="flex gap-2 justify-end p-3 border-t border-border">
          <button
            onClick={onClose}
            className="flex-1 px-3 py-1.5 text-sm font-semibold rounded-lg bg-muted text-foreground border-2 border-border hover:bg-muted/80 transition-all duration-200 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleAssignAccess}
            disabled={!selectedUser || !selectedFramework || assigning}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none transition-all duration-200 cursor-pointer"
          >
            {assigning ? (
              <>
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Assigning...
              </>
            ) : (
              <>
                <Icon name="check" size="14px" />
                Continue
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
