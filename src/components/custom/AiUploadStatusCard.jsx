import Icon from "@/components/Icon";
import { formatDate } from "@/utils/dateFormatter";

/**
 * AiUploadStatusCard Component
 * Displays AI upload status with icon, status and timestamp
 *
 * @param {Object} aiUpload - AI upload object with status,  timestamp,
 * @param {string} aiUpload.status - Status: "completed", "processing", "uploaded", "failed", "skipped"
 * @param {string} aiUpload.timestamp - Timestamp of successful upload
 */
const AiUploadStatusCard = ({ aiUpload }) => {
  if (!aiUpload) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-900/40 flex items-center justify-center border border-gray-200 dark:border-gray-800">
          <Icon
            name="minus"
            size="14px"
            className="text-gray-400 dark:text-gray-600"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Not sent to AI
          </span>
        </div>
      </div>
    );
  }

  const { status, timestamp } = aiUpload;

  // Status configuration
  const statusConfig = {
    completed: {
      icon: "check-circle",
      bgColor: "bg-green-100 dark:bg-green-900/40",
      borderColor: "border-green-200 dark:border-green-800",
      iconColor: "text-green-600 dark:text-green-400",
      label: "Completed",
    },
    processing: {
      icon: "refresh",
      bgColor: "bg-blue-100 dark:bg-blue-900/40",
      borderColor: "border-blue-200 dark:border-blue-800",
      iconColor: "text-blue-600 dark:text-blue-400",
      label: "Processing",
    },
    uploaded: {
      icon: "upload",
      bgColor: "bg-purple-100 dark:bg-purple-900/40",
      borderColor: "border-purple-200 dark:border-purple-800",
      iconColor: "text-purple-600 dark:text-purple-400",
      label: "Uploaded",
    },
    failed: {
      icon: "x-circle",
      bgColor: "bg-red-100 dark:bg-red-900/40",
      borderColor: "border-red-200 dark:border-red-800",
      iconColor: "text-red-600 dark:text-red-400",
      label: "Failed",
    },
    skipped: {
      icon: "warning",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/40",
      borderColor: "border-yellow-200 dark:border-yellow-800",
      iconColor: "text-yellow-600 dark:text-yellow-400",
      label: "Skipped",
    },
  };

  const config = statusConfig[status] || statusConfig.skipped;

  return (
    <div className="flex items-center gap-2">
      <div className="">
        <div
          className={`w-8 h-8 rounded-full ${config.bgColor} flex items-center justify-center border ${config.borderColor}`}
        >
          <Icon name={config.icon} size="16px" className={config.iconColor} />
        </div>
      </div>

      <div className="flex flex-col">
        <span className="font-medium text-foreground" title={config.label}>
          {config.label}
        </span>
        {timestamp && (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDate(timestamp)}
          </span>
        )}
      </div>
    </div>
  );
};

export default AiUploadStatusCard;
