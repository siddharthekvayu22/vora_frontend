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
} = {}) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
    ...(sortBy && { sortBy }),
    ...(sortOrder && { sortOrder }),
  });

  return apiRequest(`/user/all-users?${params.toString()}`, true);
}

/**
 * Get user by ID
 */
export function getUserById(userId) {
  return apiRequest(`/user/${userId}`, true); // ✅ GET with auth
}

/**
 * Create user (Admin)
 */
export function createUser(userData) {
  return apiRequest(
    "/user/create",
    {
      method: "POST",
      body: JSON.stringify(userData),
    },
    true
  );
}

/**
 * Update user by admin
 */
export function updateUserByAdmin(userId, userData) {
  return apiRequest(
    `/user/update/${userId}`,
    {
      method: "PUT",
      body: JSON.stringify(userData),
    },
    true
  );
}

/**
 * Update own profile
 */
export function updateUser(userData) {
  return apiRequest(
    "/user/profile/update",
    {
      method: "PUT",
      body: JSON.stringify(userData),
    },
    true
  );
}

/**
 * Delete user
 */
export function deleteUser(userId, deleteData = true) {
  return apiRequest(
    `/user/${userId}`, 
    {
      method: "DELETE",
      body: JSON.stringify({ deleteData }),
    }, 
    true
  );
}

export default {
  getAllUsers,
  getUserById,
  createUser,
  updateUserByAdmin,
  updateUser,
  deleteUser,
};
