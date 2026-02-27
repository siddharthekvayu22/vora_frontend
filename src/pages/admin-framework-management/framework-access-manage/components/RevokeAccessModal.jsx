import { useState } from "react";
import { toast } from "sonner";
import Icon from "../../../../components/Icon";
import { Button } from "@/components/ui/button";

/**
 * RevokeAccessModal Component - Confirmation dialog for revoking framework access
 *
 * @param {Object} accessRecord - Access record to revoke
 * @param {Function} onConfirm - Confirm revoke handler
 * @param {Function} onCancel - Cancel handler
 */
export default function RevokeAccessModal({
  accessRecord,
  onConfirm,
  onCancel,
}) {
  const [revoking, setRevoking] = useState(false);

  const handleConfirm = async () => {
    setRevoking(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error("Error revoking access:", error);
      toast.error(error.message || "Failed to revoke access");
    } finally {
      setRevoking(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10000 animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div
        className="bg-background rounded shadow-2xl max-w-137.5 w-[90%] max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-5 duration-300 sidebar-scroll border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-linear-to-br from-primary to-primary/80 text-white p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-37.5 h-37.5 bg-white/10 rounded-full transform translate-x-[40%] -translate-y-[40%]"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon name="x-circle" size="24px" />
              <h2 className="text-xl font-bold text-white drop-shadow-sm">
                Revoke Framework Access
              </h2>
            </div>
            <Button
              size="icon"
              className="bg-white/10 border border-white/20 text-white backdrop-blur-sm rounded-full w-9 h-9 flex items-center justify-center hover:bg-white/20 hover:border-white/40 hover:scale-105 transition-all duration-200 cursor-pointer"
              onClick={onCancel}
              title="Close"
            >
              <Icon name="x" size="20px" />
            </Button>
          </div>
        </div>

        <div className="p-4 flex flex-col">
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            Are you sure you want to revoke framework access for this expert?
            This action cannot be undone.
          </p>

          {/* Access Details */}
          <div className="bg-muted rounded p-3 border-l-4 border-red-500 mb-4">
            <div className="space-y-3">
              {/* Expert Info */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Icon
                    name="user"
                    size="20px"
                    className="text-blue-600 dark:text-blue-400"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-foreground m-0">
                    {accessRecord?.expert?.name}
                  </h4>
                  <p className="text-sm text-muted-foreground m-0">
                    {accessRecord?.expert?.email}
                  </p>
                </div>
              </div>

              {/* Framework Info */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Icon
                    name="shield"
                    size="20px"
                    className="text-purple-600 dark:text-purple-400"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-foreground m-0">
                    {accessRecord?.frameworkCategory?.frameworkCategoryName}
                  </h4>
                  <p className="text-sm text-muted-foreground m-0">
                    Code: {accessRecord?.frameworkCategory?.frameworkCode}
                  </p>
                </div>
              </div>

              {/* Current Status */}
              <div className="flex gap-2 mt-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  Approved
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end p-3 border-t border-border">
          <Button
            type="button"
            variant="outline"
            className="flex-1 rounded"
            onClick={onCancel}
            disabled={revoking}
          >
            Cancel
          </Button>

          <Button
            type="button"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-destructive text-white hover:bg-destructive/80 disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleConfirm}
            disabled={revoking}
          >
            {revoking ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Revoking...
              </>
            ) : (
              <>
                <Icon name="x-circle" size="16px" />
                Revoke Access
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
