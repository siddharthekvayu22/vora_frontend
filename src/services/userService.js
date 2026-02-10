import { apiRequest } from "./apiService";

/**
 * Get all users
 */
export function getAllUsers({
  page = 1,
  limit = 10,
  search = "",
  sortBy = "",
  sortOrder = "",
  role = "",
  isActive = "",
} = {}) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
    ...(sortBy && { sortBy }),
    ...(sortOrder && { sortOrder }),
    ...(role && { role }),
    ...(isActive && { isActive }),
  });

  return apiRequest(`/users/all-users?${params.toString()}`, true);
}

/**
 * Get user by ID
 */
export function getUserById(userId) {
  return apiRequest(`/users/${userId}`, true); // ✅ GET with auth
}

/**
 * Create user (Admin)
 */
export function createUser(userData) {
  return apiRequest(
    "/users/create",
    {
      method: "POST",
      body: JSON.stringify(userData),
    },
    true,
  );
}

/**
 * Update user by admin
 */
export function updateUserByAdmin(userId, userData) {
  return apiRequest(
    `/users/${userId}`,
    {
      method: "PUT",
      body: JSON.stringify(userData),
    },
    true,
  );
}

/**
 * Own profile
 */
export function userProfile() {
  return apiRequest("/profile", true);
}

/**
 * Update own profile
 */
export function updateUser(userData) {
  return apiRequest(
    "/profile/update",
    {
      method: "PUT",
      body: JSON.stringify(userData),
    },
    true,
  );
}

/**
 * Delete user
 */
export function deleteUser(userId) {
  return apiRequest(
    `/users/${userId}`,
    {
      method: "DELETE",
    },
    true,
  );
}

/**
 * Toggle user status (active/inactive)
 */
export function toggleUserStatus(userId) {
  return apiRequest(
    `/users/${userId}/toggle-status`,
    {
      method: "PATCH",
    },
    true,
  );
}

export default {
  getAllUsers,
  getUserById,
  createUser,
  updateUserByAdmin,
  updateUser,
  deleteUser,
  toggleUserStatus,
};
