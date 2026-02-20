import { Route } from "react-router-dom";
import Layout from "../../layout/Layout";
import ProtectedRoute from "./ProtectedRoute";

// Company Pages
import Dashboard from "../../pages/dashboard-management/Dashboard";
import Users from "../../pages/user-management/Users";
import CompanyFramework from "@/pages/company-framework-management/CompanyFramework";
import OfficialFramework from "@/pages/company-framework-management/OfficialFramework";
import OfficialFrameworkDetail from "@/pages/company-framework-management/OfficialFrameworkDetail";
import CompanyFrameworkDetail from "@/pages/company-framework-management/CompanyFrameworkDetail";

const companyRoutes = [
  <Route
    key="company-dashboard"
    path="/dashboard"
    element={
      <ProtectedRoute>
        <Layout>
          <Dashboard />
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
    path="/official-framework"
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
];

export default companyRoutes;
