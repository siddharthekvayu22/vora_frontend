import { useState, useEffect } from "react";
import Icon from "../../../components/Icon";

/**
 * UserModal Component - Handles View, Create, and Edit modes
 *
 * @param {string} mode - 'view' | 'create' | 'edit'
 * @param {Object} user - User data (for view/edit modes)
 * @param {Function} onSave - Save handler for create/edit
 * @param {Function} onClose - Close handler
 */
export default function UserModal({
  mode = "view",
  user = null,
  onSave,
  onClose,
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const isReadOnly = mode === "view";

  useEffect(() => {
    if (user && (mode === "view" || mode === "edit")) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "",
      });
    } else if (mode === "create") {
      // Set default role for create mode
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: "expert",
      });
    }
  }, [user, mode]);

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
              className="bg-white/10 border border-white/20 text-white backdrop-blur-sm rounded-full w-9 h-9 flex items-center justify-center hover:bg-white/20 hover:border-white/40 hover:scale-105 transition-all duration-200"
              onClick={onClose}
              title="Close"
            >
              <Icon name="x" size="20px" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col">
          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="user-email" className="form-label">
              Email Address {!isReadOnly && <span className="required">*</span>}
            </label>
            {isReadOnly ? (
              <div className="py-2 text-foreground">
                {formData.email || "-"}
              </div>
            ) : (
              <>
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
                {errors.email && (
                  <span className="error-message">{errors.email}</span>
                )}
              </>
            )}
          </div>

          {/* Name Field */}
          <div className="form-group">
            <label htmlFor="user-name" className="form-label">
              Full Name {!isReadOnly && <span className="required">*</span>}
            </label>
            {isReadOnly ? (
              <div className="py-2 text-foreground">{formData.name || "-"}</div>
            ) : (
              <>
                <input
                  id="user-name"
                  type="text"
                  className={`form-input ${errors.name ? "error" : ""}`}
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Enter full name"
                />
                {errors.name && (
                  <span className="error-message">{errors.name}</span>
                )}
              </>
            )}
          </div>

          {/* Phone Field */}
          <div className="form-group">
            <label htmlFor="user-phone" className="form-label">
              Phone Number
            </label>
            {isReadOnly ? (
              <div className="py-2 text-foreground">
                {formData.phone || "-"}
              </div>
            ) : (
              <input
                id="user-phone"
                type="tel"
                className="form-input"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="Enter phone number"
              />
            )}
          </div>

          {/* Role */}
          <div className="form-group">
            <label htmlFor="user-role" className="form-label">
              Role {!isReadOnly && <span className="required">*</span>}
            </label>
            {isReadOnly ? (
              <div className="py-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    formData.role === "admin"
                      ? "bg-red-100 text-red-800"
                      : formData.role === "expert"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                  }`}
                >
                  {formData.role}
                </span>
              </div>
            ) : (
              <>
                <select
                  id="user-role"
                  className={`form-select ${errors.role ? "error" : ""}`}
                  value={formData.role}
                  onChange={(e) => handleChange("role", e.target.value)}
                >
                  <option value="expert">Expert</option>
                  <option value="admin">Admin</option>
                  <option value="company">Company</option>
                </select>
              </>
            )}
          </div>

          {errors.submit && (
            <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              <Icon name="alert-circle" size="20px" />
              <span>{errors.submit}</span>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-5 border-t border-border">
            <button
              type="button"
              className="px-6 py-3 text-sm font-semibold rounded-lg bg-muted text-foreground border-2 border-border hover:bg-muted/80 transition-all duration-200"
              onClick={onClose}
            >
              {isReadOnly ? "Close" : "Cancel"}
            </button>
            {!isReadOnly && (
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none transition-all duration-200"
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
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
