/**
 * Common API Service
 * Handles base URL, headers, auth token & error handling
 */

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;
const TENANT_ID = `${import.meta.env.VITE_TENANT_ID}`;

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
    ...(TENANT_ID && { "X-TENANT-ID": TENANT_ID }),
    ...(options.headers || {}),
  };

  // Only set Content-Type for non-FormData requests
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (Object.keys(headers).length) options.headers = headers;

  try {
    const response = await fetch(url, options);

    // ✅ HANDLE BLOB RESPONSE (DOWNLOAD)
    if (options.responseType === "blob") {
      if (!response.ok) {
        throw {
          status: response.status,
          message: "Failed to download file",
        };
      }
      return response.blob();
    }

    // Check if response has content before trying to parse JSON
    const contentType = response.headers.get("content-type");
    let data = null;

    if (contentType && contentType.includes("application/json")) {
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
          }),
        );
      }

      throw {
        status: response.status,
        message: data?.message || data?.error || "Something went wrong",
        data,
      };
    }

    // Normalize successful responses to standard format
    if (data && typeof data === "object") {
      // If response already has the correct format, return as is
      if (
        data.hasOwnProperty("success") &&
        data.hasOwnProperty("message") &&
        data.hasOwnProperty("data")
      ) {
        return data;
      }

      // If response has message and data properties but no success flag
      if (data.hasOwnProperty("message") && data.hasOwnProperty("data")) {
        return {
          success: true,
          message: data.message,
          data: data.data,
        };
      }

      // If response has only data property
      if (data.hasOwnProperty("data") && !data.hasOwnProperty("message")) {
        return {
          success: true,
          message: "Operation successful",
          data: data.data,
        };
      }

      // If response is just the data object itself (no wrapper)
      return {
        success: true,
        message: "Operation successful",
        data: data,
      };
    }

    // For non-object responses or null/empty responses
    return {
      success: true,
      message: "Operation successful",
      data: data,
    };
  } catch (error) {
    if (error?.status) throw error;
    throw {
      status: 500,
      message: error?.message || "Network error. Please check your connection.",
      data: null,
    };
  }
}
