import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Icon from "../../components/Icon";
import DeleteVersionModal from "./components/DeleteVersionModal";
import UpdateCompanyFrameworkModal from "./components/UpdateCompanyFrameworkModal";
import CompareFrameworkModal from "./components/CompareFrameworkModal";
import RequestReviewModal from "./components/RequestReviewModal";
import ApproveFrameworkModal from "./components/ApproveFrameworkModal";
import RejectFrameworkModal from "./components/RejectFrameworkModal";
import {
  downloadCompanyFrameworkFile,
  getCompanyFrameworkById,
  uploadCompanyFrameworkToAi,
  deleteCompanyFrameworkVersion,
  approveCompanyFramework,
  rejectCompanyFramework,
} from "../../services/companyFrameworkService";
import { formatDate } from "../../utils/dateFormatter";
import { Button } from "@/components/ui/button";
import ComparisonTable from "./components/ComparisonTable";
import DeploymentGapsTable from "./components/DeploymentGapsTable";
import { useAuth } from "@/context/useAuth";

// ========== HELPER COMPONENTS ==========
const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 p-3 rounded bg-muted">
    <div className="mt-0.5 text-primary">{icon}</div>
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wider mb-1 text-muted-foreground">
        {label}
      </p>
      {value}
    </div>
  </div>
);

const FileIcon = ({ type }) => {
  const configs = {
    pdf: {
      icon: "pdf",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      textColor: "text-red-600 dark:text-red-400",
      borderColor: "border-red-200 dark:border-red-800",
    },
    doc: {
      icon: "doc",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-600 dark:text-blue-400",
      borderColor: "border-blue-200 dark:border-blue-800",
    },
    docx: {
      icon: "doc",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-600 dark:text-blue-400",
      borderColor: "border-blue-200 dark:border-blue-800",
    },
    xls: {
      icon: "excel",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      textColor: "text-green-600 dark:text-green-400",
      borderColor: "border-green-200 dark:border-green-800",
    },
    xlsx: {
      icon: "excel",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      textColor: "text-green-600 dark:text-green-400",
      borderColor: "border-green-200 dark:border-green-800",
    },
    ppt: {
      icon: "ppt",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      textColor: "text-orange-600 dark:text-orange-400",
      borderColor: "border-orange-200 dark:border-orange-800",
    },
    pptx: {
      icon: "ppt",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      textColor: "text-orange-600 dark:text-orange-400",
      borderColor: "border-orange-200 dark:border-orange-800",
    },
    default: {
      icon: "file",
      bgColor: "bg-gray-50 dark:bg-gray-900/20",
      textColor: "text-gray-600 dark:text-gray-400",
      borderColor: "border-gray-200 dark:border-gray-800",
    },
  };

  const fileType = type?.toLowerCase() || "pdf";
  const config = configs[fileType] || configs.default;

  return (
    <span
      className={`inline-flex items-center justify-center w-6 h-6 rounded ${config.bgColor} border ${config.borderColor} ${config.textColor}`}
    >
      <Icon name={config.icon} size="13px" />
    </span>
  );
};

// ========== CUSTOM HOOK FOR POLLING ==========
const useStatusPolling = (framework, setFramework, id) => {
  const pollingRef = useRef(null);
  const isActiveRef = useRef(true);

  useEffect(() => {
    const aiStatus = framework?.fileVersions?.[0]?.aiUpload?.status;
    const comparisonStatus = framework?.fileVersions?.[0]?.comparison?.status;
    const deploymentGapStatus =
      framework?.fileVersions?.[0]?.deploymentGap?.status;

    const shouldPollAI = aiStatus === "uploaded" || aiStatus === "processing";
    const shouldPollComparison =
      comparisonStatus === "comparison_started" ||
      comparisonStatus === "comparison_processing";
    const shouldPollDeploymentGap =
      deploymentGapStatus === "deployment_gap_started" ||
      deploymentGapStatus === "deployment_gap_processing";

    const shouldPoll =
      shouldPollAI || shouldPollComparison || shouldPollDeploymentGap;
    const isCorrectPage = window.location.pathname.includes(
      `/frameworks/${id}`,
    );

    if (!framework?.fileVersions?.length || !shouldPoll || !isCorrectPage) {
      return;
    }

    let pollCount = 0;
    const delays = [5000, 10000, 20000, 40000, 60000];

    const poll = () => {
      const delay = delays[Math.min(pollCount, delays.length - 1)];

      pollingRef.current = setTimeout(async () => {
        if (
          !isActiveRef.current ||
          !window.location.pathname.includes(`/frameworks/${id}`)
        ) {
          return;
        }

        try {
          const response = await getCompanyFrameworkById(id, {
            params: { _t: Date.now() },
          });

          if (response.success && isActiveRef.current) {
            const newFramework = response.data.framework;
            const newAIStatus =
              newFramework?.fileVersions?.[0]?.aiUpload?.status;
            const newComparisonStatus =
              newFramework?.fileVersions?.[0]?.comparison?.status;
            const newDeploymentGapStatus =
              newFramework?.fileVersions?.[0]?.deploymentGap?.status;

            setFramework(newFramework);
            pollCount++;

            const continuePollingAI =
              newAIStatus === "uploaded" || newAIStatus === "processing";
            const continuePollingComparison =
              newComparisonStatus === "comparison_started" ||
              newComparisonStatus === "comparison_processing";
            const continuePollingDeploymentGap =
              newDeploymentGapStatus === "deployment_gap_started" ||
              newDeploymentGapStatus === "deployment_gap_processing";

            if (
              continuePollingAI ||
              continuePollingComparison ||
              continuePollingDeploymentGap
            ) {
              poll();
            }
          }
        } catch {
          if (isActiveRef.current) {
            pollCount++;
            poll();
          }
        }
      }, delay);
    };

    poll();

    return () => {
      isActiveRef.current = false;
      if (pollingRef.current) clearTimeout(pollingRef.current);
    };
  }, [framework?.fileVersions, id, setFramework]);
};

