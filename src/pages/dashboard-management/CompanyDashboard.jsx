import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import CardWrapper from "./components/CardWrapper";
import MetricCard from "./components/MetricCard";
import Icon from "../../components/Icon";
import { formatDate } from "../../utils/dateFormatter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function CompanyDashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call when backend is ready
      // const response = await getCompanyDashboardAnalytics();
      // setDashboardData(response.data);

      // Mock data for now
      const mockData = {
        stats: {
          totalFrameworks: 24,
          totalDocuments: 156,
          totalUsers: 18,
          frameworksByStatus: {
            aiProcessing: 3,
            aiCompleted: 18,
            aiFailed: 3,
          },
          reviewRequests: {
            pending: 2,
            requested: 4,
            approved: 15,
            rejected: 3,
          },
        },
        charts: {
          frameworkActivity: [
            { month: "Jan", uploads: 4, reviews: 3, approvals: 2 },
            { month: "Feb", uploads: 6, reviews: 5, approvals: 4 },
            { month: "Mar", uploads: 8, reviews: 7, approvals: 6 },
            { month: "Apr", uploads: 5, reviews: 6, approvals: 5 },
            { month: "May", uploads: 7, reviews: 8, approvals: 7 },
            { month: "Jun", uploads: 9, reviews: 9, approvals: 8 },
          ],
          reviewStatus: [
            { name: "Approved", value: 15, color: "#10b981" },
            { name: "Pending", value: 2, color: "#f59e0b" },
            { name: "Rejected", value: 3, color: "#ef4444" },
            { name: "Requested", value: 4, color: "#3b82f6" },
          ],
        },
        recentFrameworks: [
          {
            id: "1",
            frameworkName: "NIST Cybersecurity Framework",
            currentVersion: "2.0",
            requestReview: { status: "approved" },
            aiUpload: { status: "completed" },
            uploadedBy: { name: "John Doe", email: "john@example.com" },
            createdAt: "2024-03-15T10:30:00",
          },
          {
            id: "2",
            frameworkName: "ISO 27001:2022",
            currentVersion: "2022",
            requestReview: { status: "requested" },
            aiUpload: { status: "processing" },
            uploadedBy: { name: "Jane Smith", email: "jane@example.com" },
            createdAt: "2024-03-14T09:15:00",
          },
          {
            id: "3",
            frameworkName: "COBIT 2019",
            currentVersion: "2019",
            requestReview: { status: "rejected" },
            aiUpload: { status: "completed" },
            uploadedBy: { name: "Robert Johnson", email: "robert@example.com" },
            createdAt: "2024-03-13T16:45:00",
          },
          {
            id: "4",
            frameworkName: "PCI DSS v4.0",
            currentVersion: "4.0",
            requestReview: { status: "pending" },
            aiUpload: { status: "pending" },
            uploadedBy: { name: "Maria Garcia", email: "maria@example.com" },
            createdAt: "2024-03-12T13:20:00",
          },
          {
            id: "5",
            frameworkName: "GDPR Compliance Framework",
            currentVersion: "1.5",
            requestReview: { status: "approved" },
            aiUpload: { status: "completed" },
            uploadedBy: { name: "David Wilson", email: "david@example.com" },
            createdAt: "2024-03-11T08:00:00",
          },
        ],
        recentDocuments: [
          {
            id: "1",
            documentName: "Security Policy v3.pdf",
            currentVersion: "3.0",
            uploadedBy: { name: "John Doe", email: "john@example.com" },
            createdAt: "2024-03-15T11:30:00",
          },
          {
            id: "2",
            documentName: "Risk Assessment Report Q1.xlsx",
            currentVersion: "1.2",
            uploadedBy: { name: "Jane Smith", email: "jane@example.com" },
            createdAt: "2024-03-14T14:20:00",
          },
          {
            id: "3",
            documentName: "Incident Response Plan.docx",
            currentVersion: "2.1",
            uploadedBy: { name: "Robert Johnson", email: "robert@example.com" },
            createdAt: "2024-03-13T09:45:00",
          },
          {
            id: "4",
            documentName: "Business Continuity Plan.pdf",
            currentVersion: "1.0",
            uploadedBy: { name: "Maria Garcia", email: "maria@example.com" },
            createdAt: "2024-03-12T16:15:00",
          },
          {
            id: "5",
            documentName: "Compliance Checklist.xlsx",
            currentVersion: "4.3",
            uploadedBy: { name: "David Wilson", email: "david@example.com" },
            createdAt: "2024-03-11T10:00:00",
          },
        ],
      };
      setDashboardData(mockData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error(error.message || "Failed to load dashboard data");
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
          <Button onClick={fetchDashboardData} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const { stats, charts, recentFrameworks, recentDocuments } = dashboardData;

  // Prepare metrics data
  const metrics = [
    {
      label: "TOTAL FRAMEWORKS",
      value: stats.totalFrameworks || 0,
      trend: [
        {
          text: `${stats.frameworksByStatus?.aiCompleted || 0} Completed`,
          color: "text-green-600 dark:text-green-400",
        },
        {
          text: `${stats.frameworksByStatus?.aiProcessing || 0} Processing`,
          color: "text-blue-600 dark:text-blue-400",
        },
      ],
      trendColor: "text-purple-500",
      icon: "framework",
      subtitle: [
        {
          text: `${stats.frameworksByStatus?.aiFailed || 0} Failed`,
          color: "text-red-600 dark:text-red-400",
        },
      ],
    },
    {
      label: "TOTAL DOCUMENTS",
      value: stats.totalDocuments || 0,
      trend: "Company uploaded documents",
      trendColor: "text-orange-500",
      icon: "document",
    },
    {
      label: "TOTAL USERS",
      value: stats.totalUsers || 0,
      trend: "Users created by company",
      trendColor: "text-green-500",
      icon: "users",
    },
    {
      label: "REVIEW REQUESTS",
      value:
        (stats.reviewRequests?.pending || 0) +
        (stats.reviewRequests?.requested || 0) +
        (stats.reviewRequests?.approved || 0) +
        (stats.reviewRequests?.rejected || 0),
      trend: [
        {
          text: `${stats.reviewRequests?.approved || 0} Approved`,
          color: "text-green-600 dark:text-green-400",
        },
        {
          text: `${stats.reviewRequests?.pending || 0} Pending`,
          color: "text-yellow-600 dark:text-yellow-400",
        },
      ],
      trendColor: "text-purple-500",
      icon: "star",
      subtitle: [
        {
          text: `${stats.reviewRequests?.rejected || 0} Rejected`,
          color: "text-red-600 dark:text-red-400",
        },
        {
          text: `${stats.reviewRequests?.requested || 0} Requested`,
          color: "text-blue-600 dark:text-blue-400",
        },
      ],
    },
  ];

  // Quick Actions for Company
  const quickActions = [
    {
      title: "Upload Framework",
      desc: "Upload new framework",
      icon: "upload",
      color: "bg-blue-500/20 text-blue-400",
      path: "/frameworks",
    },
    {
      title: "Upload Document",
      desc: "Upload new document",
      icon: "document",
      color: "bg-amber-500/20 text-amber-400",
      path: "/documents",
    },
    {
      title: "Manage Users",
      desc: "View and manage users",
      icon: "users",
      color: "bg-emerald-500/20 text-emerald-400",
      path: "/users",
    },
    {
      title: "Review Requests",
      desc: "View review status",
      icon: "star",
      color: "bg-purple-500/20 text-purple-400",
      path: "/frameworks",
    },
  ];

  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "rejected":
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "requested":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "pending":
      case "processing":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  return (
    <div className="space-y-4 my-4">
      {/* Metrics */}
      <CardWrapper title="Company Overview">
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

      {/* Charts Section */}
      <CardWrapper title="Framework Analytics">
        <div className="grid xl:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div>
              <h4 className="text-sm font-semibold text-foreground">
                Framework Activity
              </h4>
              <p className="text-xs text-muted-foreground">
                Monthly uploads, reviews, and approvals
              </p>
            </div>
            <Card className="bg-card border-border p-0">
              <CardContent className="p-0">
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={charts.frameworkActivity}
                      margin={{ top: 5, right: 10, left: -30, bottom: -5 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorUploads"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="var(--primary)"
                            stopOpacity={0.2}
                          />
                          <stop
                            offset="95%"
                            stopColor="var(--primary)"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="colorReviews"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="var(--secondary)"
                            stopOpacity={0.2}
                          />
                          <stop
                            offset="95%"
                            stopColor="var(--secondary)"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--border)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="month"
                        stroke="var(--muted-foreground)"
                        tick={{ fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="var(--muted-foreground)"
                        tick={{ fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        domain={[0, 12]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          borderColor: "var(--border)",
                          fontSize: "11px",
                          padding: "6px",
                          borderRadius: "6px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="uploads"
                        stroke="var(--primary)"
                        strokeWidth={2}
                        fill="url(#colorUploads)"
                        name="Uploads"
                      />
                      <Area
                        type="monotone"
                        dataKey="reviews"
                        stroke="var(--secondary)"
                        strokeWidth={2}
                        fill="url(#colorReviews)"
                        name="Reviews"
                      />
                      <Area
                        type="monotone"
                        dataKey="approvals"
                        stroke="#10b981"
                        strokeWidth={2}
                        fill="#10b98120"
                        name="Approvals"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-2">
            <div>
              <h4 className="text-sm font-semibold text-foreground">
                Review Status Distribution
              </h4>
              <p className="text-xs text-muted-foreground">
                Current framework review status
              </p>
            </div>
            <Card className="bg-card border-border p-0">
              <CardContent className="p-0">
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart
                      margin={{ top: 5, right: 10, left: -30, bottom: -5 }}
                    >
                      <Pie
                        data={charts.reviewStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        labelLine={{
                          stroke: "var(--muted-foreground)",
                          strokeWidth: 1,
                        }}
                      >
                        {charts.reviewStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          borderColor: "var(--border)",
                          fontSize: "11px",
                          padding: "6px",
                          borderRadius: "6px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardWrapper>

      {/* Recent Items */}
      <div className="grid xl:grid-cols-2 gap-4 items-stretch">
        {/* Recent Frameworks */}
        <CardWrapper
          title="Recent Frameworks"
          right={
            <Link
              to={"/frameworks"}
              className="text-primary cursor-pointer flex items-center gap-1"
            >
              View All <Icon name="arrow-right" size="14px" />
            </Link>
          }
          className="flex flex-col"
        >
          <div className="space-y-2 flex-1">
            {recentFrameworks.length === 0 ? (
              <div className="text-center py-8 flex-1 flex flex-col justify-center">
                <Icon
                  name="framework"
                  size="48px"
                  className="text-muted-foreground mb-4"
                />
                <p className="text-muted-foreground">No recent frameworks</p>
              </div>
            ) : (
              recentFrameworks.map((framework) => (
                <div
                  key={framework.id}
                  className="flex items-center gap-3 p-3 bg-accent rounded border border-border hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() =>
                    navigate(`/company-frameworks/${framework.id}`)
                  }
                >
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <Icon name="framework" size="18px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground text-sm truncate">
                        {framework.frameworkName}
                      </h4>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${getStatusBadgeColor(
                          framework.requestReview?.status,
                        )}`}
                      >
                        {framework.requestReview?.status || "pending"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      v{framework.currentVersion} • {framework.uploadedBy?.name}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs whitespace-nowrap">
                      {formatDate(framework.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardWrapper>

        {/* Recent Documents */}
        <CardWrapper
          title="Recent Documents"
          right={
            <Link
              to={"/documents"}
              className="text-primary cursor-pointer flex items-center gap-1"
            >
              View All <Icon name="arrow-right" size="14px" />
            </Link>
          }
          className="flex flex-col"
        >
          <div className="space-y-2 flex-1">
            {recentDocuments.length === 0 ? (
              <div className="text-center py-8 flex-1 flex flex-col justify-center">
                <Icon
                  name="document"
                  size="48px"
                  className="text-muted-foreground mb-4"
                />
                <p className="text-muted-foreground">No recent documents</p>
              </div>
            ) : (
              recentDocuments.map((document) => (
                <div
                  key={document.id}
                  className="flex items-center gap-3 p-3 bg-accent rounded border border-border hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/company-documents/${document.id}`)}
                >
                  <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
                    <Icon name="document" size="18px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground text-sm truncate">
                      {document.documentName}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate">
                      v{document.currentVersion} • {document.uploadedBy?.name}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs whitespace-nowrap">
                      {formatDate(document.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardWrapper>
      </div>

      {/* Quick Actions */}
      <CardWrapper title="Quick Actions">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((a) => (
            <Button
              variant="outline"
              key={a.title}
              size="lg"
              className="group flex gap-3 rounded border border-border bg-accent px-5 py-10 shadow-lg hover:border-primary transition-all duration-200 cursor-pointer"
              onClick={() => {
                navigate(a.path);
              }}
            >
              <div
                className={`h-10 w-10 rounded flex items-center justify-center shrink-0 ${a.color}`}
              >
                <Icon name={a.icon} size="18px" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="font-semibold text-sm">{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.desc}</p>
              </div>
              <span className="text-muted-foreground group-hover:translate-x-1 transition shrink-0">
                <Icon name="arrow-right" size="16px" />
              </span>
            </Button>
          ))}
        </div>
      </CardWrapper>
    </div>
  );
}
