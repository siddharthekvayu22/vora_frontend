import Icon from "../../../components/Icon";
import { formatDate } from "../../../utils/dateFormatter";
import toast from "react-hot-toast";

/**
 * UserViewModal Component - Beautiful user details display
 *
 * @param {Object} user - User data object
 * @param {Function} onClose - Close modal handler
 * @param {Function} onEdit - Edit user handler (optional)
 */
export default function UserViewModal({ user, onClose, onEdit }) {
  if (!user) return null;

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "admin";
      case "expert":
        return "expert";
      case "user":
        return "user";
      default:
        return "user";
    }
  };

  const getStatusColor = (isVerified) => {
    return isVerified ? "verified" : "pending";
  };

  const getInitials = (name) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U"
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10000] animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-background rounded-2xl border border-border shadow-2xl max-w-[600px] w-[90vw] max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 scale-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-primary to-primary/80 text-white p-6 flex justify-between items-start relative overflow-hidden min-h-[110px]">
          <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-white/10 rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="flex gap-4 items-start relative z-10 flex-1">
            <div className="w-[60px] h-[60px] rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center backdrop-blur-sm flex-shrink-0">
              <span className="text-xl font-bold text-white drop-shadow-sm">
                {getInitials(user.name)}
              </span>
            </div>
            <div className="flex-1 flex flex-col gap-1 pt-0.5">
              <h2 className="text-2xl font-bold text-white drop-shadow-sm leading-tight">
                {user.name}
              </h2>
              <p className="text-sm text-white/90 font-normal leading-tight">
                {user.email}
              </p>
              <div className="flex gap-2 flex-wrap mt-1">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border border-white/40 min-h-[22px] whitespace-nowrap shadow-sm ${
                    getRoleColor(user.role) === "admin"
                      ? "bg-red-500/60 text-white border-red-400/80"
                      : getRoleColor(user.role) === "expert"
                      ? "bg-blue-500/60 text-white border-blue-400/80"
                      : "bg-green-500/60 text-white border-green-400/80"
                  }`}
                >
                  <Icon name="shield" size="12px" />
                  {user.role}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border border-white/40 min-h-[22px] whitespace-nowrap shadow-sm ${
                    getStatusColor(user.isEmailVerified) === "verified"
                      ? "bg-green-500/60 text-white border-green-400/80"
                      : "bg-yellow-500/60 text-white border-yellow-400/80"
                  }`}
                >
                  <Icon
                    name={user.isEmailVerified ? "check-circle" : "clock"}
                    size="12px"
                  />
                  {user.isEmailVerified ? "Verified" : "Pending"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 relative z-10">
            {onEdit && (
              <button
                className="w-10 h-10 rounded-full border border-white/20 bg-white/10 text-white flex items-center justify-center cursor-pointer transition-all duration-200 backdrop-blur-sm hover:bg-yellow-500/30 hover:border-yellow-400/50 hover:scale-105"
                onClick={() => onEdit(user)}
                title="Edit User"
              >
                <Icon name="edit" size="16px" />
              </button>
            )}
            <button
              className="w-10 h-10 rounded-full border border-white/20 bg-white/10 text-white flex items-center justify-center cursor-pointer transition-all duration-200 backdrop-blur-sm hover:bg-red-500/30 hover:border-red-400/50 hover:scale-105"
              onClick={onClose}
              title="Close"
            >
              <Icon name="x" size="18px" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 overflow-y-auto flex flex-col gap-8 sidebar-scroll">
          {/* Contact Information */}
          <div className="bg-muted rounded-xl p-6 border border-border">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-6 pb-2 border-b-2 border-primary/20">
              <Icon name="user" size="16px" />
              Contact Information
            </h3>
            <div className="grid gap-6">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  <Icon name="mail" size="14px" />
                  Email Address
                </div>
                <div className="text-base text-foreground font-medium">
                  <a
                    href={`mailto:${user.email}`}
                    className="text-primary hover:text-primary/80 hover:underline transition-all duration-200"
                  >
                    {user.email}
                  </a>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  <Icon name="phone" size="14px" />
                  Phone Number
                </div>
                <div className="text-base text-foreground font-medium">
                  {user.phone ? (
                    <a
                      href={`tel:${user.phone}`}
                      className="text-primary hover:text-primary/80 hover:underline transition-all duration-200"
                    >
                      {user.phone}
                    </a>
                  ) : (
                    <span className="text-muted-foreground italic">
                      Not provided
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="bg-muted rounded-xl p-6 border border-border">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-6 pb-2 border-b-2 border-primary/20">
              <Icon name="settings" size="16px" />
              Account Details
            </h3>
            <div className="grid gap-6">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  <Icon name="shield" size="14px" />
                  Role
                </div>
                <div className="text-base text-foreground font-medium">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getRoleColor(user.role) === "admin"
                        ? "bg-red-100 text-red-800"
                        : getRoleColor(user.role) === "expert"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  <Icon name="check-circle" size="14px" />
                  Email Status
                </div>
                <div className="text-base text-foreground font-medium">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getStatusColor(user.isEmailVerified) === "verified"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {user.isEmailVerified ? "Verified" : "Pending Verification"}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  <Icon name="hash" size="14px" />
                  User ID
                </div>
                <div className="text-base text-foreground font-medium">
                  <div className="flex items-center gap-2">
                    <code className="bg-muted border border-primary/20 px-2 py-1 rounded text-sm font-mono text-primary">
                      {user.id}
                    </code>
                    <button
                      className="bg-primary/20 border border-primary rounded text-primary p-1 cursor-pointer transition-all duration-200 flex items-center justify-center hover:bg-primary hover:text-white"
                      onClick={() => {
                        navigator.clipboard.writeText(user.id);
                        toast.success("User ID copied to clipboard");
                      }}
                      title="Copy User ID"
                    >
                      <Icon name="copy" size="12px" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-muted rounded-xl p-6 border border-border">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-6 pb-2 border-b-2 border-primary/20">
              <Icon name="clock" size="16px" />
              Timeline
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 border-2 border-green-600 flex items-center justify-center flex-shrink-0">
                  <Icon name="user-plus" size="12px" />
                </div>
                <div className="flex-1 pt-1">
                  <div className="font-semibold text-foreground mb-1">
                    Account Created
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </div>
                </div>
              </div>
              {user.updatedAt && user.updatedAt !== user.createdAt && (
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 border-2 border-blue-600 flex items-center justify-center flex-shrink-0">
                    <Icon name="edit" size="12px" />
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="font-semibold text-foreground mb-1">
                      Last Updated
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(user.updatedAt)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-muted border-t border-border p-6 flex justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon name="info" size="14px" />
            <span>User information is automatically synced</span>
          </div>
          <div className="flex gap-2">
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 bg-transparent text-muted-foreground border border-border hover:bg-muted/80 hover:text-foreground hover:border-muted-foreground"
              onClick={onClose}
            >
              Close
            </button>
            {onEdit && (
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 bg-primary text-white border border-primary hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30"
                onClick={() => onEdit(user)}
              >
                <Icon name="edit" size="16px" />
                Edit User
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
