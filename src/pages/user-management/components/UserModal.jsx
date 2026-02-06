import { useState, useEffect, useContext } from "react";
import toast from "react-hot-toast";
import Icon from "../../../components/Icon";
import SelectDropdown from "../../../components/custom/SelectDropdown";
import { AuthContext } from "../../../context/AuthContext";

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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10000] animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-background rounded-2xl shadow-2xl max-w-[550px] w-[90%] max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-5 duration-300 sidebar-scroll"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-br from-primary to-primary/80 text-white p-6 relative overflow-hidden min-h-[80px]">
          <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-white/10 rounded-full transform translate-x-[40%] -translate-y-[40%]"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon name={getIcon()} size="24px" />
              <h2 className="text-xl font-bold text-white drop-shadow-sm">
                {getTitle()}
              </h2>
            </div>
            <button
              className="bg-white/10 border border-white/20 text-white backdrop-blur-sm rounded-full w-9 h-9 flex items-center justify-center hover:bg-white/20 hover:border-white/40 hover:scale-105 transition-all duration-200 cursor-pointer"
              onClick={onClose}
              title="Close"
            >
              <Icon name="x" size="20px" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-4 flex flex-col">
            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="user-email" className="form-label">
                Email Address <span className="required">*</span>
              </label>
              <input
                id="user-email"
                type="email"
                className={`form-input ${errors.email ? "error" : ""} ${
                  mode === "edit" ? "opacity-60 cursor-not-allowed" : ""
                }`}
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="Enter email address"
                disabled={mode === "edit"}
              />
            </div>

            {/* Name Field */}
            <div className="form-group">
              <label htmlFor="user-name" className="form-label">
                Full Name <span className="required">*</span>
              </label>
              <input
                id="user-name"
                type="text"
                className={`form-input ${errors.name ? "error" : ""}`}
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter full name"
                required
              />
            </div>

            {/* Phone Field */}
            <div className="form-group">
              <label htmlFor="user-phone" className="form-label">
                Phone Number <span className="required">*</span>
              </label>
              <input
                id="user-phone"
                type="tel"
                className="form-input"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="Enter phone number"
                required
              />
            </div>

            {/* Role */}
            <div className="form-group">
              <label htmlFor="user-role" className="form-label">
                Role <span className="required">*</span>
              </label>
              <SelectDropdown
                value={formData.role}
                onChange={(value) => handleChange("role", value)}
                options={getRoleOptions()}
                placeholder="Select role"
                variant="default"
                size="lg"
                buttonClassName="border-2 py-[0.60rem] rounded-sm"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end p-3 border-t border-border">
            <button
              type="button"
              className="flex-1 px-4 py-2 text-sm font-semibold rounded-lg bg-muted text-foreground border-2 border-border hover:bg-muted/80 transition-all duration-200 cursor-pointer"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none transition-all duration-200 cursor-pointer"
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
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
