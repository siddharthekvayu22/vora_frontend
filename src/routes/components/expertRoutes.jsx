import { Route } from "react-router-dom";
import Layout from "../../layout/Layout";
import ProtectedRoute from "./ProtectedRoute";

// Expert Pages
import ExpertDashboard from "../../pages/dashboard-management/ExpertDashboard";
import OfficialFramework from "../../pages/official-framework-management/OfficialFramework";
import OfficialFrameworkDetail from "../../pages/official-framework-management/OfficialFrameworkDetail";
import OfficialFrameworkCategory from "../../pages/official-framework-management/OfficialFrameworkCategory";
import OfficialFrameworkAccess from "../../pages/official-framework-management/OfficialFrameworkAccess";

const expertRoutes = [
  // Expert Dashboard
  <Route
    key="expert-dashboard"
    path="/dashboard"
    element={
      <ProtectedRoute>
        <Layout>
          <ExpertDashboard />
        </Layout>
      </ProtectedRoute>
    }
  />,

  // Official Framework Management
  <Route
    key="official-frameworks"
    path="/official-frameworks"
    element={
      <ProtectedRoute>
        <Layout>
          <OfficialFramework />
        </Layout>
      </ProtectedRoute>
    }
  />,

  <Route
    key="official-framework-detail"
    path="/official-frameworks/:id"
    element={
      <ProtectedRoute>
        <Layout>
          <OfficialFrameworkDetail />
        </Layout>
      </ProtectedRoute>
    }
  />,

  <Route
    key="official-framework-category"
    path="/official-framework-category"
    element={
      <ProtectedRoute>
        <Layout>
          <OfficialFrameworkCategory />
        </Layout>
      </ProtectedRoute>
    }
  />,

  <Route
    key="official-framework-access"
    path="/official-framework-access"
    element={
      <ProtectedRoute>
        <Layout>
          <OfficialFrameworkAccess />
        </Layout>
      </ProtectedRoute>
    }
  />,
];

export default expertRoutes;
