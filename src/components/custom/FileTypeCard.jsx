import Icon from "@/components/Icon";

const FileTypeCard = ({ fileType, fileSize, fileName }) => {
  // Get file extension from fileName if fileType is not provided
  const getFileType = () => {
    if (fileType) return fileType.toLowerCase();
    if (fileName) {
      const extension = fileName.split(".").pop()?.toLowerCase();
      return extension || "unknown";
    }
    return "pdf"; // default
  };

  // Get appropriate icon and color based on file type
  const getFileTypeConfig = (type) => {
    const configs = {
      pdf: {
        icon: "pdf",
        bgColor: "bg-red-50 dark:bg-red-900/20",
        textColor: "text-red-600 dark:text-red-400",
        borderColor: "border-red-200 dark:border-red-800",
        label: "PDF",
      },
      doc: {
        icon: "doc",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
        textColor: "text-blue-600 dark:text-blue-400",
        borderColor: "border-blue-200 dark:border-blue-800",
        label: "DOC",
      },
      docx: {
        icon: "doc",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
        textColor: "text-blue-600 dark:text-blue-400",
        borderColor: "border-blue-200 dark:border-blue-800",
        label: "DOCX",
      },
      xls: {
        icon: "excel",
        bgColor: "bg-green-50 dark:bg-green-900/20",
        textColor: "text-green-600 dark:text-green-400",
        borderColor: "border-green-200 dark:border-green-800",
        label: "XLS",
      },
      xlsx: {
        icon: "excel",
        bgColor: "bg-green-50 dark:bg-green-900/20",
        textColor: "text-green-600 dark:text-green-400",
        borderColor: "border-green-200 dark:border-green-800",
        label: "XLSX",
      },
      ppt: {
        icon: "ppt",
        bgColor: "bg-orange-50 dark:bg-orange-900/20",
        textColor: "text-orange-600 dark:text-orange-400",
        borderColor: "border-orange-200 dark:border-orange-800",
        label: "PPT",
      },
      pptx: {
        icon: "ppt",
        bgColor: "bg-orange-50 dark:bg-orange-900/20",
        textColor: "text-orange-600 dark:text-orange-400",
        borderColor: "border-orange-200 dark:border-orange-800",
        label: "PPTX",
      },
      txt: {
        icon: "document",
        bgColor: "bg-gray-50 dark:bg-gray-900/20",
        textColor: "text-gray-600 dark:text-gray-400",
        borderColor: "border-gray-200 dark:border-gray-800",
        label: "TXT",
      },
      zip: {
        icon: "zip",
        bgColor: "bg-purple-50 dark:bg-purple-900/20",
        textColor: "text-purple-600 dark:text-purple-400",
        borderColor: "border-purple-200 dark:border-purple-800",
        label: "ZIP",
      },
      rar: {
        icon: "zip",
        bgColor: "bg-purple-50 dark:bg-purple-900/20",
        textColor: "text-purple-600 dark:text-purple-400",
        borderColor: "border-purple-200 dark:border-purple-800",
        label: "RAR",
      },
      csv: {
        icon: "csv",
        bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
        textColor: "text-emerald-600 dark:text-emerald-400",
        borderColor: "border-emerald-200 dark:border-emerald-800",
        label: "CSV",
      },
      default: {
        icon: "file",
        bgColor: "bg-gray-50 dark:bg-gray-900/20",
        textColor: "text-gray-600 dark:text-gray-400",
        borderColor: "border-gray-200 dark:border-gray-800",
        label: "FILE",
      },
    };

    return configs[type] || configs.default;
  };

  // Format file size
  const formatFileSize = (size) => {
    if (!size) return "—";

    // If size is already formatted (contains units), return as is
    if (typeof size === "string" && /[KMGT]B/i.test(size)) {
      return size;
    }

    // If size is a number (bytes), format it
    const bytes = parseInt(size);
    if (isNaN(bytes)) return size || "—";

    if (bytes === 0) return "0 B";

    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const type = getFileType();
  const config = getFileTypeConfig(type);
  const formattedSize = formatFileSize(fileSize);

  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-8 h-8 rounded-lg ${config.bgColor} ${config.borderColor} border flex items-center justify-center ${config.textColor}`}
      >
        <Icon name={config.icon} size="14px" />
      </div>

      <div className="flex flex-col">
        <span className={`text-xs font-medium ${config.textColor} uppercase`}>
          {config.label}
        </span>
        {fileName && (
          <span
            className="text-xs text-foreground font-medium truncate max-w-[200px]"
            title={fileName}
          >
            {fileName}
          </span>
        )}
        <span className="text-xs text-muted-foreground">{formattedSize}</span>
      </div>
    </div>
  );
};

export default FileTypeCard;
