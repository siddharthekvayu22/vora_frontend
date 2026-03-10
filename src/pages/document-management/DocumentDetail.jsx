import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Icon from "../../components/Icon";
import DeleteVersionModal from "./components/DeleteVersionModal";
import UpdateCompanyDocumentModal from "./components/UpdateCompanyDocumentModal";
import {
  downloadCompanyDocumentFile,
  getCompanyDocumentById,
  deleteCompanyDocumentVersion,
  uploadCompanyDocumentToAi,
} from "../../services/companyDocumentService";
import { formatDate } from "../../utils/dateFormatter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/useAuth";
import FileIcon from "./components/custom/FileIcon";
import InfoItem from "./components/custom/InfoItem";

// ========== CUSTOM HOOK FOR POLLING ==========
const useStatusPolling = (document, setDocument, id) => {
  const pollingRef = useRef(null);
  const isActiveRef = useRef(true);

  useEffect(() => {
    const aiStatus = document?.fileVersions?.[0]?.aiUpload?.status;

    const shouldPollAI = aiStatus === "uploaded" || aiStatus === "processing";
    const isCorrectPage = window.location.pathname.includes(`/documents/${id}`);

    if (!document?.fileVersions?.length || !shouldPollAI || !isCorrectPage) {
      return;
    }

    let pollCount = 0;
    const delays = [5000, 10000, 20000, 40000, 60000];

    const poll = () => {
      const delay = delays[Math.min(pollCount, delays.length - 1)];

      pollingRef.current = setTimeout(async () => {
        if (
          !isActiveRef.current ||
          !window.location.pathname.includes(`/documents/${id}`)
        ) {
          return;
        }

        try {
          const response = await getCompanyDocumentById(id, {
            params: { _t: Date.now() },
          });

          if (response.success && isActiveRef.current) {
            const newDocument = response.data.document;
            const newAIStatus =
              newDocument?.fileVersions?.[0]?.aiUpload?.status;

            setDocument(newDocument);
            pollCount++;

            const continuePollingAI =
              newAIStatus === "uploaded" || newAIStatus === "processing";

            if (continuePollingAI) {
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
  }, [document?.fileVersions, id, setDocument]);
};

// ========== MAIN COMPONENT ==========
function DocumentDetail() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [versionToDelete, setVersionToDelete] = useState(null);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [expandedVersions, setExpandedVersions] = useState(new Set());
  const [showHash, setShowHash] = useState(new Set());

  // Use status polling hook
  useStatusPolling(document, setDocument, id);

  // Fetch document details
  const fetchDocumentDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getCompanyDocumentById(id, {
        params: { _t: Date.now() },
      });

      if (response.success) {
        setDocument(response.data.document);
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch document details");
      navigate("/documents");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchDocumentDetails();
  }, [fetchDocumentDetails]);

  useEffect(() => {
    if (document?.fileVersions?.length && document?.currentVersion) {
      // Only expand the current version by default
      setExpandedVersions(new Set([document.currentVersion]));
    }
  }, [document?.fileVersions, document?.currentVersion]);

  // ========== HANDLERS ==========
  const handleDownload = async (fileId, fileName) => {
    try {
      await downloadCompanyDocumentFile(fileId, fileName);
      toast.success("Download completed successfully");
    } catch (error) {
      toast.error(error.message || "Failed to download file");
    }
  };

  const handleDeleteVersion = (version) => {
    setVersionToDelete(version);
  };

  const handleDeleteConfirm = async () => {
    if (!versionToDelete) return;
    try {
      const response = await deleteCompanyDocumentVersion(
        document.mainFileId,
        versionToDelete.fileId,
      );
      if (response.success) {
        toast.success(response.message || "Version deleted successfully");
        await fetchDocumentDetails();
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

  const handleUploadToAi = async (fileId) => {
    try {
      const result = await uploadCompanyDocumentToAi(fileId);
      // toast.success(result.message || "Document uploaded to AI successfully");
      fetchDocumentDetails(true);
    } catch (error) {
      toast.error(error.message || "Failed to upload to AI");
      fetchDocumentDetails(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-primary border-r-secondary" />
          <p className="text-sm font-medium text-muted-foreground">
            Loading document details...
          </p>
        </div>
      </div>
    );
  }

  if (!document) return null;

  // Check if AI is processing 
  const isAIProcessing = ["uploaded", "processing"].includes(
    document.fileVersions?.[0]?.aiUpload?.status,
  );

  return (
    <div className="min-h-screen bg-background text-foreground my-5">
      <div className="space-y-6">
        {/* AI Processing Indicator */}
        {isAIProcessing && (
          <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded shadow-lg backdrop-blur-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
              Monitoring AI status...
            </span>
          </div>
        )}
        {/* Document Overview Card */}
        <div className="rounded overflow-hidden bg-card border border-border">
          <div className="h-1 bg-linear-to-r from-primary to-secondary" />
          <div className="p-6">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded bg-primary/12 text-primary">
                  <Icon name="file" size="22px" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">{document.documentName}</h2>
                  <p className="text-xs text-muted-foreground">
                    Document Overview
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={() => setUpdateModalOpen(true)}>
                  <Icon name="edit" size="16px" /> Update Document
                </Button>
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
                    v{document.currentVersion}
                  </span>
                }
              />
              <InfoItem
                icon={<Icon name="calendar" size="15px" />}
                label="Created"
                value={
                  <span className="text-sm font-medium">
                    {formatDate(document.createdAt)}
                  </span>
                }
              />
              <InfoItem
                icon={<Icon name="clock" size="15px" />}
                label="Updated"
                value={
                  <span className="text-sm font-medium">
                    {formatDate(document.updatedAt)}
                  </span>
                }
              />
              <InfoItem
                icon={<Icon name="tag" size="15px" />}
                label="Document ID"
                value={
                  <span className="text-xs font-mono px-2 py-1 rounded bg-muted text-muted-foreground">
                    {document.id}
                  </span>
                }
              />
              <InfoItem
                icon={<Icon name="tag" size="15px" />}
                label="File Object Id"
                value={
                  <span className="text-xs font-mono px-2 py-1 rounded bg-muted text-muted-foreground">
                    {document.mainFileId}
                  </span>
                }
              />
              <InfoItem
                icon={<Icon name="tag" size="15px" />}
                label="Current File Id"
                value={
                  <span className="text-xs font-mono px-2 py-1 rounded bg-muted text-muted-foreground">
                    {
                      document.fileVersions.find(
                        (v) => v.version === document.currentVersion,
                      )?.fileId
                    }
                  </span>
                }
              />
              <InfoItem
                icon={<Icon name="upload-cloud" size="15px" />}
                label="AI Extraction"
                value={
                  document.fileVersions?.[0]?.aiUpload ? (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        document.fileVersions[0].aiUpload.status === "completed"
                          ? "bg-green-500/15 text-green-600"
                          : document.fileVersions[0].aiUpload.status ===
                                "uploaded" ||
                              document.fileVersions[0].aiUpload.status ===
                                "processing"
                            ? "bg-blue-500/15 text-blue-600"
                            : document.fileVersions[0].aiUpload.status ===
                                "failed"
                              ? "bg-red-500/15 text-red-600"
                              : "bg-yellow-500/15 text-yellow-600"
                      }`}
                    >
                      {document.fileVersions[0].aiUpload.status}
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-500/15 text-gray-600">
                      Not Uploaded
                    </span>
                  )
                }
              />
            </div>
          </div>
        </div>

        {/* File Versions */}
        <div>
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-xl font-bold">File Versions</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/15 text-primary">
              {document.fileVersions?.length || 0} files
            </span>
          </div>

          <div className="space-y-3">
            {document.fileVersions?.map((ver) => {
              const isCurrent = ver.version === document.currentVersion;
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
                        <FileIcon type={ver.documentType} />
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

                      {/* AI Upload Button */}
                      {(user.role === "company" || user.role === "user") &&
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

                      {!isCurrent && document.fileVersions.length > 1 && (
                        <Button
                          variant="destructive"
                          onClick={() => handleDeleteVersion(ver)}
                        >
                          <Icon name="trash" size="15px" /> Delete
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
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleHash(ver.version)}
                        >
                          <Icon name="tag" size="13px" />
                          {hashVisible ? "Hide" : "Show"} file hash
                        </Button>
                        {hashVisible && (
                          <div className="px-2 py-2 rounded text-xs font-mono break-all bg-muted text-muted-foreground">
                            {ver.fileHash}
                          </div>
                        )}
                      </div>

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

                                  {/* Show filename for uploaded status */}
                                  {ver.aiUpload.status === "uploaded" &&
                                    ver.aiUpload.filename && (
                                      <div
                                        className={
                                          ver.aiUpload.message
                                            ? "pt-2 border-t border-border"
                                            : ""
                                        }
                                      >
                                        <p className="text-[11px] font-medium uppercase tracking-wider mb-1.5 text-muted-foreground">
                                          Filename
                                        </p>
                                        <p className="text-xs font-mono text-foreground break-all">
                                          {ver.aiUpload.filename}
                                        </p>
                                      </div>
                                    )}

                                  {/* Show resourceType for uploaded status */}
                                  {ver.aiUpload.status === "uploaded" &&
                                    ver.aiUpload.resourceType && (
                                      <div className="pt-2 border-t border-border">
                                        <p className="text-[11px] font-medium uppercase tracking-wider mb-1.5 text-muted-foreground">
                                          Resource Type
                                        </p>
                                        <p className="text-xs text-foreground">
                                          {ver.aiUpload.resourceType}
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

                                  {/* Show duplicate information if applicable */}
                                  {ver.aiUpload.is_duplicate && (
                                    <div className="pt-2 border-t border-border">
                                      <p className="text-[11px] font-medium uppercase tracking-wider mb-1.5 text-muted-foreground">
                                        Duplicate Detection
                                      </p>
                                      <div className="flex items-center gap-2">
                                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-600">
                                          Duplicate Detected
                                        </span>
                                      </div>
                                      {ver.aiUpload.duplicate_of_uuid && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                          Reusing extraction from:{" "}
                                          {ver.aiUpload.duplicate_of_uuid}
                                        </p>
                                      )}
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
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modals */}
      {versionToDelete && (
        <DeleteVersionModal
          version={versionToDelete}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setVersionToDelete(null)}
        />
      )}

      {updateModalOpen && (
        <UpdateCompanyDocumentModal
          isOpen={updateModalOpen}
          onClose={() => setUpdateModalOpen(false)}
          onSuccess={() => {
            fetchDocumentDetails();
            setUpdateModalOpen(false);
          }}
          document={document}
        />
      )}
    </div>
  );
}

export default DocumentDetail;
