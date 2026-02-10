import Icon from "@/components/Icon";
import { formatDate } from "@/utils/dateFormatter";

/**
 * AiUploadStatusCard Component
 * Displays AI upload status with icon, status, reason, and timestamp
 *
 * @param {Object} aiUpload - AI upload object with status, reason, attemptedAt/uploadedAt, uuid
 * @param {string} aiUpload.status - Status: "completed", "processing", "uploaded", "failed", "skipped"
 * @param {string} aiUpload.reason - Reason for the status (for skipped/failed)
 * @param {string} aiUpload.attemptedAt - Timestamp of the attempt (for skipped/failed)
 * @param {string} aiUpload.uploadedAt - Timestamp of successful upload
 * @param {string} aiUpload.uuid - UUID of the uploaded file
 */
const AiUploadStatusCard = ({ aiUpload }) => {
  if (!aiUpload) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center border border-border">
          <Icon name="minus" size="16px" className="text-muted-foreground" />
        </div>
        <span className="text-sm text-muted-foreground">No AI upload data</span>
      </div>
    );
  }

  const { status, reason, attemptedAt, uploadedAt, uuid } = aiUpload;

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
  const timestamp = uploadedAt || attemptedAt;

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
        {reason && (
          <span
            className="text-xs text-muted-foreground whitespace-nowrap"
            title={reason}
          >
            {reason}
          </span>
        )}
        {uuid && (
          <span
            className="text-xs text-muted-foreground/70 font-mono whitespace-nowrap"
            title={uuid}
          >
            {uuid.substring(0, 15)}...
          </span>
        )}
        {/* {timestamp && (
          <span className="text-[11px] text-muted-foreground whitespace-nowrap">
            {formatDate(timestamp)}
          </span>
        )} */}
      </div>
    </div>
  );
};

export default AiUploadStatusCard;
