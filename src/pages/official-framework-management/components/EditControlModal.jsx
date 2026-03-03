import { useState } from "react";
import Icon from "../../../components/Icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

/**
 * EditControlModal Component - Modal for editing AI extracted control details
 *
 * @param {Object} control - Control object to edit
 * @param {Function} onSave - Save handler (receives updated control)
 * @param {Function} onCancel - Cancel handler
 */
export default function EditControlModal({ control, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    Control_name: control?.Control_name || "",
    Control_type: control?.Control_type || "",
    Control_description: control?.Control_description || "",
  });

  // Initialize deployment points as array
  const [deploymentPoints, setDeploymentPoints] = useState(() => {
    if (control && Array.isArray(control.Deployment_points)) {
      return control.Deployment_points.length > 0
        ? control.Deployment_points
        : [""];
    }
    return [""];
  });

  const [saving, setSaving] = useState(false);

  if (!control) return null;

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
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="lg:max-w-175">
        <DialogHeader className="flex flex-row items-center justify-between bg-linear-to-br from-primary to-primary/80 text-white py-4">
          <div className="flex items-center gap-3">
            <Icon name="edit" size="24px" />
            <div>
              <DialogTitle className="text-xl font-bold text-white drop-shadow-sm">
                Edit Control
              </DialogTitle>
              <DialogDescription className="text-sm text-white/80 mt-1">
                {formData.Control_name}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
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

          <DialogFooter className="pt-4 border-t border-border p-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
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
                className="w-full inline-flex items-center justify-center gap-2 bg-primary text-white hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