// ========== MAIN COMPONENT ==========
function CompanyFrameworkDetail() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [framework, setFramework] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(false);
  const [versionToDelete, setVersionToDelete] = useState(null);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [expandedVersions, setExpandedVersions] = useState(new Set());
  const [showHash, setShowHash] = useState(new Set());
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [selectedVersionForCompare, setSelectedVersionForCompare] =
    useState(null);
  const [deploymentGapModalOpen, setDeploymentGapModalOpen] = useState(false);
  const [selectedVersionForDeploymentGap, setSelectedVersionForDeploymentGap] =
    useState(null);
  const [requestReviewModalOpen, setRequestReviewModalOpen] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Use custom polling hook
  useStatusPolling(framework, setFramework, id);

  // Fetch framework details
  const fetchFrameworkDetails = useCallback(
    async (isBackground = false) => {
      try {
        if (!isBackground) setLoading(true);
        else setIsPolling(true);

        const response = await getCompanyFrameworkById(id, {
          params: { _t: Date.now() },
        });

        if (response.success) setFramework(response.data.framework);
      } catch (error) {
        if (!isBackground) {
          toast.error(error.message || "Failed to fetch framework details");
          navigate("/company-frameworks");
        }
      } finally {
        setLoading(false);
        setIsPolling(false);
      }
    },
    [id, navigate],
  );

  useEffect(() => {
    fetchFrameworkDetails(false);
  }, [fetchFrameworkDetails]);

  useEffect(() => {
    if (framework?.fileVersions?.length) {
      setExpandedVersions(
        new Set(framework.fileVersions.map((v) => v.version)),
      );
    }
  }, [framework?.fileVersions]);

  // ========== HANDLERS ==========
  const handleDownload = async (fileId, fileName) => {
    try {
      await downloadCompanyFrameworkFile(fileId, fileName);
      toast.success("Download completed successfully");
    } catch (error) {
      toast.error(error.message || "Failed to download file");
    }
  };

  const handleUploadToAi = async (versionFileId) => {
    try {
      const response = await uploadCompanyFrameworkToAi(versionFileId);
      toast.success(response.message || "File uploaded to AI successfully");
      fetchFrameworkDetails(true);
    } catch (error) {
      toast.error(error.message || "Failed to upload to AI");
      fetchFrameworkDetails(true);
    }
  };

  const handleDeleteVersion = (version) => {
    setVersionToDelete(version);
  };

  const handleDeleteConfirm = async () => {
    if (!versionToDelete) return;
    try {
      const response = await deleteCompanyFrameworkVersion(
        framework.mainFileId,
        versionToDelete.fileId,
      );
      if (response.success) {
        toast.success(response.message || "Version deleted successfully");
        await fetchFrameworkDetails();
        setVersionToDelete(null);
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete version");
      throw error;
    }
  };

  const toggleVersion = (version) => {
    setExpandedVersions((prev) => {
      const next = new Set(prev);
      next.has(version) ? next.delete(version) : next.add(version);
      return next;
    });
  };

  const toggleHash = (version) => {
    setShowHash((prev) => {
      const next = new Set(prev);
      next.has(version) ? next.delete(version) : next.add(version);
      return next;
    });
  };

  const handleApprove = async (comments) => {
    try {
      const response = await approveCompanyFramework(framework.id, {
        comments,
      });
      if (response.success) {
        toast.success(response.message || "Framework approved successfully");
        await fetchFrameworkDetails();
        setShowApproveModal(false);
      }
    } catch (error) {
      toast.error(error.message || "Failed to approve framework");
      throw error;
    }
  };

  const handleReject = async (comments) => {
    try {
      const response = await rejectCompanyFramework(framework.id, {
        comments,
      });
      if (response.success) {
        toast.success(response.message || "Framework rejected successfully");
        await fetchFrameworkDetails();
        setShowRejectModal(false);
      }
    } catch (error) {
      toast.error(error.message || "Failed to reject framework");
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-primary border-r-secondary" />
          <p className="text-sm font-medium text-muted-foreground">
            Loading framework details...
          </p>
        </div>
      </div>
    );
  }

  if (!framework) return null;

  const isAIProcessing = ["uploaded", "processing"].includes(
    framework.fileVersions?.[0]?.aiUpload?.status,
  );

  const isComparisonProcessing = [
    "comparison_started",
    "comparison_processing",
  ].includes(framework.fileVersions?.[0]?.comparison?.status);

  const isDeploymentGapProcessing = [
    "deployment_gap_started",
    "deployment_gap_processing",
  ].includes(framework.fileVersions?.[0]?.deploymentGap?.status);

  // Determine which process is active and get appropriate message
  const getProcessingStatus = () => {
    if (isAIProcessing) {
      return {
        message: isPolling
          ? "Checking AI status..."
          : "Monitoring AI status...",
      };
    }
    if (isComparisonProcessing) {
      return {
        message: isPolling
          ? "Checking comparison status..."
          : "Monitoring comparison...",
      };
    }
    if (isDeploymentGapProcessing) {
      return {
        message: isPolling
          ? "Checking deployment gap status..."
          : "Monitoring deployment gap analysis...",
      };
    }
    return null;
  };

  const processingStatus = getProcessingStatus();
  const isAnyProcessing =
    isAIProcessing || isComparisonProcessing || isDeploymentGapProcessing;

  return (
    <div className="min-h-screen bg-background text-foreground my-5">
      <div className="space-y-6">
        {/* Unified Processing Indicator */}
        {isAnyProcessing && processingStatus && (
          <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded shadow-lg backdrop-blur-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
              {processingStatus.message}
            </span>
          </div>
        )}

        {/* Framework Overview Card */}
        <div className="rounded overflow-hidden bg-card border border-border">
          <div className="h-1 bg-linear-to-r from-primary to-secondary" />
          <div className="p-6">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded bg-primary/12 text-primary">
                  <Icon name="shield" size="22px" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">
                    {framework.frameworkName}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Framework Overview
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {user.role === "expert" &&
                  framework.requestReview?.status !== "approved" &&
                  framework.requestReview?.status !== "rejected" &&
                  framework.requestReview?.status === "requested" && (
                    <>
                      <Button onClick={() => setShowApproveModal(true)}>
                        <Icon name="edit" size="16px" /> <span>Approve</span>
                      </Button>

                      <Button
                        variant="destructive"
                        onClick={() => setShowRejectModal(true)}
                      >
                        <Icon name="edit" size="16px" /> <span>Reject</span>
                      </Button>
                    </>
                  )}
                {user.role === "company" && (
                  <Button onClick={() => setUpdateModalOpen(true)}>
                    <Icon name="edit" size="16px" /> Update Framework
                  </Button>
                )}
                <Button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2"
                >
                  <Icon name="arrow-left" size="20px" /> Back
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoItem
                icon={<Icon name="tag" size="15px" />}
                label="Current Version"
                value={
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/15 text-primary">
                    v{framework.currentVersion}
                  </span>
                }
              />
              <InfoItem
                icon={<Icon name="calendar" size="15px" />}
                label="Created"
                value={
                  <span className="text-sm font-medium">
                    {formatDate(framework.createdAt)}
                  </span>
                }
              />
              <InfoItem
                icon={<Icon name="clock" size="15px" />}
                label="Updated"
                value={
                  <span className="text-sm font-medium">
                    {formatDate(framework.updatedAt)}
                  </span>
                }
              />
              <InfoItem
                icon={<Icon name="tag" size="15px" />}
                label="Framework ID"
                value={
                  <span className="text-xs font-mono px-2 py-1 rounded bg-muted text-muted-foreground">
                    {framework.id}
                  </span>
                }
              />
              <InfoItem
                icon={<Icon name="tag" size="15px" />}
                label="File Object Id"
                value={
                  <span className="text-xs font-mono px-2 py-1 rounded bg-muted text-muted-foreground">
                    {framework.mainFileId}
                  </span>
                }
              />
              <InfoItem
                icon={<Icon name="tag" size="15px" />}
                label="Current File Id"
                value={
                  <span className="text-xs font-mono px-2 py-1 rounded bg-muted text-muted-foreground">
                    {
                      framework.fileVersions.find(
                        (v) => v.version === framework.currentVersion,
                      )?.fileId
                    }
                  </span>
                }
              />
              <InfoItem
                icon={<Icon name="shield" size="15px" />}
                label="Approval Status"
                value={
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      framework.requestReview.status === "approved"
                        ? "bg-primary/15 text-primary"
                        : framework.requestReview.status === "rejected"
                          ? "bg-red-500/15 text-red-600 dark:text-red-400"
                          : "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400"
                    }`}
                  >
                    {framework.requestReview.status === "approved"
                      ? "Approved"
                      : framework.requestReview.status === "rejected"
                        ? "Rejected"
                        : "Pending"}
                  </span>
                }
              />
            </div>

            {/* Show rejection reason if framework is rejected */}
            {framework.requestReview.status === "rejected" &&
              framework.requestReview.comments && (
                <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-4">
                  <div className="flex gap-3">
                    <Icon
                      name="x-circle"
                      size="20px"
                      className="text-red-600 dark:text-red-400 mt-0.5 shrink-0"
                    />
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
                        Rejection Reason
                      </h4>
                      <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
                        {framework.requestReview.comments}
                      </p>
                      {framework.requestReview.assignedExpert && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                          Rejected by:{" "}
                          {framework.requestReview.assignedExpert.name} on{" "}
                          {formatDate(framework.requestReview.reviewedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

            {/* Show approval info if framework is approved */}
            {framework.requestReview.status === "approved" &&
              framework.requestReview.assignedExpert && (
                <div className="mt-4 bg-primary/10 border border-primary/30 rounded p-4">
                  <div className="flex gap-3">
                    <Icon
                      name="check-circle"
                      size="20px"
                      className="text-primary mt-0.5 shrink-0"
                    />
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-foreground mb-1">
                        Framework Approved
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Approved by:{" "}
                        {framework.requestReview.assignedExpert.name} on{" "}
                        {formatDate(framework.requestReview.reviewedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* File Versions */}
        <div>
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-xl font-bold">File Versions</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/15 text-primary">
              {framework.fileVersions?.length || 0} files
            </span>
          </div>

          <div className="space-y-3">
            {framework.fileVersions?.map((ver) => {
              const isCurrent = ver.version === framework.currentVersion;
              const isExpanded = expandedVersions.has(ver.version);
              const hashVisible = showHash.has(ver.version);

              return (
                <div
                  key={ver.version}
                  className={`rounded overflow-hidden transition-all duration-300 hover:shadow-lg bg-card ${
                    isCurrent ? "border border-primary" : "border border-border"
                  }`}
                >
                  {/* Header */}
                  <div className="w-full flex items-center justify-between p-2">
                    <div
                      onClick={() => toggleVersion(ver.version)}
                      className="flex-1 flex items-center gap-3 flex-wrap cursor-pointer"
                    >
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          isCurrent
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        v{ver.version}
                        {isCurrent && " • Current"}
                      </span>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileIcon type={ver.frameworkType} />
                        <span className="font-medium text-foreground">
                          {ver.originalFileName}
                        </span>
                        <span>•</span>
                        <span>{ver.fileSize}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() =>
                          handleDownload(ver.fileId, ver.originalFileName)
                        }
                      >
                        <Icon name="download" size="15px" /> Download
                      </Button>

                      {user.role === "company" &&
                        ver.aiUpload?.status === "completed" &&
                        ver.aiUpload?.job_id &&
                        (ver.comparison?.status !== "comparison_completed" ||
                          (ver.comparison?.status === "comparison_completed" &&
                            ver.comparison?.comparisons?.comparison_data
                              ?.length === 0)) && (
                          <Button
                            variant="secondary"
                            onClick={() => {
                              setSelectedVersionForCompare(ver);
                              setCompareModalOpen(true);
                            }}
                            disabled={
                              ver.comparison?.status === "comparison_started" ||
                              ver.comparison?.status === "comparison_processing"
                            }
                          >
                            {ver.comparison?.status === "comparison_started" ||
                            ver.comparison?.status ===
                              "comparison_processing" ? (
                              <>
                                <Icon
                                  name="loader"
                                  size="13px"
                                  className="animate-spin"
                                />
                                {ver.comparison?.status === "comparison_started"
                                  ? "Starting..."
                                  : "Comparing..."}
                              </>
                            ) : (
                              <>
                                <Icon name="git-merge" size="13px" />
                                {ver.comparison?.status ===
                                  "comparison_failed" ||
                                (ver.comparison?.status ===
                                  "comparison_completed" &&
                                  ver.comparison?.comparisons?.comparison_data
                                    ?.length === 0)
                                  ? "Retry Compare"
                                  : "Compare"}
                              </>
                            )}
                          </Button>
                        )}

                      {user.role === "company" &&
                        ver.aiUpload?.status === "completed" &&
                        ver.aiUpload?.job_id &&
                        (ver.deploymentGap?.status !==
                          "deployment_gap_completed" ||
                          (ver.deploymentGap?.status ===
                            "deployment_gap_completed" &&
                            ver.deploymentGap?.deployment_gaps
                              ?.deployment_gap_results?.length === 0)) && (
                          <Button
                            variant="secondary"
                            onClick={() => {
                              setSelectedVersionForDeploymentGap(ver);
                              setDeploymentGapModalOpen(true);
                            }}
                            disabled={
                              ver.deploymentGap?.status ===
                                "deployment_gap_started" ||
                              ver.deploymentGap?.status ===
                                "deployment_gap_processing"
                            }
                          >
                            {ver.deploymentGap?.status ===
                              "deployment_gap_started" ||
                            ver.deploymentGap?.status ===
                              "deployment_gap_processing" ? (
                              <>
                                <Icon
                                  name="loader"
                                  size="13px"
                                  className="animate-spin"
                                />
                                {ver.deploymentGap?.status ===
                                "deployment_gap_started"
                                  ? "Starting..."
                                  : "Analyzing..."}
                              </>
                            ) : (
                              <>
                                <Icon name="shield" size="13px" />
                                {ver.deploymentGap?.status ===
                                  "deployment_gap_failed" ||
                                (ver.deploymentGap?.status ===
                                  "deployment_gap_completed" &&
                                  ver.deploymentGap?.deployment_gaps
                                    ?.deployment_gap_results?.length === 0)
                                  ? "Retry Gap Analysis"
                                  : "Deployment Gap"}
                              </>
                            )}
                          </Button>
                        )}

                      {user.role === "company" &&
                        !isCurrent &&
                        framework.fileVersions.length > 1 && (
                          <Button
                            variant="destructive"
                            onClick={() => handleDeleteVersion(ver)}
                          >
                            <Icon name="trash" size="15px" /> Delete
                          </Button>
                        )}

                      {user.role === "company" &&
                        (!ver.aiUpload ||
                          !["completed"].includes(ver.aiUpload?.status)) && (
                          <Button
                            variant="secondary"
                            onClick={() => handleUploadToAi(ver.fileId)}
                            disabled={
                              ver.aiUpload?.status === "uploaded" ||
                              ver.aiUpload?.status === "processing"
                            }
                          >
                            {ver.aiUpload?.status === "uploaded" ||
                            ver.aiUpload?.status === "processing" ? (
                              <>
                                <Icon
                                  name="loader"
                                  size="13px"
                                  className="animate-spin"
                                />
                                {ver.aiUpload?.status === "processing"
                                  ? "Processing..."
                                  : "Uploading..."}
                              </>
                            ) : (
                              <>
                                <Icon name="upload-cloud" size="13px" />
                                {ver.aiUpload?.status === "failed" ||
                                ver.aiUpload?.status === "skipped"
                                  ? "Retry AI Upload"
                                  : "Upload to AI"}
                              </>
                            )}
                          </Button>
                        )}

                      {user.role === "company" &&
                        ver.aiUpload?.status === "completed" &&
                        ((ver.comparison?.status === "comparison_completed" &&
                          ver.comparison?.comparisons?.comparison_data?.length >
                            0) ||
                          (ver.deploymentGap?.status ===
                            "deployment_gap_completed" &&
                            ver.deploymentGap?.deployment_gaps
                              ?.deployment_gap_results?.length > 0)) &&
                        (!framework.requestReview ||
                          framework.requestReview.status !== "requested") && (
                          <Button
                            onClick={() => setRequestReviewModalOpen(true)}
                          >
                            {framework.requestReview?.status === "rejected"
                              ? "Re-request Review"
                              : "Request Review"}
                          </Button>
                        )}

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleVersion(ver.version)}
                      >
                        {isExpanded ? (
                          <Icon name="chevron-up" size="18px" />
                        ) : (
                          <Icon name="chevron-down" size="18px" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-4 pb-5 pt-1 space-y-4 border-t border-border">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Icon name="calendar" size="14px" />
                        <span>Uploaded on {formatDate(ver.uploadedAt)}</span>
                      </div>

                      {/* User Info */}
                      <div className="flex items-center gap-3 p-3 rounded bg-muted">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-primary/20 text-primary">
                          {ver.uploadedBy?.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase() || <Icon name="user" size="16px" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">
                            {ver.uploadedBy?.name}
                          </p>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Icon name="mail" size="11px" />
                            <span className="truncate">
                              {ver.uploadedBy?.email}
                            </span>
                          </div>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-secondary/15 text-secondary">
                          {ver.uploadedBy?.role}
                        </span>
                      </div>

                      {/* File Hash */}
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleHash(ver.version)}
                        >
                          <Icon name="tag" size="13px" />
                          {hashVisible ? "Hide" : "Show"} file hash
                        </Button>
                      </div>

                      {hashVisible && (
                        <div className="p-3 rounded text-xs font-mono break-all bg-muted text-muted-foreground">
                          {ver.fileHash}
                        </div>
                      )}

                      {/* AI Info */}
                      {ver.aiUpload && (
                        <div className="rounded border border-border bg-card overflow-hidden">
                          <div className="px-4 py-3 bg-secondary/5 border-b border-border">
                            <div className="flex items-center gap-2">
                              <Icon
                                name="info"
                                size="16px"
                                className="text-secondary"
                              />
                              <h3 className="text-sm font-bold">
                                AI Processing Information
                              </h3>
                            </div>
                          </div>

                          <div className="p-4 max-h-100 overflow-y-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              {/* Status Card */}
                              <div className="rounded border border-border bg-muted/30 overflow-hidden">
                                <div className="px-4 py-3 bg-muted/50 border-b border-border">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-semibold">
                                      Status
                                    </h4>
                                    <span
                                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                        ver.aiUpload.status === "completed"
                                          ? "bg-green-500/15 text-green-600"
                                          : ver.aiUpload.status ===
                                                "uploaded" ||
                                              ver.aiUpload.status ===
                                                "processing"
                                            ? "bg-blue-500/15 text-blue-600"
                                            : ver.aiUpload.status === "failed"
                                              ? "bg-red-500/15 text-red-600"
                                              : "bg-yellow-500/15 text-yellow-600"
                                      }`}
                                    >
                                      {ver.aiUpload.status}
                                    </span>
                                  </div>
                                </div>
                                <div className="p-3 space-y-2">
                                  {ver.aiUpload.message && (
                                    <div>
                                      <p className="text-[11px] font-medium uppercase tracking-wider mb-1.5 text-muted-foreground">
                                        Message
                                      </p>
                                      <p className="text-xs text-foreground">
                                        {ver.aiUpload.message}
                                      </p>
                                    </div>
                                  )}
                                  {ver.aiUpload.timestamp && (
                                    <div className="pt-2 border-t border-border">
                                      <p className="text-[11px] font-medium uppercase tracking-wider mb-1.5 text-muted-foreground">
                                        Timestamp
                                      </p>
                                      <p className="text-xs text-foreground">
                                        {new Date(
                                          ver.aiUpload.timestamp,
                                        ).toLocaleString()}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Identifiers Card */}
                              {(ver.aiUpload.uuid || ver.aiUpload.job_id) && (
                                <div className="rounded border border-border bg-muted/30 overflow-hidden">
                                  <div className="px-4 py-3 bg-muted/50 border-b border-border">
                                    <h4 className="text-sm font-semibold">
                                      Identifiers
                                    </h4>
                                  </div>
                                  <div className="p-3 space-y-2">
                                    {ver.aiUpload.uuid && (
                                      <div>
                                        <p className="text-[11px] font-medium uppercase tracking-wider mb-1 text-muted-foreground">
                                          UUID
                                        </p>
                                        <p className="text-xs font-mono text-foreground break-all">
                                          {ver.aiUpload.uuid}
                                        </p>
                                      </div>
                                    )}
                                    {ver.aiUpload.job_id && (
                                      <div
                                        className={
                                          ver.aiUpload.uuid
                                            ? "pt-2 border-t border-border"
                                            : ""
                                        }
                                      >
                                        <p className="text-[11px] font-medium uppercase tracking-wider mb-1 text-muted-foreground">
                                          Job ID
                                        </p>
                                        <p className="text-xs font-mono text-foreground break-all">
                                          {ver.aiUpload.job_id}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      {/* comparison Info */}
                      {ver.comparison && (
                        <div className="rounded border border-border bg-card overflow-hidden">
                          <div className="px-4 py-3 bg-secondary/5 border-b border-border">
                            <div className="flex items-center gap-2">
                              <Icon
                                name="info"
                                size="16px"
                                className="text-secondary"
                              />
                              <h3 className="text-sm font-bold">
                                Comparison Information
                              </h3>
                            </div>
                          </div>

                          <div className="p-4 overflow-y-auto">
                            <div className="grid grid-cols-12 gap-4">
                              {/* Status Card */}
                              <div className="rounded border border-border bg-muted/30 col-span-6">
                                <div className="px-4 py-3 bg-muted/50 border-b border-border">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-semibold">
                                      Status
                                    </h4>
                                    <span
                                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                        ver.comparison.status ===
                                        "comparison_completed"
                                          ? "bg-green-500/15 text-green-600"
                                          : ver.comparison.status ===
                                                "comparison_started" ||
                                              ver.comparison.status ===
                                                "comparison_processing"
                                            ? "bg-blue-500/15 text-blue-600"
                                            : ver.comparison.status ===
                                                "comparison_failed"
                                              ? "bg-red-500/15 text-red-600"
                                              : "bg-yellow-500/15 text-yellow-600"
                                      }`}
                                    >
                                      {ver.comparison.status}
                                    </span>
                                  </div>
                                </div>
                                <div className="p-3 space-y-2">
                                  {/* Message */}
                                  {ver.comparison.message && (
                                    <div>
                                      <p className="text-[11px] font-medium uppercase tracking-wider mb-1.5 text-muted-foreground">
                                        Message
                                      </p>
                                      <p className="text-xs text-foreground">
                                        {ver.comparison.message}
                                      </p>
                                    </div>
                                  )}

                                  {/* Total Controls */}
                                  {ver.comparison.total_controls !==
                                    undefined && (
                                    <div>
                                      <p className="text-[11px] font-medium uppercase tracking-wider mb-1.5 text-muted-foreground">
                                        Total Controls
                                      </p>
                                      <p className="text-xs text-foreground">
                                        {ver.comparison.total_controls}
                                      </p>
                                    </div>
                                  )}

                                  {/* Timestamp */}
                                  {ver.comparison.timestamp && (
                                    <div className="pt-2 border-t border-border">
                                      <p className="text-[11px] font-medium uppercase tracking-wider mb-1.5 text-muted-foreground">
                                        Timestamp
                                      </p>
                                      <p className="text-xs text-foreground">
                                        {new Date(
                                          ver.comparison.timestamp,
                                        ).toLocaleString()}
                                      </p>
                                    </div>
                                  )}

                                  {/* Last Updated */}
                                  {ver.comparison.lastUpdated && (
                                    <div>
                                      <p className="text-[11px] font-medium uppercase tracking-wider mb-1.5 text-muted-foreground">
                                        Last Updated
                                      </p>
                                      <p className="text-xs text-foreground">
                                        {new Date(
                                          ver.comparison.lastUpdated,
                                        ).toLocaleString()}
                                      </p>
                                    </div>
                                  )}

                                  {/* Comparison Time */}
                                  {ver.comparison.comparison_time_seconds !==
                                    undefined && (
                                    <div>
                                      <p className="text-[11px] font-medium uppercase tracking-wider mb-1.5 text-muted-foreground">
                                        Processing Time
                                      </p>
                                      <p className="text-xs text-foreground">
                                        {ver.comparison.comparison_time_seconds}{" "}
                                        sec
                                      </p>
                                    </div>
                                  )}

                                  {/* Reused Flag */}
                                  {ver.comparison.comparison_reused !==
                                    undefined && (
                                    <div className="pt-2 border-t border-border">
                                      <div className="flex items-center justify-between">
                                        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                                          Reused from Duplicate
                                        </p>
                                        <span
                                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                            ver.comparison.comparison_reused
                                              ? "bg-blue-500/15 text-blue-600"
                                              : "bg-gray-500/15 text-gray-600"
                                          }`}
                                        >
                                          {ver.comparison.comparison_reused
                                            ? "Yes"
                                            : "No"}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Identifiers Card */}
                              {(ver.comparison?.comparison_id ||
                                ver.comparison?.company_controls_job_id ||
                                ver.comparison?.official_controls_job_id ||
                                ver.comparison?.original_comparison_id) && (
                                <div className="rounded border border-border bg-muted/30 overflow-hidden col-span-6">
                                  <div className="px-4 py-3 bg-muted/50 border-b border-border">
                                    <h4 className="text-sm font-semibold">
                                      Identifiers
                                    </h4>
                                  </div>
                                  <div className="p-3 space-y-2">
                                    {/* Comparison ID */}
                                    {ver.comparison.comparison_id && (
                                      <div>
                                        <p className="text-[11px] font-medium uppercase tracking-wider mb-1 text-muted-foreground">
                                          Comparison ID
                                        </p>
                                        <p className="text-xs font-mono text-foreground break-all">
                                          {ver.comparison.comparison_id}
                                        </p>
                                      </div>
                                    )}

                                    {/* Company Controls Job ID */}
                                    {ver.comparison.company_controls_job_id && (
                                      <div
                                        className={
                                          ver.comparison.comparison_id
                                            ? "pt-2 border-t border-border"
                                            : ""
                                        }
                                      >
                                        <p className="text-[11px] font-medium uppercase tracking-wider mb-1 text-muted-foreground">
                                          Company Controls Job ID
                                        </p>
                                        <p className="text-xs font-mono text-foreground break-all">
                                          {
                                            ver.comparison
                                              .company_controls_job_id
                                          }
                                        </p>
                                      </div>
                                    )}

                                    {/* Official Controls Job ID */}
                                    {ver.comparison
                                      .official_controls_job_id && (
                                      <div className="pt-2 border-t border-border">
                                        <p className="text-[11px] font-medium uppercase tracking-wider mb-1 text-muted-foreground">
                                          Official Controls Job ID
                                        </p>
                                        <p className="text-xs font-mono text-foreground break-all">
                                          {
                                            ver.comparison
                                              .official_controls_job_id
                                          }
                                        </p>
                                      </div>
                                    )}

                                    {/* Original Comparison ID (when reused) */}
                                    {ver.comparison.original_comparison_id && (
                                      <div className="pt-2 border-t border-border">
                                        <p className="text-[11px] font-medium uppercase tracking-wider mb-1 text-muted-foreground">
                                          Original Comparison ID
                                        </p>
                                        <p className="text-xs font-mono text-foreground break-all">
                                          {
                                            ver.comparison
                                              .original_comparison_id
                                          }
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Comparison Data Table */}
                              {ver.comparison?.comparisons?.comparison_data
                                ?.length > 0 && (
                                <ComparisonTable
                                  comparisonData={
                                    ver.comparison.comparisons.comparison_data
                                  }
                                  totalControls={
                                    ver.comparison.comparisons.total_controls
                                  }
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      {/* deployment gap info */}
                      {ver.deploymentGap && (
                        <div className="mt-6">
                          <div className="rounded border border-border bg-card overflow-hidden">
                            <div className="px-4 py-3 bg-secondary/5 border-b border-border">
                              <div className="flex items-center gap-2">
                                <Icon
                                  name="info"
                                  size="16px"
                                  className="text-secondary"
                                />
                                <h3 className="text-sm font-bold">
                                  Deployment Gap Analysis
                                </h3>
                              </div>
                            </div>

                            <div className="p-4">
                              <DeploymentGapsTable
                                deploymentGaps={ver.deploymentGap}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modals */}
      <DeleteVersionModal
        version={versionToDelete}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setVersionToDelete(null)}
      />

      <UpdateCompanyFrameworkModal
        isOpen={updateModalOpen}
        onClose={() => setUpdateModalOpen(false)}
        onSuccess={() => {
          fetchFrameworkDetails();
          setUpdateModalOpen(false);
        }}
        framework={framework}
      />

      <CompareFrameworkModal
        isOpen={compareModalOpen}
        onClose={() => {
          setCompareModalOpen(false);
          setSelectedVersionForCompare(null);
        }}
        onSuccess={async () => {
          // Wait for backend to update comparison status
          await new Promise((resolve) => setTimeout(resolve, 1000));
          // Fetch updated framework data to trigger polling
          await fetchFrameworkDetails(true);
          setCompareModalOpen(false);
          setSelectedVersionForCompare(null);
        }}
        companyFramework={{
          ...framework,
          frameworkName: framework.frameworkName,
          aiUpload: selectedVersionForCompare.aiUpload,
        }}
      />

      <CompareFrameworkModal
        isOpen={deploymentGapModalOpen}
        onClose={() => {
          setDeploymentGapModalOpen(false);
          setSelectedVersionForDeploymentGap(null);
        }}
        onSuccess={async () => {
          // Wait for backend to update deployment gap status
          await new Promise((resolve) => setTimeout(resolve, 1000));
          // Fetch updated framework data to trigger polling
          await fetchFrameworkDetails(true);
          setDeploymentGapModalOpen(false);
          setSelectedVersionForDeploymentGap(null);
        }}
        companyFramework={{
          ...framework,
          frameworkName: framework.frameworkName,
          aiUpload: selectedVersionForDeploymentGap.aiUpload,
        }}
        mode="deploymentGap"
      />

      <RequestReviewModal
        isOpen={requestReviewModalOpen}
        frameworkId={framework.id}
        frameworkName={framework.frameworkName}
        onSuccess={async () => {
          await fetchFrameworkDetails(true);
        }}
        onClose={() => setRequestReviewModalOpen(false)}
      />

      <ApproveFrameworkModal
        framework={showApproveModal ? framework : null}
        onConfirm={handleApprove}
        onCancel={() => setShowApproveModal(false)}
      />

      <RejectFrameworkModal
        framework={showRejectModal ? framework : null}
        onConfirm={handleReject}
        onCancel={() => setShowRejectModal(false)}
      />
    </div>
  );
}

export default CompanyFrameworkDetail;
