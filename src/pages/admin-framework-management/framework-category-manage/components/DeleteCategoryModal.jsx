import { useState } from "react";
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
 * DeleteCategoryModal Component - Confirmation dialog for deleting a category
 *
 * @param {Object} category - Category to delete
 * @param {Function} onConfirm - Confirm delete handler
 * @param {Function} onCancel - Cancel handler
 */
export default function DeleteCategoryModal({ category, onConfirm, onCancel }) {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error("Error deleting category:", error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="lg:max-w-125">
        <DialogHeader className="flex flex-row items-center justify-between bg-linear-to-br from-primary to-primary/80 text-white py-4">
          <div className="flex items-center gap-3">
            <Icon name="warning" size="24px" />
            <DialogTitle className="text-xl font-bold text-white drop-shadow-sm">
              Delete Category
            </DialogTitle>
            <DialogDescription className="sr-only">
              Confirm deletion of framework category. This action cannot be
              undone.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-4 p-3">
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            Are you sure you want to delete this framework category? This action
            cannot be undone.
          </p>

          <div className="bg-muted rounded p-3 border-l-4 border-red-500 mb-4">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <Icon name="chart" size="20px" />
              </div>
              <div className="flex-1">
                <h4 className="text-base font-semibold text-foreground m-0">
                  {category.frameworkCategoryName}
                </h4>
                <p className="text-sm text-muted-foreground m-0">
                  Code: {category.code}
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-1">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  category.isActive
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                {category.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            {category.description && (
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {category.description}
              </p>
            )}
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
                Delete Category
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
