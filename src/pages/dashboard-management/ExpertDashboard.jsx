import { useState, useEffect } from "react";
import CardWrapper from "./components/CardWrapper";
import MetricCard from "./components/MetricCard";
import Icon from "../../components/Icon";
import { formatDate } from "../../utils/dateFormatter";
import { Link } from "react-router-dom";

export default function ExpertDashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

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

  // Static data for expert dashboard
  const stats = {
    totalFrameworks: 24,
    totalCategories: 8,
    successRate: 87.5, // (approved/total * 100)
    avgUploadSize: "2.4 MB",
    uploadFrequency: {
      thisMonth: 6,
      lastMonth: 4,
    },
    categoryPopularity: [
      { name: "ISO Standards", count: 8 },
      { name: "Security Frameworks", count: 6 },
      { name: "Quality Management", count: 4 },
      { name: "Risk Management", count: 3 },
      { name: "Data Protection", count: 3 },
    ],
    fileTypeDistribution: {
      pdf: 45,
      docx: 35,
      xlsx: 20,
    },
    recentActivity: 3, // last 7 days
    mostUsedCategory: "ISO Standards",
    largestFile: {
      name: "ISO_27001_Complete_Guide.pdf",
      size: "8.2 MB",
    },
    firstUpload: "2024-01-15T10:30:00Z",
    lastUpload: "2024-02-03T14:22:00Z",
    pendingRequests: 2,
    inaccessibleCategories: 3,
  };

  // Recent uploads (static data)
  const recentUploads = [
    {
      id: 1,
      name: "ISO 9001 Quality Management Framework",
      type: "pdf",
      size: "299.2 KB",
      uploadedAt: "2024-02-03T14:22:00Z",
      status: "approved",
    },
    {
      id: 2,
      name: "ISO 27001 Information Security",
      type: "docx",
      size: "22.72 KB",
      uploadedAt: "2024-02-02T11:15:00Z",
      status: "pending",
    },
    {
      id: 3,
      name: "GDPR Compliance Framework",
      type: "pdf",
      size: "1.8 MB",
      uploadedAt: "2024-02-01T16:45:00Z",
      status: "approved",
    },
    {
      id: 4,
      name: "Risk Assessment Template",
      type: "xlsx",
      size: "456 KB",
      uploadedAt: "2024-01-30T09:30:00Z",
      status: "approved",
    },
    {
      id: 5,
      name: "SOC 2 Compliance Guide",
      type: "pdf",
      size: "3.2 MB",
      uploadedAt: "2024-01-28T13:20:00Z",
      status: "rejected",
    },
  ];

  // Prepare metrics data
  const metrics = [
    {
      label: "TOTAL FRAMEWORKS",
      value: stats.totalFrameworks,
      trend: "Frameworks uploaded by me",
      trendColor: "text-blue-500",
      icon: "framework",
    },
    {
      label: "CATEGORIES AVAILABLE",
      value: stats.totalCategories,
      trend: "Active categories in system",
      trendColor: "text-purple-500",
      icon: "chart",
    },
    {
      label: "SUCCESS RATE",
      value: `${stats.successRate}%`,
      trend: "Approval rate for my uploads",
      trendColor: "text-green-500",
      icon: "check-circle",
    },
    {
      label: "AVERAGE UPLOAD SIZE",
      value: stats.avgUploadSize,
      trend: "Average file size of uploads",
      trendColor: "text-orange-500",
      icon: "file",
    },
  ];

  // Quick Actions for Expert
  const quickActions = [
    {
      title: "Upload Framework",
      desc: "Upload new compliance framework",
      icon: "upload",
      color: "bg-blue-500/20 text-blue-400",
      path: "/official-frameworks",
    },
    {
      title: "Framework Categories",
      desc: "Manage framework categories",
      icon: "chart",
      color: "bg-purple-500/20 text-purple-400",
      path: "/official-framework-category",
    },
    {
      title: "Access Management",
      desc: "Manage framework access",
      icon: "key",
      color: "bg-green-500/20 text-green-400",
      path: "/official-framework-access",
    },
  ];

  // File type distribution for chart
  const fileTypeData = [
    {
      name: "PDF",
      count: stats.fileTypeDistribution.pdf,
      percentage: stats.fileTypeDistribution.pdf,
      color: "bg-red-500",
    },
    {
      name: "DOCX",
      count: stats.fileTypeDistribution.docx,
      percentage: stats.fileTypeDistribution.docx,
      color: "bg-blue-500",
    },
    {
      name: "XLSX",
      count: stats.fileTypeDistribution.xlsx,
      percentage: stats.fileTypeDistribution.xlsx,
      color: "bg-green-500",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getFileTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case "pdf":
        return "file";
      case "docx":
        return "document";
      case "xlsx":
        return "chart";
      default:
        return "file";
    }
  };

  return (
    <div className="space-y-4 my-4">
      {/* Metrics */}
      <CardWrapper title="Framework Overview">
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

      {/* Upload Analytics */}
      <div className="grid xl:grid-cols-2 gap-4 items-stretch">
        {/* Upload Frequency & Quick Insights */}
        <CardWrapper title="Upload Analytics" className="flex flex-col">
          <div className="space-y-4 flex-1">
            {/* Upload Frequency */}
            <div className="p-4 bg-accent rounded-lg border border-border">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Icon name="calendar" size="16px" className="text-blue-500" />
                Upload Frequency
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">
                    {stats.uploadFrequency.thisMonth}
                  </p>
                  <p className="text-xs text-muted-foreground">This Month</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">
                    {stats.uploadFrequency.lastMonth}
                  </p>
                  <p className="text-xs text-muted-foreground">Last Month</p>
                </div>
              </div>
            </div>

            {/* Quick Insights */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Icon name="star" size="16px" className="text-yellow-500" />
                Quick Insights
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm text-muted-foreground">
                    Most Used Category
                  </span>
                  <span className="text-sm font-medium">
                    {stats.mostUsedCategory}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm text-muted-foreground">
                    Largest File
                  </span>
                  <span className="text-sm font-medium">
                    {stats.largestFile.size}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm text-muted-foreground">
                    Recent Activity
                  </span>
                  <span className="text-sm font-medium">
                    {stats.recentActivity} uploads (7 days)
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm text-muted-foreground">
                    Pending Requests
                  </span>
                  <span className="text-sm font-medium text-yellow-600">
                    {stats.pendingRequests}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardWrapper>

        {/* File Type Distribution */}
        <CardWrapper title="File Type Distribution" className="flex flex-col">
          <div className="flex-1 space-y-4">
            {fileTypeData.map((type) => (
              <div key={type.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${type.color}`}></div>
                    <span className="text-sm font-medium">{type.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {type.percentage}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${type.color}`}
                    style={{ width: `${type.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}

            {/* Category Popularity */}
            <div className="pt-4 border-t border-border">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Icon name="chart" size="16px" className="text-purple-500" />
                Top Categories
              </h4>
              <div className="space-y-2">
                {stats.categoryPopularity.slice(0, 3).map((cat, index) => (
                  <div
                    key={cat.name}
                    className="flex items-center justify-between p-2 bg-muted rounded"
                  >
                    <span className="text-sm">{cat.name}</span>
                    <span className="text-sm font-medium text-primary">
                      {cat.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardWrapper>
      </div>

      {/* Recent Uploads & Timeline */}
      <div className="grid xl:grid-cols-2 gap-4 items-stretch">
        {/* Recent Uploads */}
        <CardWrapper
          title="Recent Uploads"
          right={
            <Link
              to="/official-frameworks"
              className="text-primary cursor-pointer flex items-center gap-1"
            >
              View All <Icon name="arrow-right" size="14px" />
            </Link>
          }
          className="flex flex-col"
        >
          <div className="space-y-2 flex-1">
            {recentUploads.map((upload) => (
              <div
                key={upload.id}
                className="flex items-center gap-3 p-3 bg-accent rounded-lg border border-border hover:border-primary/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <Icon name={getFileTypeIcon(upload.type)} size="18px" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-foreground text-sm truncate">
                      {upload.name}
                    </h4>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${getStatusColor(upload.status)}`}
                    >
                      {upload.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{upload.type.toUpperCase()}</span>
                    <span>•</span>
                    <span>{upload.size}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs whitespace-nowrap">
                    {formatDate(upload.uploadedAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardWrapper>

        {/* Timeline & Summary */}
        <CardWrapper title="Account Summary" className="flex flex-col">
          <div className="space-y-4 flex-1">
            {/* Timeline */}
            <div className="p-4 bg-accent rounded-lg border border-border">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Icon name="clock" size="16px" className="text-green-500" />
                Timeline
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    First Upload
                  </span>
                  <span className="text-sm font-medium">
                    {formatDate(stats.firstUpload)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Last Upload
                  </span>
                  <span className="text-sm font-medium">
                    {formatDate(stats.lastUpload)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Days Active
                  </span>
                  <span className="text-sm font-medium">
                    {Math.ceil(
                      (new Date(stats.lastUpload) -
                        new Date(stats.firstUpload)) /
                        (1000 * 60 * 60 * 24),
                    )}{" "}
                    days
                  </span>
                </div>
              </div>
            </div>

            {/* Access Summary */}
            <div className="p-4 bg-accent rounded-lg border border-border">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Icon name="key" size="16px" className="text-blue-500" />
                Access Summary
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-xl font-bold text-green-600">
                    {stats.totalCategories - stats.inaccessibleCategories}
                  </p>
                  <p className="text-xs text-muted-foreground">Accessible</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-red-600">
                    {stats.inaccessibleCategories}
                  </p>
                  <p className="text-xs text-muted-foreground">Restricted</p>
                </div>
              </div>
            </div>

            {/* Largest File Info */}
            <div className="p-4 bg-accent rounded-lg border border-border">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Icon name="file" size="16px" className="text-orange-500" />
                Largest Upload
              </h4>
              <p className="text-sm font-medium truncate">
                {stats.largestFile.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {stats.largestFile.size}
              </p>
            </div>
          </div>
        </CardWrapper>
      </div>

      {/* Quick Actions */}
      <CardWrapper title="Quick Actions">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {quickActions.map((a) => (
            <Link
              key={a.title}
              to={a.path}
              className="group flex gap-3 rounded-xl border border-border bg-accent p-4 shadow-lg hover:border-primary transition-all duration-200"
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
            </Link>
          ))}
        </div>
      </CardWrapper>
    </div>
  );
}
