import { useLocation } from "react-router-dom";
import { generateBreadcrumbs } from "../utils/generateBreadcrumbs";
import { useAuth } from "../context/useAuth";
import Header from "./Header";
import Sidebar from "./Sidebar";

function Layout({ children }) {
  const location = useLocation();
  const { user } = useAuth();
  const breadcrumbs = generateBreadcrumbs(location.pathname, user?.role);
  const pageTitle = breadcrumbs[breadcrumbs.length - 1]?.label || "";

  return (
    <div className="mx-auto max-w-full px-3">
      <Sidebar />
      <main className="w-full">
        <Header pageTitle={pageTitle} breadcrumbs={breadcrumbs} />
        <div className="">{children}</div>
      </main>
    </div>
  );
}

export default Layout;
