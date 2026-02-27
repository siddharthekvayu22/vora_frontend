// src/pages/CompanyFramework/components/DeploymentGapsTable.jsx
import { useState } from "react";
import {
  FiChevronDown,
  FiChevronUp,
  FiCheckCircle,
  FiAlertCircle,
  FiXCircle,
  FiInfo,
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
        <div className="flex items-center gap-3 flex-1">
          <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
            Point {index + 1}
          </span>
          <span className="text-sm font-medium truncate flex-1">
            {point.Client_deployment_point}
          </span>
          <StatusBadge status={point.Implementation_Status} />
        </div>
        <button className="p-1 hover:bg-muted rounded">
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

  console.log("deploymentGaps", deploymentGaps);

  if (!deploymentGaps?.deployment_gaps?.deployment_gap_results?.length) {
    return (
      <div className="rounded border border-border bg-muted/30 p-8 text-center">
        <FiInfo size={32} className="mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          No deployment gap data available
        </p>
      </div>
    );
  }

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
  const totalPoints =
    deploymentGaps.deployment_gaps.total_deployment_points || 0;
  const totalControls = filteredResults.length;
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
      <div className="space-y-3">
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
                <div className="flex items-center gap-3 flex-1">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-primary/15 text-primary">
                    {controlId}
                  </span>
                  <span className="font-medium">{controlName}</span>
                </div>

                <div className="flex items-center gap-4">
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

                  <span className="text-xs text-muted-foreground">
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
