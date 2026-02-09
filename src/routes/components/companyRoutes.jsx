import { Route } from "react-router-dom";
import Layout from "../../layout/Layout";
import ProtectedRoute from "./ProtectedRoute";

// Company Pages
import Dashboard from "../../pages/dashboard-management/Dashboard";
import Users from "../../pages/user-management/Users";

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
];

export default companyRoutes;
