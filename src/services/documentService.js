import { apiRequest } from "./apiService";

/**
 * Get all documents (role-based)
 */
export function getAllDocuments({
  page = 1,
  limit = 10,
  search = "",
  userRole = "expert"
} = {}) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
  });

  const endpoint = userRole === "user" 
    ? `/users/documents/?${params.toString()}`
    : `/documents/?${params.toString()}`;

  return apiRequest(endpoint, true);
}

/**
 * Get user's own documents (role-based)
 */
export function getMyDocuments({
  page = 1,
  limit = 10,
  search = "",
  userRole = "expert"
} = {}) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
  });

  const endpoint = userRole === "user"
    ? `/users/documents/my-documents?${params.toString()}`
    : `/documents/?${params.toString()}`;

  return apiRequest(endpoint, true);
}

/**
 * Get document by ID (role-based)
 */
export function getDocumentById(documentId, userRole = "expert") {
  const endpoint = userRole === "user"
    ? `/users/documents/${documentId}`
    : `/documents/${documentId}`;

  return apiRequest(endpoint, true);
}

/**
 * Upload document (role-based)
 */
export function uploadDocument(formData, userRole = "expert") {
  const endpoint = userRole === "user" ? "/users/documents" : "/documents";
  
  return apiRequest(endpoint, {
    method: "POST",
    body: formData,
    headers: {}, // Don't set Content-Type for FormData, let browser set it
  }, true);
}

/**
 * Update document (role-based)
 */
export function updateDocument(documentId, documentData, userRole = "expert") {
  const endpoint = userRole === "user"
    ? `/users/documents/${documentId}`
    : `/documents/${documentId}`;

  return apiRequest(
    endpoint,
    {
      method: "PUT",
      body: JSON.stringify(documentData),
    },
    true
  );
}

/**
 * Update document with file (role-based)
 */
export function updateDocumentWithFile(documentId, formData, userRole = "expert") {
  const endpoint = userRole === "user"
    ? `/users/documents/${documentId}`
    : `/documents/${documentId}`;

  return apiRequest(
    endpoint,
    {
      method: "PUT",
      body: formData,
      headers: {}, // Don't set Content-Type for FormData, let browser set it
    },
    true
  );
}

/**
 * Delete document (role-based)
 */
export function deleteDocument(documentId, userRole = "expert") {
  const endpoint = userRole === "user"
    ? `/users/documents/${documentId}`
    : `/documents/${documentId}`;

  return apiRequest(endpoint, {
    method: "DELETE",
  }, true);
}

/**
 * Download document (role-based)
 */
export function downloadDocument(documentId, userRole = "expert") {
  const token = sessionStorage.getItem("token");
  const endpoint = userRole === "user"
    ? `/users/documents/${documentId}/download`
    : `/documents/${documentId}`;
  
  const url = `${import.meta.env.VITE_API_BASE_URL}/api${endpoint}`;
  
  // Create a temporary link and trigger download
  fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Download failed');
    }
    return response.blob();
  })
  .then(blob => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = ''; // Let the browser determine the filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  })
  .catch(error => {
    console.error('Download error:', error);
    throw error;
  });
}

export default {
  getAllDocuments,
  getMyDocuments,
  getDocumentById,
  uploadDocument,
  updateDocument,
  updateDocumentWithFile,
  deleteDocument,
  downloadDocument,
};