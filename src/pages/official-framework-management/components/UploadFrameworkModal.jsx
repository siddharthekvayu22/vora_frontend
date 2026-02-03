import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Icon from "../../../components/Icon";
import SelectDropdown from "../../../components/custom/SelectDropdown";
import {
  getOfficialFrameworkCategoryAccess,
  uploadFramework,
} from "../../../services/officialFrameworkService";

/**
 * Upload Framework Modal Component
 * Allows experts to upload frameworks for categories they have approved access to
 */
export default function UploadFrameworkModal({ isOpen, onClose, onSuccess }) {
  const [saving, setSaving] = useState(false);
  const [approvedCategories, setApprovedCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    frameworkCategoryId: "",
    frameworkName: "",
    frameworkCode: "",
    file: null,
  });

  const [errors, setErrors] = useState({});

  // Fetch approved framework categories for the expert
  const fetchApprovedCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await getOfficialFrameworkCategoryAccess();

      // Filter only approved access records
      const approved = response.data
        .filter((access) => access.status === "approved")
        .map((access) => ({
          value: access.frameworkCategory.id,
          label: access.frameworkCategory.frameworkCategoryName,
          code: access.frameworkCategory.code,
        }));

      setApprovedCategories(approved);
    } catch (error) {
      console.error("Error fetching approved categories:", error);
      toast.error("Failed to load approved categories");
      setApprovedCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Load approved categories when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchApprovedCategories();
    }
  }, [isOpen]);

  // Handle form input changes
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    // Auto-generate framework code when category is selected
    if (field === "frameworkCategoryId") {
      const selectedCategory = approvedCategories.find(
        (cat) => cat.value === value,
      );
      if (selectedCategory) {
        setFormData((prev) => ({
          ...prev,
          frameworkCode: selectedCategory.code,
          [field]: value,
        }));
      }
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type (PDF only)
      if (file.type !== "application/pdf") {
        toast.error("Only PDF files are allowed");
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }

      setFormData((prev) => ({ ...prev, file }));
      if (errors.file) {
        setErrors((prev) => ({ ...prev, file: "" }));
      }
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.frameworkCategoryId) {
      newErrors.frameworkCategoryId = "Framework category is required";
    }
    if (!formData.frameworkName.trim()) {
      newErrors.frameworkName = "Framework name is required";
    }
    if (!formData.frameworkCode.trim()) {
      newErrors.frameworkCode = "Framework code is required";
    }
    if (!formData.file) {
      newErrors.file = "Framework file is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      // Prepare form data for upload
      const uploadFormData = new FormData();
      uploadFormData.append("file", formData.file);
      uploadFormData.append("resourceType", "official-framework");
      uploadFormData.append("fileName", formData.frameworkName);

      const metadata = {
        frameworkCode: formData.frameworkCode,
        frameworkCategoryId: formData.frameworkCategoryId,
        frameworkName: formData.frameworkName,
      };
      uploadFormData.append("metadata", JSON.stringify(metadata));

      // Upload framework using the service
      const result = await uploadFramework(uploadFormData);

      toast.success(result.message || "Framework uploaded successfully!");
      onSuccess?.(result.data);
      handleClose();
    } catch (error) {
      console.error("Error uploading framework:", error);
      toast.error(error.message || "Failed to upload framework");
    } finally {
      setSaving(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    setFormData({
      frameworkCategoryId: "",
      frameworkName: "",
      frameworkCode: "",
      file: null,
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10000] animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="bg-background rounded-2xl shadow-2xl max-w-[600px] w-[90%] max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-5 duration-300 sidebar-scroll"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-primary to-primary/80 text-white p-6 relative overflow-hidden min-h-[80px]">
          <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-white/10 rounded-full transform translate-x-[40%] -translate-y-[40%]"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon name="upload" size="24px" />
              <h2 className="text-xl font-bold text-white drop-shadow-sm">
                Upload Framework
              </h2>
            </div>
            <button
              className="bg-white/10 border border-white/20 text-white backdrop-blur-sm rounded-full w-9 h-9 flex items-center justify-center hover:bg-white/20 hover:border-white/40 hover:scale-105 transition-all duration-200 cursor-pointer"
              onClick={handleClose}
              disabled={saving}
              title="Close"
            >
              <Icon name="close" size="20px" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {loadingCategories ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-muted-foreground">
                  Loading approved categories...
                </span>
              </div>
            </div>
          ) : approvedCategories.length === 0 ? (
            <div className="text-center py-12">
              <Icon
                name="warning"
                size="48px"
                className="text-muted-foreground mb-4 mx-auto"
              />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No Approved Categories
              </h3>
              <p className="text-muted-foreground mb-4">
                You don't have approved access to any framework categories.
              </p>
              <p className="text-sm text-muted-foreground">
                Please request access to framework categories first.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col">
              {/* Framework Category */}
              <div className="form-group">
                <label className="form-label">
                  Framework Category <span className="required">*</span>
                </label>
                <SelectDropdown
                  value={formData.frameworkCategoryId}
                  onChange={(value) =>
                    handleChange("frameworkCategoryId", value)
                  }
                  options={[
                    { value: "", label: "Select a category" },
                    ...approvedCategories,
                  ]}
                  placeholder="Choose framework category"
                  variant="outline"
                />
                {errors.frameworkCategoryId && (
                  <span className="error-message">
                    {errors.frameworkCategoryId}
                  </span>
                )}
              </div>

              {/* Framework Name */}
              <div className="form-group">
                <label className="form-label">
                  Framework Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className={`form-input ${errors.frameworkName ? "error" : ""}`}
                  value={formData.frameworkName}
                  onChange={(e) =>
                    handleChange("frameworkName", e.target.value)
                  }
                  placeholder="e.g., ISO 27001 Security Framework"
                />
                {errors.frameworkName && (
                  <span className="error-message">{errors.frameworkName}</span>
                )}
              </div>

              {/* Framework Code */}
              <div className="form-group">
                <label className="form-label">
                  Framework Code <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className={`form-input font-mono ${errors.frameworkCode ? "error" : ""}`}
                  value={formData.frameworkCode}
                  onChange={(e) =>
                    handleChange("frameworkCode", e.target.value)
                  }
                  placeholder="e.g., iso27001"
                />
                {errors.frameworkCode && (
                  <span className="error-message">{errors.frameworkCode}</span>
                )}
              </div>

              {/* File Upload */}
              <div className="form-group">
                <label className="form-label">
                  Framework File (PDF) <span className="required">*</span>
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="framework-file"
                  />
                  <label
                    htmlFor="framework-file"
                    className={`flex items-center justify-center w-full px-4 py-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors hover:bg-accent/50 ${
                      errors.file ? "border-red-500" : "border-border"
                    }`}
                  >
                    <div className="text-center">
                      <Icon
                        name="upload"
                        size="32px"
                        className="text-muted-foreground mb-2 mx-auto"
                      />
                      <p className="text-sm font-medium text-foreground">
                        {formData.file
                          ? formData.file.name
                          : "Click to upload PDF file"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Maximum file size: 10MB
                      </p>
                    </div>
                  </label>
                </div>
                {errors.file && (
                  <span className="error-message">{errors.file}</span>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        {!loadingCategories && approvedCategories.length > 0 && (
          <div className="flex gap-2 justify-end p-3 border-t border-border">
            <button
              type="button"
              className="flex-1 px-4 py-2 text-sm font-semibold rounded-lg bg-muted text-foreground border-2 border-border hover:bg-muted/80 transition-all duration-200 cursor-pointer"
              onClick={handleClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none transition-all duration-200 cursor-pointer"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Icon name="upload" size="16px" />
                  Upload Framework
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
