import { Route } from "react-router-dom";
import Layout from "../../layout/Layout";
import ProtectedRoute from "./ProtectedRoute";
import UserDashboard from "@/pages/dashboard-management/UserDashboard";

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
];

export default userRoutes;
