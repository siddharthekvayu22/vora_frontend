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
  FiAlertCircle,
  FiLoader,
  FiTag,
  FiClock,
  FiMail,
  FiInfo,
  FiActivity,
} from "react-icons/fi";
import Icon from "../../components/Icon";
import {
  downloadOfficialFrameworkFile,
  getOfficialFrameworkById,
  uploadOfficialFrameworkToAi,
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
  const [uploadingToAi, setUploadingToAi] = useState(false);
  const [expandedVersions, setExpandedVersions] = useState(new Set());
  const [showHash, setShowHash] = useState(new Set());

  useEffect(() => {
    fetchFrameworkDetails();
  }, [id]);

  const fetchFrameworkDetails = async () => {
    try {
      setLoading(true);
      const response = await getOfficialFrameworkById(id);
      if (response.success) {
        setFramework(response.data.framework);
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch framework details");
      navigate("/official-frameworks");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      await downloadOfficialFrameworkFile(fileId, fileName);
      toast.success("Download started");
    } catch (error) {
      toast.error(error.message || "Failed to download file");
    }
  };

  const handleUploadToAi = async (versionFileId) => {
    try {
      setUploadingToAi(true);
      const response = await uploadOfficialFrameworkToAi(versionFileId);
      if (response.success) {
        toast.success(response.message || "File uploaded to AI successfully");
        fetchFrameworkDetails();
      }
    } catch (error) {
      toast.error(error.message || "Failed to upload to AI");
    } finally {
      setUploadingToAi(false);
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

  return (
    <div className="min-h-screen bg-background text-foreground my-5">
      <div className="space-y-6">
        {/* ===== FRAMEWORK OVERVIEW CARD ===== */}
        <div className="rounded-2xl overflow-hidden transition-shadow duration-300 hover:shadow-xl bg-card border border-border">
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
          </div>
        </div>

        {/* ===== FILE VERSIONS ===== */}
        <div>
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className=" flex items-center gap-3">
              <h2 className="text-xl font-bold">File Versions</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/15 text-primary">
                {framework.fileVersions?.length || 0}
              </span>
            </div>
            {currentVersionData && (
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() =>
                    handleDownload(
                      currentVersionData.fileId,
                      currentVersionData.originalFileName,
                    )
                  }
                  className="flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-semibold transition-all duration-300 hover:bg-primary/80 bg-primary text-primary-foreground cursor-pointer"
                >
                  <FiDownload size={16} />
                  Download Current Version
                </button>
                {currentVersionData.aiUpload?.status !== "completed" && (
                  <button
                    onClick={() => handleUploadToAi(currentVersionData.fileId)}
                    disabled={uploadingToAi}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-semibold transition-all duration-300 hover:bg-secondary/80 bg-secondary text-secondary-foreground cursor-pointer disabled:cursor-not-allowed"
                  >
                    {uploadingToAi ? (
                      <FiLoader size={16} className="animate-spin" />
                    ) : (
                      <FiUploadCloud size={16} />
                    )}
                    Upload Current Version to AI
                  </button>
                )}
              </div>
            )}
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
                  <button
                    onClick={() => toggleVersion(ver.version)}
                    className="w-full flex items-center justify-between p-4 text-left transition-colors duration-200 text-foreground cursor-pointer"
                  >
                    <div className="flex items-center gap-3 flex-wrap">
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
                    {isExpanded ? (
                      <FiChevronUp size={18} />
                    ) : (
                      <FiChevronDown size={18} />
                    )}
                  </button>

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

                      {ver.aiUpload?.status !== "completed" && (
                        <div className="flex items-center justify-between p-3 rounded-xl bg-muted">
                          <div className="flex items-center gap-2 text-sm">
                            <>
                              <FiAlertCircle
                                size={16}
                                className="text-secondary"
                              />
                              <span className="font-medium text-secondary">
                                Not uploaded to AI
                              </span>
                            </>
                          </div>
                          <button
                            onClick={() => handleUploadToAi(ver.fileId)}
                            disabled={uploadingToAi}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-300 hover:bg-secondary/80 disabled:opacity-50 bg-secondary text-secondary-foreground cursor-pointer disabled:cursor-not-allowed"
                          >
                            {uploadingToAi ? (
                              <FiLoader size={13} className="animate-spin" />
                            ) : (
                              <FiUploadCloud size={13} />
                            )}
                            Upload to AI
                          </button>
                        </div>
                      )}

                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <button
                          onClick={() =>
                            handleDownload(ver.fileId, ver.originalFileName)
                          }
                          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 hover:bg-primary/80 bg-primary text-primary-foreground cursor-pointer"
                        >
                          <FiDownload size={15} />
                          Download
                        </button>

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

                      {ver.aiUpload && ver.aiUpload.controls && (
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

                            <div className="p-2 space-y-3 flex justify-between gap-5">
                              {/* UUID and Job ID */}
                              <div className="flex-1">
                                <div className="rounded-xl border border-border bg-muted p-4 space-y-3">
                                  {/* Status + badge */}
                                  <div className="flex items-center justify-between">
                                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                                      Status
                                    </p>
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-500/15 text-green-600 dark:text-green-400">
                                      {ver.aiUpload.status}
                                    </span>
                                  </div>

                                  {/* Message */}
                                  <p className="text-xs text-foreground">
                                    {ver.aiUpload.message}
                                  </p>

                                  {/* IDs */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                    <div>
                                      <p className="text-[11px] font-medium uppercase tracking-wider mb-1 text-muted-foreground">
                                        UUID
                                      </p>
                                      <p className="text-xs font-mono text-foreground break-all">
                                        {ver.aiUpload.uuid}
                                      </p>
                                    </div>

                                    <div>
                                      <p className="text-[11px] font-medium uppercase tracking-wider mb-1 text-muted-foreground">
                                        Job ID
                                      </p>
                                      <p className="text-xs font-mono text-foreground break-all">
                                        {ver.aiUpload.job_id}
                                      </p>
                                    </div>

                                    {ver.aiUpload.original_uuid && (
                                      <div className="sm:col-span-2">
                                        <p className="text-[11px] font-medium uppercase tracking-wider mb-1 text-muted-foreground">
                                          Original UUID
                                        </p>
                                        <p className="text-xs font-mono text-foreground break-all">
                                          {ver.aiUpload.original_uuid}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Status History */}
                              {ver.aiUpload.status_history && (
                                <div className="p-3 rounded-lg bg-muted flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <FiActivity
                                      size={14}
                                      className="text-primary"
                                    />
                                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                                      Status History
                                    </p>
                                  </div>

                                  {/* Processing Time */}
                                  {ver.aiUpload.status_history
                                    .processing_time_seconds !== undefined && (
                                    <div className="mb-2 pb-2 border-b border-border">
                                      <p className="text-xs text-muted-foreground">
                                        Processing Time:{" "}
                                        <span className="font-semibold text-foreground">
                                          {
                                            ver.aiUpload.status_history
                                              .processing_time_seconds
                                          }{" "}
                                          seconds
                                        </span>
                                      </p>
                                    </div>
                                  )}

                                  {/* History Timeline */}
                                  {ver.aiUpload.status_history.history &&
                                    ver.aiUpload.status_history.history.length >
                                      0 && (
                                      <div className="space-y-2">
                                        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                                          Timeline
                                        </p>
                                        <div className="space-y-2">
                                          {ver.aiUpload.status_history.history.map(
                                            (item, idx) => (
                                              <div
                                                key={idx}
                                                className="flex items-start gap-2 text-xs"
                                              >
                                                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/15 text-primary flex items-center justify-center text-[10px] font-bold mt-0.5">
                                                  {idx + 1}
                                                </span>
                                                <div className="flex-1">
                                                  <div className="flex items-center gap-2 mb-0.5">
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
                                                    <p className="text-muted-foreground">
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
                              )}
                            </div>
                          </div>

                          <div className="mt-4 rounded-xl border border-border bg-card overflow-hidden">
                            <div className="px-4 py-3 bg-primary/5 border-b border-border flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <FiShield size={16} className="text-primary" />
                                <h3 className="text-sm font-bold text-foreground">
                                  AI Extracted Controls
                                </h3>
                              </div>
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/15 text-primary">
                                {ver.aiUpload.controls.total_controls} Controls
                              </span>
                            </div>

                            <div className="p-2 h-[500px] overflow-y-auto">
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
    </div>
  );
}

export default OfficialFrameworkDetail;
