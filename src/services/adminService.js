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
export function getAdminFrameworkCategory() {
  return apiRequest("/admin/framework-categories/categories", true);
}
/**
 * Get admin framework access
 */
export function getAdminFrameworkAccess() {
  return apiRequest("/admin/framework-access/access/approved", true);
}

/**
 * Get admin framework access requests
 */
export function getAdminFrameworkAccessRequests() {
  return apiRequest("/admin/framework-access/access/requests", true);
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
export function revokeFrameworkAccess(expertId, frameworkId, adminNotes) {
  return apiRequest(
    `/admin/framework-access/access/revoke/${expertId}/${frameworkId}`,
    {
      method: "DELETE",
      body: JSON.stringify({ adminNotes }),
    },
    true,
  );
}

export default {
  getAdminDashboardAnalytics,
  getAdminFrameworkCategory,
  getAdminFrameworkAccess,
  getAdminFrameworkAccessRequests,
  createFrameworkCategory,
  updateFrameworkCategory,
  deleteFrameworkCategory,
  revokeFrameworkAccess,
};
