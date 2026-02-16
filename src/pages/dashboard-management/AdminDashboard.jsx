import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import CardWrapper from "./components/CardWrapper";
import MetricCard from "./components/MetricCard";
import UserRegistrationChart from "../../components/charts/UserRegistrationChart";
import Icon from "../../components/Icon";
import { getAdminDashboardAnalytics } from "../../services/adminService";
import { formatDate } from "../../utils/dateFormatter";
import { Link, useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await getAdminDashboardAnalytics();
      setDashboardData(response.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-muted-foreground">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Icon
            name="warning"
            size="48px"
            className="text-muted-foreground mb-4"
          />
          <p className="text-muted-foreground">Failed to load dashboard data</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { stats, charts, recentCreatedUsers } = dashboardData;

  // Prepare metrics data
  const totalUsers =
    (stats.totalActiveUsers || 0) + (stats.totalInactiveUsers || 0);

  const metrics = [
    {
      label: "TOTAL USERS",
      value: totalUsers,
      trend: [
        {
          text: `${stats.totalActiveUsers || 0} Active`,
          color: "text-green-600 dark:text-green-400",
        },
        {
          text: `${stats.totalInactiveUsers || 0} Inactive`,
          color: "text-red-600 dark:text-red-400",
        },
      ],
      trendColor: "text-blue-500",
      icon: "users",
      subtitle: [
        {
          text: `${stats.usersByRole?.admin || 0} Admin`,
          color: "text-pink-600 dark:text-pink-400",
        },
        {
          text: `${stats.usersByRole?.expert || 0} Expert`,
          color: "text-blue-600 dark:text-blue-400",
        },
        {
          text: `${stats.usersByRole?.company || 0} Company`,
          color: "text-yellow-600 dark:text-yellow-400",
        },
        {
          text: `${stats.usersByRole?.user || 0} User`,
          color: "text-green-600 dark:text-green-400",
        },
      ],
    },
    {
      label: "TOTAL OFFICIAL FRAMEWORKS",
      value: stats.totalOfficialFrameworks || 0,
      trend: "Official frameworks available",
      trendColor: "text-purple-500",
      icon: "framework",
    },
    {
      label: "TOTAL COMPANY FRAMEWORKS",
      value: stats.totalCompanyFrameworks || 0,
      trend: "Company uploaded frameworks",
      trendColor: "text-green-500",
      icon: "framework",
    },
    {
      label: "TOTAL COMPANY DOCUMENTS",
      value: stats.totalCompanyDocuments || 0,
      trend: "Company uploaded documents",
      trendColor: "text-orange-500",
      icon: "document",
    },
  ];

  // Quick Actions for Admin
  const quickActions = [
    {
      title: "Manage Users",
      desc: "View and manage system users",
      icon: "users",
      color: "bg-blue-500/20 text-blue-400",
      path: "/users",
    },
    {
      title: "Framework Category",
      desc: "Manage frameworks category",
      icon: "list",
      color: "bg-amber-500/20 text-amber-400",
      path: "/framework-category",
    },
    {
      title: "Framework Access",
      desc: "Manage frameworks access",
      icon: "shield-check",
      color: "bg-emerald-500/20 text-emerald-400",
      path: "/framework-access",
    },
    {
      title: "System Settings",
      desc: "Configure system settings",
      icon: "settings",
      color: "bg-gray-500/20 text-gray-400",
      path: "/settings",
    },
  ];

  return (
    <div className="space-y-4 my-4">
      {/* Metrics */}
      <CardWrapper title="System Overview">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((m) => (
            <MetricCard
              key={m.label}
              {...m}
              icon={<Icon name={m.icon} size="20px" />}
            />
          ))}
        </div>
      </CardWrapper>

      {/* User Analytics */}
      <div className="grid xl:grid-cols-2 gap-4 items-stretch">
        {/* Recent Users */}
        <CardWrapper
          title="Recently Created Users"
          right={
            <Link
              to={"/users"}
              className="text-primary cursor-pointer flex items-center gap-1"
            >
              View All <Icon name="arrow-right" size="14px" />
            </Link>
          }
          className="flex flex-col"
        >
          <div className="space-y-2 flex-1">
            {recentCreatedUsers.length === 0 ? (
              <div className="text-center py-8 flex-1 flex flex-col justify-center">
                <Icon
                  name="users"
                  size="48px"
                  className="text-muted-foreground mb-4"
                />
                <p className="text-muted-foreground">No recent users</p>
              </div>
            ) : (
              recentCreatedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-3 bg-accent rounded-lg border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <Icon name="user" size="18px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground text-sm truncate">
                        {user.name}
                      </h4>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                          user.role === "admin"
                            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            : user.role === "expert"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                              : user.role === "company"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs whitespace-nowrap">
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardWrapper>
        {/* User Registration Chart */}
        <CardWrapper title="User Registration Trends" className="flex flex-col">
          <div className="flex-1 min-h-[350px]">
            <UserRegistrationChart data={charts.userCreation} />
          </div>
        </CardWrapper>
      </div>

      {/* Quick Actions */}
      <CardWrapper title="Quick Actions">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((a) => (
            <button
              key={a.title}
              className="group flex gap-3 rounded-xl border border-border bg-accent p-4 shadow-lg hover:border-primary transition-all duration-200 cursor-pointer"
              onClick={() => {
                navigate(a.path);
              }}
            >
              <div
                className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${a.color}`}
              >
                <Icon name={a.icon} size="18px" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="font-semibold text-sm">{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.desc}</p>
              </div>
              <span className="text-muted-foreground group-hover:translate-x-1 transition flex-shrink-0">
                <Icon name="arrow-right" size="16px" />
              </span>
            </button>
          ))}
        </div>
      </CardWrapper>
    </div>
  );
}
