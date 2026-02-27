import { useState, useEffect } from "react";
import { toast } from "sonner";
import Icon from "../../../../components/Icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

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
      toast.error(error.message || "Failed to save category");
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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10000 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-background rounded shadow-2xl max-w-137.5 w-[90%] max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-5 duration-300 sidebar-scroll border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-linear-to-br from-primary to-primary/80 text-white p-4 relative overflow-hidden">
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
            {/* Code Field */}
            <div className="space-y-1.5">
              <Label htmlFor="category-code">
                Code <span className="required">*</span>
              </Label>
              <Input
                id="category-code"
                type="text"
                className={
                  errors.code && "border-red-500 focus-visible:ring-red-500/20"
                }
                value={formData.code}
                onChange={(e) => handleChange("code", e.target.value)}
                placeholder="Enter category code (e.g., iso27002)"
              />
              {errors.code && (
                <p className="text-xs text-red-500 mt-1">{errors.code}</p>
              )}
            </div>

            {/* Framework Category Name Field */}
            <div className="space-y-1.5">
              <Label htmlFor="category-name">
                Framework Category Name <span className="required">*</span>
              </Label>
              <Input
                id="category-name"
                type="text"
                className={
                  errors.frameworkCategoryName &&
                  "border-red-500 focus-visible:ring-red-500/20"
                }
                value={formData.frameworkCategoryName}
                onChange={(e) =>
                  handleChange("frameworkCategoryName", e.target.value)
                }
                placeholder="Enter framework category name"
              />
              {errors.frameworkCategoryName && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.frameworkCategoryName}
                </p>
              )}
            </div>

            {/* Description Field */}
            <div className="space-y-1.5">
              <Label htmlFor="category-description">
                Description <span className="required">*</span>
              </Label>
              <Textarea
                id="category-description"
                className={cn(
                  "min-h-25",
                  errors.description &&
                    "border-red-500 focus-visible:ring-red-500/20",
                )}
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Enter category description"
                rows={4}
              />
              {errors.description && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Status Field - Only show in edit mode */}
            {mode === "edit" && (
              <div className="space-y-1.5">
                <Label htmlFor="category-status">Status</Label>
                <div className="flex items-center gap-4">
                  <Label className="flex items-center gap-2 cursor-pointer">
                    <Input
                      type="radio"
                      name="isActive"
                      checked={formData.isActive === true}
                      onChange={() => handleChange("isActive", true)}
                      className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                    />
                    <span className="text-sm font-medium">Active</span>
                  </Label>
                  <Label className="flex items-center gap-2 cursor-pointer">
                    <Input
                      type="radio"
                      name="isActive"
                      checked={formData.isActive === false}
                      onChange={() => handleChange("isActive", false)}
                      className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                    />
                    <span className="text-sm font-medium">Inactive</span>
                  </Label>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-end p-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded"
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
                  {mode === "create" ? "Create Category" : "Save Changes"}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
