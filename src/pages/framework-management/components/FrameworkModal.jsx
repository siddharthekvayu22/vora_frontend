import { useState, useEffect } from "react";
import Icon from "../../../components/Icon";

function FrameworkModal({ isOpen, onClose, onSave, framework, mode }) {
  const [formData, setFormData] = useState({
    frameworkName: "",
    file: null,
  });
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && framework) {
        setFormData({
          frameworkName: framework.frameworkName || "",
          file: null,
        });
      } else {
        setFormData({
          frameworkName: "",
          file: null,
        });
      }
      setLoading(false);
    }
  }, [isOpen, framework, mode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ 
        ...prev, 
        file,
        frameworkName: prev.frameworkName || file.name.split('.')[0]
      }));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setFormData((prev) => ({ 
        ...prev, 
        file,
        frameworkName: prev.frameworkName || file.name.split('.')[0]
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (loading) return;
    
    if (mode === "create" && !formData.file) {
      alert("Please select a file to upload");
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error("Error saving framework:", error);
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            {mode === "create" ? "Upload Framework" : "Edit Framework"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <Icon name="close" size="20px" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <fieldset disabled={loading} className="space-y-4">
            {/* Framework Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Framework Name
              </label>
              <input
                type="text"
                name="frameworkName"
                value={formData.frameworkName}
                onChange={handleInputChange}
                placeholder="Enter framework name"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* File Upload - Show in both create and edit modes */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {mode === "create" ? "Select File" : "Change File (Optional)"}
              </label>
              
              {/* Current File Info for Edit Mode */}
              {mode === "edit" && framework && (
                <div className="mb-3 p-3 border border-border rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon name="framework" size="16px" className="text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        Current: {framework.originalFileName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {framework.frameworkType?.toUpperCase()} • {framework.fileSize}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Drag & Drop Area */}
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                } ${loading ? "opacity-50 pointer-events-none" : ""}`}
                onDragEnter={loading ? undefined : handleDrag}
                onDragLeave={loading ? undefined : handleDrag}
                onDragOver={loading ? undefined : handleDrag}
                onDrop={loading ? undefined : handleDrop}
              >
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept=".pdf,.doc,.docx,.txt,.json,.xml,.xlsx,.xls"
                  disabled={loading}
                  multiple={false}
                />
                
                {formData.file ? (
                  <div className="space-y-2">
                    <div className="w-12 h-12 mx-auto bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon name="framework" size="24px" className="text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{formData.file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(formData.file.size)}
                      </p>
                      <p className="text-xs text-green-600">
                        {mode === "edit" ? "New file selected" : "File selected"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 mx-auto bg-muted rounded-lg flex items-center justify-center">
                      <Icon name="upload" size="24px" className="text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {mode === "create" 
                          ? "Drop your framework file here or click to browse"
                          : "Drop a new file here or click to browse (optional)"
                        }
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Supports PDF, DOC, DOCX, TXT, JSON, XML, XLSX
                      </p>
                      {mode === "edit" && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Leave empty to keep the current file
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </fieldset>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            
            {/* Show Remove button only when file is selected */}
            {formData.file && (
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, file: null }))}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-red-200 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Remove
              </button>
            )}
            
            <button
              type="submit"
              disabled={loading || (mode === "create" && !formData.file)}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Uploading..." : mode === "create" ? "Upload" : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FrameworkModal;