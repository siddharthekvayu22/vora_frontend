export function generateBreadcrumbs(pathname) {
  // Normalize paths
  if (pathname === "/" || pathname === "/dashboard") {
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
      label: "Dashboard",
      path: "/dashboard",
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
