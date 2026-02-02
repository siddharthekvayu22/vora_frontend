import { apiRequest } from "./apiService";

/**
 * Get all official frameworks
 */
function getAllOfficialFrameworks() {
  return apiRequest("/official-frameworks/frameworks", true);
}

export default {
  getAllOfficialFrameworks,
};
