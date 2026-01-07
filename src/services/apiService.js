/**
 * Common API Service
 * Handles base URL, headers, auth token & error handling
 */

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

/**
 * Get auth token from sessionStorage (matches AuthContext)
 */
function getAuthToken() {
  return sessionStorage.getItem("token");
}

/**
 * Generic API request helper
 * Supports:
 * 1. GET without options
 * 2. POST/PUT/DELETE with options + auth
 */
export async function apiRequest(endpoint, optionsOrAuth, maybeAuth) {
  const url = `${API_BASE_URL}${endpoint}`;

  let options = {};
  let requireAuth = false;

  if (typeof optionsOrAuth === "boolean") {
    requireAuth = optionsOrAuth;
  } else if (typeof optionsOrAuth === "object") {
    options = optionsOrAuth;
    requireAuth = maybeAuth || false;
  }

  const token = getAuthToken();

  const headers = {
    ...(requireAuth && token && { Authorization: `Bearer ${token}` }),
    ...(options.headers || {}),
  };

  // Only set Content-Type for non-FormData requests
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (Object.keys(headers).length) options.headers = headers;

  try {
    const response = await fetch(url, options);
    
    // Check if response has content before trying to parse JSON
    const contentType = response.headers.get('content-type');
    let data = null;
    
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      if (text) {
        data = JSON.parse(text);
      }
    }

    if (!response.ok) {
      // Handle 401 Unauthorized responses
      if (response.status === 401) {
        // Dispatch custom event for AuthContext to handle
        window.dispatchEvent(
          new CustomEvent("unauthorized-response", {
            detail: {
              status: response.status,
              message:
                data?.message ||
                "Your session has expired. Please log in again.",
            },
          })
        );
      }

      throw {
        status: response.status,
        message: data?.message || data?.error || "Something went wrong",
        data,
      };
    }

    return data;
  } catch (error) {
    if (error?.status) throw error;
    throw {
      status: 500,
      message: error?.message || "Network error. Please check your connection.",
      data: null,
    };
  }
}
