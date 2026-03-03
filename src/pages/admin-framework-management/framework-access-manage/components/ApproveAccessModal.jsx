import { useState } from "react";
import { toast } from "sonner";
import Icon from "../../../../components/Icon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

/**
 * ApproveAccessModal Component - Modal for approving framework access requests
 *
 * @param {Object} accessRecord - Access record to approve
 * @param {Function} onConfirm - Confirm approve handler
 * @param {Function} onCancel - Cancel handler
 */
export default function ApproveAccessModal({
  accessRecord,
  onConfirm,
  onCancel,
}) {
  const [approving, setApproving] = useState(false);

  const handleConfirm = async () => {
    setApproving(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error("Error approving access:", error);
      toast.error(error.message || "Failed to approve access");
    } finally {
      setApproving(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent showCloseButton={false} className="overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between bg-linear-to-br from-primary to-primary/80 text-white py-4">
          <div className="flex items-center gap-3">
            <Icon name="check-circle" size="24px" />
            <DialogTitle className="text-xl font-bold text-white drop-shadow-sm">
              Approve Framework Access
            </DialogTitle>
            <DialogDescription className="sr-only">
              Approve framework access request for expert
            </DialogDescription>
          </div>
          <Button
            size="icon"
            className="bg-white/10 border border-white/20 text-white backdrop-blur-sm rounded-full w-9 h-9 flex items-center justify-center hover:bg-white/20 hover:border-white/40 hover:scale-105 transition-all duration-200 cursor-pointer"
            onClick={onCancel}
            title="Close"
          >
            <Icon name="x" size="20px" />
          </Button>
        </DialogHeader>

        <div className="flex flex-col gap-4 p-3">
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            You are about to approve framework access for this expert.
          </p>

          {/* Access Details */}
          <div className="bg-muted rounded p-3 border-l-4 border-primary mb-4">
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

        <DialogFooter className="pt-4 border-t border-border p-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onCancel}
            disabled={approving}
          >
            Cancel
          </Button>

          <Button
            type="button"
            className="flex-1 inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleConfirm}
            disabled={approving}
          >
            {approving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Approving...
              </>
            ) : (
              <>
                <Icon name="check-circle" size="16px" />
                Approve Access
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
