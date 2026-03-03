import { useState } from "react";
import Icon from "../../../components/Icon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function DeleteCompanyFrameworkModal({
  framework,
  onConfirm,
  onCancel,
}) {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error("Error deleting framework:", error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={!!framework} onOpenChange={onCancel}>
      <DialogContent className="max-w-[500px]">
        <DialogHeader className="bg-linear-to-br from-primary to-primary/80 text-white py-4">
          <div className="flex items-center gap-3">
            <Icon name="warning" size="24px" />
            <DialogTitle className="text-xl font-bold text-white drop-shadow-sm">
              Delete Framework
            </DialogTitle>
          </div>
          <DialogDescription className="sr-only">
            Confirm deletion of company framework
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 p-3">
          <p className="text-muted-foreground text-sm leading-relaxed">
            Are you sure you want to delete this framework? This action cannot
            be undone.
          </p>

          <div className="bg-muted rounded p-3 border-l-4 border-red-500">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <Icon name="document" size="20px" />
              </div>
              <div className="flex-1">
                <h4 className="text-base font-semibold text-foreground m-0">
                  {framework?.frameworkName}
                </h4>
                <p className="text-sm text-muted-foreground m-0">
                  Code: {framework?.frameworkCode}
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                {framework?.frameworkType?.toUpperCase() || "PDF"}
              </span>
              {framework?.fileInfo?.fileSize && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
                  {framework.fileInfo.fileSize}
                </span>
              )}
            </div>
            {framework?.uploadedBy?.name && (
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Uploaded by: {framework.uploadedBy.name}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="pt-4 border-t border-border p-2">
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
                Delete Framework
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
