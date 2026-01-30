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

export default {
  getAdminDashboardAnalytics,
  getAdminFrameworkCategory,
  getAdminFrameworkAccess,
};
