import CardWrapper from "./components/CardWrapper";
import MetricCard from "./components/MetricCard";
import ProgressBar from "./components/ProgressBar";

/* ---------- CONFIG DATA ---------- */

const metrics = [
  {
    label: "OPEN AUDITS",
    value: 12,
    trend: "+8% vs last week",
    trendColor: "text-emerald-400",
    icon: "⏸",
  },
  {
    label: "COMPLIANCE SCORE",
    value: "92%",
    trend: "0% change",
    trendColor: "text-muted-foreground",
    icon: "↗",
  },
  {
    label: "OVERDUE FINDINGS",
    value: 5,
    trend: "-3% vs last week",
    trendColor: "text-red-500",
    icon: "⚠",
  },
  {
    label: "AVG. RESOLUTION TIME",
    value: "3.2d",
    trend: "+12% faster",
    trendColor: "text-emerald-400",
    icon: "⏱",
  },
];

const quickActions = [
  {
    title: "Upload Document",
    desc: "Upload and analyze compliance documents",
    icon: "📄",
    color: "bg-blue-500/20 text-blue-400",
  },
  {
    title: "Upload Framework",
    desc: "Add custom compliance frameworks",
    icon: "✓",
    color: "bg-emerald-500/20 text-emerald-400",
  },
  {
    title: "New Audit",
    desc: "Start a new compliance audit",
    icon: "🔍",
    color: "bg-amber-500/20 text-amber-400",
  },
  {
    title: "Generate Report",
    desc: "Create compliance reports",
    icon: "📊",
    color: "bg-purple-500/20 text-purple-400",
  },
];

const activeAudits = [
  {
    name: "ISO 27001 Q4 Audit",
    user: "Sarah Chen",
    progress: 68,
    due: "2025-11-15",
  },
  {
    name: "NIST Cybersecurity Review",
    user: "Mike Johnson",
    progress: 45,
    due: "2025-11-20",
  },
  { name: "GDPR Compliance Check", user: "Emma Wilson", progress: 0, due: "—" },
];

const complianceFrameworks = [
  { name: "ISO 27001", value: 92, color: "bg-emerald-500" },
  { name: "NIST CSF", value: 87, color: "bg-amber-400" },
  { name: "GDPR", value: 95, color: "bg-emerald-500" },
  { name: "SOX", value: 88, color: "bg-amber-400" },
  { name: "PCI DSS", value: 91, color: "bg-emerald-500" },
];

const upcomingDeadlines = [
  {
    days: 5,
    title: "ISO 27001 Annual Review",
    due: "2025-11-15",
    priority: "High",
  },
  {
    days: 8,
    title: "GDPR Data Mapping Update",
    due: "2025-11-18",
    priority: "Medium",
  },
  {
    days: 12,
    title: "SOX Controls Testing",
    due: "2025-11-22",
    priority: "High",
  },
  {
    days: 15,
    title: "Security Awareness Training",
    due: "2025-11-25",
    priority: "Low",
  },
];

const recentActivity = [
  {
    title: "New document uploaded: Security Policy v2.3",
    user: "Sarah Chen",
    time: "2 hours ago",
  },
  {
    title: "ISO 27001 Q4 Audit updated to 68% complete",
    user: "Mike Johnson",
    time: "4 hours ago",
  },
  { title: "Custom framework created", user: "Emma Wilson", time: "1 day ago" },
  {
    title: "Compliance score improved to 87%",
    user: "System",
    time: "1 day ago",
  },
];

const priorityStyles = {
  High: "bg-destructive text-destructive-foreground",
  Medium: "bg-secondary text-secondary-foreground",
  Low: "bg-primary/80 text-primary-foreground",
};

/* ---------- Dashboard ---------- */
export default function Dashboard() {
  return (
    <div className="space-y-6 my-5">
      {/* Metrics */}
      <CardWrapper title="Key Metrics">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((m) => (
            <MetricCard key={m.label} {...m} icon={<span>{m.icon}</span>} />
          ))}
        </div>
      </CardWrapper>

      {/* Quick Actions */}
      <CardWrapper title="Quick Actions">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((a) => (
            <button
              key={a.title}
              className="group flex gap-4 rounded-2xl border border-border bg-accent p-6 shadow-lg hover:border-primary"
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

      {/* Audits + Compliance */}
      <div className="grid xl:grid-cols-2 gap-6">
        <CardWrapper
          title="Active Audits"
          right={<span className="text-primary">View All →</span>}
        >
          {activeAudits.map((a) => (
            <div
              key={a.name}
              className="mb-6 border border-border rounded-xl p-5 last:mb-0 bg-accent"
            >
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold">{a.name}</p>
                  <p className="text-sm text-muted-foreground">{a.user}</p>
                </div>
                <span className="bg-popover-foreground/10 text-xs h-fit p-2 rounded-full">
                  IN PROGRESS
                </span>
              </div>
              <div className="mt-4">
                <ProgressBar value={a.progress} />
              </div>
              <div className="mt-3 flex justify-between text-sm">
                <span>Due: {a.due}</span>
                <span className="text-primary">View Details</span>
              </div>
            </div>
          ))}
        </CardWrapper>

        <CardWrapper title="Compliance by Framework">
          {complianceFrameworks.map((c) => (
            <div key={c.name} className="mb-6">
              <div className="flex justify-between text-base mb-2">
                <span className="">{c.name}</span>
                <span className="font-semibold">{c.value}%</span>
              </div>
              <ProgressBar value={c.value} color={c.color} />
            </div>
          ))}
        </CardWrapper>
      </div>

      {/* Deadlines + Activity */}
      <div className="grid md:grid-cols-2 gap-4">
        <CardWrapper title="Upcoming Deadlines">
          {upcomingDeadlines.map((d, i) => (
            <div
              key={i}
              className="flex justify-between p-3 bg-accent rounded-lg mb-3 border border-border"
            >
              <div>
                <p className="text-xl font-bold">
                  {d.days}{" "}
                  <span className="text-xs text-muted-foreground">DAYS</span>
                </p>
                <p className="font-medium">{d.title}</p>
                <p className="text-xs text-muted-foreground">Due: {d.due}</p>
              </div>
              <span
                className={`px-2 py-1 rounded text-xs h-fit text-white ${
                  priorityStyles[d.priority]
                }`}
              >
                {d.priority}
              </span>
            </div>
          ))}
        </CardWrapper>

        <CardWrapper title="Recent Activity">
          {recentActivity.map((r, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 bg-accent rounded-lg mb-2 border border-border"
            >
              <div className="h-8 w-8 bg-popover-foreground/10 rounded-full flex items-center justify-center text-sm">
                {r.user[0]}
              </div>
              <div>
                <p className="text-sm">{r.title}</p>
                <p className="text-xs text-muted-foreground">
                  {r.user} • {r.time}
                </p>
              </div>
            </div>
          ))}
        </CardWrapper>
      </div>
    </div>
  );
}
