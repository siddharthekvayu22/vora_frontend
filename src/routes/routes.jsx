import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Layout from "../layout/Layout";
import ProtectedRoute from "../routes/ProtectedRoute";
import PublicRoute from "../routes/PublicRoute";
import AuthLayout from "../layout/AuthLayout";
import { useAuth } from "../context/useAuth";
import { useEffect } from "react";
import Dashboard from "../pages/dashboard-management/Dashboard";
import Users from "../pages/user-management/Users";
import Documents from "../pages/document-management/Documents";
import Frameworks from "../pages/framework-management/Frameworks";
import FrameworkDetails from "../pages/framework-management/FrameworkDetails";

function AppRoutes() {
  const { isAuthenticated } = useAuth();
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

      {/* Root redirect */}
      <Route
        path="/"
        element={
          <Navigate
            to={isAuthenticated ? "/dashboard" : "/auth/login"}
            replace
          />
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
