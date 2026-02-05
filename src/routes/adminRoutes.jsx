import { Route } from "react-router-dom";
import Layout from "../layout/Layout";
import ProtectedRoute from "./ProtectedRoute";

// Admin Pages
import AdminDashboard from "../pages/dashboard-management/AdminDashboard";
import Users from "../pages/user-management/Users";
import Category from "../pages/admin-framework-management/framework-category-manage/Category";
import AccessApproved from "../pages/admin-framework-management/framework-access-manage/AccessApproved";
import AccessRequests from "../pages/admin-framework-management/framework-access-manage/AccessRequests";
import AccessRejected from "../pages/admin-framework-management/framework-access-manage/AccessRejected";
import AccessRevoked from "../pages/admin-framework-management/framework-access-manage/AccessRevoked";

const adminRoutes = [
  // Admin Dashboard
  <Route
    key="admin-dashboard"
    path="/dashboard"
    element={
      <ProtectedRoute>
        <Layout>
          <AdminDashboard />
        </Layout>
      </ProtectedRoute>
    }
  />,

  // User Management
  <Route
    key="users"
    path="/users"
    element={
      <ProtectedRoute>
        <Layout>
          <Users />
        </Layout>
      </ProtectedRoute>
    }
  />,

  // Framework Category Management
  <Route
    key="framework-category"
    path="/framework-category"
    element={
      <ProtectedRoute>
        <Layout>
          <Category />
        </Layout>
      </ProtectedRoute>
    }
  />,

  // Framework Access Management
  <Route
    key="framework-access-approved"
    path="/framework-access/approved"
    element={
      <ProtectedRoute>
        <Layout>
          <AccessApproved />
        </Layout>
      </ProtectedRoute>
    }
  />,

  <Route
    key="framework-access-requests"
    path="/framework-access/requests"
    element={
      <ProtectedRoute>
        <Layout>
          <AccessRequests />
        </Layout>
      </ProtectedRoute>
    }
  />,

  <Route
    key="framework-access-rejected"
    path="/framework-access/rejected"
    element={
      <ProtectedRoute>
        <Layout>
          <AccessRejected />
        </Layout>
      </ProtectedRoute>
    }
  />,

  <Route
    key="framework-access-revoked"
    path="/framework-access/revoked"
    element={
      <ProtectedRoute>
        <Layout>
          <AccessRevoked />
        </Layout>
      </ProtectedRoute>
    }
  />,
];

export default adminRoutes;
