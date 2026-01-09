import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Layout from "../layout/Layout";
import ProtectedRoute from "../routes/ProtectedRoute";
import PublicRoute from "../routes/PublicRoute";
import AuthLayout from "../layout/AuthLayout";
import { useAuth } from "../context/useAuth";
import { useEffect } from "react";
import Dashboard from "../pages/dashboard-management/Dashboard";
import AdminDashboard from "../pages/dashboard-management/AdminDashboard";
import Users from "../pages/user-management/Users";
import UserStatistics from "../pages/user-management/UserStatistics";
import Documents from "../pages/document-management/Documents";
import Frameworks from "../pages/framework-management/Frameworks";
import FrameworkDetails from "../pages/framework-management/FrameworkDetails";

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  // Role-based dashboard redirect
  const getRoleBasedDashboard = () => {
    if (!user) return "/dashboard";

    switch (user.role?.toLowerCase()) {
      case "admin":
        return "/admin-dashboard";
      case "expert":
        return "/dashboard";
      case "user":
        return "/dashboard";
      default:
        return "/dashboard";
    }
  };

  return (
    <Routes>
      <Route
        path="/auth/login"
        element={
          <PublicRoute>
            <AuthLayout />
          </PublicRoute>
        }
      />
      <Route
        path="/auth/register"
        element={
          <PublicRoute>
            <AuthLayout />
          </PublicRoute>
        }
      />
      <Route
        path="/auth/forgot-password"
        element={
          <PublicRoute>
            <AuthLayout />
          </PublicRoute>
        }
      />
      <Route
        path="/auth/reset-password"
        element={
          <PublicRoute>
            <AuthLayout />
          </PublicRoute>
        }
      />
      <Route
        path="/auth/verify-email"
        element={
          <PublicRoute>
            <AuthLayout />
          </PublicRoute>
        }
      />
      <Route
        path="/auth/verify-otp"
        element={
          <PublicRoute>
            <AuthLayout />
          </PublicRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <Layout>
              <Users />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/:userId/statistics"
        element={
          <ProtectedRoute>
            <Layout>
              <UserStatistics />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/documents"
        element={
          <ProtectedRoute>
            <Layout>
              <Documents />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/frameworks"
        element={
          <ProtectedRoute>
            <Layout>
              <Frameworks />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/frameworks/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <FrameworkDetails />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Root redirect - role-based dashboard */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to={getRoleBasedDashboard()} replace />
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
              navigate(-1);
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
