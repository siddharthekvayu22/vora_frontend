import { apiRequest } from "./apiService";

/**
 * Logout (optional - backend may not have this endpoint)
 */
export function logoutApi() {
  return apiRequest(
    "/auth/logout",
    {
      method: "POST",
    },
    true
  ); // requireAuth = true
}

/**
 * Login
 */
export function loginApi(email, password) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

/**
 * Register
 */
export function register({ name, email, phone, password }) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, phone, password }),
  });
}

/**
 * Verify OTP
 */
export function verifyOTP(email, otp) {
  return apiRequest("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });
}

/**
 * Forgot Password
 */
export function forgotPassword(email) {
  return apiRequest("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

/**
 * Reset Password
 */
export function resetPassword({ email, otp, password }) {
  return apiRequest("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ email, otp, password }),
  });
}

/**
 * Resend OTP
 */
export function resendOTP(email) {
  return apiRequest("/auth/resend-otp", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

/**
 * Change Password
 */
export function changePassword(currentPassword, newPassword) {
  return apiRequest(
    "/auth/change-password",
    {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    },
    true
  ); // requireAuth = true
}

/**
 * Verify Email (send OTP)
 */
export function verifyEmail(email) {
  return apiRequest("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export default {
  logoutApi,
  loginApi,
  register,
  verifyOTP,
  forgotPassword,
  resetPassword,
  resendOTP,
  verifyEmail,
  changePassword,
};
