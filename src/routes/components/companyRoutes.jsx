import { Route } from "react-router-dom";
import Layout from "../../layout/Layout";
import ProtectedRoute from "./ProtectedRoute";

// Company Pages
import Users from "../../pages/user-management/Users";
import CompanyFramework from "@/pages/company-framework-management/CompanyFramework";
import CompanyFrameworkDetail from "@/pages/company-framework-management/CompanyFrameworkDetail";
import OfficialFramework from "@/pages/official-framework-management/OfficialFramework";
import OfficialFrameworkDetail from "@/pages/official-framework-management/OfficialFrameworkDetail";
import CompanyDashboard from "@/pages/dashboard-management/CompanyDashboard";
import Document from "@/pages/document-management/Document";

const companyRoutes = [
  <Route
    key="company-dashboard"
    path="/dashboard"
    element={
      <ProtectedRoute>
        <Layout>
          <CompanyDashboard />
        </Layout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="company-users"
    path="/users"
    element={
      <ProtectedRoute>
        <Layout>
          <Users />
        </Layout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="company-framework"
    path="/frameworks"
    element={
      <ProtectedRoute>
        <Layout>
          <CompanyFramework />
        </Layout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="company-framework-detail"
    path="/frameworks/:id"
    element={
      <ProtectedRoute>
        <Layout>
          <CompanyFrameworkDetail />
        </Layout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="company-official-framework"
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
    key="company-official-framework-detail"
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
    key="company-document"
    path="/documents"
    element={
      <ProtectedRoute>
        <Layout>
          <Document />
        </Layout>
      </ProtectedRoute>
    }
  />,
];

export default companyRoutes;
