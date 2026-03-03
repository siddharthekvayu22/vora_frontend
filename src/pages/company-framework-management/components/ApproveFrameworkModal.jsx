import { useState } from "react";
import Icon from "../../../components/Icon";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/**
 * ApproveFrameworkModal Component - Confirmation dialog for approving a company framework
 *
 * @param {Object} framework - Framework object to approve
 * @param {string} framework.id - Framework ID
 * @param {string} framework.frameworkName - Framework name
 * @param {string} framework.currentVersion - Current version
 * @param {Function} onConfirm - Confirm approve handler (receives comments)
 * @param {Function} onCancel - Cancel handler
 */
export default function ApproveFrameworkModal({
  framework,
  onConfirm,
  onCancel,
}) {
  const [approving, setApproving] = useState(false);
  const [comments, setComments] = useState("");

  const handleConfirm = async () => {
    setApproving(true);
    try {
      await onConfirm(comments);
    } catch (error) {
      console.error("Error approving framework:", error);
    } finally {
      setApproving(false);
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
              <Icon name="check-circle" size="24px" />
              <h2 className="text-xl font-bold text-white drop-shadow-sm">
                Approve Framework
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
            Are you sure you want to approve this framework? This will mark the
            framework as approved and ready for use.
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
              htmlFor="comments"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Comments (Optional)
            </Label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add any comments about the approval..."
              className="w-full px-3 py-2 text-sm rounded border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              rows={4}
              maxLength={500}
              disabled={approving}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {comments.length}/500 characters
            </p>
          </div>
        </div>

        <div className="flex gap-2 justify-end p-3 border-t border-border">
          <Button
            type="button"
            variant="outline"
            className="flex-1 rounded"
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
                Approve Framework
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
