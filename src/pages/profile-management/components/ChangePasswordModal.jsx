import { useState } from "react";
import { changePassword } from "../../../services/authService";
import { useAuth } from "../../../context/useAuth";
import Icon from "../../../components/Icon";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10000 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-background rounded shadow-2xl max-w-137.5 w-[90%] max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-5 duration-300 sidebar-scroll border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-linear-to-br from-primary to-primary/80 text-white p-6 relative overflow-hidden min-h-20">
          <div className="absolute top-0 right-0 w-37.5 h-37.5 bg-white/10 rounded-full transform translate-x-[40%] -translate-y-[40%]"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon name="key" size="24px" />
              <h2 className="text-xl font-bold text-white drop-shadow-sm">
                Change Password
              </h2>
            </div>
            <Button
              variant="ghost"
              className="bg-white/10 border border-white/20 text-white backdrop-blur-sm rounded-full w-9 h-9 flex items-center justify-center hover:bg-white/20 hover:border-white/40 hover:scale-105 transition-all duration-200 cursor-pointer"
              onClick={onClose}
              title="Close"
            >
              <Icon name="x" size="20px" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-4 flex flex-col gap-4">
            {/* Current Password */}
            <div className="space-y-1.5">
              <Label htmlFor="current-password">
                Current Password <span className="required">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showPasswords.current ? "text" : "password"}
                  className="pr-12"
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
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-accent rounded transition-colors"
                >
                  <Icon
                    name={showPasswords.current ? "eye-off" : "eye"}
                    size="16px"
                  />
                </Button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <Label htmlFor="new-password">
                New Password <span className="required">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPasswords.new ? "text" : "password"}
                  className="pr-12"
                  value={formData.newPassword}
                  onChange={(e) => handleChange("newPassword", e.target.value)}
                  placeholder="Enter new password"
                  required
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => togglePasswordVisibility("new")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-accent rounded transition-colors"
                >
                  <Icon
                    name={showPasswords.new ? "eye-off" : "eye"}
                    size="16px"
                  />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Password must be at least 8 characters long and meet all
                requirements below
              </p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label htmlFor="confirm-password">
                Confirm New Password <span className="required">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showPasswords.confirm ? "text" : "password"}
                  className="pr-12"
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
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-accent rounded transition-colors"
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
              <div className="p-4 bg-accent/30 rounded-lg border border-border">
                <p className="text-sm font-medium text-foreground mb-3">
                  Password Requirements:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {rules.map((rule, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-center gap-2 text-xs",
                        rule.test(formData.newPassword)
                          ? "text-green-600 dark:text-green-400"
                          : "text-muted-foreground",
                      )}
                    >
                      <div
                        className={cn(
                          "w-4 h-4 rounded-full flex items-center justify-center shrink-0",
                          rule.test(formData.newPassword)
                            ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        <Icon
                          name={
                            rule.test(formData.newPassword) ? "check" : "close"
                          }
                          size="10px"
                        />
                      </div>
                      <span>{rule.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-end p-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 inline-flex items-center justify-center gap-2"
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
