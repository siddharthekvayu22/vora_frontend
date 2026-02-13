import { apiRequest } from "./apiService";

/**
 * Get official framework by ID
 */
export function getOfficialFrameworkById(id) {
  return apiRequest(`/official-frameworks/frameworks/${id}`, true);
}

/**
 * Get all official frameworks
 */
export function getAllOfficialFrameworks({
  page = 1,
  limit = 10,
  search = "",
  status = "",
} = {}) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
    ...(status && { status }),
  });

  return apiRequest(
    `/official-frameworks/frameworks/all-frameworks?${params.toString()}`,
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
export function uploadOfficialFramework(formData) {
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
 * Upload framework file to ai
 */
export function uploadOfficialFrameworkToAi(id) {
  return apiRequest(
    `/files/${id}/upload-to-ai`,
    {
      method: "POST",
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
export function updateOfficialFramework(frameworkId, formData) {
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
export function deleteOfficialFramework(fileId) {
  return apiRequest(
    `/files/${fileId}`,
    {
      method: "DELETE",
    },
    true,
  );
}

/**
 * Delete a specific file version
 */
export function deleteOfficialFrameworkVersion(fileId, versionFileId) {
  return apiRequest(
    `/files/${fileId}/versions/${versionFileId}`,
    {
      method: "DELETE",
    },
    true,
  );
}

export default {
  getOfficialFrameworkById,
  getAllOfficialFrameworks,
  getOfficialFrameworkCategory,
  getOfficialFrameworkCategoryAccess,
  requestFrameworkAccess,
  uploadOfficialFramework,
  updateOfficialFramework,
  downloadOfficialFrameworkFile,
  deleteOfficialFramework,
};
