import { useState } from "react";
import Icon from "../../../components/Icon";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/**
 * RejectFrameworkModal Component - Confirmation dialog for rejecting a framework
 *
 * @param {Object} framework - Framework object to reject
 * @param {string} framework.id - Framework ID
 * @param {string} framework.frameworkName - Framework name
 * @param {string} framework.currentVersion - Current version
 * @param {Function} onConfirm - Confirm reject handler (receives rejectionReason)
 * @param {Function} onCancel - Cancel handler
 */
export default function RejectFrameworkModal({
  framework,
  onConfirm,
  onCancel,
}) {
  const [rejecting, setRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleConfirm = async () => {
    setRejecting(true);
    try {
      await onConfirm(rejectionReason);
    } catch (error) {
      console.error("Error rejecting framework:", error);
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
        className="bg-background rounded shadow-2xl max-w-125 w-[90%] max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-5 duration-300 border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-linear-to-br from-primary to-primary/80 text-white p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-37.5 h-37.5 bg-white/10 rounded-full transform translate-x-[40%] -translate-y-[40%]"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon name="x-circle" size="24px" />
              <h2 className="text-xl font-bold text-white drop-shadow-sm">
                Reject Framework
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

        <div className="p-4">
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            Are you sure you want to reject this framework? Please provide a
            reason for rejection.
          </p>

          <div className="bg-muted rounded p-3 border-l-4 border-primary mb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <Icon name="shield" size="20px" />
              </div>
              <div className="flex-1">
                <h4 className="text-base font-semibold text-foreground m-0">
                  {framework.frameworkName}
                </h4>
                <p className="text-sm text-muted-foreground m-0">
                  Version: {framework.currentVersion}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <Label
              htmlFor="rejectionReason"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Rejection Reason (Optional)
            </Label>
            <Textarea
              id="rejectionReason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Explain why this framework is being rejected..."
              className="w-full px-3 py-2 text-sm rounded border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              rows={4}
              maxLength={500}
              disabled={rejecting}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {rejectionReason.length}/500 characters
            </p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-3">
            <div className="flex gap-2">
              <Icon
                name="info"
                size="16px"
                className="text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0"
              />
              <p className="text-xs text-yellow-800 dark:text-yellow-200 leading-relaxed">
                Once rejected, the framework will be marked as not approved. The
                uploader will be notified of the rejection.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end p-3 border-t border-border">
          <Button
            type="button"
            variant="outline"
            className="flex-1 rounded"
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
                Reject Framework
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
