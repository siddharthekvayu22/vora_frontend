import { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useTheme } from "../context/ThemeContext";
import Icon from "../components/Icon";
import logoImage from "../assets/loggo.png";

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);

  const location = useLocation();
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const role = user?.role || "expert";

  /* ================= NAV CONFIG ================= */
  const navigationConfig = {
    admin: [
      {
        id: "admin-dashboard",
        title: "Dashboard",
        description: "Admin overview & analytics",
        icon: "dashboard",
        path: "/admin-dashboard",
      },

      {
        id: "users",
        title: "User Management",
        description: "Manage users & roles",
        icon: "user",
        path: "/users",
      },
      {
        id: "framework-management",
        title: "Framework Management",
        description: "Manage category & access",
        icon: "framework",
        children: [
          {
            id: "framework-category",
            title: "Framework Category",
            description: "Manage framework category",
            icon: "chart",
            path: "/framework-category",
          },
          {
            id: "framework-access",
            title: "Access Approved",
            description: "Manage approved access",
            icon: "check-circle",
            path: "/framework-access/approved",
          },
          {
            id: "framework-access-requests",
            title: "Access Requests",
            description: "Manage access requests",
            icon: "clock",
            path: "/framework-access/requests",
          },
          {
            id: "framework-access-rejected",
            title: "Access Rejected",
            description: "View rejected access",
            icon: "x-circle",
            path: "/framework-access/rejected",
          },
          {
            id: "framework-access-revoked",
            title: "Access Revoked",
            description: "View revoked access",
            icon: "user-minus",
            path: "/framework-access/revoked",
          },
        ],
      },
      // {
      //   id: "settings",
      //   title: "Settings",
      //   description: "Admin settings",
      //   icon: "settings",
      //   path: "/settings",
      // },
    ],

    expert: [
      {
        id: "expert-dashboard",
        title: "Dashboard",
        description: "Expert overview & analytics",
        icon: "dashboard",
        path: "/expert-dashboard",
      },
      {
        id: "official-framework-management",
        title: "Framework Management",
        description: "Manage framework & access",
        icon: "framework",
        children: [
          {
            id: "official-framework",
            title: "Frameworks",
            description: "Official frameworks",
            icon: "framework",
            path: "/official-frameworks",
          },
          {
            id: "official-framework-category",
            title: "Framework Category",
            description: "Official framework category",
            icon: "framework",
            path: "/official-framework-category",
          },
          {
            id: "official-framework-access",
            title: "Framework Access",
            description: "Official framework access",
            icon: "framework",
            path: "/official-framework-access",
          },
        ],
      },
      // {
      //   id: "reports",
      //   title: "Reports",
      //   description: "Compliance reports",
      //   icon: "chart",
      //   path: "/reports",
      // },
    ],

    user: [
      {
        id: "dashboard",
        title: "Dashboard",
        description: "Overview & analytics",
        icon: "dashboard",
        path: "/dashboard",
      },
      {
        id: "documents",
        title: "Documents",
        description: "View & manage documents",
        icon: "file",
        path: "/documents",
      },
      {
        id: "frameworks",
        title: "Frameworks",
        description: "View & browse frameworks",
        icon: "framework",
        path: "/frameworks",
      },
    ],
  };

  const menuItems = navigationConfig[role] || navigationConfig.expert;

  // Auto-expand parent menu if child is active
  useEffect(() => {
    const activeParent = menuItems.find(
      (item) =>
        item.children && item.children.some((child) => isActive(child.path)),
    );
    if (activeParent && activeMenu !== activeParent.id) {
      setActiveMenu(activeParent.id);
    }
  }, [location.pathname]);

  const isActive = (path) => {
    if (!path) return false;
    return path === "/dashboard"
      ? location.pathname === "/" || location.pathname === "/dashboard"
      : location.pathname === path;
  };

  const isParentActive = (item) => {
    if (item.path) return isActive(item.path);
    if (item.children) {
      return item.children.some((child) => isActive(child.path));
    }
    return false;
  };

  /* ================= RENDER ================= */
  return (
    <>
      {/* Hamburger */}
      {/* Premium Hamburger */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open sidebar"
          className="
      fixed left-2 top-5 z-50
      flex h-11 w-11 items-center justify-center
      rounded-2xl
      bg-gradient-to-br from-primary to-primary/70
      shadow-[0_8px_30px_rgba(20,184,166,0.45)]
      transition-all duration-300
      hover:scale-105 hover:shadow-[0_12px_40px_rgba(20,184,166,0.65)]
      active:scale-95 cursor-pointer
    "
        >
          <div className="flex flex-col gap-[4px]">
            <span className="h-[2px] w-5 rounded-full bg-white" />
            <span className="h-[2px] w-4 rounded-full bg-white opacity-80" />
            <span className="h-[2px] w-5 rounded-full bg-white" />
          </div>
        </button>
      )}

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[2px]"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-[340px] bg-background flex flex-col
                    shadow-2xl transition-transform duration-300
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* ================= HEADER ================= */}
        <div
          className="relative flex items-center justify-between overflow-hidden
                     border-b-2 border-[var(--line)]
                     bg-gradient-to-br from-primary to-primary-2
                     px-6 py-7"
        >
          <span
            className="pointer-events-none absolute -top-1/2 -right-1/2
                       h-[200%] w-[200%]
                       bg-[radial-gradient(circle,rgba(255,255,255,0.1)_0%,transparent_70%)]
                       animate-rotatePattern"
          />

          <div className="relative z-10 flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center
                            rounded-xl shadow-lg overflow-hidden"
            >
              <img
                src={logoImage}
                alt="VORA Logo"
                className="h-full w-full object-contain rounded-xl mix-blend-screen"
                style={{
                  filter: "drop-shadow(0 0 5px rgba(255,255,255,0.5))",
                  background: "transparent",
                }}
              />
            </div>
            <div>
              <div className="text-lg font-extrabold tracking-wide text-white">
                VORA
              </div>
              <div className="text-xs text-white/90">
                AI Compliance Platform
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="relative z-10 flex h-9 w-9 items-center justify-center
                       rounded-lg border border-white/30 bg-white/20
                       text-white transition hover:rotate-90 hover:bg-red-500 cursor-pointer"
          >
            <Icon name="close" size="20px" />
          </button>
        </div>

        {/* ================= MENU ================= */}
        <div className="flex-1 overflow-y-auto px-4 py-3 sidebar-scroll">
          <div className="flex flex-col gap-2">
            {menuItems.map((item) => (
              <div key={item.id} className="">
                {/* Parent */}
                <div
                  onClick={() => {
                    if (item.children) {
                      setActiveMenu(activeMenu === item.id ? null : item.id);
                    } else if (item.path) {
                      navigate(item.path);
                      setIsOpen(false);
                    }
                  }}
                  className={`group relative flex cursor-pointer items-center gap-4
                            rounded-2xl px-4 py-3 transition-all
                  ${
                    isParentActive(item)
                      ? "border border-primary bg-gradient-to-br from-primary/15 to-primary-2/15 shadow-md"
                      : "border border-transparent bg-muted hover:translate-x-1 hover:border-border hover:bg-background"
                  }`}
                >
                  {/* Left accent */}
                  <span
                    className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r
                    ${
                      isParentActive(item)
                        ? "h-2/3 bg-gradient-to-b from-primary to-primary-2"
                        : "h-0 bg-primary group-hover:h-1/2 transition-all"
                    }`}
                  />

                  {/* Icon */}
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border transition
                    ${
                      isParentActive(item)
                        ? "border-primary bg-primary/20 text-primary scale-110"
                        : "border-border bg-muted text-muted-foreground group-hover:text-primary"
                    }`}
                  >
                    <Icon name={item.icon} size="20px" />
                  </div>

                  {/* Text */}
                  <div className="flex flex-1 flex-col">
                    <span
                      className={`text-sm font-semibold
                      ${
                        isParentActive(item)
                          ? "text-primary"
                          : "text-foreground"
                      }`}
                    >
                      {item.title}
                    </span>
                    {item.description && (
                      <span className="text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    )}
                  </div>

                  {/* Arrow */}
                  {item.children && (
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-md border transition
                      ${
                        activeMenu === item.id
                          ? "rotate-180 border-primary bg-primary text-white"
                          : "border-border bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon name="arrow-down" size="12px" />
                    </div>
                  )}
                </div>

                {/* Submenu */}
                {item.children && activeMenu === item.id && (
                  <div className="ml-6 mt-2 flex flex-col gap-1 border-l-2 border-primary/40 pl-1">
                    {item.children.map((sub) => (
                      <Link
                        key={sub.id}
                        to={sub.path}
                        onClick={() => setIsOpen(false)}
                        className={`group flex items-center gap-3 rounded-xl px-3 py-2 transition
                        ${
                          isActive(sub.path)
                            ? "bg-primary/20 text-primary border-l-2 border-primary"
                            : "hover:translate-x-1 hover:bg-muted"
                        }`}
                      >
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg border
                          ${
                            isActive(sub.path)
                              ? "border-primary bg-primary/20 text-primary scale-110"
                              : "border-border bg-muted text-muted-foreground"
                          }`}
                        >
                          <Icon name={sub.icon} size="16px" />
                        </div>
                        <span className="text-sm font-medium">{sub.title}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ================= FOOTER ================= */}
        <div className="shrink-0 border-t border-border bg-muted p-4">
          <Link
            to={"/profile"}
            onClick={() => setIsOpen(false)}
            className="mb-4 flex items-center gap-3 rounded-xl border border-border bg-gradient-to-br from-primary/15 to-primary-2/15 p-3 hover:shadow-md cursor-pointer transition-all duration-200 hover:scale-[1.02]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white animate-pulse">
              <Icon name="user" size="18px" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-lg font-bold text-foreground truncate">
                {user?.name || "Admin User"}
              </div>

              <div className="text-xs text-muted-foreground truncate mt-0.5">
                {user?.email || "user@example.com"}
              </div>
              <div className="text-xs text-muted-foreground capitalize">
                {role === "admin"
                  ? "Admin"
                  : role === "expert"
                    ? "System Expert"
                    : "System User"}
              </div>
            </div>
          </Link>

          <div className="flex gap-2">
            <button
              onClick={toggleTheme}
              className="flex-1 rounded-xl border border-border bg-primary/70 py-2 text-sm hover:bg-primary/50 text-white"
            >
              Theme
            </button>
            <button
              onClick={() => logout()}
              className="flex-1 rounded-xl border border-red-500 bg-red-500/10
                         py-2 text-sm text-red-500 hover:bg-red-500 hover:text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
