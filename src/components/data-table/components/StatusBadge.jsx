/**
 * Status Badge Component - Tailwind CSS version
 * Replaces the CSS-based status badges with Tailwind classes
 */
export default function StatusBadge({ status, children, className = "" }) {
  const getStatusClasses = (status) => {
    const baseClasses =
      "inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium capitalize";

    switch (status?.toLowerCase()) {
      case "verified":
      case "active":
      case "success":
        return `${baseClasses} bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300`;
      case "pending":
      case "warning":
        return `${baseClasses} bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300`;
      case "admin":
        return `${baseClasses} bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300`;
      case "expert":
      case "info":
        return `${baseClasses} bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300`;
      case "user":
      case "primary":
        return `${baseClasses} bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300`;
      case "inactive":
      case "disabled":
      case "error":
        return `${baseClasses} bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300`;
    }
  };

  return (
    <span className={`${getStatusClasses(status)} ${className}`}>
      {children || status}
    </span>
  );
}
