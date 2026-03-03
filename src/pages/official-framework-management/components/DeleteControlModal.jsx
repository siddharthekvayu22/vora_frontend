import { useState } from "react";
import Icon from "../../../components/Icon";
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
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="lg:max-w-[500px]">
        <DialogHeader className="flex flex-row items-center justify-between bg-linear-to-br from-primary to-primary/80 text-white py-4">
          <div className="flex items-center gap-3">
            <Icon name="warning" size="24px" />
            <DialogTitle className="text-xl font-bold text-white drop-shadow-sm">
              Delete Control
            </DialogTitle>
            <DialogDescription className="sr-only">
              Confirm deletion of control. This action cannot be undone.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-4 p-3">
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

        <DialogFooter className="pt-4 border-t border-border p-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
