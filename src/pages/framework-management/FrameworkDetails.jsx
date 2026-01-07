import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useWebSocket } from "../../hooks/useWebSocket";
import { formatDate } from "../../utils/dateFormatter";
import toast from "react-hot-toast";
import Icon from "../../components/Icon";
import {
  getFrameworkById,
  downloadFramework,
  sendFrameworkToAI,
} from "../../services/frameworkService";
import CompareFrameworkModal from "./components/CompareFrameworkModal";
import FrameworkComparisonTable from "./components/FrameworkComparisonTable";

function FrameworkDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const userRole = user?.role || "expert";

  const [framework, setFramework] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sendingToAI, setSendingToAI] = useState(false);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [aiProcessingStatus, setAiProcessingStatus] = useState(null);
  const [comparisonStatus, setComparisonStatus] = useState(null);

  const { connect, subscribe } = useWebSocket();

  // Fetch framework details
  const fetchFrameworkDetails = async () => {
    try {
      setLoading(true);
      const response = await getFrameworkById(id, userRole);
      const frameworkData =
        response.data?.framework ||
        response.framework ||
        response.data ||
        response;
      setFramework(frameworkData);

      // Check if AI is currently processing and show processing box
      if (
        frameworkData.aiProcessing?.status &&
        frameworkData.aiProcessing.status !== "completed" &&
        frameworkData.aiProcessing.status !== "failed"
      ) {
        setAiProcessingStatus({
          status: frameworkData.aiProcessing.status,
          message: `AI is ${frameworkData.aiProcessing.status}...`,
        });
      }
    } catch (error) {
      toast.error("Failed to load framework details");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  // Initialize WebSocket and fetch data
  useEffect(() => {
    if (token) {
      connect(token);
      fetchFrameworkDetails();
    }
  }, [id, token]);

  // Subscribe to WebSocket updates
  useEffect(() => {
    if (token) {
      // Subscribe to AI processing updates
      const unsubscribeAI = subscribe("ai-processing-update", (message) => {
        if (message.frameworkId === id) {
          const aiMessage = message.aiMessage;

          // Update AI processing status for display
          setAiProcessingStatus(aiMessage);

          // Handle completion or error
          if (aiMessage.status === "completed") {
            // Refresh framework data to get updated controls
            setTimeout(() => {
              fetchFrameworkDetails();
              setAiProcessingStatus(null); // Clear processing status
            }, 1000);
          } else if (
            aiMessage.status === "error" ||
            aiMessage.status === "failed"
          ) {
            toast.error(aiMessage.message || "AI processing failed");
            // Refresh framework data to get error status
            setTimeout(() => {
              fetchFrameworkDetails();
              setAiProcessingStatus(null); // Clear processing status
            }, 1000);
          }
        }
      });

      // Subscribe to comparison updates
      const unsubscribeComparison = subscribe(
        "comparison-update",
        (message) => {
          if (message.userFrameworkId === id) {
            const aiMessage = message.aiMessage;

            // Update comparison status for display
            setComparisonStatus(aiMessage);

            // Handle completion or error
            if (aiMessage.status === "completed") {
              // Refresh framework data to get updated comparison results
              setTimeout(() => {
                fetchFrameworkDetails();
                setComparisonStatus(null); // Clear comparison status
              }, 1000);
            } else if (
              aiMessage.status === "error" ||
              aiMessage.status === "failed"
            ) {
              toast.error(aiMessage.message || "Comparison failed");
              setTimeout(() => {
                setComparisonStatus(null); // Clear comparison status
              }, 1000);
            }
          }
        }
      );

      return () => {
        if (unsubscribeAI) unsubscribeAI();
        if (unsubscribeComparison) unsubscribeComparison();
      };
    }
  }, [id, token]);

  // Handle processing status after framework loads
  useEffect(() => {
    if (
      framework?.aiProcessing?.status &&
      framework.aiProcessing.status !== "completed" &&
      framework.aiProcessing.status !== "failed" &&
      !aiProcessingStatus
    ) {
      // Show processing status if not already showing
      setAiProcessingStatus({
        status: framework.aiProcessing.status,
        message: `AI is ${framework.aiProcessing.status}...`,
      });
    }
  }, [framework?.aiProcessing?.status]);

  const handleSendToAI = async () => {
    try {
      setSendingToAI(true);
      await sendFrameworkToAI(id, userRole);
      toast.success("Framework sent to AI successfully");
      fetchFrameworkDetails();
    } catch (error) {
      toast.error(error.message || "Failed to send framework to AI");
    } finally {
      setSendingToAI(false);
    }
  };

  const handleDownload = async () => {
    try {
      await downloadFramework(id, userRole);
      toast.success("Download started");
    } catch (error) {
      toast.error("Failed to download framework");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading framework details...</p>
        </div>
      </div>
    );
  }

  if (!framework) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Framework Not Found
          </h2>
          <p className="text-muted-foreground mb-4">
            The requested framework could not be found.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const hasAIProcessing = framework.aiProcessing?.status;
  const isAICompleted = framework.aiProcessing?.status === "completed";
  const controlsCount = framework.aiProcessing?.controlsCount || 0;

  return (
    <div className="min-h-[50vh] bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <Icon name="arrow-left" size="20px" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Framework Details
                </h1>
                <p className="text-sm text-muted-foreground">
                  View framework information and AI processing status
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Send to AI Button */}
              {!hasAIProcessing && (
                <button
                  onClick={handleSendToAI}
                  disabled={sendingToAI}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
                >
                  {sendingToAI ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending to AI...
                    </>
                  ) : (
                    <>
                      <Icon name="brain" size="16px" />
                      Send to AI
                    </>
                  )}
                </button>
              )}

              {/* Manual Refresh Button */}
              <button
                onClick={fetchFrameworkDetails}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition-colors"
                title="Refresh"
              >
                <Icon name="refresh" size="16px" />
              </button>

              {/* Compare Button - Only show for users */}
              {userRole === "user" && (
                <button
                  onClick={() => setCompareModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg hover:from-green-600 hover:to-teal-700 transition-all duration-200"
                >
                  <Icon name="compare" size="16px" />
                  Compare
                </button>
              )}

              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Icon name="download" size="16px" />
                Download
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Framework Info */}
          <div className="lg:w-1/3">
            <div className="bg-card rounded-xl border border-border p-4 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20">
                  <Icon
                    name="framework"
                    size="24px"
                    className="text-purple-500"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-foreground">
                    {framework.frameworkName || framework.originalFileName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {framework.frameworkType?.toUpperCase()} •{" "}
                    {framework.fileSize}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Upload Date
                  </label>
                  <p className="text-foreground font-medium">
                    {formatDate(framework.createdAt)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Last Modified
                  </label>
                  <p className="text-foreground font-medium">
                    {formatDate(framework.updatedAt)}
                  </p>
                </div>
              </div>

              {framework.uploadedBy && (
                <div className="pt-3 border-t border-border">
                  <label className="text-sm font-medium text-muted-foreground">
                    Uploaded By
                  </label>
                  <div className="flex items-center gap-3 mt-2 p-3 border border-border rounded-lg bg-muted/50">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                      <Icon name="user" size="16px" className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {framework.uploadedBy.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {framework.uploadedBy.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI Processing Status & Controls */}
          <div className="lg:w-2/3">
            {hasAIProcessing ? (
              <div className="space-y-4">
                {/* AI Processing Status */}
                <div className="bg-card rounded-xl border border-border p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                      <Icon
                        name="brain"
                        size="18px"
                        className="text-blue-500"
                      />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-foreground">
                        AI Processing Status
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Status:{" "}
                        <span
                          className={`font-medium ${
                            framework.aiProcessing.status === "completed"
                              ? "text-green-600"
                              : "text-blue-600"
                          }`}
                        >
                          {framework.aiProcessing.status}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Controls Extracted
                      </label>
                      <p className="font-medium text-foreground">
                        {controlsCount}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Processed At
                      </label>
                      <p className="font-medium text-foreground">
                        {framework.aiProcessing.processedAt
                          ? formatDate(framework.aiProcessing.processedAt)
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Live AI Processing Status */}
                {aiProcessingStatus && (
                  <div className="bg-card rounded-xl border border-border p-4 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-500/20 to-orange-500/10 rounded-lg flex items-center justify-center animate-pulse">
                        {aiProcessingStatus.status === "preprocessing" ? (
                          <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Icon
                            name="activity"
                            size="18px"
                            className="text-orange-500 animate-bounce"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-foreground">
                          Live AI Processing
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Status:{" "}
                          <span className="font-medium text-orange-600 animate-pulse">
                            {aiProcessingStatus.status}
                          </span>
                        </p>
                      </div>
                      {/* Animated dots indicator */}
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                      </div>
                    </div>

                    {aiProcessingStatus.message && (
                      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-3 animate-in fade-in duration-500">
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-4 bg-orange-500 rounded-full animate-pulse"></div>
                          <p className="text-sm text-orange-800 animate-in slide-in-from-left-1 duration-300">
                            {aiProcessingStatus.message}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Animated progress bar */}
                    <div className="mt-3">
                      <div className="w-full bg-orange-100 rounded-full h-1.5 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full animate-pulse">
                          <div className="h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_ease-in-out_infinite]"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Live Comparison Status */}
                {comparisonStatus && (
                  <div className="bg-card rounded-xl border border-border p-4 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center animate-pulse">
                        {comparisonStatus.status === "processing" ||
                        comparisonStatus.status === "starting" ? (
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Icon
                            name="compare"
                            size="18px"
                            className="text-blue-500 animate-bounce"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-foreground">
                          Live Framework Comparison
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Status:{" "}
                          <span className="font-medium text-blue-600 animate-pulse">
                            {comparisonStatus.status}
                          </span>
                        </p>
                      </div>
                      {/* Animated dots indicator */}
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      </div>
                    </div>

                    {comparisonStatus.message && (
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3 animate-in fade-in duration-500">
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                          <p className="text-sm text-blue-800 animate-in slide-in-from-left-1 duration-300">
                            {comparisonStatus.message}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Animated progress bar */}
                    <div className="mt-3">
                      <div className="w-full bg-blue-100 rounded-full h-1.5 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse">
                          <div className="h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_ease-in-out_infinite]"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Extracted Controls */}
                {isAICompleted &&
                  framework.aiProcessing.extractedControls?.length > 0 && (
                    <div className="bg-card rounded-xl border border-border p-4">
                      <h3 className="text-base font-semibold text-foreground mb-3">
                        Extracted Controls ({controlsCount})
                      </h3>
                      <div className="space-y-3 max-h-80 overflow-y-auto">
                        {framework.aiProcessing.extractedControls.map(
                          (control, index) => (
                            <div
                              key={control._id || index}
                              className="border border-border rounded-lg p-3 bg-muted/30"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="text-sm font-semibold text-foreground">
                                  {control.Control_id}
                                </h4>
                                {control.Control_type && (
                                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                    {control.Control_type}
                                  </span>
                                )}
                              </div>
                              <h5 className="text-sm font-medium text-foreground mb-1">
                                {control.Control_name}
                              </h5>
                              <p className="text-xs text-muted-foreground">
                                {control.Control_description}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            ) : (
              <div className="bg-card rounded-xl border border-border p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-500/20 to-gray-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Icon name="brain" size="24px" className="text-gray-500" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">
                  No AI Processing
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  This framework has not been processed by AI yet. Send it to AI
                  to extract controls.
                </p>
                <button
                  onClick={handleSendToAI}
                  disabled={sendingToAI}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 mx-auto"
                >
                  {sendingToAI ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending to AI...
                    </>
                  ) : (
                    <>
                      <Icon name="brain" size="16px" />
                      Send to AI
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Framework Comparison Results Table */}
      {framework?.comparisonResults?.length > 0 && (
        <FrameworkComparisonTable
          comparisonResults={framework.comparisonResults}
          comparisonCount={framework.comparisonCount}
        />
      )}

      {/* Compare Modal */}
      <CompareFrameworkModal
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        userFramework={framework}
        onComparisonStart={(comparisonData) => {
          // Set comparison status when comparison starts
          setComparisonStatus(comparisonData);
        }}
      />
    </div>
  );
}

export default FrameworkDetails;
