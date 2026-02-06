import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Layout from "../layout/Layout";
import ProtectedRoute from "../routes/components/ProtectedRoute";
import { useAuth } from "../context/useAuth";
import { useEffect } from "react";
import Profile from "../pages/profile-management/Profile";

// Import role-based routes
import adminRoutes from "./components/adminRoutes";
import expertRoutes from "./components/expertRoutes";
import companyRoutes from "./components/companyRoutes";
import authRoutes from "./components/authRoutes";

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  // Get routes based on authentication and user role
  const getRoutes = () => {
    // If not authenticated or no user, show auth routes
    if (!isAuthenticated || !user) {
      return authRoutes;
    }

    // If authenticated and has user, show role-based routes
    switch (user.role?.toLowerCase()) {
      case "admin":
        return adminRoutes;
      case "expert":
        return expertRoutes;
      case "company":
        return companyRoutes;
      default:
        return companyRoutes;
    }
  };

  return (
    <Routes>
      {/* ================= DYNAMIC ROUTES ================= */}
      {/* Show auth routes for non-authenticated, role-based routes for authenticated */}
      {getRoutes()}

      {/* ================= SHARED ROUTES ================= */}
      {/* Profile - Only for authenticated users */}
      {isAuthenticated && (
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />
      )}

      {/* ================= REDIRECTS ================= */}
      {/* Root redirect - dashboard for authenticated, login for non-authenticated */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/auth/login" replace />
          )
        }
      />

      {/* Catch all - redirect to dashboard or login */}
      <Route
        path="*"
        element={(() => {
          const NavigateBack = () => {
            const navigate = useNavigate();
            useEffect(() => {
              if (isAuthenticated && user) {
                navigate("/dashboard", { replace: true });
              } else {
                navigate("/auth/login", { replace: true });
              }
            }, [navigate]);
            return null;
          };
          return <NavigateBack />;
        })()}
      />
    </Routes>
  );
}

export default AppRoutes;
