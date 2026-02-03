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
 * Get admin framework access rejected
 */
export function getAdminFrameworkAccessRejected() {
  return apiRequest("/admin/framework-access/access/rejected", true);
}

/**
 * Get admin framework access revoked
 */
export function getAdminFrameworkAccessRevoked() {
  return apiRequest("/admin/framework-access/access/revoked", true);
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
      method: "DELETE",
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
  getAdminFrameworkAccessRequests,
  getAdminFrameworkAccessRejected,
  getAdminFrameworkAccessRevoked,
  createFrameworkCategory,
  updateFrameworkCategory,
  deleteFrameworkCategory,
  revokeFrameworkAccess,
  approveFrameworkAccessRequest,
  rejectFrameworkAccessRequest,
  assignFrameworkAccess,
};
