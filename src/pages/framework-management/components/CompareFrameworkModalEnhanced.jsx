import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Icon from "../../../components/Icon";
import {
  getExpertFrameworks,
  compareFrameworks,
} from "../../../services/frameworkService";
import { formatDate } from "../../../utils/dateFormatter";
import { useFrameworkComparison } from "../../../hooks/useWebSocket";

function CompareFrameworkModalEnhanced({ isOpen, onClose, userFramework }) {
  const [expertFrameworks, setExpertFrameworks] = useState([]);
  const [selectedExpertFramework, setSelectedExpertFramework] = useState(null);
  const [loading, setLoading] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);

  const {
    connectionStatus,
    comparisonStatus,
    comparisonResults,
    resultsCount,
    startComparison,
    disconnect,
  } = useFrameworkComparison();

  useEffect(() => {
    if (isOpen) {
      fetchExpertFrameworks();
      // Reset all states when modal opens
      setSelectedExpertFramework(null);
      setSearchTerm("");
      setShowResults(false);
      setComparing(false);
    } else {
      // Clean up WebSocket when modal closes
      disconnect();
    }
  }, [isOpen, disconnect]);

  // Handle comparison status changes
  useEffect(() => {
    switch (comparisonStatus) {
      case "in-process":
        toast.loading("Processing comparison...", { id: "comparison-status" });
        break;

      case "completed":
        setShowResults(true);
        setComparing(false);
        toast.success(
          `Comparison completed! Found ${resultsCount || 0} matches`,
          {
            id: "comparison-status",
          }
        );
        break;

      case "error":
        setComparing(false);
        toast.error("Comparison failed", { id: "comparison-status" });
        break;
    }
  }, [comparisonStatus, resultsCount]);

  const fetchExpertFrameworks = async () => {
    try {
      setLoading(true);
      const response = await getExpertFrameworks();

      // Handle different response structures
      let frameworks = [];
      if (Array.isArray(response)) {
        frameworks = response;
      } else if (response.data && Array.isArray(response.data)) {
        frameworks = response.data;
      } else if (response.frameworks && Array.isArray(response.frameworks)) {
        frameworks = response.frameworks;
      } else if (
        response.data &&
        response.data.frameworks &&
        Array.isArray(response.data.frameworks)
      ) {
        frameworks = response.data.frameworks;
      }

      setExpertFrameworks(frameworks);
    } catch (error) {
      console.error("Error fetching expert frameworks:", error);
      toast.error("Failed to load expert frameworks");
      setExpertFrameworks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = async () => {
    if (!selectedExpertFramework) {
      toast.error("Please select an expert framework to compare");
      return;
    }

    try {
      setComparing(true);

      // Get JWT token from sessionStorage
      const token = sessionStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const userFrameworkId = userFramework?.id || userFramework?._id;
      const expertFrameworkId =
        selectedExpertFramework.id || selectedExpertFramework._id;

      // Use the enhanced WebSocket hook
      await startComparison(token, userFrameworkId, expertFrameworkId);

      toast.success("Comparison started! Waiting for results...", {
        id: "comparison-status",
      });
    } catch (error) {
      console.error("Error comparing frameworks:", error);
      setComparing(false);
      toast.error(error.message || "Failed to compare frameworks");
    }
  };

  const handleClose = () => {
    // Clean up WebSocket
    disconnect();

    // Reset all states
    setSelectedExpertFramework(null);
    setSearchTerm("");
    setShowResults(false);
    setComparing(false);

    onClose();
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case "connected":
        return <Icon name="wifi" size="16px" className="text-green-500" />;
      case "connecting":
        return (
          <Icon
            name="loader"
            size="16px"
            className="text-yellow-500 animate-spin"
          />
        );
      case "disconnected":
        return <Icon name="wifi-off" size="16px" className="text-gray-500" />;
      case "error":
        return (
          <Icon name="alert-circle" size="16px" className="text-red-500" />
        );
      default:
        return <Icon name="wifi-off" size="16px" className="text-gray-500" />;
    }
  };

  const getComparisonStatusIcon = () => {
    switch (comparisonStatus) {
      case "in-process":
        return (
          <Icon
            name="loader"
            size="16px"
            className="text-blue-500 animate-spin"
          />
        );
      case "completed":
        return (
          <Icon name="check-circle" size="16px" className="text-green-500" />
        );
      case "error":
        return <Icon name="x-circle" size="16px" className="text-red-500" />;
      default:
        return null;
    }
  };

  const filteredFrameworks = expertFrameworks.filter((framework) =>
    framework.frameworkName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Compare Framework
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Compare "{userFramework?.frameworkName}" with expert frameworks
            </p>
          </div>

          {/* Connection Status */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {getConnectionStatusIcon()}
              <span className="text-sm text-gray-600 capitalize">
                {connectionStatus}
              </span>
            </div>

            {comparisonStatus && (
              <div className="flex items-center gap-2">
                {getComparisonStatusIcon()}
                <span className="text-sm text-gray-600 capitalize">
                  {comparisonStatus}
                </span>
              </div>
            )}

            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <Icon name="x" size="24px" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {!showResults ? (
            <>
              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <Icon
                    name="search"
                    size="20px"
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search expert frameworks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Expert Frameworks List */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Select Expert Framework
                </h3>

                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Icon
                      name="loader"
                      size="24px"
                      className="animate-spin text-blue-500"
                    />
                    <span className="ml-2 text-gray-600">
                      Loading frameworks...
                    </span>
                  </div>
                ) : (
                  <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                    {filteredFrameworks.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No expert frameworks found
                      </div>
                    ) : (
                      filteredFrameworks.map((framework) => (
                        <div
                          key={framework._id || framework.id}
                          className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                            selectedExpertFramework?._id === framework._id ||
                            selectedExpertFramework?.id === framework.id
                              ? "bg-blue-50 border-blue-200"
                              : ""
                          }`}
                          onClick={() => setSelectedExpertFramework(framework)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {framework.frameworkName}
                              </h4>
                              <p className="text-sm text-gray-600">
                                Uploaded: {formatDate(framework.createdAt)}
                              </p>
                            </div>
                            <div className="flex items-center">
                              {(selectedExpertFramework?._id ===
                                framework._id ||
                                selectedExpertFramework?.id ===
                                  framework.id) && (
                                <Icon
                                  name="check"
                                  size="20px"
                                  className="text-blue-500"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Compare Button */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCompare}
                  disabled={
                    !selectedExpertFramework ||
                    comparing ||
                    connectionStatus !== "connected"
                  }
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {comparing && (
                    <Icon name="loader" size="16px" className="animate-spin" />
                  )}
                  {comparing ? "Comparing..." : "Start Comparison"}
                </button>
              </div>
            </>
          ) : (
            /* Comparison Results */
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Comparison Results
                </h3>
                <div className="text-sm text-gray-600">
                  {resultsCount} matches found
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {comparisonResults.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No comparison results available
                  </div>
                ) : (
                  <div className="space-y-4">
                    {comparisonResults.map((result, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">
                              Your Framework Control
                            </h4>
                            <p className="text-sm font-medium text-blue-600">
                              {result.User_Document_Control_Name}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {result.User_Document_Control_Description}
                            </p>
                          </div>

                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">
                              Expert Framework Control
                            </h4>
                            <p className="text-sm font-medium text-green-600">
                              {result.Expert_Framework_Control_Name}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {result.Expert_Framework_Control_Description}
                            </p>
                          </div>
                        </div>

                        {result.Deployment_Points && (
                          <div className="mt-4">
                            <h4 className="font-medium text-gray-900 mb-2">
                              Deployment Points
                            </h4>
                            <p className="text-sm text-gray-600">
                              {result.Deployment_Points}
                            </p>
                          </div>
                        )}

                        {result.Comparison_Score && (
                          <div className="mt-4 flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">
                              Match Score:
                            </span>
                            <span className="text-sm font-bold text-blue-600">
                              {(result.Comparison_Score * 100).toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowResults(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Back to Selection
                </button>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CompareFrameworkModalEnhanced;
