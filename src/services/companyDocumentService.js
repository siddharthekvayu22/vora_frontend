import { apiRequest } from "./apiService";

/**
 * Get company document by ID
 */
export function getCompanyDocumentById(id, options = {}) {
  const params = options.params || {};
  const queryString = new URLSearchParams(params).toString();
  const url = queryString
    ? `/company-documents/documents/${id}?${queryString}`
    : `/company-documents/documents/${id}`;
  return apiRequest(url, true);
}

/**
 * Get all company documents
 */
export function getAllCompanyDocuments({
  page = 1,
  limit = 10,
  search = "",
  sortBy = "createdAt",
  sortOrder = "desc",
} = {}) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
    ...(sortBy && { sortBy }),
    ...(sortOrder && { sortOrder }),
  });

  return apiRequest(`/company-documents/documents?${params.toString()}`, true);
}

/**
 * Upload company document file
 */
export function uploadCompanyDocument(formData) {
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
 * Download company document file
 */
export async function downloadCompanyDocumentFile(fileId, fileName) {
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
  a.download = fileName || "document";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

/**
 * Update company document file
 */
export function updateCompanyDocument(documentId, formData) {
  return apiRequest(
    `/files/${documentId}`,
    {
      method: "PUT",
      body: formData, // FormData object
    },
    true,
  );
}

/**
 * Delete company document
 */
export function deleteCompanyDocument(fileId) {
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
export function deleteCompanyDocumentVersion(fileId, versionFileId) {
  return apiRequest(
    `/files/${fileId}/versions/${versionFileId}`,
    {
      method: "DELETE",
    },
    true,
  );
}

export default {
  getCompanyDocumentById,
  getAllCompanyDocuments,
  uploadCompanyDocument,
  updateCompanyDocument,
  downloadCompanyDocumentFile,
  deleteCompanyDocument,
  deleteCompanyDocumentVersion,
};
