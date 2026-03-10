import { useState } from "react";
import { toast } from "sonner";
import Icon from "../../../components/Icon";
import FileTypeCard from "../../../components/custom/FileTypeCard";
import { uploadCompanyDocument } from "../../../services/companyDocumentService";
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

export default function UploadCompanyDocumentModal({
  isOpen,
  onClose,
  onSuccess,
}) {
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    documentName: "",
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
    const fileInput = document.getElementById("company-document-file");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.documentName.trim()) {
      newErrors.documentName = "Document name is required";
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
      newErrors.file = "Document file is required";
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
      uploadFormData.append("resourceType", "company-document");

      const metadata = {
        documentName: formData.documentName,
        currentVersion: formData.currentVersion,
      };
      uploadFormData.append("metadata", JSON.stringify(metadata));

      const result = await uploadCompanyDocument(uploadFormData);

      toast.success(result.message || "Document uploaded successfully!");
      onSuccess?.(result.data);
      handleClose();
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error(error.message || "Failed to upload document");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setFormData({
      documentName: "",
      currentVersion: "1.0.0",
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
            <Icon name="upload" size="24px" />
            <DialogTitle className="text-xl font-bold text-white drop-shadow-sm">
              Upload Company Document
            </DialogTitle>
          </div>
          <DialogDescription className="sr-only">
            Upload a new company document with file and metadata
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 p-3">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Document Name */}
            <div className="space-y-1.5">
              <Label htmlFor="document-name">
                Document Name <span className="required">*</span>
              </Label>
              <Input
                id="document-name"
                type="text"
                className={
                  errors.documentName &&
                  "border-red-500 focus-visible:ring-red-500/20"
                }
                value={formData.documentName}
                onChange={(e) => handleChange("documentName", e.target.value)}
                placeholder="e.g., Company Policy Document"
              />
            </div>

            {/* Version */}
            <div className="space-y-1.5">
              <Label htmlFor="version">
                Version <span className="required">*</span>
              </Label>
              <Input
                id="version"
                type="text"
                className={
                  errors.currentVersion &&
                  "border-red-500 focus-visible:ring-red-500/20"
                }
                value={formData.currentVersion}
                onChange={(e) => handleChange("currentVersion", e.target.value)}
                placeholder="e.g., 1.0.0"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Semantic version format: X.Y.Z (e.g., 1.0.0, 2.1.3)
              </p>
            </div>

            {/* File Upload */}
            <div className="space-y-1.5">
              <Label htmlFor="document-file">
                Document File <span className="required">*</span>
              </Label>
              <div className="relative">
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="company-document-file"
                />

                {!formData.file ? (
                  <Label
                    htmlFor="company-document-file"
                    className={cn(
                      "flex items-center justify-center w-full px-4 py-8 border-2 border-dashed rounded cursor-pointer transition-colors hover:bg-accent/50",
                      errors.file ? "border-red-500" : "border-border",
                    )}
                  >
                    <div className="text-center">
                      <Icon
                        name="upload"
                        size="32px"
                        className="text-muted-foreground mb-2 mx-auto"
                      />
                      <p className="text-sm font-medium text-foreground">
                        Click to upload document file
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Supports: PDF, DOC, DOCX, XLS, XLSX
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Maximum file size: 50MB
                      </p>
                    </div>
                  </Label>
                ) : (
                  <div
                    className={cn(
                      "flex items-center justify-between w-full px-4 py-4 border-2 rounded",
                      errors.file
                        ? "border-red-500"
                        : "border-green-200 bg-green-50 dark:bg-green-900/20",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <FileTypeCard
                        fileName={formData.file.name}
                        fileSize={formData.file.size}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor="company-document-file"
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
                Uploading...
              </>
            ) : (
              <>
                <Icon name="upload" size="16px" />
                Upload Document
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
