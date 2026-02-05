import { Route } from "react-router-dom";
import Layout from "../layout/Layout";
import ProtectedRoute from "./ProtectedRoute";
import AuthLayout from "../layout/AuthLayout";

const authRoutes = [
  <Route
    key="login"
    path="/auth/login"
    element={
      <ProtectedRoute>
        <Layout>
          <AuthLayout />
        </Layout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="register"
    path="/auth/register"
    element={
      <ProtectedRoute>
        <Layout>
          <AuthLayout />
        </Layout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="forgot-password"
    path="/auth/forgot-password"
    element={
      <ProtectedRoute>
        <Layout>
          <AuthLayout />
        </Layout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="reset-password"
    path="/auth/reset-password"
    element={
      <ProtectedRoute>
        <Layout>
          <AuthLayout />
        </Layout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="verify-email"
    path="/auth/verify-email"
    element={
      <ProtectedRoute>
        <Layout>
          <AuthLayout />
        </Layout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="verify-otp"
    path="/auth/verify-otp"
    element={
      <ProtectedRoute>
        <Layout>
          <AuthLayout />
        </Layout>
      </ProtectedRoute>
    }
  />,
];

export default authRoutes;
