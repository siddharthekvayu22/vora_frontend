import { Route } from "react-router-dom";
import Layout from "../../layout/Layout";
import ProtectedRoute from "./ProtectedRoute";
import UserDashboard from "@/pages/dashboard-management/UserDashboard";
import Document from "@/pages/document-management/Document";
import DocumentDetail from "@/pages/document-management/DocumentDetail";

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
  <Route
    key="user-document-detail"
    path="/documents/:id"
    element={
      <ProtectedRoute>
        <Layout>
          <DocumentDetail />
        </Layout>
      </ProtectedRoute>
    }
  />,
];

export default userRoutes;
