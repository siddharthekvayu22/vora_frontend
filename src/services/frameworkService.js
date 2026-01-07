import { apiRequest } from "./apiService";

/**
 * Get all frameworks (role-based)
 */
export function getAllFrameworks({
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
    ? `/users/frameworks?${params.toString()}`
    : `/expert/frameworks?${params.toString()}`;

  return apiRequest(endpoint, true);
}

/**
 * Get user's frameworks (role-based)
 */
export function getMyFrameworks({
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
    ? `/users/frameworks/my-frameworks?${params.toString()}`
    : `/expert/frameworks/my-frameworks?${params.toString()}`;

  return apiRequest(endpoint, true);
}

/**
 * Get framework by ID (role-based)
 */
export function getFrameworkById(frameworkId, userRole = "expert") {
  const endpoint = userRole === "user"
    ? `/users/frameworks/${frameworkId}`
    : `/expert/frameworks/${frameworkId}`;

  return apiRequest(endpoint, true);
}

/**
 * Upload framework (role-based)
 */
export function uploadFramework(formData, userRole = "expert") {
  const endpoint = userRole === "user" ? "/users/frameworks" : "/expert/frameworks";
  
  return apiRequest(endpoint, {
    method: "POST",
    body: formData,
    headers: {}, // Don't set Content-Type for FormData, let browser set it
  }, true);
}

/**
 * Update framework (role-based)
 */
export function updateFramework(frameworkId, frameworkData, userRole = "expert") {
  const endpoint = userRole === "user"
    ? `/users/frameworks/${frameworkId}`
    : `/expert/frameworks/${frameworkId}`;

  return apiRequest(
    endpoint,
    {
      method: "PUT",
      body: JSON.stringify(frameworkData),
    },
    true
  );
}

/**
 * Update framework with file (role-based)
 */
export function updateFrameworkWithFile(frameworkId, formData, userRole = "expert") {
  const endpoint = userRole === "user"
    ? `/users/frameworks/${frameworkId}`
    : `/expert/frameworks/${frameworkId}`;

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
 * Delete framework (role-based)
 */
export function deleteFramework(frameworkId, userRole = "expert") {
  const endpoint = userRole === "user"
    ? `/users/frameworks/${frameworkId}`
    : `/expert/frameworks/${frameworkId}`;

  return apiRequest(endpoint, {
    method: "DELETE",
  }, true);
}

/**
 * Send framework to AI (role-based)
 */
export function sendFrameworkToAI(frameworkId, userRole = "expert") {
  const endpoint = userRole === "user"
    ? `/users/frameworks/${frameworkId}/upload-to-ai`
    : `/expert/frameworks/${frameworkId}/upload-to-ai`;

  return apiRequest(endpoint, {
    method: "POST",
  }, true);
}
export function downloadFramework(frameworkId, userRole = "expert") {
  const token = sessionStorage.getItem("token");
  const endpoint = userRole === "user"
    ? `/users/frameworks/${frameworkId}/download`
    : `/expert/frameworks/${frameworkId}/download`;
  
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

/**
 * Get expert frameworks for comparison (user role only)
 */
export function getExpertFrameworks() {
  return apiRequest("/expert/frameworks/", true);
}

/**
 * Compare user framework with expert framework
 */
export function compareFrameworks(userFrameworkId, expertFrameworkId) {
  return apiRequest("/users/framework-comparisons", {
    method: "POST",
    body: JSON.stringify({
      userFrameworkId,
      expertFrameworkId
    }),
  }, true);
}

export default {
  getAllFrameworks,
  getMyFrameworks,
  getFrameworkById,
  uploadFramework,
  updateFramework,
  updateFrameworkWithFile,
  deleteFramework,
  sendFrameworkToAI,
  downloadFramework,
  getExpertFrameworks,
  compareFrameworks,
};