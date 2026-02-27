import { useState } from "react";
import Icon from "../../../components/Icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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

  const isDisabled = saving || !isFormValid();

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10000 animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div
        className="bg-background rounded shadow-2xl max-w-175 w-[90%] max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-5 duration-300 border border-border flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-linear-to-br from-primary to-primary/80 text-white p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-37.5 h-37.5 bg-white/10 rounded-full transform translate-x-[40%] -translate-y-[40%]"></div>
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
            {/* Control Name */}
            <div className="space-y-2">
              <Label
                htmlFor="control-name"
                className="block text-sm font-medium text-foreground"
              >
                Control Name
              </Label>
              <Input
                id="control-name"
                type="text"
                value={formData.Control_name}
                onChange={(e) => handleChange("Control_name", e.target.value)}
                placeholder="Enter control name..."
              />
            </div>

            {/* Control Type */}
            <div className="space-y-2">
              <Label
                htmlFor="control-type"
                className="block text-sm font-medium text-foreground"
              >
                Control Type
              </Label>
              <Input
                id="control-type"
                type="text"
                value={formData.Control_type}
                onChange={(e) => handleChange("Control_type", e.target.value)}
                placeholder="Enter control type (e.g., Technical, Administrative)..."
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="block text-sm font-medium text-foreground"
              >
                Description
              </Label>
              <Textarea
                value={formData.Control_description}
                onChange={(e) =>
                  handleChange("Control_description", e.target.value)
                }
                rows={3}
                className="min-h-20 resize-none"
                placeholder="Enter control description..."
              />
            </div>

            {/* Deployment Points */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="deployment-points"
                  className="block text-sm font-medium text-foreground"
                >
                  Deployment Points
                </Label>
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
              <p className="text-xs text-muted-foreground">
                Add deployment points one by one. Each point will be numbered
                automatically.
              </p>
              <div className="space-y-2 max-h-75 overflow-y-auto py-1">
                {deploymentPoints.map((point, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="shrink-0 w-6 h-9 flex items-center justify-center text-xs font-medium text-muted-foreground bg-muted rounded">
                      {index + 1}
                    </div>
                    <Input
                      type="text"
                      value={point}
                      onChange={(e) => handlePointChange(index, e.target.value)}
                      className="flex-1"
                      placeholder={`Enter point ${index + 1}...`}
                    />
                    {deploymentPoints.length > 1 && (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => removePoint(index)}
                        className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
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
              className="flex-1 rounded"
              onClick={onCancel}
              disabled={saving}
            >
              Cancel
            </Button>

            <div
              className="flex-1"
              style={{ cursor: isDisabled ? "not-allowed" : "pointer" }}
            >
              <Button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 bg-primary text-white hover:bg-primary/90 disabled:opacity-60"
                disabled={isDisabled}
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
          </div>
        </form>
      </div>
    </div>
  );
}
