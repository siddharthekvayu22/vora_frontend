import { useState } from "react";
import { changePassword } from "../../../services/authService";
import { useAuth } from "../../../context/useAuth";
import Icon from "../../../components/Icon";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

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

  const isPasswordValid = rules.every((rule) =>
    rule.test(formData.newPassword),
  );

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

    if (!isPasswordValid) {
      return toast.error("Password does not meet security requirements");
    }

    if (newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    if (currentPassword === newPassword) {
      return toast.error("New password must be different");
    }

    try {
      setLoading(true);

      const result = await changePassword(currentPassword, newPassword);

      toast.success(
        result.message || "Password changed successfully. Please login again.",
      );

      // Force logout for security
      setTimeout(() => {
        logout("Please login with your new password", true);
      }, 1000);
    } catch (error) {
      toast.error(error?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
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
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10000] animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-background rounded-2xl shadow-2xl max-w-[550px] w-[90%] max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-5 duration-300 sidebar-scroll border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-br from-primary to-primary/80 text-white p-6 relative overflow-hidden min-h-[80px]">
          <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-white/10 rounded-full transform translate-x-[40%] -translate-y-[40%]"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon name="key" size="24px" />
              <h2 className="text-xl font-bold text-white drop-shadow-sm">
                Change Password
              </h2>
            </div>
              <Button
                 variant="ghost"
                 className=" rounded-full w-9 h-9 flex "
                 onClick={onClose}
                 title="Close"
               >
                 <Icon name="x" size="20px" />
               </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-4 flex flex-col">
            {/* Current Password */}
            <div className="form-group">
              <label htmlFor="current-password" className="form-label">
                Current Password <span className="required">*</span>
              </label>
              <div className="relative">
                <input
                  id="current-password"
                  type={showPasswords.current ? "text" : "password"}
                  className="form-input pr-12"
                  value={formData.currentPassword}
                  onChange={(e) =>
                    handleChange("currentPassword", e.target.value)
                  }
                  placeholder="Enter current password"
                  required
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => togglePasswordVisibility("current")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded transition-colors"
                >
                  <Icon
                    name={showPasswords.current ? "eye-off" : "eye"}
                    size="16px"
                  />
                </Button>
              </div>
            </div>

            {/* New Password */}
            <div className="form-group">
              <label htmlFor="new-password" className="form-label">
                New Password <span className="required">*</span>
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showPasswords.new ? "text" : "password"}
                  className="form-input pr-12"
                  value={formData.newPassword}
                  onChange={(e) => handleChange("newPassword", e.target.value)}
                  placeholder="Enter new password"
                  required
                  minLength={6}
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => togglePasswordVisibility("new")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded transition-colors"
                >
                  <Icon
                    name={showPasswords.new ? "eye-off" : "eye"}
                    size="16px"
                  />
                </Button>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Password must be at least 6 characters long
              </div>
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label htmlFor="confirm-password" className="form-label">
                Confirm New Password <span className="required">*</span>
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showPasswords.confirm ? "text" : "password"}
                  className="form-input pr-12"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleChange("confirmPassword", e.target.value)
                  }
                  placeholder="Confirm new password"
                  required
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => togglePasswordVisibility("confirm")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded transition-colors"
                >
                  <Icon
                    name={showPasswords.confirm ? "eye-off" : "eye"}
                    size="16px"
                  />
                </Button>
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
                        name={
                          rule.test(formData.newPassword) ? "check" : "close"
                        }
                        size="12px"
                      />
                      {rule.label}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-end p-3 border-t border-border">
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="flex-1 px-4 py-2 "
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none transition-all duration-200 cursor-pointer"
              disabled={loading || !isPasswordValid}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Changing...
                </>
              ) : (
                <>
                  <Icon name="check" size="16px" />
                  Change Password
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangePasswordModal;
