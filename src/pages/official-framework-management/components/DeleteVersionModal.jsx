import { useState } from "react";
import Icon from "../../../components/Icon";

/**
 * DeleteVersionModal Component - Confirmation dialog for deleting a file version
 *
 * @param {Object} version - Version object to delete
 * @param {string} version.version - Version number (e.g., "1.0.0")
 * @param {string} version.fileId - Version file ID
 * @param {string} version.originalFileName - Original file name
 * @param {string} version.fileSize - File size
 * @param {string} version.frameworkType - File type
 * @param {Object} version.uploadedBy - Uploader info
 * @param {Function} onConfirm - Confirm delete handler
 * @param {Function} onCancel - Cancel handler
 */
export default function DeleteVersionModal({ version, onConfirm, onCancel }) {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error("Error deleting version:", error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10000] animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div
        className="bg-background rounded-2xl shadow-2xl max-w-[500px] w-[90%] max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-5 duration-300 border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-br from-primary to-primary/80 text-white p-6 relative overflow-hidden min-h-[80px]">
          <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-white/10 rounded-full transform translate-x-[40%] -translate-y-[40%]"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon name="warning" size="24px" />
              <h2 className="text-xl font-bold text-white drop-shadow-sm">
                Delete Version
              </h2>
            </div>
            <button
              className="bg-white/10 border border-white/20 text-white backdrop-blur-sm rounded-full w-9 h-9 flex items-center justify-center hover:bg-white/20 hover:border-white/40 hover:scale-105 transition-all duration-200 cursor-pointer"
              onClick={onCancel}
              title="Close"
            >
              <Icon name="x" size="20px" />
            </button>
          </div>
        </div>

        <div className="p-4">
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            Are you sure you want to delete version{" "}
            <span className="font-semibold text-foreground">
              {version.version}
            </span>
            ? This action cannot be undone.
          </p>

          <div className="bg-muted rounded-xl p-3 border-l-4 border-red-500 mb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400">
                <Icon name="document" size="20px" />
              </div>
              <div className="flex-1">
                <h4 className="text-base font-semibold text-foreground m-0">
                  {version.originalFileName}
                </h4>
                <p className="text-sm text-muted-foreground m-0">
                  Version: {version.version}
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                {version.frameworkType?.toUpperCase() || "PDF"}
              </span>
              {version.fileSize && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
                  {version.fileSize}
                </span>
              )}
            </div>
            {version.uploadedBy?.name && (
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Uploaded by: {version.uploadedBy.name}
              </p>
            )}
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <div className="flex gap-2">
              <Icon
                name="info"
                size="16px"
                className="text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0"
              />
              <p className="text-xs text-yellow-800 dark:text-yellow-200 leading-relaxed">
                Other versions will remain intact. If this is the current
                version, the latest version will become the new current version.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end p-3 border-t border-border">
          <button
            type="button"
            className="flex-1 px-4 py-2 text-sm font-semibold rounded-lg bg-muted text-foreground border-2 border-border hover:bg-muted/80 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            onClick={onCancel}
            disabled={deleting}
          >
            Cancel
          </button>

          <button
            type="button"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-red-500 text-white hover:bg-red-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-500/30 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none transition-all duration-200 cursor-pointer"
            onClick={handleConfirm}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Deleting...
              </>
            ) : (
              <>
                <Icon name="trash" size="16px" />
                Delete Version
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
