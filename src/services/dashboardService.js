/**
 * Dashboard Service
 * Handles dashboard analytics API calls
 */

import { apiRequest } from "./apiService";

/**
 * Get admin dashboard analytics
 */
export function getAdminDashboardAnalytics() {
  return apiRequest("/dashboard/admin/analytics", true);
}

/**
 * Get Expert Dashboard Analytics
 * @returns {Promise} Dashboard analytics data
 */
export async function getExpertDashboardAnalytics() {
  return await apiRequest("/dashboard/expert/analytics", true);
}
