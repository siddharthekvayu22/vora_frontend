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

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [pendingEmail, setPendingEmail] = useState("");

  // Initialize state from sessionStorage
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return JSON.parse(sessionStorage.getItem("isAuthenticated")) || false;
  });

  const [token, setToken] = useState(
    () => sessionStorage.getItem("token") || null
  );
  const [user, setUser] = useState(() => {
    const storedUser = sessionStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Store pending email for OTP verification
  const setEmailForVerification = (email) => {
    setPendingEmail(email);
    sessionStorage.setItem("pendingEmail", email);
  };

  // Get pending email from session
  const getEmailForVerification = () => {
    return pendingEmail || sessionStorage.getItem("pendingEmail") || "";
  };

  // Clear pending email after verification
  const clearPendingEmail = () => {
    setPendingEmail("");
    sessionStorage.removeItem("pendingEmail");
  };

  // Refs to track activity
  const lastActivityTime = useRef(Date.now());
  const sessionStartTime = useRef(
    parseInt(sessionStorage.getItem("sessionStartTime")) || Date.now()
  );

  // -------------------------
  // Login
  // -------------------------
  const login = useCallback((userData, authToken) => {
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
  // Logout
  // -------------------------
  const logout = useCallback(
    async (message = null) => {
      try {
        // Only call logout API if we have a token
        if (token) {
          await logoutApi();
        }
      } catch (error) {
        // Don't show error for logout API failure, just proceed with local logout
        console.warn("Logout API failed:", error.message);
      } finally {
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

        if (message) {
          toast.error(message, { position: "top-center", duration: 5000 });
        }

        navigate("/auth/login");
      }
    },
    [navigate, token]
  );

  // -------------------------
  // Update last activity on user actions
  // -------------------------
  useEffect(() => {
    const updateActivity = () => {
      lastActivityTime.current = Date.now();
    };

    window.addEventListener("mousemove", updateActivity);
    window.addEventListener("keydown", updateActivity);
    window.addEventListener("scroll", updateActivity);

    return () => {
      window.removeEventListener("mousemove", updateActivity);
      window.removeEventListener("keydown", updateActivity);
      window.removeEventListener("scroll", updateActivity);
    };
  }, []);

  // -------------------------
  // Auto logout on focus check
  // -------------------------
  useEffect(() => {
    const checkSessionOnFocus = () => {
      if (isAuthenticated) {
        const sessionDuration = Date.now() - sessionStartTime.current;
        const idleTime = Date.now() - lastActivityTime.current;

        const maxSessionTime = 6 * 60 * 60 * 1000; // 6 hours
        const maxIdleTime = 60 * 60 * 1000; // 1 hour

        if (sessionDuration > maxSessionTime) {
          logout("Your session has expired. Please log in again.");
        } else if (idleTime > maxIdleTime) {
          logout("You have been inactive for too long. Please log in again.");
        }
      }
    };

    window.addEventListener("focus", checkSessionOnFocus);
    checkSessionOnFocus();

    return () => window.removeEventListener("focus", checkSessionOnFocus);
  }, [isAuthenticated, logout]);

  // -------------------------
  // Auto logout every 1 min check
  // -------------------------
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (isAuthenticated) {
        const idleTime = Date.now() - lastActivityTime.current;
        if (idleTime >= 60 * 60 * 1000) {
          logout(
            "Your session has expired due to inactivity. Please log in again."
          );
        }
      }
    }, 60 * 1000);

    return () => clearInterval(intervalId);
  }, [isAuthenticated, logout]);

  // -------------------------
  // Handle global unauthorized API responses
  // -------------------------
  useEffect(() => {
    const handleUnauthorizedResponse = (event) => {
      if (event.detail && event.detail.status === 401) {
        logout(
          event.detail.message ||
            "Your session has expired. Please log in again."
        );
      }
    };

    window.addEventListener(
      "unauthorized-response",
      handleUnauthorizedResponse
    );
    return () => {
      window.removeEventListener(
        "unauthorized-response",
        handleUnauthorizedResponse
      );
    };
  }, [logout]);

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
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export { AuthContext };
