// src/pages/CompanyFramework/components/DeploymentGapsTable.jsx
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import {
  FiChevronDown,
  FiChevronUp,
  FiCheckCircle,
  FiAlertCircle,
  FiXCircle,
  FiInfo,
  FiClock,
  FiHash,
} from "react-icons/fi";

// Status Badge Component
const StatusBadge = ({ status }) => {
  const getStatusConfig = () => {
    switch (status?.toLowerCase()) {
      case "implemented":
        return {
          icon: <FiCheckCircle size={14} />,
          text: "Implemented",
          className: "bg-green-500/15 text-green-600",
        };
      case "partially implemented":
        return {
          icon: <FiAlertCircle size={14} />,
          text: "Partially Implemented",
          className: "bg-yellow-500/15 text-yellow-600",
        };
      case "not implemented":
        return {
          icon: <FiXCircle size={14} />,
          text: "Not Implemented",
          className: "bg-red-500/15 text-red-600",
        };
      default:
        return {
          icon: <FiInfo size={14} />,
          text: status || "Unknown",
          className: "bg-gray-500/15 text-gray-600",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${config.className}`}
    >
      {config.icon}
      {config.text}
    </span>
  );
};

// Similarity Score Component
const SimilarityScore = ({ score }) => {
  const percentage = Math.round(score);
  const getScoreColor = () => {
    if (percentage >= 80) return "text-green-500";
    if (percentage >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full ${getScoreColor()} bg-current`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className={`text-xs font-bold ${getScoreColor()}`}>
        {percentage}%
      </span>
    </div>
  );
};

// Info Card Component for Metadata
const InfoCard = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 p-3 rounded bg-muted/30 border border-border">
    <div className="mt-0.5 text-primary">{icon}</div>
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wider mb-1 text-muted-foreground">
        {label}
      </p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  </div>
);

// Deployment Point Card Component
const DeploymentPointCard = ({ point, index }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-border rounded overflow-hidden bg-card">
      {/* Header */}
      <div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-xs font-mono bg-muted px-2 py-1 rounded whitespace-nowrap">
            Point {index + 1}
          </span>
          <span className="text-sm font-medium truncate flex-1">
            {point.Client_deployment_point}
          </span>
          <StatusBadge status={point.Implementation_Status} />
        </div>
        <button className="p-1 hover:bg-muted rounded ml-2">
          {expanded ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
        </button>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="p-4 border-t border-border space-y-4">
          {/* Matched Framework Point */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Best Matched Framework Point
              </p>
              <span className="text-xs text-muted-foreground">
                Point No. {point.Best_Matched_Framework_Point_No}
              </span>
            </div>
            <p className="text-sm p-3 rounded bg-muted/30 border-l-2 border-primary">
              {point.Best_Matched_Framework_Point}
            </p>
          </div>

          {/* Client Point */}
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider mb-2 text-muted-foreground">
              Client Deployment Point
            </p>
            <p className="text-sm p-3 rounded bg-muted/30">
              {point.Client_deployment_point}
            </p>
          </div>

          {/* Similarity Score */}
          <div className="flex items-center justify-between p-3 rounded bg-muted/30">
            <span className="text-xs font-medium text-muted-foreground">
              Similarity Score
            </span>
            <SimilarityScore score={point["Similarity_Score_%"]} />
          </div>
        </div>
      )}
    </div>
  );
};

