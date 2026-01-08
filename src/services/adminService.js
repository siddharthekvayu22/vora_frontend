import { apiRequest } from "./apiService";

/**
 * Get admin dashboard analytics
 */
export function getAdminDashboardAnalytics() {
  return apiRequest("/admin/dashboard/analytics", true);
}

export default {
  getAdminDashboardAnalytics,
};