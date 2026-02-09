import React, {
  createContext,
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { logoutApi } from "../services/authService";
import { resetUnauthorizedFlag } from "../services/apiService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [pendingEmail, setPendingEmail] = useState("");

  // Refs to prevent multiple logout calls and track state
  const isLoggingOut = useRef(false);
  const hasShownSessionExpiredToast = useRef(false);
  const sessionCheckInterval = useRef(null);

  // Initialize state from sessionStorage
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return JSON.parse(sessionStorage.getItem("isAuthenticated")) || false;
  });

  const [token, setToken] = useState(
    () => sessionStorage.getItem("token") || null,
  );

  const [user, setUser] = useState(() => {
    const storedUser = sessionStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Store pending email for OTP verification
  const setEmailForVerification = useCallback((email) => {
    setPendingEmail(email);
    sessionStorage.setItem("pendingEmail", email);
  }, []);

  // Get pending email from session
  const getEmailForVerification = useCallback(() => {
    return pendingEmail || sessionStorage.getItem("pendingEmail") || "";
  }, [pendingEmail]);

  // Clear pending email after verification
  const clearPendingEmail = useCallback(() => {
    setPendingEmail("");
    sessionStorage.removeItem("pendingEmail");
  }, []);

  // Refs to track activity
  const lastActivityTime = useRef(Date.now());
  const sessionStartTime = useRef(
    parseInt(sessionStorage.getItem("sessionStartTime")) || Date.now(),
  );

  // -------------------------
  // Login
  // -------------------------
  const login = useCallback((userData, authToken) => {
    // Reset logout flags
    isLoggingOut.current = false;
    hasShownSessionExpiredToast.current = false;

    // Reset apiService unauthorized flag
    resetUnauthorizedFlag();

    setIsAuthenticated(true);
    setToken(authToken);
    setUser(userData);

    // Save full info in sessionStorage
    sessionStorage.setItem("isAuthenticated", JSON.stringify(true));
    sessionStorage.setItem("token", authToken);
    sessionStorage.setItem("user", JSON.stringify(userData));
    sessionStorage.setItem("sessionStartTime", Date.now().toString());

    sessionStartTime.current = Date.now();
    lastActivityTime.current = Date.now();
  }, []);

  // -------------------------
  // Logout with duplicate prevention
  // -------------------------
  const logout = useCallback(
    async (message = null, showToast = true) => {
      // Prevent multiple simultaneous logout calls
      if (isLoggingOut.current) {
        return;
      }

      isLoggingOut.current = true;

      try {
        // Only call logout API if we have a token
        if (token) {
          await logoutApi();
        }
      } catch (error) {
        // Don't show error for logout API failure, just proceed with local logout
      } finally {
        // Clear session check interval
        if (sessionCheckInterval.current) {
          clearInterval(sessionCheckInterval.current);
          sessionCheckInterval.current = null;
        }

        // Always clear local state regardless of API success/failure
        setIsAuthenticated(false);
        setToken(null);
        setUser(null);
        setPendingEmail("");

        sessionStorage.removeItem("isAuthenticated");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("sessionStartTime");
        sessionStorage.removeItem("pendingEmail");

        // Show toast only if requested and not already shown
        if (message && showToast && !hasShownSessionExpiredToast.current) {
          hasShownSessionExpiredToast.current = true;

          // Dismiss ALL existing toasts first
          toast.dismiss();

          // Small delay to ensure all toasts are dismissed
          setTimeout(() => {
            toast.error(message, {
              position: "top-center",
              duration: 4000,
              id: "session-expired",
            });
          }, 100);

          // Reset flag after 5 seconds
          setTimeout(() => {
            hasShownSessionExpiredToast.current = false;
          }, 5000);
        }

        navigate("/auth/login");

        // Reset logout flag after navigation
        setTimeout(() => {
          isLoggingOut.current = false;
        }, 1000);
      }
    },
    [navigate, token],
  );

  // -------------------------
  // Session validation helper
  // -------------------------
  const checkSessionValidity = useCallback(() => {
    if (!isAuthenticated || isLoggingOut.current) {
      return true; // Don't check if not authenticated or already logging out
    }

    const now = Date.now();
    const sessionDuration = now - sessionStartTime.current;
    const idleTime = now - lastActivityTime.current;

    const maxSessionTime = 6 * 60 * 60 * 1000; // 6 hours
    const maxIdleTime = 60 * 60 * 1000; // 1 hour

    if (sessionDuration > maxSessionTime) {
      logout("Your session has expired. Please log in again.");
      return false;
    } else if (idleTime > maxIdleTime) {
      logout("You have been inactive for too long. Please log in again.");
      return false;
    }

    return true;
  }, [isAuthenticated, logout]);

  // -------------------------
  // Update last activity on user actions
  // -------------------------
  useEffect(() => {
    if (!isAuthenticated) return;

    const updateActivity = () => {
      if (isAuthenticated && !isLoggingOut.current) {
        lastActivityTime.current = Date.now();
      }
    };

    // Throttle activity updates to prevent excessive calls
    let activityTimeout;
    const throttledUpdateActivity = () => {
      if (activityTimeout) return;
      activityTimeout = setTimeout(() => {
        updateActivity();
        activityTimeout = null;
      }, 1000); // Update at most once per second
    };

    window.addEventListener("mousemove", throttledUpdateActivity);
    window.addEventListener("keydown", throttledUpdateActivity);
    window.addEventListener("scroll", throttledUpdateActivity);
    window.addEventListener("click", throttledUpdateActivity);

    return () => {
      window.removeEventListener("mousemove", throttledUpdateActivity);
      window.removeEventListener("keydown", throttledUpdateActivity);
      window.removeEventListener("scroll", throttledUpdateActivity);
      window.removeEventListener("click", throttledUpdateActivity);
      if (activityTimeout) {
        clearTimeout(activityTimeout);
      }
    };
  }, [isAuthenticated]);

  // -------------------------
  // Session monitoring with single interval
  // -------------------------
  useEffect(() => {
    if (!isAuthenticated) {
      if (sessionCheckInterval.current) {
        clearInterval(sessionCheckInterval.current);
        sessionCheckInterval.current = null;
      }
      return;
    }

    // Clear any existing interval
    if (sessionCheckInterval.current) {
      clearInterval(sessionCheckInterval.current);
    }

    // Set up single session check interval
    sessionCheckInterval.current = setInterval(() => {
      checkSessionValidity();
    }, 30 * 1000); // Check every 30 seconds instead of every minute

    // Initial check
    checkSessionValidity();

    return () => {
      if (sessionCheckInterval.current) {
        clearInterval(sessionCheckInterval.current);
        sessionCheckInterval.current = null;
      }
    };
  }, [isAuthenticated, checkSessionValidity]);

  // -------------------------
  // Handle global unauthorized API responses
  // -------------------------
  useEffect(() => {
    const handleUnauthorizedResponse = (event) => {
      if (
        event.detail &&
        event.detail.status === 401 &&
        !isLoggingOut.current
      ) {
        logout(
          event.detail.message ||
            "Your session has expired. Please log in again.",
        );
      }
    };

    window.addEventListener(
      "unauthorized-response",
      handleUnauthorizedResponse,
    );

    return () => {
      window.removeEventListener(
        "unauthorized-response",
        handleUnauthorizedResponse,
      );
    };
  }, [logout]);

  // -------------------------
  // Handle page visibility change (when user switches tabs/windows)
  // -------------------------
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        isAuthenticated &&
        !isLoggingOut.current
      ) {
        // Check session when user returns to the tab
        checkSessionValidity();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isAuthenticated, checkSessionValidity]);

  // -------------------------
  // Memoize context value
  // -------------------------
  const contextValue = useMemo(
    () => ({
      isAuthenticated,
      token,
      user,
      login,
      logout,
      setEmailForVerification,
      getEmailForVerification,
      clearPendingEmail,
    }),
    [
      isAuthenticated,
      token,
      user,
      login,
      logout,
      setEmailForVerification,
      getEmailForVerification,
      clearPendingEmail,
    ],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export { AuthContext };