// Main Deployment Gaps Table Component
const DeploymentGapsTable = ({ deploymentGaps }) => {
  const [expandedControls, setExpandedControls] = useState(new Set());
  const [filterStatus, setFilterStatus] = useState("all");
  const [showMetadata, setShowMetadata] = useState(false);

  // Agar deploymentGaps hi null hai to return null
  if (!deploymentGaps) return null;

  const hasResults =
    deploymentGaps?.deployment_gaps?.deployment_gap_results?.length > 0;
  const totalPoints =
    deploymentGaps?.deployment_gaps?.total_deployment_points || 0;
  const message = deploymentGaps?.message || "No deployment gap data available";

  // Agar results nahi hain to sirf metadata dikhao
  if (!hasResults) {
    return (
      <div className="space-y-4">
        {/* Metadata Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <InfoCard
            icon={<FiInfo size={15} />}
            label="Status"
            value={
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold inline-block ${
                  deploymentGaps.status === "deployment_gap_completed"
                    ? "bg-green-500/15 text-green-600"
                    : "bg-yellow-500/15 text-yellow-600"
                }`}
              >
                {deploymentGaps.status || "Unknown"}
              </span>
            }
          />
          <InfoCard
            icon={<FiHash size={15} />}
            label="Deployment Gap ID"
            value={
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-mono bg-muted px-2 py-1 rounded truncate flex-1 max-w-60">
                  {deploymentGaps.deployment_gap_id || "N/A"}
                </span>
                {deploymentGaps.deployment_gap_id && (
                  <Button
                    size="xs"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        deploymentGaps.deployment_gap_id,
                      );
                      toast.success("ID copied!");
                    }}
                    className="bg-primary/70"
                  >
                    Copy
                  </Button>
                )}
              </div>
            }
          />
          <InfoCard
            icon={<FiClock size={15} />}
            label="Timestamp"
            value={
              <span className="text-sm">
                {deploymentGaps.timestamp
                  ? new Date(deploymentGaps.timestamp).toLocaleString()
                  : "N/A"}
              </span>
            }
          />
          <InfoCard
            icon={<FiClock size={15} />}
            label="Last Updated"
            value={
              <span className="text-sm">
                {deploymentGaps.lastUpdated
                  ? new Date(deploymentGaps.lastUpdated).toLocaleString()
                  : "N/A"}
              </span>
            }
          />
        </div>

        {/* Counts Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 rounded bg-card border border-border">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
              Company Controls
            </p>
            <p className="text-2xl font-bold">
              {deploymentGaps.company_controls_count || 0}
            </p>
          </div>
          <div className="p-4 rounded bg-card border border-border">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
              Official Controls
            </p>
            <p className="text-2xl font-bold">
              {deploymentGaps.official_controls_count || 0}
            </p>
          </div>
          <div className="p-4 rounded bg-card border border-border">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
              Matched Controls
            </p>
            <p className="text-2xl font-bold">
              {deploymentGaps.matched_controls || 0}
            </p>
          </div>
          <div className="p-4 rounded bg-card border border-border">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
              Total Results
            </p>
            <p className="text-2xl font-bold">
              {deploymentGaps.total_results || 0}
            </p>
          </div>
        </div>

        {/* Message */}
        <div className="rounded border border-border bg-muted/30 p-8 text-center">
          <FiInfo size={32} className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-2">{message}</p>
          {totalPoints === 0 && (
            <p className="text-xs text-muted-foreground">
              No deployment points were analyzed in this comparison.
            </p>
          )}
        </div>

        {/* Job IDs (collapsible) */}
        <div className="border border-border rounded overflow-hidden">
          <button
            onClick={() => setShowMetadata(!showMetadata)}
            className="w-full px-4 py-3 flex items-center justify-between bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <span className="text-sm font-medium">Additional Metadata</span>
            {showMetadata ? (
              <FiChevronUp size={18} />
            ) : (
              <FiChevronDown size={18} />
            )}
          </button>

          {showMetadata && (
            <div className="p-4 border-t border-border space-y-3">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider mb-1 text-muted-foreground">
                  Company Controls Job ID
                </p>
                <p className="text-xs font-mono bg-muted p-2 rounded break-all">
                  {deploymentGaps.company_controls_job_id || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider mb-1 text-muted-foreground">
                  Official Controls Job ID
                </p>
                <p className="text-xs font-mono bg-muted p-2 rounded break-all">
                  {deploymentGaps.official_controls_job_id || "N/A"}
                </p>
              </div>
              {deploymentGaps.deployment_gap_id && (
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider mb-1 text-muted-foreground">
                    Deployment Gap ID
                  </p>
                  <p className="text-xs font-mono bg-muted p-2 rounded break-all">
                    {deploymentGaps.deployment_gap_id}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Agar results hain to original UI dikhao
  const toggleControl = (controlId) => {
    setExpandedControls((prev) => {
      const next = new Set(prev);
      next.has(controlId) ? next.delete(controlId) : next.add(controlId);
      return next;
    });
  };

  const expandAll = () => {
    const allControlIds =
      deploymentGaps.deployment_gaps.deployment_gap_results.map(
        (item) => Object.keys(item)[0],
      );
    setExpandedControls(new Set(allControlIds));
  };

  const collapseAll = () => {
    setExpandedControls(new Set());
  };

  // Filter controls by status
  const filterByStatus = (points, status) => {
    if (status === "all") return true;
    return points.some(
      (p) => p.Implementation_Status?.toLowerCase() === status.toLowerCase(),
    );
  };

  const filteredResults =
    deploymentGaps.deployment_gaps.deployment_gap_results.filter((item) => {
      const controlId = Object.keys(item)[0];
      const points = item[controlId];
      return filterByStatus(points, filterStatus);
    });

  // Calculate statistics
  const implementedPoints =
    deploymentGaps.deployment_gaps.deployment_gap_results.reduce(
      (acc, item) => {
        const controlId = Object.keys(item)[0];
        const points = item[controlId];
        return (
          acc +
          points.filter((p) => p.Implementation_Status === "Implemented").length
        );
      },
      0,
    );
  const partiallyImplementedPoints =
    deploymentGaps.deployment_gaps.deployment_gap_results.reduce(
      (acc, item) => {
        const controlId = Object.keys(item)[0];
        const points = item[controlId];
        return (
          acc +
          points.filter(
            (p) => p.Implementation_Status === "Partially Implemented",
          ).length
        );
      },
      0,
    );
  const notImplementedPoints =
    totalPoints - (implementedPoints + partiallyImplementedPoints);

  return (
    <div className="space-y-4">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="p-4 rounded bg-card border border-border">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
            Total Deployment Points
          </p>
          <p className="text-2xl font-bold">{totalPoints}</p>
        </div>
        <div className="p-4 rounded bg-card border border-border">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
            Implemented
          </p>
          <p className="text-2xl font-bold text-green-500">
            {implementedPoints}
          </p>
        </div>
        <div className="p-4 rounded bg-card border border-border">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
            Partially Implemented
          </p>
          <p className="text-2xl font-bold text-yellow-500">
            {partiallyImplementedPoints}
          </p>
        </div>
        <div className="p-4 rounded bg-card border border-border">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
            Not Implemented
          </p>
          <p className="text-2xl font-bold text-red-500">
            {notImplementedPoints}
          </p>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Filter by status:
          </span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded text-sm border border-border bg-background"
          >
            <option value="all">All Controls</option>
            <option value="implemented">Implemented</option>
            <option value="partially implemented">Partially Implemented</option>
            <option value="not implemented">Not Implemented</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="px-3 py-1.5 text-xs font-medium rounded border border-border hover:bg-muted transition-colors"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1.5 text-xs font-medium rounded border border-border hover:bg-muted transition-colors"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Controls List */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
        {filteredResults.map((item, idx) => {
          const controlId = Object.keys(item)[0];
          const points = item[controlId];
          const isExpanded = expandedControls.has(controlId);

          // Calculate control stats
          const implementedCount = points.filter(
            (p) => p.Implementation_Status === "Implemented",
          ).length;
          const partiallyCount = points.filter(
            (p) => p.Implementation_Status === "Partially Implemented",
          ).length;
          const notImplementedCount = points.filter(
            (p) => p.Implementation_Status === "Not Implemented",
          ).length;

          // Get control name from first point
          const controlName = points[0]?.Framework_control_name || controlId;

          return (
            <div
              key={idx}
              className="border border-border rounded overflow-hidden bg-card"
            >
              {/* Control Header */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => toggleControl(controlId)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-primary/15 text-primary whitespace-nowrap">
                    {controlId}
                  </span>
                  <span className="font-medium truncate">{controlName}</span>
                </div>

                <div className="flex items-center gap-4 ml-4">
                  {/* Status indicators */}
                  <div className="flex items-center gap-2 text-xs">
                    {implementedCount > 0 && (
                      <span className="flex items-center gap-1 text-green-600">
                        <FiCheckCircle size={12} />
                        {implementedCount}
                      </span>
                    )}
                    {partiallyCount > 0 && (
                      <span className="flex items-center gap-1 text-yellow-600">
                        <FiAlertCircle size={12} />
                        {partiallyCount}
                      </span>
                    )}
                    {notImplementedCount > 0 && (
                      <span className="flex items-center gap-1 text-red-600">
                        <FiXCircle size={12} />
                        {notImplementedCount}
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {points.length} points
                  </span>

                  <button className="p-1 hover:bg-muted rounded">
                    {isExpanded ? (
                      <FiChevronUp size={18} />
                    ) : (
                      <FiChevronDown size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Deployment Points List */}
              {isExpanded && (
                <div className="p-4 border-t border-border space-y-3">
                  {points.map((point, pointIdx) => (
                    <DeploymentPointCard
                      key={pointIdx}
                      point={point}
                      index={pointIdx}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {deploymentGaps.message && (
        <div className="p-4 rounded bg-muted/30 border border-border text-sm">
          <p className="text-muted-foreground">{deploymentGaps.message}</p>
        </div>
      )}
    </div>
  );
};

export default DeploymentGapsTable;
