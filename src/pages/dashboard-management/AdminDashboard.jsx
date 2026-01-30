import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import CardWrapper from "./components/CardWrapper";
import MetricCard from "./components/MetricCard";
import UserRegistrationChart from "../../components/charts/UserRegistrationChart";
import Icon from "../../components/Icon";
import { getAdminDashboardAnalytics } from "../../services/adminService";
import { formatDate } from "../../utils/dateFormatter";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
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
  const metrics = [
    {
      label: "TOTAL USERS",
      value: `${stats.totalActiveUsers + stats.totalInactiveUsers || 0}`,
      trend: `${stats.usersByRole.admin} Admin, ${stats.usersByRole.expert} Expert, ${stats.usersByRole.company} Company`,
      trendColor: "text-blue-500",
      icon: "👥",
    },
    {
      label: "TOTAL OFFICIAL FRAMEWORKS",
      value: stats.totalOfficialFrameworks || 0,
      trend: "Official frameworks available",
      trendColor: "text-purple-500",
      icon: "🏗",
    },
    {
      label: "TOTAL COMPANY FRAMEWORKS",
      value: stats.totalCompanyFrameworks || 0,
      trend: "Comapny uploaded frameworks",
      trendColor: "text-green-500",
      icon: "📋",
    },

    {
      label: "TOTAL COMPANY DOCUMENTS",
      value: stats.totalCompanyDocuments || 0,
      trend: "Company uploaded Documents",
      trendColor: "text-orange-500",
      icon: "📄",
    },
  ];

  // Quick Actions for Admin
  const quickActions = [
    {
      title: "Manage Users",
      desc: "View and manage system users",
      icon: "👥",
      color: "bg-blue-500/20 text-blue-400",
      path: "/users",
    },
    {
      title: "Framework Management",
      desc: "Manage compliance frameworks",
      icon: "🏗",
      color: "bg-purple-500/20 text-purple-400",
      path: "/",
    },
    {
      title: "System Settings",
      desc: "Configure system settings",
      icon: "⚙",
      color: "bg-gray-500/20 text-gray-400",
      path: "/settings",
    },
  ];

  // Role distribution data
  const roleDistribution = [
    {
      name: "Admin",
      count: stats.usersByRole.admin,
      percentage: ((stats.usersByRole.admin / stats.totalUsers) * 100).toFixed(
        1,
      ),
      color: "bg-red-500",
    },
    {
      name: "Expert",
      count: stats.usersByRole.expert,
      percentage: ((stats.usersByRole.expert / stats.totalUsers) * 100).toFixed(
        1,
      ),
      color: "bg-blue-500",
    },
    {
      name: "User",
      count: stats.usersByRole.user,
      percentage: ((stats.usersByRole.user / stats.totalUsers) * 100).toFixed(
        1,
      ),
      color: "bg-green-500",
    },
  ];

  return (
    <div className="space-y-6 my-5">
      {/* Metrics */}
      <CardWrapper title="System Overview">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((m) => (
            <MetricCard key={m.label} {...m} icon={<span>{m.icon}</span>} />
          ))}
        </div>
      </CardWrapper>

      {/* User Analytics */}
      <div className="grid xl:grid-cols-2 gap-6 items-stretch">
        {/* Recent Users */}
        <CardWrapper
          title="Recently Created Users"
          right={
            <Link to={"/users"} className="text-primary cursor-pointer">
              View All →
            </Link>
          }
          className="flex flex-col"
        >
          <div className="space-y-3 flex-1">
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
                  className="flex items-center gap-4 p-4 bg-accent rounded-lg border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <Icon name="user" size="20px" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground">
                        {user.name}
                      </h4>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          user.role === "admin"
                            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            : user.role === "expert"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                              : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
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
          <div className="flex-1 min-h-[400px]">
            <UserRegistrationChart data={charts.userCreation} />
          </div>
        </CardWrapper>
      </div>

      {/* Quick Actions */}
      <CardWrapper title="Quick Actions">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((a) => (
            <button
              key={a.title}
              className="group flex gap-4 rounded-2xl border border-border bg-accent p-6 shadow-lg hover:border-primary transition-all duration-200"
              onClick={() => {
                // Navigate to the respective page
                window.location.href = a.path;
              }}
            >
              <div
                className={`h-12 w-12 rounded-xl flex items-center justify-center ${a.color}`}
              >
                {a.icon}
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold">{a.title}</p>
                <p className="text-sm text-muted-foreground">{a.desc}</p>
              </div>
              <span className="text-muted-foreground group-hover:translate-x-1 transition">
                →
              </span>
            </button>
          ))}
        </div>
      </CardWrapper>
    </div>
  );
}
