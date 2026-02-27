import { useState } from "react";
import Icon from "../../../components/Icon";
import { Button } from "@/components/ui/button";

/**
 * DeleteControlModal Component - Confirmation dialog for deleting a control
 *
 * @param {Object} control - Control to delete
 * @param {Function} onConfirm - Confirm delete handler
 * @param {Function} onCancel - Cancel handler
 */
export default function DeleteControlModal({ control, onConfirm, onCancel }) {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error("Error deleting control:", error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10001 animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div
        className="bg-background rounded shadow-2xl max-w-[500px] w-[90%] max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-5 duration-300 border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-linear-to-br from-primary to-primary/80 text-white p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-37.5 h-37.5 bg-white/10 rounded-full transform translate-x-[40%] -translate-y-[40%]"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon name="warning" size="24px" />
              <h2 className="text-xl font-bold text-white drop-shadow-sm">
                Delete Control
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
            Are you sure you want to delete this control? This action cannot be
            undone.
          </p>

          <div className="bg-muted rounded p-3 border-l-4 border-red-500 mb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400">
                <span className="text-sm font-bold">{control.Control_id}</span>
              </div>
              <div className="flex-1">
                <h4 className="text-base font-semibold text-foreground m-0">
                  {control.Control_name}
                </h4>
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary/15 text-secondary">
                {control.Control_type}
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {control.Control_description}
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
            disabled={deleting}
          >
            Cancel
          </Button>

          <Button
            type="button"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-destructive text-white hover:bg-destructive/80 disabled:opacity-60 disabled:cursor-not-allowed"
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
                Delete Control
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
