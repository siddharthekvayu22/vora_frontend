import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Icon from "../../../components/Icon";
import SelectDropdown from "../../../components/custom/SelectDropdown";
import FileTypeCard from "../../../components/custom/FileTypeCard";
import {
  getOfficialFrameworkCategoryAccess,
  updateOfficialFramework,
} from "../../../services/officialFrameworkService";

/**
 * Update Framework Modal Component
 * Allows experts to update existing frameworks for categories they have approved access to
 */
export default function UpdateFrameworkModal({
  isOpen,
  onClose,
  onSuccess,
  framework,
}) {
  const [saving, setSaving] = useState(false);
  const [approvedCategories, setApprovedCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    frameworkCategoryId: "",
    frameworkName: "",
    frameworkCode: "",
    currentVersion: "",
    file: null,
  });

  const [errors, setErrors] = useState({});

  // Initialize form data when framework prop changes
  useEffect(() => {
    if (framework && isOpen && approvedCategories.length > 0) {
      // Find the matching category based on framework code
      const matchingCategory = approvedCategories.find(
        (cat) => cat.code === framework.frameworkCode,
      );

      setFormData({
        frameworkCategoryId:
          matchingCategory?.value || framework.frameworkCategory?.id || "",
        frameworkName: framework.frameworkName || "",
        frameworkCode: framework.frameworkCode || "",
        file: null, // File will be optional for updates
      });
    }
  }, [framework, isOpen, approvedCategories]);

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
          label: `${access.frameworkCategory.frameworkCategoryName} (${access.frameworkCategory.code})`,
          code: access.frameworkCategory.code,
          name: access.frameworkCategory.frameworkCategoryName,
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

  // Initialize form data after categories are loaded
  useEffect(() => {
    if (framework && isOpen && approvedCategories.length > 0) {
      // Find the matching category based on framework code
      const matchingCategory = approvedCategories.find(
        (cat) => cat.code === framework.frameworkCode,
      );

      setFormData({
        frameworkCategoryId:
          matchingCategory?.value || framework.frameworkCategory?.id || "",
        frameworkName: framework.frameworkName || "",
        frameworkCode: framework.frameworkCode || "",
        currentVersion: framework.currentVersion || "1.0.0",
        file: null, // File will be optional for updates
      });
    }
  }, [framework, isOpen, approvedCategories]);

  // Handle form input changes
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    // Auto-generate framework code when category is selected (but preserve existing name)
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
      // Define allowed file types - only Word, Excel, and PDF
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];

      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        toast.error(
          "File type not supported. Please upload PDF, DOC, DOCX, XLS, or XLSX files.",
        );
        return;
      }

      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast.error("File size must be less than 50MB");
        return;
      }

      // Auto-increment version based on current version
      const currentVersion = framework?.currentVersion || "1.0.0";
      const versionParts = currentVersion.split(".");
      const newPatchVersion = parseInt(versionParts[2] || 0) + 1;
      const suggestedVersion = `${versionParts[0]}.${versionParts[1]}.${newPatchVersion}`;

      setFormData((prev) => ({
        ...prev,
        file,
        currentVersion: suggestedVersion,
      }));
      if (errors.file) {
        setErrors((prev) => ({ ...prev, file: "" }));
      }
    }
  };

  // Handle file removal
  const handleFileRemove = () => {
    setFormData((prev) => ({ ...prev, file: null, currentVersion: "" }));
    // Reset the file input
    const fileInput = document.getElementById("update-framework-file");
    if (fileInput) {
      fileInput.value = "";
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
    // Only validate version if a new file is being uploaded
    if (formData.file) {
      if (!formData.currentVersion) {
        newErrors.currentVersion =
          "Version is required when uploading a new file";
      } else {
        // Validate semantic versioning format
        const versionRegex = /^\d+\.\d+\.\d+$/;
        if (!versionRegex.test(formData.currentVersion)) {
          newErrors.currentVersion =
            "Version must be in format X.Y.Z (e.g., 1.0.0)";
        }
      }
    }

    // Show errors in toast instead of inline
    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError);
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

      // Prepare form data for update
      const updateFormData = new FormData();

      // Only append file if a new file is selected
      if (formData.file) {
        updateFormData.append("file", formData.file);
      }

      updateFormData.append("resourceType", "official-framework");

      const metadata = {
        frameworkCode: formData.frameworkCode,
        frameworkCategoryId: formData.frameworkCategoryId,
        frameworkName: formData.frameworkName,
      };

      // Only add currentVersion if a new file is being uploaded
      if (formData.file && formData.currentVersion) {
        metadata.currentVersion = formData.currentVersion; // Already a string
      }

      updateFormData.append("metadata", JSON.stringify(metadata));

      // Update framework using the service
      const result = await updateOfficialFramework(
        framework.mainFileId,
        updateFormData,
      );

      toast.success(result.message || "Framework updated successfully!");
      onSuccess?.(result.data);
      handleClose();
    } catch (error) {
      console.error("Error updating framework:", error);
      toast.error(error.message || "Failed to update framework");
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
      currentVersion: "",
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
        className="bg-background rounded-2xl shadow-2xl max-w-[600px] w-[90%] max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-5 duration-300 sidebar-scroll border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-primary to-primary/80 text-white p-6 relative overflow-hidden min-h-[80px]">
          <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-white/10 rounded-full transform translate-x-[40%] -translate-y-[40%]"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon name="edit" size="24px" />
              <h2 className="text-xl font-bold text-white drop-shadow-sm">
                Update Framework
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
                  variant="default"
                  size="lg"
                  buttonClassName="border-2 py-[0.60rem] rounded-sm"
                />
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
              </div>

              {/* File Management Section - 2 Column Layout */}
              <div className="form-group">
                <label className="form-label mb-2">File Management</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Current File Column */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-foreground">
                        Current File
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium">
                        v{framework?.currentVersion || "1.0.0"}
                      </span>
                    </div>
                    {(() => {
                      // Get current version file info from fileVersions array
                      const currentVersionData = framework?.fileVersions?.find(
                        (v) => v.version === framework?.currentVersion,
                      );

                      // Use fileInfo if available (from list page), otherwise use currentVersionData (from detail page)
                      const fileInfo =
                        framework?.fileInfo || currentVersionData;

                      return fileInfo ? (
                        <div className="flex items-center w-full px-3 py-2.5 border-2 rounded-lg border-blue-200 bg-blue-50 dark:bg-blue-900/20 min-h-[70px]">
                          <FileTypeCard
                            fileName={fileInfo.originalFileName}
                            fileSize={fileInfo.fileSize}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-full px-3 py-2.5 border-2 border-dashed rounded-lg border-border min-h-[70px]">
                          <p className="text-xs text-muted-foreground">
                            No file information available
                          </p>
                        </div>
                      );
                    })()}
                  </div>

                  {/* New File Column */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-foreground">
                        New File
                      </span>
                      <span className="text-xs text-muted-foreground">
                        (Optional)
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                        onChange={handleFileChange}
                        className="hidden"
                        id="update-framework-file"
                      />

                      {!formData.file ? (
                        <label
                          htmlFor="update-framework-file"
                          className={`flex items-center justify-center w-full px-3 py-1 border-2 border-dashed rounded-lg cursor-pointer transition-colors hover:bg-accent/50 min-h-[70px] ${
                            errors.file ? "border-red-500" : "border-border"
                          }`}
                        >
                          <div className="text-center">
                            <Icon
                              name="upload"
                              size="20px"
                              className="text-muted-foreground mb-1 mx-auto"
                            />
                            <p className="text-xs font-medium text-foreground">
                              Upload new file
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              PDF, DOC, XLS (Max 50MB)
                            </p>
                          </div>
                        </label>
                      ) : (
                        <div
                          className={`flex items-center justify-between w-full px-3 py-2.5 border-2 rounded-lg min-h-[70px] ${
                            errors.file
                              ? "border-red-500"
                              : "border-green-200 bg-green-50 dark:bg-green-900/20"
                          }`}
                        >
                          <FileTypeCard
                            fileName={formData.file.name}
                            fileSize={formData.file.size}
                          />
                          <div className="flex items-center gap-2 ml-2">
                            <label
                              htmlFor="update-framework-file"
                              className="flex items-center justify-center w-8 h-8 text-primary bg-primary/10 border border-primary/20 rounded hover:bg-primary/20 transition-colors cursor-pointer"
                              title="Change file"
                            >
                              <Icon name="refresh" size="18px" />
                            </label>
                            <button
                              type="button"
                              onClick={handleFileRemove}
                              className="flex items-center justify-center w-8 h-8 text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                              title="Remove file"
                            >
                              <Icon name="close" size="18px" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Version - Show when uploading new file */}
              {formData.file && (
                <div className="form-group">
                  <label className="form-label">
                    New Version <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-input ${errors.currentVersion ? "error" : ""}`}
                    value={formData.currentVersion}
                    onChange={(e) =>
                      handleChange("currentVersion", e.target.value)
                    }
                    placeholder="e.g., 1.1.0, 2.0.0"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Semantic version format: X.Y.Z (current:{" "}
                    {framework?.currentVersion || "1.0.0"})
                  </p>
                </div>
              )}
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
                  Updating...
                </>
              ) : (
                <>
                  <Icon name="save" size="16px" />
                  Update Framework
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
