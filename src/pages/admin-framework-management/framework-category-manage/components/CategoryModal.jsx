import { useState, useEffect } from "react";
import Icon from "../../../../components/Icon";

/**
 * CategoryModal Component - Handles Create and Edit modes
 *
 * @param {string} mode - 'create' | 'edit'
 * @param {Object} category - Category data (for edit mode)
 * @param {Function} onSave - Save handler for create/edit
 * @param {Function} onClose - Close handler
 */
export default function CategoryModal({
  mode = "create",
  category = null,
  onSave,
  onClose,
}) {
  const [formData, setFormData] = useState({
    code: "",
    frameworkCategoryName: "",
    description: "",
    isActive: true,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (category && mode === "edit") {
      setFormData({
        code: category.code || "",
        frameworkCategoryName: category.frameworkCategoryName || "",
        description: category.description || "",
        isActive: category.isActive !== undefined ? category.isActive : true,
      });
    } else if (mode === "create") {
      // Set default values for create mode
      setFormData({
        code: "",
        frameworkCategoryName: "",
        description: "",
        isActive: true,
      });
    }
  }, [category, mode]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.code.trim()) {
      newErrors.code = "Code is required";
    }

    if (!formData.frameworkCategoryName.trim()) {
      newErrors.frameworkCategoryName = "Framework category name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
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
      console.error("Error saving category:", error);
    } finally {
      setSaving(false);
    }
  };

  const getTitle = () => {
    return mode === "create" ? "Create New Category" : "Edit Category";
  };

  const getIcon = () => {
    return mode === "create" ? "plus" : "edit";
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

        <form onSubmit={handleSubmit}>
          <div className="p-4 flex flex-col">
            {/* Code Field */}
            <div className="form-group">
              <label htmlFor="category-code" className="form-label">
                Code <span className="required">*</span>
              </label>
              <input
                id="category-code"
                type="text"
                className={`form-input ${errors.code ? "error" : ""}`}
                value={formData.code}
                onChange={(e) => handleChange("code", e.target.value)}
                placeholder="Enter category code (e.g., iso27002)"
              />
              {errors.code && (
                <span className="error-message">{errors.code}</span>
              )}
            </div>

            {/* Framework Category Name Field */}
            <div className="form-group">
              <label htmlFor="category-name" className="form-label">
                Framework Category Name <span className="required">*</span>
              </label>
              <input
                id="category-name"
                type="text"
                className={`form-input ${errors.frameworkCategoryName ? "error" : ""}`}
                value={formData.frameworkCategoryName}
                onChange={(e) =>
                  handleChange("frameworkCategoryName", e.target.value)
                }
                placeholder="Enter framework category name"
              />
              {errors.frameworkCategoryName && (
                <span className="error-message">
                  {errors.frameworkCategoryName}
                </span>
              )}
            </div>

            {/* Description Field */}
            <div className="form-group">
              <label htmlFor="category-description" className="form-label">
                Description <span className="required">*</span>
              </label>
              <textarea
                id="category-description"
                className={`form-input ${errors.description ? "error" : ""}`}
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Enter category description"
                rows={4}
              />
              {errors.description && (
                <span className="error-message">{errors.description}</span>
              )}
            </div>

            {/* Status Field - Only show in edit mode */}
            {mode === "edit" && (
              <div className="form-group">
                <label htmlFor="category-status" className="form-label">
                  Status
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="isActive"
                      checked={formData.isActive === true}
                      onChange={() => handleChange("isActive", true)}
                      className="text-primary focus:ring-primary"
                    />
                    <span className="text-sm">Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="isActive"
                      checked={formData.isActive === false}
                      onChange={() => handleChange("isActive", false)}
                      className="text-primary focus:ring-primary"
                    />
                    <span className="text-sm">Inactive</span>
                  </label>
                </div>
              </div>
            )}

            {errors.submit && (
              <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                <Icon name="alert-circle" size="20px" />
                <span>{errors.submit}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-end p-3 border-t border-border">
            <button
              type="button"
              className="flex-1 px-4 py-2 text-sm font-semibold rounded-lg bg-muted text-foreground border-2 border-border hover:bg-muted/80 transition-all duration-200"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none transition-all duration-200"
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
                  {mode === "create" ? "Create Category" : "Save Changes"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
