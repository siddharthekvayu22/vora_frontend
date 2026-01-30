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

/**
 * Approve framework access request
 */
export function approveFrameworkAccessRequest(requestId, adminApproveMessage) {
  return apiRequest(
    `/admin/framework-access/access/approve/${requestId}`,
    {
      method: "PUT",
      body: JSON.stringify({ adminApproveMessage }),
    },
    true,
  );
}

/**
 * Reject framework access request
 */
export function rejectFrameworkAccessRequest(requestId, adminRejectMessage) {
  return apiRequest(
    `/admin/framework-access/access/reject/${requestId}`,
    {
      method: "PUT",
      body: JSON.stringify({ adminRejectMessage }),
    },
    true,
  );
}

/**
 * Assign framework access directly
 */
export function assignFrameworkAccess(
  expertId,
  frameworkId,
  adminAssignMessage,
) {
  return apiRequest(
    `/admin/framework-access/access/${expertId}/${frameworkId}/assign`,
    {
      method: "POST",
      body: JSON.stringify({ adminAssignMessage }),
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
  approveFrameworkAccessRequest,
  rejectFrameworkAccessRequest,
  assignFrameworkAccess,
};
