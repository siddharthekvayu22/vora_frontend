import Icon from "../../../components/Icon";
import { downloadDocument } from "../../../services/documentService";
import toast from "react-hot-toast";

function DocumentViewModal({ isOpen, onClose, document, loading = false }) {
  if (!isOpen || !document) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      return "Invalid Date";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            Document Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <Icon name="close" size="20px" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading ? (
            /* Loading State */
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-muted-foreground">Loading document details...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Document Info */}
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                  <Icon name="file" size="32px" className="text-blue-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">
                    {document.documentName || document.originalFileName}
                  </h3>
                  <p className="text-muted-foreground">
                    {document.documentType?.toUpperCase()} • {document.fileSize}
                  </p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Original File Name */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">
                    Original File Name
                  </label>
                  <p className="text-foreground font-medium">
                    {document.originalFileName || "Not available"}
                  </p>
                </div>

                {/* Document Type */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">
                    Document Type
                  </label>
                  <p className="text-foreground font-medium">
                    {document.documentType?.toUpperCase() || "Not available"}
                  </p>
                </div>

                {/* File Size */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">
                    File Size
                  </label>
                  <p className="text-foreground font-medium">
                    {document.fileSize || "Not available"}
                  </p>
                </div>

                {/* Upload Date */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">
                    Upload Date
                  </label>
                  <p className="text-foreground font-medium">
                    {document.createdAt ? formatDate(document.createdAt) : "Not available"}
                  </p>
                </div>

                {/* Last Modified */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">
                    Last Modified
                  </label>
                  <p className="text-foreground font-medium">
                    {document.updatedAt ? formatDate(document.updatedAt) : "Not available"}
                  </p>
                </div>
              </div>

              {/* Uploaded By */}
              {document.uploadedBy && (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-muted-foreground">
                    Uploaded By
                  </label>
                  <div className="flex items-center gap-3 p-3 border border-border rounded-lg bg-muted/50">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                      <Icon name="user" size="18px" className="text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {document.uploadedBy.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {document.uploadedBy.email}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {document.uploadedBy.role}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={async () => {
                    try {
                      const documentId = document.id || document._id;
                      await downloadDocument(documentId);
                      toast.success("Download started");
                    } catch (error) {
                      console.error("Download error:", error);
                      toast.error("Failed to download document");
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  disabled={loading}
                >
                  <Icon name="download" size="16px" />
                  Download
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default DocumentViewModal;