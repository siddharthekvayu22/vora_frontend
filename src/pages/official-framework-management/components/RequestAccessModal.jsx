import { useState } from "react";
import toast from "react-hot-toast";
import Icon from "../../../components/Icon";
import { requestFrameworkAccess } from "../../../services/officialFrameworkService";
import { Button } from "@/components/ui/button";

/**
 * RequestAccessModal Component - Modal for requesting framework access
 *
 * @param {Object} framework - Framework to request access for (can be direct framework or access record with nested frameworkCategory)
 * @param {Function} onSuccess - Success handler
 * @param {Function} onClose - Close handler
 */
export default function RequestAccessModal({ framework, onSuccess, onClose }) {
  const [requesting, setRequesting] = useState(false);

  // Handle both data structures: direct framework object or nested frameworkCategory
  const getFrameworkData = () => {
    if (framework?.frameworkCategory) {
      // Data from OfficialFrameworkAccess (nested structure)
      return {
        id: framework.frameworkCategory.id,
        frameworkCategoryName:
          framework.frameworkCategory.frameworkCategoryName,
        code: framework.frameworkCategory.code,
        description: framework.frameworkCategory.description,
      };
    } else {
      // Data from OfficialFrameworkCategory (direct structure)
      return {
        id: framework?.id,
        frameworkCategoryName: framework?.frameworkCategoryName,
        code: framework?.code,
        description: framework?.description,
      };
    }
  };

  const frameworkData = getFrameworkData();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setRequesting(true);
    try {
      const response = await requestFrameworkAccess(frameworkData.id);

      toast.success(
        response.message || "Framework access requested successfully",
      );
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to request framework access");
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10000 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-background rounded-2xl shadow-2xl max-w-[550px] w-[90%] max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-5 duration-300 sidebar-scroll border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-linear-to-br from-primary to-primary/80 text-white p-6 relative overflow-hidden min-h-[80px]">
          <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-white/10 rounded-full transform translate-x-[40%] -translate-y-[40%]"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon name="plus-circle" size="24px" />
              <h2 className="text-xl font-bold text-white drop-shadow-sm">
                Request Framework Access
              </h2>
            </div>
            <Button
              size="icon"
              className="bg-white/10 border border-white/20 text-white backdrop-blur-sm rounded-full w-9 h-9 flex items-center justify-center hover:bg-white/20 hover:border-white/40 hover:scale-105 transition-all duration-200 cursor-pointer"
              onClick={onClose}
              title="Close"
            >
              <Icon name="x" size="20px" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 flex flex-col space-y-6">
            {/* Framework Details */}
            <div className="bg-muted/50 rounded-xl p-4 border border-border">
              <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <Icon name="info" size="16px" className="text-primary" />
                Framework Details
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Icon
                      name="shield"
                      size="20px"
                      className="text-purple-600 dark:text-purple-400"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-foreground">
                      {frameworkData?.frameworkCategoryName}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Code: {frameworkData?.code}
                    </p>
                  </div>
                </div>

                {frameworkData?.description && (
                  <div className="bg-background p-3 rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground mb-1">
                      Description:
                    </p>
                    <p className="text-sm text-foreground line-clamp-3">
                      {frameworkData.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-2 justify-end p-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-lg"
              onClick={onClose}
              disabled={requesting}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="flex-1 inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={requesting}
            >
              {requesting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Requesting...
                </>
              ) : (
                <>
                  <Icon name="send" size="16px" />
                  Request Access
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
