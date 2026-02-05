import { apiRequest } from "./apiService";

/**
 * Get all official frameworks
 */
export function getAllOfficialFrameworks({
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
    `/official-frameworks/frameworks/my-frameworks?${params.toString()}`,
    true,
  );
}

/**
 * Get available official frameworks category
 */
export function getOfficialFrameworkCategory({
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
    `/official-frameworks/frameworks/categories/available?${params.toString()}`,
    true,
  );
}

/**
 * Get available official frameworks category access
 */
export function getOfficialFrameworkCategoryAccess({
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
    `/official-frameworks/frameworks/access/my-access?${params.toString()}`,
    true,
  );
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
 * Update framework file
 */
export function updateFramework(frameworkId, formData) {
  return apiRequest(
    `/files/${frameworkId}`,
    {
      method: "PUT",
      body: formData, // FormData object
    },
    true,
  );
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
  updateFramework,
  downloadOfficialFrameworkFile,
  deleteOfficialFramework,
};
