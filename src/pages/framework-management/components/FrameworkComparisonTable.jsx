import { useState } from "react";
import { formatDate } from "../../../utils/dateFormatter";
import Icon from "../../../components/Icon";

function FrameworkComparisonTable({ comparisonResults, comparisonCount }) {
    const [expandedComparison, setExpandedComparison] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'Comparison_Score', direction: 'desc' });

    if (!comparisonResults || comparisonResults.length === 0) {
        return null;
    }

    const handleSort = (key) => {
        const direction = sortConfig.key === key && sortConfig.direction === 'desc' ? 'asc' : 'desc';
        setSortConfig({ key, direction });
    };

    const getSortedData = (comparisonData) => {
        return [...comparisonData].sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (sortConfig.direction === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
    };

    const getScoreColor = (score) => {
        if (score >= 0.8) return 'text-green-600 bg-green-50';
        if (score >= 0.6) return 'text-yellow-600 bg-yellow-50';
        if (score >= 0.3) return 'text-orange-600 bg-orange-50';
        return 'text-red-600 bg-red-50';
    };

    const getScoreBadge = (score) => {
        if (score >= 0.8) return 'Excellent';
        if (score >= 0.6) return 'Good';
        if (score >= 0.3) return 'Fair';
        return 'Poor';
    };

    return (
        <div className="py-6">
            <div className="bg-card rounded-xl border border-border overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-border bg-muted/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-foreground">Framework Comparison Results</h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Detailed comparison analysis between your framework and expert frameworks
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                                {comparisonCount} Comparison{comparisonCount !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Comparison Results */}
                <div className="space-y-6 p-6">
                    {comparisonResults.map((comparison, compIndex) => (
                        <div key={comparison._id || compIndex} className="border border-border rounded-lg overflow-hidden">
                            {/* Comparison Header */}
                            <div className="bg-muted/20 p-4 border-b border-border">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                                            <Icon name="compare" size="20px" className="text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-foreground text-lg">
                                                vs. {comparison.expertFrameworkName}
                                            </h3>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <span>{comparison.resultsCount} matches found</span>
                                                <span>•</span>
                                                <span>Overall Score: {(comparison.comparisonScore * 100).toFixed(2)}%</span>
                                                <span>•</span>
                                                <span>{formatDate(comparison.comparedAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setExpandedComparison(
                                            expandedComparison === compIndex ? null : compIndex
                                        )}
                                        className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                                    >
                                        <span className="text-sm font-medium">
                                            {expandedComparison === compIndex ? 'Hide Details' : 'View Details'}
                                        </span>
                                        <Icon
                                            name="chevron-down"
                                            size="16px"
                                            className={`transition-transform ${expandedComparison === compIndex ? 'rotate-180' : ''}`}
                                        />
                                    </button>
                                </div>
                            </div>

                            {/* Detailed Comparison Table */}
                            {expandedComparison === compIndex && (
                                <div className="h-96 flex flex-col border border-border">
                                    {/* Fixed Header */}
                                    <div className="flex-shrink-0 bg-muted/50 border-b border-border">
                                        <div className="flex">
                                            <div className="w-1/4 p-4 font-medium text-foreground border-r border-border">
                                                <button
                                                    onClick={() => handleSort('User_Document_Control_Name')}
                                                    className="flex items-center gap-2 hover:text-primary transition-colors"
                                                >
                                                    Your Control
                                                    <Icon name="arrow-up-down" size="12px" />
                                                </button>
                                            </div>
                                            <div className="w-1/4 p-4 font-medium text-foreground border-r border-border">
                                                <button
                                                    onClick={() => handleSort('Expert_Framework_Control_Name')}
                                                    className="flex items-center gap-2 hover:text-primary transition-colors"
                                                >
                                                    Expert Control
                                                    <Icon name="arrow-up-down" size="12px" />
                                                </button>
                                            </div>
                                            <div className="w-1/6 p-4 font-medium text-foreground text-center border-r border-border">
                                                <button
                                                    onClick={() => handleSort('Comparison_Score')}
                                                    className="flex items-center gap-2 hover:text-primary transition-colors mx-auto"
                                                >
                                                    Match Score
                                                    <Icon name="arrow-up-down" size="12px" />
                                                </button>
                                            </div>
                                            <div className="w-5/12 p-4 font-medium text-foreground">
                                                Deployment Points
                                            </div>
                                        </div>
                                    </div>

                                    {/* Scrollable Body */}
                                    <div className="flex-1 overflow-y-auto">
                                        {getSortedData(comparison.comparisonData).map((match, matchIndex) => (
                                            <div key={matchIndex} className="flex border-b border-border hover:bg-muted/30 transition-colors">
                                                {/* Your Control */}
                                                <div className="w-1/4 p-4 border-r border-border flex items-start">
                                                    <div className="w-full">
                                                        <h4 className="font-medium text-foreground text-sm mb-2">
                                                            {match.User_Document_Control_Name}
                                                        </h4>
                                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                                            {match.User_Document_Control_Description || 'No description available'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Expert Control */}
                                                <div className="w-1/4 p-4 border-r border-border flex items-start">
                                                    <div className="w-full">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
                                                                {match.Expert_Framework_Control_Id}
                                                            </span>
                                                        </div>
                                                        <h4 className="font-medium text-foreground text-sm mb-2">
                                                            {match.Expert_Framework_Control_Name}
                                                        </h4>
                                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                                            {match.Expert_Framework_Control_Description}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Match Score */}
                                                <div className="w-1/6 p-4 border-r border-border flex items-center justify-center">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div className={`text-lg font-bold px-3 py-1 rounded-full ${getScoreColor(match.Comparison_Score)}`}>
                                                            {(match.Comparison_Score * 100).toFixed(1)}%
                                                        </div>
                                                        <span className={`text-xs px-2 py-1 rounded ${getScoreColor(match.Comparison_Score)}`}>
                                                            {getScoreBadge(match.Comparison_Score)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Deployment Points */}
                                                <div className="w-5/12 p-4 flex items-start">
                                                    <div className="w-full h-full">
                                                        {match.Deployment_Points ? (
                                                            <div className="bg-muted/50 rounded-lg p-3 border-l-2 border-primary h-full">
                                                                <div className="text-xs font-medium text-foreground mb-2">Implementation Guide:</div>
                                                                <div className="text-xs text-muted-foreground space-y-1">
                                                                    {match.Deployment_Points.split(/\d+\./).filter(point => point.trim()).map((point, idx) => (
                                                                        <div key={idx} className="flex items-start gap-2">
                                                                            <span className="text-primary font-medium flex-shrink-0">{idx + 1}.</span>
                                                                            <span className="flex-1 leading-relaxed">{point.trim()}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground italic">
                                                                No deployment points available
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Summary Stats */}
                            {expandedComparison !== compIndex && (
                                <div className="p-4 bg-muted/10">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                                <span className="text-muted-foreground">
                                                    Excellent: {comparison.comparisonData.filter(m => m.Comparison_Score >= 0.8).length}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                                <span className="text-muted-foreground">
                                                    Good: {comparison.comparisonData.filter(m => m.Comparison_Score >= 0.6 && m.Comparison_Score < 0.8).length}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                                <span className="text-muted-foreground">
                                                    Fair: {comparison.comparisonData.filter(m => m.Comparison_Score >= 0.3 && m.Comparison_Score < 0.6).length}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                                <span className="text-muted-foreground">
                                                    Poor: {comparison.comparisonData.filter(m => m.Comparison_Score < 0.3).length}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-muted-foreground">
                                            Best Match: {(Math.max(...comparison.comparisonData.map(m => m.Comparison_Score)) * 100).toFixed(1)}%
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default FrameworkComparisonTable;