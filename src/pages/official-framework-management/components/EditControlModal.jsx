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
        Deployment_points: Array.isArray(control.Deployment_points)
            ? control.Deployment_points.map((point, i) => `${i + 1}. ${point}`).join('\n')
            : control.Deployment_points || "",
    });
    const [saving, setSaving] = useState(false);

    const handleChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Convert Deployment_points string to array
            const deploymentPointsArray = formData.Deployment_points
                .split('\n')
                .map(point => point.trim().replace(/^\d+\.\s*/, '')) // Remove numbering if present
                .filter(point => point.length > 0); // Remove empty lines

            await onSave({
                ...control,
                ...formData,
                Deployment_points: deploymentPointsArray,
            });
        } catch (error) {
            console.error("Error saving control:", error);
        } finally {
            setSaving(false);
        }
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

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div className="bg-muted rounded-xl p-3 border-l-4 border-primary">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center">
                                <span className="text-sm font-bold">{control.Control_id}</span>
                            </div>
                            <div className="flex-1 flex items-center gap-2 flex-wrap">
                                <h4 className="text-base font-semibold text-foreground m-0">
                                    {formData.Control_name}
                                </h4>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary/15 text-secondary">
                                    {formData.Control_type}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Control Name
                        </label>
                        <input
                            type="text"
                            value={formData.Control_name}
                            onChange={(e) =>
                                handleChange("Control_name", e.target.value)
                            }
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
                            onChange={(e) =>
                                handleChange("Control_type", e.target.value)
                            }
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
                            className="w-full min-h-[120px] px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-y"
                            placeholder="Enter control description..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Deployment Points
                        </label>
                        <textarea
                            value={formData.Deployment_points}
                            onChange={(e) =>
                                handleChange("Deployment_points", e.target.value)
                            }
                            className="w-full min-h-[200px] px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-y"
                            placeholder="Enter deployment points (one per line or numbered)..."
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                            Enter each point on a new line. Numbering is optional.
                        </p>
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
                        type="button"
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-primary text-white hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
                        onClick={handleSave}
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
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
