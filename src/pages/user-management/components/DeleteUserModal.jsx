import { useState } from "react";
import Icon from "../../../components/Icon";
import { Button } from "@/components/ui/button";

/**
 * DeleteUserModal Component - Confirmation dialog for deleting a user
 *
 * @param {Object} user - User to delete
 * @param {Function} onConfirm - Confirm delete handler (receives method parameter)
 * @param {Function} onCancel - Cancel handler
 */
export default function DeleteUserModal({ user, onConfirm, onCancel }) {
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

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10000 animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div
        className="bg-background rounded shadow-2xl max-w-[500px] w-[90%] max-h-[90vh] animate-in slide-in-from-bottom-5 duration-300 border border-border overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-linear-to-br from-primary to-primary/80 text-white p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-37.5 h-37.5 bg-white/10 rounded-full transform translate-x-[40%] -translate-y-[40%]"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon name="warning" size="24px" />
              <h2 className="text-xl font-bold text-white drop-shadow-sm">
                Delete User
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

        <div className="p-6">
          <p className="text-muted-foreground text-sm leading-relaxed mb-6">
            Choose how you want to delete this user. This action cannot be
            undone.
          </p>

          <div className="bg-muted rounded p-4 border-l-4 border-red-500 mb-6">
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

        <div className="flex items-center gap-3 p-3 border-t border-border">
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
            className="flex-1 bg-destructive hover:bg-destructive/80 text-white rounded"
            onClick={() => handleConfirm(false)}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Deleting...
              </>
            ) : (
              <>
                <Icon name="user" size="16px" />
                Delete
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
