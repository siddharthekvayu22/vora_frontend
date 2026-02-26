// ========== COMPARISON TABLE COMPONENTS ==========

// Score Circle Component
const ScoreCircle = ({ score }) => {
  const percentage = Math.round(score * 100);
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score);

  const getScoreColor = () => {
    if (score >= 0.8) return "text-green-500";
    if (score >= 0.6) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="relative w-14 h-14">
      <svg className="w-14 h-14 transform -rotate-90">
        {/* Background circle */}
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-muted"
          strokeOpacity="0.2"
        />
        {/* Progress circle */}
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={getScoreColor()}
        />
      </svg>
      {/* Percentage inside circle */}
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
        {percentage}%
      </span>
    </div>
  );
};

// Match Badge Component
const MatchBadge = ({ score }) => {
  const getMatchInfo = () => {
    if (score >= 0.8) {
      return {
        text: "High Match",
        className: "bg-green-500/15 text-green-600",
      };
    }
    if (score >= 0.6) {
      return {
        text: "Medium Match",
        className: "bg-yellow-500/15 text-yellow-600",
      };
    }
    return { text: "Low Match", className: "bg-red-500/15 text-red-600" };
  };

  const { text, className } = getMatchInfo();

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${className}`}
    >
      {text}
    </span>
  );
};

// Deployment Points Component
const DeploymentPoints = ({ points, title = "Deployment Points" }) => {
  if (!points?.length) return null;

  return (
    <details className="text-xs">
      <summary className="cursor-pointer text-primary hover:underline">
        {title} ({points.length})
      </summary>
      <ul className="mt-2 space-y-1 list-decimal pl-4 text-muted-foreground">
        {points.map((point, i) => (
          <li key={i}>{point}</li>
        ))}
      </ul>
    </details>
  );
};

// Control Column Component
const ControlColumn = ({
  name,
  description,
  deploymentPoints,
  frameworkId,
}) => {
  return (
    <div className="space-y-2">
      <p className="font-medium text-foreground">
        {frameworkId ? `${frameworkId} - ${name}` : name}
      </p>
      <p className="text-xs text-muted-foreground line-clamp-2">
        {description}
      </p>
      <DeploymentPoints points={deploymentPoints} />
    </div>
  );
};

// Score Column Component
const ScoreColumn = ({ score }) => {
  return (
    <div className="flex flex-col items-end gap-2">
      <ScoreCircle score={score} />
      <MatchBadge score={score} />
    </div>
  );
};

// Main Comparison Table Component
const ComparisonTable = ({ comparisonData, totalControls }) => {
  if (!comparisonData?.length) return null;

  return (
    <div className="rounded-xl border border-border bg-muted/30 col-span-12 overflow-hidden">
      <div className="px-4 py-3 bg-muted/50 border-b border-border">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">Comparison Results</h4>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-primary/20 text-primary">
            Total: {totalControls}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Framework Control
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Client Control
              </th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground w-fit">
                Match Score
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {comparisonData.map((item, idx) => (
              <tr key={idx} className="hover:bg-muted/20 transition-colors">
                {/* Framework Control Column */}
                <td className="px-4 py-3 align-top">
                  <ControlColumn
                    name={item.Framework_control_name}
                    description={item.Framework_control_description}
                    deploymentPoints={item.Framework_deployment_points}
                    frameworkId={item.Framework_control_id}
                  />
                </td>
                {/* Client Control Column */}
                <td className="px-4 py-3 align-top">
                  <ControlColumn
                    name={item.Client_control_name}
                    description={item.Client_control_description}
                    deploymentPoints={item.Client_deployment_points}
                  />
                </td>

                {/* Score Column */}
                <td className="px-4 py-3 align-top">
                  <ScoreColumn score={item.Comparison_score} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComparisonTable;
