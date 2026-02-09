import { Route } from "react-router-dom";
import Layout from "../../layout/Layout";
import ProtectedRoute from "./ProtectedRoute";

// Admin Pages
import AdminDashboard from "../../pages/dashboard-management/AdminDashboard";
import Users from "../../pages/user-management/Users";
import Category from "../../pages/admin-framework-management/framework-category-manage/Category";
import FrameworkAccess from "../../pages/admin-framework-management/framework-access-manage/FrameworkAccess";

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

  // Framework Access Management (Unified)
  <Route
    key="framework-access"
    path="/framework-access"
    element={
      <ProtectedRoute>
        <Layout>
          <FrameworkAccess />
        </Layout>
      </ProtectedRoute>
    }
  />,
];

export default adminRoutes;
