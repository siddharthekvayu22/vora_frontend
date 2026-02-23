import { useState } from "react";
import toast from "react-hot-toast";
import Icon from "../../../components/Icon";
import FileTypeCard from "../../../components/custom/FileTypeCard";
import { uploadCompanyFramework } from "../../../services/companyFrameworkService";
import { Button } from "@/components/ui/button";

export default function UploadCompanyFrameworkModal({
  isOpen,
  onClose,
  onSuccess,
}) {
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    frameworkName: "",
    currentVersion: "1.0.0",
    file: null,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error(
          "File type not supported. Please upload PDF, DOC, DOCX, XLS, or XLSX files.",
        );
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        toast.error("File size must be less than 50MB");
        return;
      }

      setFormData((prev) => ({ ...prev, file }));
      if (errors.file) {
        setErrors((prev) => ({ ...prev, file: "" }));
      }
    }
  };

  const handleFileRemove = () => {
    setFormData((prev) => ({ ...prev, file: null }));
    const fileInput = document.getElementById("company-framework-file");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.frameworkName.trim()) {
      newErrors.frameworkName = "Framework name is required";
    }
    if (!formData.currentVersion) {
      newErrors.currentVersion = "Version is required";
    } else {
      const versionRegex = /^\d+\.\d+\.\d+$/;
      if (!versionRegex.test(formData.currentVersion)) {
        newErrors.currentVersion =
          "Version must be in format X.Y.Z (e.g., 1.0.0)";
      }
    }
    if (!formData.file) {
      newErrors.file = "Framework file is required";
    }

    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      const uploadFormData = new FormData();
      uploadFormData.append("file", formData.file);
      uploadFormData.append("resourceType", "company-framework");

      const metadata = {
        frameworkName: formData.frameworkName,
        currentVersion: formData.currentVersion,
      };
      uploadFormData.append("metadata", JSON.stringify(metadata));

      const result = await uploadCompanyFramework(uploadFormData);

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

  const handleClose = () => {
    setFormData({
      frameworkName: "",
      currentVersion: "1.0.0",
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
        <div className="bg-gradient-to-br from-primary to-primary/80 text-white p-6 relative overflow-hidden min-h-[80px]">
          <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-white/10 rounded-full transform translate-x-[40%] -translate-y-[40%]"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon name="upload" size="24px" />
              <h2 className="text-xl font-bold text-white drop-shadow-sm">
                Upload Company Framework
              </h2>
            </div>
            <Button
              className="bg-white/10 border border-white/20 text-white backdrop-blur-sm rounded-full w-9 h-9 flex items-center justify-center hover:bg-white/20 hover:border-white/40 hover:scale-105 transition-all duration-200 cursor-pointer"
              onClick={handleClose}
              disabled={saving}
              title="Close"
            >
              <Icon name="close" size="20px" />
            </Button>
          </div>
        </div>

        <div className="p-4">
          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="form-group">
              <label className="form-label">
                Framework Name <span className="required">*</span>
              </label>
              <input
                type="text"
                className={`form-input ${errors.frameworkName ? "error" : ""}`}
                value={formData.frameworkName}
                onChange={(e) => handleChange("frameworkName", e.target.value)}
                placeholder="e.g., Company Security Framework"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Version <span className="required">*</span>
              </label>
              <input
                type="text"
                className={`form-input ${errors.currentVersion ? "error" : ""}`}
                value={formData.currentVersion}
                onChange={(e) => handleChange("currentVersion", e.target.value)}
                placeholder="e.g., 1.0.0"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Semantic version format: X.Y.Z (e.g., 1.0.0, 2.1.3)
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">
                Framework File <span className="required">*</span>
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="company-framework-file"
                />

                {!formData.file ? (
                  <label
                    htmlFor="company-framework-file"
                    className={`flex items-center justify-center w-full px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer transition-colors hover:bg-accent/50 ${
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
                        Click to upload framework file
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Supports: PDF, DOC, DOCX, XLS, XLSX
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Maximum file size: 50MB
                      </p>
                    </div>
                  </label>
                ) : (
                  <div
                    className={`flex items-center justify-between w-full px-4 py-4 border-2 rounded-lg ${
                      errors.file
                        ? "border-red-500"
                        : "border-green-200 bg-green-50 dark:bg-green-900/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FileTypeCard
                        fileName={formData.file.name}
                        fileSize={formData.file.size}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="company-framework-file"
                        className="flex items-center justify-center w-8 h-8 text-primary bg-primary/10 border border-primary/20 rounded hover:bg-primary/20 transition-colors cursor-pointer"
                        title="Change file"
                      >
                        <Icon name="refresh" size="18px" />
                      </label>
                      <Button
                        type="button"
                        size="icon"
                        onClick={handleFileRemove}
                        className="flex items-center justify-center w-8 h-8 text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        title="Remove file"
                      >
                        <Icon name="close" size="18px" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        <div className="flex gap-2 justify-end p-3 border-t border-border">
          <Button
            type="button"
            variant="outline"
            className="flex-1 rounded-lg"
            onClick={handleClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
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
          </Button>
        </div>
      </div>
    </div>
  );
}
