export function generateBreadcrumbs(pathname, userRole = null) {
  // Get role-based dashboard path
  const getDashboardPath = (role) => {
    if (!role) return "/dashboard";

    switch (role.toLowerCase()) {
      case "admin":
        return "/admin-dashboard";
      case "expert":
        return "/dashboard";
      case "user":
        return "/dashboard";
      default:
        return "/dashboard";
    }
  };

  const dashboardPath = getDashboardPath(userRole);
  const dashboardLabel =
    userRole?.toLowerCase() === "admin" ? "Admin Dashboard" : "Dashboard";

  // Normalize paths
  if (
    pathname === "/" ||
    pathname === "/dashboard" ||
    pathname === "/admin-dashboard"
  ) {
    return [
      {
        label: dashboardLabel,
        path: dashboardPath,
        active: true,
      },
    ];
  }

  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = [
    {
      label: dashboardLabel,
      path: dashboardPath,
      active: false,
    },
  ];

  let currentPath = "";

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;

    const label = segment
      .replace(/-/g, " ")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    breadcrumbs.push({
      label,
      path: currentPath,
      active: index === segments.length - 1,
    });
  });

  return breadcrumbs;
}
