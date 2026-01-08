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

  // Normalize paths
  if (
    pathname === "/" ||
    pathname === "/dashboard" ||
    pathname === "/admin-dashboard"
  ) {
    return [
      {
        label: "Dashboard",
        path: "/dashboard",
        active: true,
      },
    ];
  }

  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = [
    {
      label: "Dashbaord",
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
