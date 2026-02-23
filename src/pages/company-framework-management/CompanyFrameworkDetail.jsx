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
  FiEdit,
  FiGitMerge,
} from "react-icons/fi";
import Icon from "../../components/Icon";
import DeleteVersionModal from "./components/DeleteVersionModal";
import UpdateCompanyFrameworkModal from "./components/UpdateCompanyFrameworkModal";
import CompareFrameworkModal from "./components/CompareFrameworkModal";
import {
  downloadCompanyFrameworkFile,
  getCompanyFrameworkById,
  uploadCompanyFrameworkToAi,
  deleteCompanyFrameworkVersion,
  compareFrameworks,
} from "../../services/companyFrameworkService";
import { formatDate } from "../../utils/dateFormatter";
import { Button } from "@/components/ui/button";

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

function CompanyFrameworkDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [framework, setFramework] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(false);
  const [uploadingToAi, setUploadingToAi] = useState(new Set());
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [versionToDelete, setVersionToDelete] = useState(null);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [expandedVersions, setExpandedVersions] = useState(new Set());
  const [showHash, setShowHash] = useState(new Set());
  const [comparingFrameworks, setComparingFrameworks] = useState(new Set());
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [selectedVersionForCompare, setSelectedVersionForCompare] =
    useState(null);

  useEffect(() => {
    fetchFrameworkDetails(false);
  }, [id]);

  useEffect(() => {
    if (framework?.fileVersions?.length) {
      setExpandedVersions(
        new Set(framework.fileVersions.map((v) => v.version)),
      );
    }
  }, [framework?.fileVersions?.length]);

  useEffect(() => {
    const isOnDetailPage = window.location.pathname.includes(
      `/company-frameworks/${id}`,
    );
    if (!isOnDetailPage) {
      return;
    }

    if (!framework?.fileVersions?.length) return;

    const currentVersion = framework.fileVersions[0];
    const status = currentVersion?.aiUpload?.status;

    if (status !== "uploaded" && status !== "processing") {
      return;
    }

    let pollCount = 0;
    let timeoutId = null;

    const getNextPollDelay = (count) => {
      const delays = [5000, 10000, 20000, 40000, 60000];
      return delays[Math.min(count, delays.length - 1)];
    };

    const pollForStatus = () => {
      const delay = getNextPollDelay(pollCount);

      timeoutId = setTimeout(async () => {
        const stillOnPage = window.location.pathname.includes(
          `/company-frameworks/${id}`,
        );
        if (!stillOnPage) {
          console.log("User left detail page, stopping polling");
          return;
        }

        await fetchFrameworkDetails(true);
        pollCount++;

        const updatedStatus = framework?.fileVersions?.[0]?.aiUpload?.status;
        if (updatedStatus === "uploaded" || updatedStatus === "processing") {
          pollForStatus();
        }
      }, delay);
    };

    pollForStatus();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [framework?.fileVersions?.[0]?.aiUpload?.status, id]);

  const fetchFrameworkDetails = async (isBackgroundRefresh = false) => {
    try {
      if (!isBackgroundRefresh) {
        setLoading(true);
      } else {
        setIsPolling(true);
      }
      const response = await getCompanyFrameworkById(id);
      if (response.success) {
        setFramework(response.data.framework);
      }
    } catch (error) {
      if (!isBackgroundRefresh) {
        toast.error(error.message || "Failed to fetch framework details");
        navigate("/company-frameworks");
      }
    } finally {
      setLoading(false);
      setIsPolling(false);
    }
  };

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
      setUploadingToAi((prev) => new Set(prev).add(versionFileId));

      const response = await uploadCompanyFrameworkToAi(versionFileId);
      toast.success(response.message || "File uploaded to AI successfully");
      fetchFrameworkDetails(true);
    } catch (error) {
      toast.error(error.message || "Failed to upload to AI");
      fetchFrameworkDetails(true);
    } finally {
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
      const response = await deleteCompanyFrameworkVersion(
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
      throw error;
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setVersionToDelete(null);
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

  const handleCompare = (version) => {
    setSelectedVersionForCompare(version);
    setCompareModalOpen(true);
  };

  const handleCompareModalClose = () => {
    setCompareModalOpen(false);
    setSelectedVersionForCompare(null);
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

  const isAIProcessing =
    framework.fileVersions?.[0]?.aiUpload?.status === "uploaded" ||
    framework.fileVersions?.[0]?.aiUpload?.status === "processing";

  return (
    <div className="min-h-screen bg-background text-foreground my-5">
      <div className="space-y-6">
        {isAIProcessing && (
          <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg shadow-lg backdrop-blur-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
              {isPolling ? "Checking AI status..." : "Monitoring AI status..."}
            </span>
          </div>
        )}

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
                <Button onClick={handleUpdate}>
                  <FiEdit size={16} />
                  Update Framework
                </Button>
                <Button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2"
                >
                  <FiArrowLeft size={20} /> Back
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                label="File Object Id"
                value={
                  <span className="text-xs font-mono px-2 py-1 rounded-md bg-muted text-muted-foreground">
                    {framework.mainFileId}
                  </span>
                }
              />
            </div>
          </div>
        </div>

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
                      <Button
                        onClick={() =>
                          handleDownload(ver.fileId, ver.originalFileName)
                        }
                        className="flex items-center gap-2"
                      >
                        <FiDownload size={15} />
                        Download
                      </Button>

                      {ver.aiUpload?.status === "completed" &&
                        ver.aiUpload?.job_id && (
                          <Button
                            variant="secondary"
                            onClick={() => handleCompare(ver)}
                            className="flex items-center gap-2"
                          >
                            <FiGitMerge size={13} />
                            Compare
                          </Button>
                        )}

                      {!isCurrent && framework.fileVersions.length > 1 && (
                        <Button
                          variant="destructive"
                          onClick={() => handleDeleteVersion(ver)}
                          className="flex items-center gap-2"
                        >
                          <FiTrash size={15} />
                          Delete
                        </Button>
                      )}

                      {(!ver.aiUpload ||
                        (ver.aiUpload.status !== "completed" &&
                          ver.aiUpload.status !== "uploaded" &&
                          ver.aiUpload.status !== "processing")) && (
                        <Button
                          variant="secondary"
                          onClick={() => handleUploadToAi(ver.fileId)}
                          disabled={uploadingToAi.has(ver.fileId)}
                          className="flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleVersion(ver.version)}
                        className="ml-2"
                        aria-label={isExpanded ? "Collapse" : "Expand"}
                      >
                        {isExpanded ? (
                          <FiChevronUp size={18} />
                        ) : (
                          <FiChevronDown size={18} />
                        )}
                      </Button>
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleHash(ver.version)}
                          className="flex items-center gap-1.5"
                        >
                          <FiHash size={13} />
                          {hashVisible ? "Hide" : "Show"} file hash
                        </Button>
                      </div>

                      {hashVisible && (
                        <div className="p-3 rounded-lg text-xs font-mono break-all bg-muted text-muted-foreground">
                          {ver.fileHash}
                        </div>
                      )}

                      {ver.aiUpload && (
                        <>
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
                                  <div className="p-3 space-y-2">
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

                                    {ver.aiUpload.reason && (
                                      <div
                                        className={
                                          ver.aiUpload.message
                                            ? "pt-2 border-t border-border"
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
                              </div>
                            </div>
                          </div>
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

      {deleteModalOpen && versionToDelete && (
        <DeleteVersionModal
          version={versionToDelete}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}

      {updateModalOpen && (
        <UpdateCompanyFrameworkModal
          isOpen={updateModalOpen}
          onClose={handleUpdateCancel}
          onSuccess={handleUpdateSuccess}
          framework={framework}
        />
      )}

      {compareModalOpen && selectedVersionForCompare && (
        <CompareFrameworkModal
          isOpen={compareModalOpen}
          onClose={handleCompareModalClose}
          companyFramework={{
            ...framework,
            frameworkName: framework.frameworkName,
            aiUpload: selectedVersionForCompare.aiUpload,
          }}
        />
      )}
    </div>
  );
}

export default CompanyFrameworkDetail;
