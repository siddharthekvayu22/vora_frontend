import { apiRequest } from "./apiService";

/**
 * Get all official frameworks
 */
export function getAllOfficialFrameworks() {
  return apiRequest("/official-frameworks/frameworks/my-frameworks", true);
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

/**
 * Get available official frameworks category access
 */
export function getOfficialFrameworkCategoryAccess() {
  return apiRequest("/official-frameworks/frameworks/access/my-access", true);
}

/**
 * Request framework access
 */
export function requestFrameworkAccess(frameworkId) {
  return apiRequest(
    `/official-frameworks/frameworks/access/${frameworkId}/request`,
    {
      method: "POST",
    },
    true,
  );
}

/**
 * Upload framework file
 */
export function uploadFramework(formData) {
  return apiRequest(
    "/files/upload",
    {
      method: "POST",
      body: formData, // FormData object
    },
    true,
  );
}

/**
 * Download framework file
 */
export async function downloadOfficialFrameworkFile(fileId, fileName) {
  const blob = await apiRequest(
    `/files/${fileId}/download`,
    {
      method: "GET",
      responseType: "blob", // 🔥 important
    },
    true,
  );

  // Trigger browser download
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName || "framework";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

/**
 * Delete official framework
 */
export function deleteOfficialFramework(frameworkId) {
  return apiRequest(
    `/official-frameworks/frameworks/${frameworkId}`,
    {
      method: "DELETE",
    },
    true,
  );
}

export default {
  getAllOfficialFrameworks,
  getOfficialFrameworkCategory,
  getOfficialFrameworkCategoryAccess,
  requestFrameworkAccess,
  uploadFramework,
  downloadOfficialFrameworkFile,
  deleteOfficialFramework,
};
