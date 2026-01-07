import { useLocation } from "react-router-dom";
import { generateBreadcrumbs } from "../utils/generateBreadcrumbs";
import Header from "./Header";
import Sidebar from "./Sidebar";

function Layout({ children }) {
  const location = useLocation();
  const breadcrumbs = generateBreadcrumbs(location.pathname);
  const pageTitle = breadcrumbs[breadcrumbs.length - 1]?.label || "";

  return (
    <div className="mx-auto max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-5xl xl:max-w-[1500px]">
      <Sidebar />
      <main className="w-full min-h-screen">
        <Header pageTitle={pageTitle} breadcrumbs={breadcrumbs} />
        <div className="">{children}</div>
      </main>
    </div>
  );
}

export default Layout;
