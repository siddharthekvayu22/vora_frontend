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
 * DeleteUserModal Component - Confirmation dialog for deleting a user
 *
 * @param {boolean} open - Dialog open state
 * @param {Function} onOpenChange - Dialog open state change handler
 * @param {Object} user - User to delete
 * @param {Function} onConfirm - Confirm delete handler
 */
export default function DeleteUserModal({
  open,
  onOpenChange,
  user,
  onConfirm,
}) {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setDeleting(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="flex flex-row items-center justify-between bg-linear-to-br from-primary to-primary/80 text-white py-4">
          <div className="flex items-center gap-3">
            <Icon name="warning" size="24px" />
            <DialogTitle className="text-xl font-bold text-white drop-shadow-sm">
              Delete User
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-4 p-3">
          <DialogDescription>
            Choose how you want to delete this user. This action cannot be
            undone.
          </DialogDescription>

          <div className="bg-muted rounded p-4 border-l-4 border-red-500">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <Icon name="user" size="24px" />
              </div>
              <div className="flex-1">
                <h4 className="text-base font-semibold text-foreground m-0">
                  {user.name}
                </h4>
                <p className="text-sm text-muted-foreground m-0">
                  {user.email}
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.role === "admin"
                    ? "bg-red-100 text-red-800"
                    : user.role === "expert"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                }`}
              >
                {user.role}
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.isEmailVerified
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {user.isEmailVerified ? "Verified" : "Pending"}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t border-border p-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
            disabled={deleting}
          >
            Cancel
          </Button>

          <Button
            type="button"
            className="flex-1 bg-destructive hover:bg-destructive/80 text-white inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
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
                Delete
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
