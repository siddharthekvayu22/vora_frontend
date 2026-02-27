import { useState, useEffect, useContext } from "react";
import toast from "react-hot-toast";
import Icon from "../../../components/Icon";
import { AuthContext } from "../../../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

/**
 * UserModal Component - Handles Create and Edit modes
 *
 * @param {string} mode - 'create' | 'edit'
 * @param {Object} user - User data (for edit mode)
 * @param {Function} onSave - Save handler for create/edit
 * @param {Function} onClose - Close handler
 */
export default function UserModal({
  mode = "create",
  user = null,
  onSave,
  onClose,
}) {
  const { user: currentUser } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Get role options based on current user's role
  const getRoleOptions = () => {
    const currentUserRole = currentUser?.role;

    if (currentUserRole === "admin") {
      // Admin can create all roles
      return [
        { value: "expert", label: "Expert" },
        { value: "admin", label: "Admin" },
        { value: "company", label: "Company" },
      ];
    } else if (currentUserRole === "company") {
      // Company can only create users
      return [{ value: "user", label: "User" }];
    }

    // Default fallback (shouldn't reach here normally)
    return [{ value: "user", label: "User" }];
  };

  // Helper function to get role label from value
  const getRoleLabel = (roleValue) => {
    if (!roleValue) return "Select role";
    const option = getRoleOptions().find((opt) => opt.value === roleValue);
    return option ? option.label : roleValue; // Return the value as fallback if label not found
  };

  useEffect(() => {
    if (user && mode === "edit") {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "",
      });
    } else if (mode === "create") {
      // Set default role based on current user's role
      const defaultRole = currentUser?.role === "admin" ? "expert" : "user";
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: defaultRole,
      });
    }
  }, [user, mode, currentUser]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    }

    if (!formData.role) {
      newErrors.role = "Role is required";
    }

    // Show errors in toast instead of inline
    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error("Error saving user:", error);
      toast.error(error.message || "Failed to save user");
    } finally {
      setSaving(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case "create":
        return "Create New User";
      case "edit":
        return "Edit User";
      default:
        return "User Details";
    }
  };

  const getIcon = () => {
    switch (mode) {
      case "create":
        return "plus";
      case "edit":
        return "edit";
      default:
        return "user";
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10000 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-background rounded shadow-2xl max-w-137.5 w-[90%] max-h-[90vh] animate-in slide-in-from-bottom-5 duration-300 border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-linear-to-br from-primary to-primary/80 text-white p-6 relative overflow-hidden min-h-20 rounded-t">
          <div className="absolute top-0 right-0 w-37.5 h-37.5 bg-white/10 rounded-full transform translate-x-[40%] -translate-y-[40%]"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon name={getIcon()} size="24px" />
              <h2 className="text-xl font-bold text-white drop-shadow-sm">
                {getTitle()}
              </h2>
            </div>
            <Button
              size="icon"
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
            {/* Email Field */}
            <div className="space-y-1.5">
              <Label htmlFor="user-email">
                Email Address <span className="required">*</span>
              </Label>
              <Input
                id="user-email"
                type="email"
                className={cn(
                  errors.email &&
                    "border-red-500 focus-visible:ring-red-500/20",
                  mode === "edit" &&
                    "bg-muted/50 opacity-60 cursor-not-allowed",
                )}
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="Enter email address"
                disabled={mode === "edit"}
              />
            </div>

            {/* Name Field */}
            <div className="space-y-1.5">
              <Label htmlFor="user-name">
                Full Name <span className="required">*</span>
              </Label>
              <Input
                id="user-name"
                type="text"
                className={
                  errors.name && "border-red-500 focus-visible:ring-red-500/20"
                }
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter full name"
                required
              />
            </div>

            {/* Phone Field */}
            <div className="space-y-1.5">
              <Label htmlFor="user-phone">
                Phone Number <span className="required">*</span>
              </Label>
              <Input
                id="user-phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="Enter phone number"
                required
              />
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <Label htmlFor="user-role">
                Role <span className="required">*</span>
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-between font-normal bg-background hover:bg-background",
                      errors.role
                        ? "border-red-500 dark:border-red-500"
                        : "border-border dark:border-gray-600",
                      "dark:hover:border-gray-500",
                    )}
                  >
                    <span className="truncate">
                      {getRoleLabel(formData.role)}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-(--radix-dropdown-menu-trigger-width) border-border dark:border-gray-600 dark:bg-gray-800 z-10001"
                  align="start"
                  sideOffset={4}
                >
                  {getRoleOptions().map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => handleChange("role", option.value)}
                      className={cn(
                        "cursor-pointer py-2.5 dark:focus:bg-gray-700 dark:focus:text-white",
                        formData.role === option.value &&
                          "bg-primary/10 text-primary font-medium",
                      )}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex gap-2 justify-end p-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              className="flex-1 px-4 py-2 font-semibold rounded bg-muted text-foreground border-2 border-border hover:bg-muted/80 transition-all duration-200 cursor-pointer"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Icon name="check" size="16px" />
                  {mode === "create" ? "Create User" : "Save Changes"}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
