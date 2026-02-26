import { useState } from "react";
import toast from "react-hot-toast";
import Icon from "../../../../components/Icon";
import { Button } from "@/components/ui/button";

/**
 * RejectAccessModal Component - Modal for rejecting framework access requests
 *
 * @param {Object} accessRecord - Access record to reject
 * @param {Function} onConfirm - Confirm reject handler
 * @param {Function} onCancel - Cancel handler
 */
export default function RejectAccessModal({
  accessRecord,
  onConfirm,
  onCancel,
}) {
  const [rejecting, setRejecting] = useState(false);

  const handleConfirm = async () => {
    setRejecting(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error("Error rejecting access:", error);
      toast.error(error.message || "Failed to reject access");
    } finally {
      setRejecting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10000 animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div
        className="bg-background rounded-2xl shadow-2xl max-w-[550px] w-[90%] max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-5 duration-300 sidebar-scroll border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-linear-to-br from-primary to-primary/80 text-white p-6 relative overflow-hidden min-h-[80px]">
          <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-white/10 rounded-full transform translate-x-[40%] -translate-y-[40%]"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon name="x-circle" size="24px" />
              <h2 className="text-xl font-bold text-white drop-shadow-sm">
                Reject Framework Access
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
            You are about to reject framework access for this expert.
          </p>

          {/* Access Details */}
          <div className="bg-muted rounded-xl p-3 border-l-4 border-red-500 mb-4">
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

              {/* Request Message */}
              {accessRecord?.requestMessage && (
                <div className="bg-background p-2 rounded">
                  <p className="text-xs text-muted-foreground mb-1">
                    Request Message:
                  </p>
                  <p className="text-sm text-foreground">
                    {accessRecord.requestMessage}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end p-3 border-t border-border">
          <Button
            type="button"
            variant="outline"
            className="flex-1 rounded-lg"
            onClick={onCancel}
            disabled={rejecting}
          >
            Cancel
          </Button>

          <Button
            type="button"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-destructive text-white hover:bg-destructive/80 disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleConfirm}
            disabled={rejecting}
          >
            {rejecting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Rejecting...
              </>
            ) : (
              <>
                <Icon name="x-circle" size="16px" />
                Reject Access
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
