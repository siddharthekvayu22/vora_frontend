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
import UserDetails from "../pages/user-management/UserDetails";
import Profile from "../pages/profile-management/Profile";
import Category from "../pages/admin-framework-management/framework-category-manage/Category";
import AccessApproved from "../pages/admin-framework-management/framework-access-manage/AccessApproved";
import AccessRequests from "../pages/admin-framework-management/framework-access-manage/AccessRequests";
import AccessRejected from "../pages/admin-framework-management/framework-access-manage/AccessRejected";
import AccessRevoked from "../pages/admin-framework-management/framework-access-manage/AccessRevoked";

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
        path="/framework-category"
        element={
          <ProtectedRoute>
            <Layout>
              <Category />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/framework-access/approved"
        element={
          <ProtectedRoute>
            <Layout>
              <AccessApproved />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/framework-access/requests"
        element={
          <ProtectedRoute>
            <Layout>
              <AccessRequests />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/framework-access/rejected"
        element={
          <ProtectedRoute>
            <Layout>
              <AccessRejected />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/framework-access/revoked"
        element={
          <ProtectedRoute>
            <Layout>
              <AccessRevoked />
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
        path="/users/:userId"
        element={
          <ProtectedRoute>
            <Layout>
              <UserDetails />
            </Layout>
          </ProtectedRoute>
        }
      />
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
