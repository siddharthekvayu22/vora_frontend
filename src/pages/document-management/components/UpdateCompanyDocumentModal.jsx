import { useState, useEffect } from "react";
import { toast } from "sonner";
import Icon from "../../../components/Icon";
import FileTypeCard from "../../../components/custom/FileTypeCard";
import { updateCompanyDocument } from "../../../services/companyDocumentService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function UpdateCompanyDocumentModal({
  isOpen,
  onClose,
  onSuccess,
  document,
}) {
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    documentName: "",
    currentVersion: "",
    file: null,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (document && isOpen) {
      setFormData({
        documentName: document.documentName || "",
        currentVersion: document.currentVersion || "1.0.0",
        file: null,
      });
    }
  }, [document, isOpen]);

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

      const currentVersion = document?.currentVersion || "1.0.0";
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

  const handleFileRemove = () => {
    setFormData((prev) => ({ ...prev, file: null, currentVersion: "" }));
    const fileInput = document.getElementById("update-company-document-file");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.documentName.trim()) {
      newErrors.documentName = "Document name is required";
    }
    if (formData.file) {
      if (!formData.currentVersion) {
        newErrors.currentVersion =
          "Version is required when uploading a new file";
      } else {
        const versionRegex = /^\d+\.\d+\.\d+$/;
        if (!versionRegex.test(formData.currentVersion)) {
          newErrors.currentVersion =
            "Version must be in format X.Y.Z (e.g., 1.0.0)";
        }
      }
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

      const updateFormData = new FormData();

      if (formData.file) {
        updateFormData.append("file", formData.file);
      }

      updateFormData.append("resourceType", "company-document");

      const metadata = {
        documentName: formData.documentName,
      };

      if (formData.file && formData.currentVersion) {
        metadata.currentVersion = formData.currentVersion;
      }

      updateFormData.append("metadata", JSON.stringify(metadata));

      const result = await updateCompanyDocument(
        document.mainFileId,
        updateFormData,
      );

      toast.success(result.message || "Document updated successfully!");
      onSuccess?.(result.data);
      handleClose();
    } catch (error) {
      console.error("Error updating document:", error);
      toast.error(error.message || "Failed to update document");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setFormData({
      documentName: "",
      currentVersion: "",
      file: null,
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="lg:max-w-150 max-h-[90vh]">
        <DialogHeader className="bg-linear-to-br from-primary to-primary/80 text-white py-4">
          <div className="flex items-center gap-3">
            <Icon name="edit" size="24px" />
            <DialogTitle className="text-xl font-bold text-white drop-shadow-sm">
              Update Company Document
            </DialogTitle>
          </div>
          <DialogDescription className="sr-only">
            Update company document details and upload new version
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 p-3">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Document Name */}
            <div className="space-y-1.5">
              <Label htmlFor="documentName">
                Document Name <span className="required">*</span>
              </Label>
              <Input
                type="text"
                id="documentName"
                className={
                  errors.documentName &&
                  "border-red-500 focus-visible:ring-red-500/20"
                }
                value={formData.documentName}
                onChange={(e) => handleChange("documentName", e.target.value)}
                placeholder="e.g., Company Policy Document"
              />
            </div>

            {/* File Management Section - 2 Column Layout */}
            <div className="space-y-1.5">
              <Label htmlFor="file-management" className="mb-2">
                File Management
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Current File Column */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-foreground">
                      Current File
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium">
                      v{document?.currentVersion || "1.0.0"}
                    </span>
                  </div>
                  {(() => {
                    const currentVersionData = document?.fileVersions?.find(
                      (v) => v.version === document?.currentVersion,
                    );

                    const fileInfo = document?.fileInfo || currentVersionData;

                    return fileInfo ? (
                      <div className="flex items-center w-full px-3 py-2.5 border-2 rounded border-blue-200 bg-blue-50 dark:bg-blue-900/20 min-h-17.5">
                        <FileTypeCard
                          fileName={fileInfo.originalFileName}
                          fileSize={fileInfo.fileSize}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-full px-3 py-2.5 border-2 border-dashed rounded border-border min-h-17.5">
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
                      id="update-company-document-file"
                    />

                    {!formData.file ? (
                      <Label
                        htmlFor="update-company-document-file"
                        className={cn(
                          "flex items-center justify-center w-full px-3 py-1 border-2 border-dashed rounded cursor-pointer transition-colors hover:bg-accent/50 min-h-17.5",
                          errors.file ? "border-red-500" : "border-border",
                        )}
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
                      </Label>
                    ) : (
                      <div
                        className={cn(
                          "flex items-center justify-between w-full px-3 py-2.5 border-2 rounded min-h-17.5",
                          errors.file
                            ? "border-red-500"
                            : "border-green-200 bg-green-50 dark:bg-green-900/20",
                        )}
                      >
                        <FileTypeCard
                          fileName={formData.file.name}
                          fileSize={formData.file.size}
                        />
                        <div className="flex items-center gap-2 ml-2">
                          <Label
                            htmlFor="update-company-document-file"
                            className="flex items-center justify-center w-8 h-8 text-primary bg-primary/10 border border-primary/20 rounded hover:bg-primary/20 transition-colors cursor-pointer"
                            title="Change file"
                          >
                            <Icon name="refresh" size="18px" />
                          </Label>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
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
              </div>
            </div>

            {/* Version - Show when uploading new file */}
            {formData.file && (
              <div className="space-y-1.5">
                <Label htmlFor="new-version">
                  New Version <span className="required">*</span>
                </Label>
                <Input
                  id="new-version"
                  type="text"
                  className={
                    errors.currentVersion &&
                    "border-red-500 focus-visible:ring-red-500/20"
                  }
                  value={formData.currentVersion}
                  onChange={(e) =>
                    handleChange("currentVersion", e.target.value)
                  }
                  placeholder="e.g., 1.1.0, 2.0.0"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Semantic version format: X.Y.Z (current:{" "}
                  {document?.currentVersion || "1.0.0"})
                </p>
              </div>
            )}
          </form>
        </div>

        <DialogFooter className="pt-4 border-t border-border p-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1 rounded"
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
                Updating...
              </>
            ) : (
              <>
                <Icon name="check" size="16px" />
                Update Document
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
