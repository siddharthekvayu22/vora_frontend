import { Route } from "react-router-dom";
import PublicRoute from "./PublicRoute";
import AuthLayout from "../../layout/AuthLayout";

const authRoutes = [
  <Route
    key="login"
    path="/auth/login"
    element={
      <PublicRoute>
        <AuthLayout />
      </PublicRoute>
    }
  />,
  <Route
    key="register"
    path="/auth/register"
    element={
      <PublicRoute>
        <AuthLayout />
      </PublicRoute>
    }
  />,
  <Route
    key="forgot-password"
    path="/auth/forgot-password"
    element={
      <PublicRoute>
        <AuthLayout />
      </PublicRoute>
    }
  />,
  <Route
    key="reset-password"
    path="/auth/reset-password"
    element={
      <PublicRoute>
        <AuthLayout />
      </PublicRoute>
    }
  />,
  <Route
    key="verify-email"
    path="/auth/verify-email"
    element={
      <PublicRoute>
        <AuthLayout />
      </PublicRoute>
    }
  />,
  <Route
    key="verify-otp"
    path="/auth/verify-otp"
    element={
      <PublicRoute>
        <AuthLayout />
      </PublicRoute>
    }
  />,
];

export default authRoutes;
