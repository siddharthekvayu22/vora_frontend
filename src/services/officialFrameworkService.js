import { apiRequest } from "./apiService";

/**
 * Get all official frameworks
 */
export function getAllOfficialFrameworks() {
  return apiRequest("/official-frameworks/frameworks", true);
}

/**
 * Get available official frameworks category
 */
export function getOfficialFrameworkCategory() {
  return apiRequest(
    "/official-frameworks/frameworks/categories/available",
    true,
  );
}

export default {
  getAllOfficialFrameworks,
  getOfficialFrameworkCategory,
};
