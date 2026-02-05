import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Layout from "../layout/Layout";
import ProtectedRoute from "../routes/ProtectedRoute";
import PublicRoute from "../routes/PublicRoute";
import AuthLayout from "../layout/AuthLayout";
import { useAuth } from "../context/useAuth";
import { useEffect } from "react";
import Profile from "../pages/profile-management/Profile";

// Import role-based routes
import adminRoutes from "./adminRoutes";
import expertRoutes from "./expertRoutes";
import companyRoutes from "./companyRoutes";
import authRoutes from "./authRoutes";

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  // Get routes based on user role
  const getRoleBasedRoutes = () => {
    if (!user) return authRoutes;

    switch (user.role?.toLowerCase()) {
      case "admin":
        return adminRoutes;
      case "expert":
        return expertRoutes;
      case "company":
        return companyRoutes;
      default:
        return authRoutes;
    }
  };

  return (
    <Routes>
      {/* ================= ROLE-BASED ROUTES ================= */}
      {isAuthenticated && getRoleBasedRoutes()}

      {/* ================= SHARED ROUTES ================= */}
      {/* Profile - All authenticated users */}
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

      {/* ================= REDIRECTS ================= */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to={"/dashboard"} replace />
          ) : (
            <Navigate to="/auth/login" replace />
          )
        }
      />

      {/* Catch all */}
      <Route
        path="*"
        element={(() => {
          const NavigateBack = () => {
            const navigate = useNavigate();
            useEffect(() => {
              if (isAuthenticated) {
                navigate(-1);
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
