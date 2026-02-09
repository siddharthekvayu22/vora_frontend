import { apiRequest } from "./apiService";

/**
 * Get admin dashboard analytics
 */
export function getAdminDashboardAnalytics() {
  return apiRequest("/admin/dashboard/analytics", true);
}

/**
 * Get admin framework category
 */
export function getAdminFrameworkCategory({
  page = 1,
  limit = 10,
  search = "",
} = {}) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
  });
  return apiRequest(
    `/admin/framework-categories/categories?${params.toString()}`,
    true,
  );
}
/**
 * Get admin framework access (all statuses)
 */
export function getAdminFrameworkAccess({
  page = 1,
  limit = 10,
  search = "",
  status = "",
  sortBy = "createdAt",
  sortOrder = "desc",
} = {}) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
    ...(status && { status }),
    ...(sortBy && { sortBy }),
    ...(sortOrder && { sortOrder }),
  });
  return apiRequest(
    `/admin/framework-access/access/?${params.toString()}`,
    true,
  );
}

/**
 * Create framework category
 */
export function createFrameworkCategory(categoryData) {
  return apiRequest(
    "/admin/framework-categories/categories",
    {
      method: "POST",
      body: JSON.stringify(categoryData),
    },
    true,
  );
}

/**
 * Update framework category
 */
export function updateFrameworkCategory(categoryId, categoryData) {
  return apiRequest(
    `/admin/framework-categories/categories/${categoryId}`,
    {
      method: "PUT",
      body: JSON.stringify(categoryData),
    },
    true,
  );
}

/**
 * Delete framework category
 */
export function deleteFrameworkCategory(categoryId) {
  return apiRequest(
    `/admin/framework-categories/categories/${categoryId}`,
    {
      method: "DELETE",
    },
    true,
  );
}

/**
 * Revoke framework access
 */
export function revokeFrameworkAccess(expertId, frameworkId) {
  return apiRequest(
    `/admin/framework-access/access/revoke/${expertId}/${frameworkId}`,
    {
      method: "PUT",
    },
    true,
  );
}

/**
 * Approve framework access request
 */
export function approveFrameworkAccessRequest(requestId) {
  return apiRequest(
    `/admin/framework-access/access/approve/${requestId}`,
    {
      method: "PUT",
    },
    true,
  );
}

/**
 * Reject framework access request
 */
export function rejectFrameworkAccessRequest(requestId) {
  return apiRequest(
    `/admin/framework-access/access/reject/${requestId}`,
    {
      method: "PUT",
    },
    true,
  );
}

/**
 * Assign framework access directly
 */
export function assignFrameworkAccess(expertId, frameworkId) {
  return apiRequest(
    `/admin/framework-access/access/${expertId}/${frameworkId}/assign`,
    {
      method: "POST",
    },
    true,
  );
}

export default {
  getAdminDashboardAnalytics,
  getAdminFrameworkCategory,
  getAdminFrameworkAccess,
  createFrameworkCategory,
  updateFrameworkCategory,
  deleteFrameworkCategory,
  revokeFrameworkAccess,
  approveFrameworkAccessRequest,
  rejectFrameworkAccessRequest,
  assignFrameworkAccess,
};
