import { Route } from "react-router-dom";
import Layout from "../../layout/Layout";
import ProtectedRoute from "./ProtectedRoute";

// Company Pages
import Dashboard from "../../pages/dashboard-management/Dashboard";

const companyRoutes = [
  // Company Dashboard
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

  // Add more company-specific routes here as needed
  // Example:
  // <Route
  //   key="company-documents"
  //   path="/documents"
  //   element={
  //     <ProtectedRoute>
  //       <Layout>
  //         <Documents />
  //       </Layout>
  //     </ProtectedRoute>
  //   }
  // />,

  // <Route
  //   key="company-frameworks"
  //   path="/frameworks"
  //   element={
  //     <ProtectedRoute>
  //       <Layout>
  //         <Frameworks />
  //       </Layout>
  //     </ProtectedRoute>
  //   }
  // />,
];

export default companyRoutes;
