import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Icon from "../../components/Icon";
import DeleteVersionModal from "./components/DeleteVersionModal";
import UpdateCompanyDocumentModal from "./components/UpdateCompanyDocumentModal";
import {
  downloadCompanyDocumentFile,
  getCompanyDocumentById,
  deleteCompanyDocumentVersion,
} from "../../services/companyDocumentService";
import { formatDate } from "../../utils/dateFormatter";
import { Button } from "@/components/ui/button";

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

// ========== MAIN COMPONENT ==========
function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [versionToDelete, setVersionToDelete] = useState(null);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [expandedVersions, setExpandedVersions] = useState(new Set());
  const [showHash, setShowHash] = useState(new Set());

  // Fetch document details
  const fetchDocumentDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getCompanyDocumentById(id, {
        params: { _t: Date.now() },
      });

      if (response.success) setDocument(response.data.document);
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
    if (document?.fileVersions?.length) {
      setExpandedVersions(new Set(document.fileVersions.map((v) => v.version)));
    }
  }, [document?.fileVersions]);

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

  return (
    <div className="min-h-screen bg-background text-foreground my-5">
      <div className="space-y-6">
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
