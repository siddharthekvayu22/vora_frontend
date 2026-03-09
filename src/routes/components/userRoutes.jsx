import { Route } from "react-router-dom";
import Layout from "../../layout/Layout";
import ProtectedRoute from "./ProtectedRoute";
import UserDashboard from "@/pages/dashboard-management/UserDashboard";
import Document from "@/pages/document-management/Document";

// User Pages

const userRoutes = [
  <Route
    key="user-dashboard"
    path="/dashboard"
    element={
      <ProtectedRoute>
        <Layout>
          <UserDashboard />
        </Layout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="user-document"
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

export default userRoutes;
