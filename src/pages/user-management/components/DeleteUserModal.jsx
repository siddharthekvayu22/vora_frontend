import { useState } from "react";
import Icon from "../../../components/Icon";

/**
 * DeleteUserModal Component - Confirmation dialog for deleting a user
 *
 * @param {Object} user - User to delete
 * @param {Function} onConfirm - Confirm delete handler (receives method parameter)
 * @param {Function} onCancel - Cancel handler
 */
export default function DeleteUserModal({ user, onConfirm, onCancel }) {
  const [deleting, setDeleting] = useState(false);
  const [deleteType, setDeleteType] = useState(null); // 'user-only' or 'all-data'

  const handleConfirm = async (deleteData) => {
    setDeleting(true);
    setDeleteType(deleteData ? 'all-data' : 'user-only');
    try {
      await onConfirm(deleteData);
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setDeleting(false);
      setDeleteType(null);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10000] animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div
        className="bg-background rounded-2xl shadow-2xl max-w-[500px] w-[90%] max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-5 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-br from-primary to-primary/80 text-white p-6 relative overflow-hidden min-h-[80px]">
          <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-white/10 rounded-full transform translate-x-[40%] -translate-y-[40%]"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon name="warning" size="24px" />
              <h2 className="text-xl font-bold text-white drop-shadow-sm">
                Delete User
              </h2>
            </div>
            <button
              className="bg-white/10 border border-white/20 text-white backdrop-blur-sm rounded-full w-9 h-9 flex items-center justify-center hover:bg-white/20 hover:border-white/40 hover:scale-105 transition-all duration-200"
              onClick={onCancel}
              title="Close"
            >
              <Icon name="x" size="20px" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <p className="text-muted-foreground text-base leading-relaxed mb-6">
            Choose how you want to delete this user. This action cannot be undone.
          </p>

          <div className="bg-muted rounded-xl p-4 border-l-4 border-red-500 mb-6">
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

          {/* Delete Options */}
          <div className="space-y-4 mb-6">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Icon name="user" size="20px" className="text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                    Delete User Only
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Remove user account but keep their associated data (documents, frameworks, etc.)
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Icon name="trash" size="20px" className="text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-800 dark:text-red-200 mb-1">
                    Delete All Data
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Permanently remove user account and ALL associated data (documents, frameworks, comparisons, etc.)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end p-6 pt-0 border-t border-border">
          <button
            type="button"
            className="px-6 py-3 text-sm font-semibold rounded-lg bg-muted text-foreground border-2 border-border hover:bg-muted/80 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={onCancel}
            disabled={deleting}
          >
            Cancel
          </button>
          
          <button
            type="button"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-yellow-500/30 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none transition-all duration-200"
            onClick={() => handleConfirm(false)}
            disabled={deleting}
          >
            {deleting && deleteType === 'user-only' ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Deleting...
              </>
            ) : (
              <>
                <Icon name="user" size="16px" />
                Delete User Only
              </>
            )}
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg bg-red-500 text-white hover:bg-red-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-500/30 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none transition-all duration-200"
            onClick={() => handleConfirm(true)}
            disabled={deleting}
          >
            {deleting && deleteType === 'all-data' ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Deleting...
              </>
            ) : (
              <>
                <Icon name="trash" size="16px" />
                Delete All Data
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
