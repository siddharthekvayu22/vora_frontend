import { useState } from "react";
import Icon from "../../../components/Icon";
import { Button } from "@/components/ui/button";

/**
 * EditControlModal Component - Modal for editing AI extracted control details
 *
 * @param {Object} control - Control object to edit
 * @param {Function} onSave - Save handler (receives updated control)
 * @param {Function} onCancel - Cancel handler
 */
export default function EditControlModal({ control, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    Control_name: control.Control_name || "",
    Control_type: control.Control_type || "",
    Control_description: control.Control_description || "",
  });

  // Initialize deployment points as array
  const [deploymentPoints, setDeploymentPoints] = useState(() => {
    if (Array.isArray(control.Deployment_points)) {
      return control.Deployment_points.length > 0
        ? control.Deployment_points
        : [""];
    }
    return [""];
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePointChange = (index, value) => {
    const newPoints = [...deploymentPoints];
    newPoints[index] = value;
    setDeploymentPoints(newPoints);
  };

  const addPoint = () => {
    setDeploymentPoints([...deploymentPoints, ""]);
  };

  const removePoint = (index) => {
    if (deploymentPoints.length > 1) {
      const newPoints = deploymentPoints.filter((_, i) => i !== index);
      setDeploymentPoints(newPoints);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Filter out empty points
      const filteredPoints = deploymentPoints
        .map((point) => point.trim())
        .filter((point) => point.length > 0);

      await onSave({
        ...control,
        ...formData,
        Deployment_points: filteredPoints,
      });
    } catch (error) {
      console.error("Error saving control:", error);
    } finally {
      setSaving(false);
    }
  };

  // Check if form is valid
  const isFormValid = () => {
    // Check if at least one deployment point has content
    const hasValidPoints = deploymentPoints.some(
      (point) => point.trim().length > 0,
    );
    return hasValidPoints;
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10000] animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div
        className="bg-background rounded-2xl shadow-2xl max-w-[700px] w-[90%] max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-5 duration-300 border border-border flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-br from-primary to-primary/80 text-white p-6 relative overflow-hidden min-h-[80px]">
          <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-white/10 rounded-full transform translate-x-[40%] -translate-y-[40%]"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon name="edit" size="24px" />
              <div>
                <h2 className="text-xl font-bold text-white drop-shadow-sm">
                  Edit Control
                </h2>
                <p className="text-sm text-white/80 mt-1">
                  {formData.Control_name}
                </p>
              </div>
            </div>
            <Button
              size="icon"
              className="bg-white/10 border border-white/20 text-white backdrop-blur-sm rounded-full w-9 h-9 flex items-center justify-center hover:bg-white/20 hover:border-white/40 hover:scale-105 transition-all duration-200 cursor-pointer"
              onClick={onCancel}
              title="Close"
            >
              <Icon name="x" size="20px" />
            </Button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Control Name
              </label>
              <input
                type="text"
                value={formData.Control_name}
                onChange={(e) => handleChange("Control_name", e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                placeholder="Enter control name..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Control Type
              </label>
              <input
                type="text"
                value={formData.Control_type}
                onChange={(e) => handleChange("Control_type", e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                placeholder="Enter control type (e.g., Technical, Administrative)..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <textarea
                value={formData.Control_description}
                onChange={(e) =>
                  handleChange("Control_description", e.target.value)
                }
                rows={3}
                className="w-full h-auto px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
                placeholder="Enter control description..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-foreground">
                  Deployment Points
                </label>
                <Button
                  type="button"
                  size="sm"
                  onClick={addPoint}
                  className="h-7 px-2 text-xs bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                >
                  <Icon name="plus" size="14px" />
                  <span className="ml-1">Add Point</span>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Add deployment points one by one. Each point will be numbered
                automatically.
              </p>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {deploymentPoints.map((point, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-shrink-0 w-6 h-9 flex items-center justify-center text-xs font-medium text-muted-foreground bg-muted rounded">
                      {index + 1}
                    </div>
                    <input
                      type="text"
                      value={point}
                      onChange={(e) => handlePointChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                      placeholder={`Enter point ${index + 1}...`}
                    />
                    {deploymentPoints.length > 1 && (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => removePoint(index)}
                        className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="Remove point"
                      >
                        <Icon name="trash" size="16px" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end p-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-lg"
              onClick={onCancel}
              disabled={saving}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-primary text-white hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={saving || !isFormValid()}
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Icon name="check" size="16px" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
