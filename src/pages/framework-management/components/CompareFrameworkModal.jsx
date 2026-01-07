import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Icon from "../../../components/Icon";
import { useAuth } from "../../../context/useAuth";
import { useWebSocket } from "../../../hooks/useWebSocket";
import {
  getExpertFrameworks,
  compareFrameworks,
} from "../../../services/frameworkService";
import { formatDate } from "../../../utils/dateFormatter";

function CompareFrameworkModal({
  isOpen,
  onClose,
  userFramework,
  onComparisonStart,
}) {
  const { token } = useAuth();
  const { connect } = useWebSocket();

  const [expertFrameworks, setExpertFrameworks] = useState([]);
  const [selectedExpertFramework, setSelectedExpertFramework] = useState(null);
  const [loading, setLoading] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Initialize and fetch data
  useEffect(() => {
    if (isOpen && token) {
      connect(token);
      fetchExpertFrameworks();
      resetStates();
    }
  }, [isOpen, token]);

  const resetStates = () => {
    setSelectedExpertFramework(null);
    setSearchTerm("");
    setComparing(false);
  };

  const fetchExpertFrameworks = async () => {
    try {
      setLoading(true);
      const response = await getExpertFrameworks();

      // Handle different response structures
      let frameworks = [];
      if (Array.isArray(response)) {
        frameworks = response;
      } else if (response.data?.frameworks) {
        frameworks = response.data.frameworks;
      } else if (response.frameworks) {
        frameworks = response.frameworks;
      }

      setExpertFrameworks(frameworks);
    } catch (error) {
      toast.error("Failed to load expert frameworks");
      setExpertFrameworks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = async () => {
    if (!selectedExpertFramework) {
      toast.error("Please select an expert framework to compare");
      return;
    }

    try {
      setComparing(true);

      const userFrameworkId = userFramework?.id || userFramework?._id;
      const expertFrameworkId =
        selectedExpertFramework.id || selectedExpertFramework._id;

      const response = await compareFrameworks(
        userFrameworkId,
        expertFrameworkId
      );

      if (response.success) {
        // Close modal immediately on successful API response
        handleClose();

        // Show success message
        toast.success(
          "Comparison started successfully! Check the framework details for live updates."
        );

        // Notify parent component about comparison start
        if (onComparisonStart) {
          onComparisonStart({
            status: "processing",
            message: "Framework comparison in progress...",
            expertFramework: selectedExpertFramework,
          });
        }
      } else {
        throw new Error(response.message || "Failed to start comparison");
      }
    } catch (error) {
      setComparing(false);
      toast.error(error.message || "Failed to compare frameworks");
    }
  };

  const handleClose = () => {
    resetStates();
    onClose();
  };

  const filteredFrameworks = expertFrameworks.filter(
    (framework) =>
      framework.frameworkName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      framework.originalFileName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Compare Framework
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Select an expert framework to compare with "
              {userFramework?.frameworkName || userFramework?.originalFileName}"
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <Icon name="close" size="20px" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Icon
                name="search"
                size="16px"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                placeholder="Search expert frameworks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                disabled={comparing}
              />
            </div>
          </div>

          {/* Framework List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-2 text-muted-foreground">
                  Loading expert frameworks...
                </span>
              </div>
            ) : filteredFrameworks.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Icon
                    name="framework"
                    size="24px"
                    className="text-muted-foreground"
                  />
                </div>
                <p className="text-muted-foreground">
                  {searchTerm
                    ? "No frameworks found matching your search"
                    : "No expert frameworks available"}
                </p>
              </div>
            ) : (
              filteredFrameworks.map((framework) => {
                const frameworkId = framework.id || framework._id;
                const selectedId =
                  selectedExpertFramework?.id || selectedExpertFramework?._id;
                const isSelected = selectedId === frameworkId;

                return (
                  <div
                    key={frameworkId}
                    onClick={() =>
                      !comparing && setSelectedExpertFramework(framework)
                    }
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      comparing
                        ? "opacity-50 cursor-not-allowed"
                        : isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20">
                        <Icon
                          name="framework"
                          size="18px"
                          className="text-blue-500"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">
                          {framework.frameworkName ||
                            framework.originalFileName}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {framework.frameworkType?.toUpperCase()} •{" "}
                          {framework.fileSize}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>
                            By: {framework.uploadedBy?.name || "Unknown"}
                          </span>
                          <span>•</span>
                          <span>{formatDate(framework.createdAt)}</span>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <Icon
                            name="check"
                            size="12px"
                            className="text-white"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-border">
          <button
            onClick={handleClose}
            disabled={comparing}
            className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleCompare}
            disabled={comparing || !selectedExpertFramework}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {comparing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Starting...
              </>
            ) : (
              <>
                <Icon name="compare" size="16px" />
                {selectedExpertFramework
                  ? "Compare Frameworks"
                  : "Select Framework to Compare"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CompareFrameworkModal;
