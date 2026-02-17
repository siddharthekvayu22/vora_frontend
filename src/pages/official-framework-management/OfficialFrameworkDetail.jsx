import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiArrowLeft,
  FiDownload,
  FiUploadCloud,
  FiUser,
  FiCalendar,
  FiHash,
  FiShield,
  FiChevronDown,
  FiChevronUp,
  FiLoader,
  FiTag,
  FiClock,
  FiMail,
  FiInfo,
  FiActivity,
  FiTrash,
  FiCheckCircle,
  FiXCircle,
  FiEdit,
} from "react-icons/fi";
import Icon from "../../components/Icon";
import DeleteVersionModal from "./components/DeleteVersionModal";
import ApproveFrameworkModal from "./components/ApproveFrameworkModal";
import RejectFrameworkModal from "./components/RejectFrameworkModal";
import UpdateFrameworkModal from "./components/UpdateFrameworkModal";
import {
  downloadOfficialFrameworkFile,
  getOfficialFrameworkById,
  uploadOfficialFrameworkToAi,
  deleteOfficialFrameworkVersion,
  approveOfficialFramework,
  rejectOfficialFramework,
} from "../../services/officialFrameworkService";
import { formatDate } from "../../utils/dateFormatter";

function InfoItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-muted">
      <div className="mt-0.5 text-primary">{icon}</div>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wider mb-1 text-muted-foreground">
          {label}
        </p>
        {value}
      </div>
    </div>
  );
}

function FileIcon({ type }) {
  // Get appropriate icon and color based on file type
  const getFileTypeConfig = (fileType) => {
    const type = fileType?.toLowerCase() || "pdf";

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

    return configs[type] || configs.default;
  };

  const config = getFileTypeConfig(type);

  return (
    <span
      className={`inline-flex items-center justify-center w-6 h-6 rounded ${config.bgColor} ${config.borderColor} border ${config.textColor}`}
    >
      <Icon name={config.icon} size="13px" />
    </span>
  );
}

function OfficialFrameworkDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [framework, setFramework] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(false);
  const [uploadingToAi, setUploadingToAi] = useState(new Set()); // Changed to Set to track multiple uploads
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [versionToDelete, setVersionToDelete] = useState(null);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [expandedVersions, setExpandedVersions] = useState(new Set());
  const [showHash, setShowHash] = useState(new Set());

  useEffect(() => {
    fetchFrameworkDetails(false);
  }, [id]);

  // Polling effect for AI status updates
  useEffect(() => {
    if (!framework?.fileVersions?.length) return;

    const currentVersion = framework.fileVersions[0];
    const status = currentVersion?.aiUpload?.status;

    // Start polling if status is "uploaded" or "processing"
    if (status === "uploaded" || status === "processing") {
      const interval = setInterval(() => {
        fetchFrameworkDetails(true); // Background refresh
      }, 5000); // Poll every 5 seconds

      return () => clearInterval(interval);
    }
  }, [framework?.fileVersions?.[0]?.aiUpload?.status]);

  const fetchFrameworkDetails = async (isBackgroundRefresh = false) => {
    try {
      if (!isBackgroundRefresh) {
        setLoading(true);
      } else {
        setIsPolling(true);
      }
      const response = await getOfficialFrameworkById(id);
      if (response.success) {
        setFramework(response.data.framework);
      }
    } catch (error) {
      if (!isBackgroundRefresh) {
        toast.error(error.message || "Failed to fetch framework details");
        navigate("/official-frameworks");
      }
    } finally {
      setLoading(false);
      setIsPolling(false);
    }
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      await downloadOfficialFrameworkFile(fileId, fileName);
      toast.success("Download completed successfully");
    } catch (error) {
      toast.error(error.message || "Failed to download file");
    }
  };

  const handleUploadToAi = async (versionFileId) => {
    try {
      // Add this versionFileId to the uploading set
      setUploadingToAi((prev) => new Set(prev).add(versionFileId));

      const response = await uploadOfficialFrameworkToAi(versionFileId);
      toast.success(response.message || "File uploaded to AI successfully");
      fetchFrameworkDetails(true); // Background refresh after upload
    } catch (error) {
      toast.error(error.message || "Failed to upload to AI");
      fetchFrameworkDetails(true); // Background refresh on error
    } finally {
      // Remove this versionFileId from the uploading set
      setUploadingToAi((prev) => {
        const next = new Set(prev);
        next.delete(versionFileId);
        return next;
      });
    }
  };

  const handleDeleteVersion = (version) => {
    setVersionToDelete(version);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!versionToDelete) return;

    try {
      const response = await deleteOfficialFrameworkVersion(
        framework.mainFileId,
        versionToDelete.fileId,
      );
      if (response.success) {
        toast.success(response.message || "Version deleted successfully");
        fetchFrameworkDetails();
        setDeleteModalOpen(false);
        setVersionToDelete(null);
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete version");
      throw error; // Re-throw to let modal handle loading state
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setVersionToDelete(null);
  };

  const handleApprove = () => {
    setApproveModalOpen(true);
  };

  const handleApproveConfirm = async () => {
    try {
      const response = await approveOfficialFramework(framework.id);
      if (response.success) {
        toast.success(response.message || "Framework approved successfully");
        fetchFrameworkDetails();
        setApproveModalOpen(false);
      }
    } catch (error) {
      toast.error(error.message || "Failed to approve framework");
      throw error;
    }
  };

  const handleApproveCancel = () => {
    setApproveModalOpen(false);
  };

  const handleReject = () => {
    setRejectModalOpen(true);
  };

  const handleRejectConfirm = async (rejectionReason) => {
    try {
      const response = await rejectOfficialFramework(
        framework.id,
        rejectionReason,
      );
      if (response.success) {
        toast.success(response.message || "Framework rejected successfully");
        fetchFrameworkDetails();
        setRejectModalOpen(false);
      }
    } catch (error) {
      toast.error(error.message || "Failed to reject framework");
      throw error;
    }
  };

  const handleRejectCancel = () => {
    setRejectModalOpen(false);
  };

  const handleUpdate = () => {
    setUpdateModalOpen(true);
  };

  const handleUpdateSuccess = () => {
    fetchFrameworkDetails();
    setUpdateModalOpen(false);
  };

  const handleUpdateCancel = () => {
    setUpdateModalOpen(false);
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

  const currentVersionData = framework.fileVersions?.find(
    (v) => v.version === framework.currentVersion,
  );

  // Check if currently polling for AI status
  const isAIProcessing =
    framework.fileVersions?.[0]?.aiUpload?.status === "uploaded" ||
    framework.fileVersions?.[0]?.aiUpload?.status === "processing";

  return (
    <div className="min-h-screen bg-background text-foreground my-5">
      <div className="space-y-6">
        {/* Polling Indicator - Always show when AI is processing */}
        {isAIProcessing && (
          <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg shadow-lg backdrop-blur-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
              {isPolling ? "Checking AI status..." : "Monitoring AI status..."}
            </span>
          </div>
        )}

        {/* ===== FRAMEWORK OVERVIEW CARD ===== */}
        <div className="rounded-2xl overflow-hidden bg-card border border-border">
          <div className="h-1 bg-gradient-to-r from-primary to-secondary" />
          <div className="p-6">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/12 text-primary">
                  <FiShield size={22} />
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
                <button
                  onClick={handleUpdate}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 hover:bg-secondary/80 bg-secondary text-secondary-foreground cursor-pointer"
                >
                  <FiEdit size={16} />
                  Update Framework
                </button>
                <button
                  onClick={() => navigate("/official-frameworks")}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 hover:bg-primary/80 bg-primary text-primary-foreground cursor-pointer"
                >
                  <FiArrowLeft size={20} /> Back
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoItem
                icon={<FiTag size={15} />}
                label="Framework Code"
                value={
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-secondary/15 text-secondary">
                    {framework.frameworkCode}
                  </span>
                }
              />
              <InfoItem
                icon={<FiTag size={15} />}
                label="Current Version"
                value={
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/15 text-primary">
                    v{framework.currentVersion}
                  </span>
                }
              />
              <InfoItem
                icon={<FiShield size={15} />}
                label="Approval Status"
                value={
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      framework.approval.status === "approved"
                        ? "bg-primary/15 text-primary"
                        : framework.approval.status === "rejected"
                          ? "bg-red-500/15 text-red-600 dark:text-red-400"
                          : "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400"
                    }`}
                  >
                    {framework.approval.status === "approved"
                      ? "Approved"
                      : framework.approval.status === "rejected"
                        ? "Rejected"
                        : "Pending"}
                  </span>
                }
              />
              <InfoItem
                icon={<FiCalendar size={15} />}
                label="Created"
                value={
                  <span className="text-sm font-medium whitespace-nowrap">
                    {formatDate(framework.createdAt)}
                  </span>
                }
              />
              <InfoItem
                icon={<FiClock size={15} />}
                label="Updated"
                value={
                  <span className="text-sm font-medium whitespace-nowrap">
                    {formatDate(framework.updatedAt)}
                  </span>
                }
              />
              <InfoItem
                icon={<FiHash size={15} />}
                label="Framework ID"
                value={
                  <span className="text-xs font-mono px-2 py-1 rounded-md bg-muted text-muted-foreground">
                    {framework.id}
                  </span>
                }
              />
              <InfoItem
                icon={<FiHash size={15} />}
                label="Framework Category ID"
                value={
                  <span className="text-xs font-mono px-2 py-1 rounded-md bg-muted text-muted-foreground">
                    {framework.frameworkCategoryId}
                  </span>
                }
              />
              <InfoItem
                icon={<FiHash size={15} />}
                label="File Object Id"
                value={
                  <span className="text-xs font-mono px-2 py-1 rounded-md bg-muted text-muted-foreground">
                    {framework.mainFileId}
                  </span>
                }
              />
            </div>

            {/* Show rejection reason if framework is rejected */}
            {framework.approval.status === "rejected" &&
              framework.approval.rejectionReason && (
                <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex gap-3">
                    <FiXCircle
                      size={20}
                      className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0"
                    />
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
                        Rejection Reason
                      </h4>
                      <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
                        {framework.approval.rejectionReason}
                      </p>
                      {framework.approval.approvedBy && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                          Rejected by: {framework.approval.approvedBy.name} on{" "}
                          {formatDate(framework.approval.approvedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

            {/* Show approval info if framework is approved */}
            {framework.approval.status === "approved" &&
              framework.approval.approvedBy && (
                <div className="mt-4 bg-primary/10 border border-primary/30 rounded-lg p-4">
                  <div className="flex gap-3">
                    <FiCheckCircle
                      size={20}
                      className="text-primary mt-0.5 flex-shrink-0"
                    />
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-foreground mb-1">
                        Framework Approved
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Approved by: {framework.approval.approvedBy.name} on{" "}
                        {formatDate(framework.approval.approvedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* ===== FILE VERSIONS ===== */}
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
                  className={`rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg bg-card ${
                    isCurrent ? "border border-primary" : "border border-border"
                  }`}
                >
                  <div className="w-full flex items-center justify-between p-2 transition-colors duration-200 text-foreground ">
                    <div
                      onClick={() => toggleVersion(ver.version)}
                      className="flex-1 flex items-center gap-3 flex-wrap cursor-pointer "
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
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleDownload(ver.fileId, ver.originalFileName)
                        }
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 hover:bg-primary/80 bg-primary text-primary-foreground cursor-pointer"
                      >
                        <FiDownload size={15} />
                        Download
                      </button>

                      {!isCurrent && framework.fileVersions.length > 1 && (
                        <button
                          onClick={() => handleDeleteVersion(ver)}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 hover:bg-red-600/80 bg-red-600 text-white cursor-pointer"
                        >
                          <FiTrash size={15} />
                          Delete
                        </button>
                      )}

                      {/* Show Approve/Reject buttons only for current version when AI is completed and status is pending */}
                      {isCurrent &&
                        ver.aiUpload?.status === "completed" &&
                        framework.approval.status === "pending" && (
                          <>
                            <button
                              onClick={handleApprove}
                              className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all duration-300 hover:bg-primary/80 bg-primary text-primary-foreground cursor-pointer"
                            >
                              <FiCheckCircle size={16} />
                              Approve
                            </button>
                            <button
                              onClick={handleReject}
                              className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all duration-300 hover:bg-red-600/80 bg-red-600 text-white cursor-pointer"
                            >
                              <FiXCircle size={16} />
                              Reject
                            </button>
                          </>
                        )}
                      {/* Show Upload to AI button when not uploaded, not processing, and not completed */}
                      {(!ver.aiUpload ||
                        (ver.aiUpload.status !== "completed" &&
                          ver.aiUpload.status !== "uploaded" &&
                          ver.aiUpload.status !== "processing")) && (
                        <button
                          onClick={() => handleUploadToAi(ver.fileId)}
                          disabled={uploadingToAi.has(ver.fileId)}
                          className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all duration-300 hover:bg-secondary/80 bg-secondary text-secondary-foreground cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {uploadingToAi.has(ver.fileId) ? (
                            <FiLoader size={13} className="animate-spin" />
                          ) : (
                            <FiUploadCloud size={13} />
                          )}
                          {ver.aiUpload?.status === "failed" ||
                          ver.aiUpload?.status === "skipped"
                            ? "Retry AI Upload"
                            : "Upload to AI"}
                        </button>
                      )}
                      <button
                        onClick={() => toggleVersion(ver.version)}
                        className="ml-2 p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer"
                        aria-label={isExpanded ? "Collapse" : "Expand"}
                      >
                        {isExpanded ? (
                          <FiChevronUp size={18} />
                        ) : (
                          <FiChevronDown size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-5 pt-1 space-y-4 border-t border-border">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FiCalendar size={14} />
                        <span>Uploaded on {formatDate(ver.uploadedAt)}</span>
                      </div>

                      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-primary/20 text-primary">
                          {ver.uploadedBy?.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase() || <FiUser size={16} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">
                            {ver.uploadedBy?.name}
                          </p>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <FiMail size={11} />
                            <span className="truncate">
                              {ver.uploadedBy?.email}
                            </span>
                          </div>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-secondary/15 text-secondary">
                          {ver.uploadedBy?.role}
                        </span>
                      </div>

                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <button
                          onClick={() => toggleHash(ver.version)}
                          className="flex items-center gap-1.5 text-xs font-medium transition-colors duration-200 text-muted-foreground cursor-pointer"
                        >
                          <FiHash size={13} />
                          {hashVisible ? "Hide" : "Show"} file hash
                        </button>
                      </div>

                      {hashVisible && (
                        <div className="p-3 rounded-lg text-xs font-mono break-all bg-muted text-muted-foreground">
                          {ver.fileHash}
                        </div>
                      )}

                      {ver.aiUpload && (
                        <>
                          {/* AI Processing Information Card */}
                          <div className="rounded-xl border border-border bg-card overflow-hidden">
                            <div className="px-4 py-3 bg-secondary/5 border-b border-border">
                              <div className="flex items-center gap-2">
                                <FiInfo size={16} className="text-secondary" />
                                <h3 className="text-sm font-bold text-foreground">
                                  AI Processing Information
                                </h3>
                              </div>
                            </div>

                            <div className="p-4 max-h-[400px] overflow-y-auto">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {/* Status & Message Card */}
                                <div className="rounded-xl border border-border bg-muted/30 overflow-hidden h-fit">
                                  <div className="px-4 py-3 bg-muted/50 border-b border-border">
                                    <div className="flex items-center justify-between">
                                      <h4 className="text-sm font-bold text-foreground">
                                        Status
                                      </h4>
                                      <span
                                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                          ver.aiUpload.status === "completed"
                                            ? "bg-green-500/15 text-green-600 dark:text-green-400"
                                            : ver.aiUpload.status === "uploaded"
                                              ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                                              : ver.aiUpload.status ===
                                                  "processing"
                                                ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                                                : ver.aiUpload.status ===
                                                    "failed"
                                                  ? "bg-red-500/15 text-red-600 dark:text-red-400"
                                                  : ver.aiUpload.status ===
                                                      "skipped"
                                                    ? "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400"
                                                    : "bg-gray-500/15 text-gray-600 dark:text-gray-400"
                                        }`}
                                      >
                                        {ver.aiUpload.status}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="p-4 space-y-3">
                                    {/* Show message only if it exists */}
                                    {ver.aiUpload.message && (
                                      <div>
                                        <p className="text-[11px] font-medium uppercase tracking-wider mb-1.5 text-muted-foreground">
                                          Message
                                        </p>
                                        <p className="text-xs text-foreground leading-relaxed">
                                          {ver.aiUpload.message}
                                        </p>
                                      </div>
                                    )}

                                    {/* Show reason for failed/skipped */}
                                    {ver.aiUpload.reason && (
                                      <div
                                        className={
                                          ver.aiUpload.message
                                            ? "pt-3 border-t border-border"
                                            : ""
                                        }
                                      >
                                        <p className="text-[11px] font-medium uppercase tracking-wider mb-1.5 text-muted-foreground">
                                          Reason
                                        </p>
                                        <p className="text-xs text-foreground leading-relaxed">
                                          {ver.aiUpload.reason}
                                        </p>
                                      </div>
                                    )}

                                    {/* Show filename for uploaded status */}
                                    {ver.aiUpload.status === "uploaded" &&
                                      ver.aiUpload.filename && (
                                        <div
                                          className={
                                            ver.aiUpload.message
                                              ? "pt-3 border-t border-border"
                                              : ""
                                          }
                                        >
                                          <p className="text-[11px] font-medium uppercase tracking-wider mb-1.5 text-muted-foreground">
                                            Filename
                                          </p>
                                          <p className="text-xs font-mono text-foreground break-all leading-relaxed">
                                            {ver.aiUpload.filename}
                                          </p>
                                        </div>
                                      )}

                                    {/* Show resourceType for uploaded status */}
                                    {ver.aiUpload.status === "uploaded" &&
                                      ver.aiUpload.resourceType && (
                                        <div className="pt-3 border-t border-border">
                                          <p className="text-[11px] font-medium uppercase tracking-wider mb-1.5 text-muted-foreground">
                                            Resource Type
                                          </p>
                                          <p className="text-xs text-foreground">
                                            {ver.aiUpload.resourceType}
                                          </p>
                                        </div>
                                      )}

                                    {/* Always show timestamp */}
                                    {ver.aiUpload.timestamp && (
                                      <div className="pt-3 border-t border-border">
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

                                    {/* Show extraction_reused only for completed status */}
                                    {ver.aiUpload.status === "completed" &&
                                      ver.aiUpload.extraction_reused !==
                                        undefined && (
                                        <div className="pt-3 border-t border-border">
                                          <div className="flex items-center justify-between">
                                            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                                              Extraction Reused
                                            </p>
                                            <span
                                              className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                                ver.aiUpload.extraction_reused
                                                  ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                                                  : "bg-gray-500/15 text-gray-600 dark:text-gray-400"
                                              }`}
                                            >
                                              {ver.aiUpload.extraction_reused
                                                ? "Yes"
                                                : "No"}
                                            </span>
                                          </div>
                                        </div>
                                      )}
                                  </div>
                                </div>

                                {/* IDs Card - Only show if uuid or job_id exists */}
                                {(ver.aiUpload.uuid || ver.aiUpload.job_id) && (
                                  <div className="rounded-xl border border-border bg-muted/30 overflow-hidden h-fit">
                                    <div className="px-4 py-3 bg-muted/50 border-b border-border">
                                      <h4 className="text-sm font-bold text-foreground">
                                        Identifiers
                                      </h4>
                                    </div>
                                    <div className="p-4 space-y-3">
                                      {ver.aiUpload.uuid && (
                                        <div>
                                          <p className="text-[11px] font-medium uppercase tracking-wider mb-1.5 text-muted-foreground">
                                            UUID
                                          </p>
                                          <p className="text-xs font-mono text-foreground break-all leading-relaxed">
                                            {ver.aiUpload.uuid}
                                          </p>
                                        </div>
                                      )}
                                      {ver.aiUpload.job_id && (
                                        <div
                                          className={
                                            ver.aiUpload.uuid
                                              ? "pt-3 border-t border-border"
                                              : ""
                                          }
                                        >
                                          <p className="text-[11px] font-medium uppercase tracking-wider mb-1.5 text-muted-foreground">
                                            Job ID
                                          </p>
                                          <p className="text-xs font-mono text-foreground break-all leading-relaxed">
                                            {ver.aiUpload.job_id}
                                          </p>
                                        </div>
                                      )}
                                      {ver.aiUpload.original_uuid && (
                                        <div className="pt-3 border-t border-border">
                                          <p className="text-[11px] font-medium uppercase tracking-wider mb-1.5 text-muted-foreground">
                                            Original UUID
                                          </p>
                                          <p className="text-xs font-mono text-foreground break-all leading-relaxed">
                                            {ver.aiUpload.original_uuid}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Status History Card */}
                                {ver.aiUpload.status_history && (
                                  <div className="rounded-xl border border-border bg-muted/30 overflow-hidden lg:col-span-2 h-fit">
                                    <div className="px-4 py-3 bg-muted/50 border-b border-border">
                                      <div className="flex items-center gap-2">
                                        <FiActivity
                                          size={14}
                                          className="text-primary"
                                        />
                                        <h4 className="text-sm font-bold text-foreground">
                                          Status History
                                        </h4>
                                      </div>
                                    </div>
                                    <div className="p-4 space-y-3">
                                      {/* Processing Time */}
                                      {ver.aiUpload.status_history
                                        .processing_time_seconds !==
                                        undefined && (
                                        <div>
                                          <p className="text-[11px] font-medium uppercase tracking-wider mb-1.5 text-muted-foreground">
                                            Processing Time
                                          </p>
                                          <p className="text-xs text-foreground">
                                            <span className="font-semibold">
                                              {
                                                ver.aiUpload.status_history
                                                  .processing_time_seconds
                                              }{" "}
                                              seconds
                                            </span>
                                          </p>
                                        </div>
                                      )}

                                      {/* Completed At */}
                                      {ver.aiUpload.status_history
                                        .completed_at && (
                                        <div className="pt-3 border-t border-border">
                                          <p className="text-[11px] font-medium uppercase tracking-wider mb-1.5 text-muted-foreground">
                                            Completed At
                                          </p>
                                          <p className="text-xs text-foreground">
                                            {new Date(
                                              ver.aiUpload.status_history
                                                .completed_at,
                                            ).toLocaleString()}
                                          </p>
                                        </div>
                                      )}

                                      {/* History Timeline */}
                                      {ver.aiUpload.status_history.history &&
                                        ver.aiUpload.status_history.history
                                          .length > 0 && (
                                          <div className="pt-3 border-t border-border">
                                            <p className="text-[11px] font-medium uppercase tracking-wider mb-2 text-muted-foreground">
                                              Timeline
                                            </p>
                                            <div className="space-y-2">
                                              {ver.aiUpload.status_history.history.map(
                                                (item, idx) => (
                                                  <div
                                                    key={idx}
                                                    className="flex items-start gap-2 text-xs"
                                                  >
                                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/15 text-primary flex items-center justify-center text-[10px] font-bold mt-0.5">
                                                      {idx + 1}
                                                    </span>
                                                    <div className="flex-1">
                                                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-secondary/15 text-secondary">
                                                          {item.status}
                                                        </span>
                                                        <span className="text-muted-foreground">
                                                          {new Date(
                                                            item.timestamp,
                                                          ).toLocaleString()}
                                                        </span>
                                                      </div>
                                                      {item.message && (
                                                        <p className="text-foreground leading-relaxed">
                                                          {item.message}
                                                        </p>
                                                      )}
                                                    </div>
                                                  </div>
                                                ),
                                              )}
                                            </div>
                                          </div>
                                        )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* AI Extracted Controls - Only show if controls exist */}
                          {ver.aiUpload.controls && (
                            <div className="mt-4 rounded-xl border border-border bg-card overflow-hidden">
                              <div className="px-4 py-3 bg-primary/5 border-b border-border flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <FiShield
                                    size={16}
                                    className="text-primary"
                                  />
                                  <h3 className="text-sm font-bold text-foreground">
                                    AI Extracted Controls
                                  </h3>
                                </div>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/15 text-primary">
                                  {ver.aiUpload.controls.total_controls}{" "}
                                  Controls
                                </span>
                              </div>

                              <div className="p-4 max-h-[500px] overflow-y-auto">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                  {/* Individual Control Cards */}
                                  {ver.aiUpload.controls.controls_data?.map(
                                    (control, idx) => (
                                      <div
                                        key={idx}
                                        className="rounded-xl border border-border bg-muted/30 overflow-hidden hover:shadow-md transition-shadow h-fit"
                                      >
                                        <div className="px-4 py-3 bg-muted/50 border-b border-border">
                                          <div className="flex items-center gap-3">
                                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center text-sm font-bold">
                                              {control.Control_id}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                              <h4 className="text-sm font-bold text-foreground">
                                                {control.Control_name}
                                              </h4>
                                            </div>
                                            <span className="flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-secondary/15 text-secondary">
                                              {control.Control_type}
                                            </span>
                                          </div>
                                        </div>

                                        <div className="p-4 space-y-3">
                                          {/* Description */}
                                          <div>
                                            <p className="text-[11px] font-medium uppercase tracking-wider mb-1.5 text-muted-foreground">
                                              Description
                                            </p>
                                            <p className="text-xs text-foreground leading-relaxed">
                                              {control.Control_description}
                                            </p>
                                          </div>

                                          {/* Deployment Points */}
                                          <div className="pt-3 border-t border-border">
                                            <p className="text-[11px] font-medium uppercase tracking-wider mb-2 text-muted-foreground">
                                              Deployment Points
                                            </p>
                                            <ol className="text-xs text-foreground leading-relaxed space-y-1.5 list-decimal list-inside">
                                              {control.Deployment_points.split(
                                                /\d+\.\s+/,
                                              )
                                                .filter((point) => point.trim())
                                                .map((point, i) => (
                                                  <li key={i} className="pl-1">
                                                    {point.trim()}
                                                  </li>
                                                ))}
                                            </ol>
                                          </div>
                                        </div>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Delete Version Modal */}
      {deleteModalOpen && versionToDelete && (
        <DeleteVersionModal
          version={versionToDelete}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}

      {/* Approve Framework Modal */}
      {approveModalOpen && (
        <ApproveFrameworkModal
          framework={framework}
          onConfirm={handleApproveConfirm}
          onCancel={handleApproveCancel}
        />
      )}

      {/* Reject Framework Modal */}
      {rejectModalOpen && (
        <RejectFrameworkModal
          framework={framework}
          onConfirm={handleRejectConfirm}
          onCancel={handleRejectCancel}
        />
      )}

      {/* Update Framework Modal */}
      {updateModalOpen && (
        <UpdateFrameworkModal
          isOpen={updateModalOpen}
          onClose={handleUpdateCancel}
          onSuccess={handleUpdateSuccess}
          framework={framework}
        />
      )}
    </div>
  );
}

export default OfficialFrameworkDetail;
