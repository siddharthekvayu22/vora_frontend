import { apiRequest } from "./apiService";

/**
 * Get company framework by ID
 */
export function getCompanyFrameworkById(id) {
  return apiRequest(`/company-frameworks/frameworks/${id}`, true);
}

/**
 * Get all company frameworks
 */
export function getAllCompanyFrameworks({
  page = 1,
  limit = 10,
  search = "",
  sortBy = "createdAt",
  sortOrder = "desc",
  status = "",
} = {}) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
    ...(sortBy && { sortBy }),
    ...(sortOrder && { sortOrder }),
    ...(status && { status }),
  });

  return apiRequest(
    `/company-frameworks/frameworks?${params.toString()}`,
    true,
  );
}

/**
 * Upload company framework file
 */
export function uploadCompanyFramework(formData) {
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
 * Upload company framework file to ai
 */
export function uploadCompanyFrameworkToAi(id) {
  return apiRequest(
    `/files/${id}/upload-to-ai`,
    {
      method: "POST",
    },
    true,
  );
}

/**
 * Download company framework file
 */
export async function downloadCompanyFrameworkFile(fileId, fileName) {
  const blob = await apiRequest(
    `/files/${fileId}/download`,
    {
      method: "GET",
      responseType: "blob",
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
 * Update company framework file
 */
export function updateCompanyFramework(frameworkId, formData) {
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
 * Delete company framework
 */
export function deleteCompanyFramework(fileId) {
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
export function deleteCompanyFrameworkVersion(fileId, versionFileId) {
  return apiRequest(
    `/files/${fileId}/versions/${versionFileId}`,
    {
      method: "DELETE",
    },
    true,
  );
}

/**
 * Compare company framework with official framework
 */
export function compareFrameworks(companyControlsJobId, officialControlsJobId) {
  const params = new URLSearchParams({
    companyControlsJobId,
    officialControlsJobId,
  });

  return apiRequest(
    `/company-frameworks/frameworks/compare?${params.toString()}`,
    {
      method: "POST",
    },
    true,
  );
}

/**
 * Analyze deployment gap between company and official framework
 */
export function analyzeDeploymentGap(
  companyControlsJobId,
  officialControlsJobId,
) {
  const params = new URLSearchParams({
    companyControlsJobId,
    officialControlsJobId,
  });

  return apiRequest(
    `/company-frameworks/frameworks/deployment-gap?${params.toString()}`,
    {
      method: "POST",
    },
    true,
  );
}

export default {
  getCompanyFrameworkById,
  getAllCompanyFrameworks,
  uploadCompanyFramework,
  updateCompanyFramework,
  downloadCompanyFrameworkFile,
  deleteCompanyFramework,
  deleteCompanyFrameworkVersion,
  uploadCompanyFrameworkToAi,
  compareFrameworks,
  analyzeDeploymentGap,
};
