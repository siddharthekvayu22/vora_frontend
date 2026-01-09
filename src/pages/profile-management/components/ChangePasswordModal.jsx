import { useState } from "react";
import { changePassword } from "../../../services/authService";
import { useAuth } from "../../../context/useAuth";
import Icon from "../../../components/Icon";
import toast from "react-hot-toast";

function ChangePasswordModal({ isOpen, onClose }) {
  const { logout } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const rules = [
    { label: "At least 8 characters", test: (v) => v.length >= 8 },
    { label: "One uppercase letter", test: (v) => /[A-Z]/.test(v) },
    { label: "One lowercase letter", test: (v) => /[a-z]/.test(v) },
    { label: "One number", test: (v) => /\d/.test(v) },
    {
      label: "One special character (@$!%*#?&)",
      test: (v) => /[@$!%*#?&]/.test(v),
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { currentPassword, newPassword, confirmPassword } = formData;

    // Basic validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return toast.error("All fields are required");
    }

    if (newPassword !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    if (newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    if (currentPassword === newPassword) {
      return toast.error("New password must be different");
    }

    try {
      setLoading(true);

      await changePassword(currentPassword, newPassword);

      toast.success("Password changed successfully. Please login again.");

      // Force logout for security
      setTimeout(() => {
        logout("Please login with your new password", true);
      }, 1500);
    } catch (error) {
      toast.error(error?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-background rounded-2xl border border-border shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            Change Password
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <Icon name="close" size="20px" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Current Password *
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? "text" : "password"}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 pr-12 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter current password"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("current")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded transition-colors"
              >
                <Icon
                  name={showPasswords.current ? "eye-off" : "eye"}
                  size="16px"
                />
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              New Password *
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 pr-12 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter new password"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("new")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded transition-colors"
              >
                <Icon
                  name={showPasswords.new ? "eye-off" : "eye"}
                  size="16px"
                />
              </button>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Password must be at least 6 characters long
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Confirm New Password *
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 pr-12 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Confirm new password"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("confirm")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded transition-colors"
              >
                <Icon
                  name={showPasswords.confirm ? "eye-off" : "eye"}
                  size="16px"
                />
              </button>
            </div>
          </div>

          {/* Password Strength Indicator */}
          {formData.newPassword && (
            <div className="p-3 bg-accent rounded-lg border border-border">
              <div className="text-sm font-medium text-foreground mb-2">
                Password Requirements:
              </div>

              <div className="space-y-1 text-xs">
                {rules.map((rule, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 ${
                      rule.test(formData.newPassword)
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    <Icon
                      name={rule.test(formData.newPassword) ? "check" : "close"}
                      size="12px"
                    />
                    {rule.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-border rounded-lg hover:bg-accent transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Changing...
                </>
              ) : (
                "Change Password"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangePasswordModal;
