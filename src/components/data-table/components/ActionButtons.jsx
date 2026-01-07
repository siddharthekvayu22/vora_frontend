import Icon from "../../Icon";

/**
 * Action Buttons Component - Tailwind CSS version
 * Replaces the CSS-based action buttons with Tailwind classes
 */
export default function ActionButtons({ actions = [], row }) {
  const getActionClasses = (type) => {
    const baseClasses =
      "inline-flex items-center justify-center w-8 h-8 rounded-md border border-transparent bg-transparent cursor-pointer transition-all duration-200";

    switch (type) {
      case "view":
        return `${baseClasses} text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900 hover:border-blue-500`;
      case "edit":
        return `${baseClasses} text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900 hover:border-yellow-500`;
      case "delete":
        return `${baseClasses} text-red-500 hover:bg-red-50 dark:hover:bg-red-900 hover:border-red-500`;
      default:
        return `${baseClasses} text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300`;
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {actions.map((action, index) => (
        <button
          key={index}
          className={getActionClasses(action.type)}
          onClick={() => action.onClick(row)}
          title={action.title || action.type}
          disabled={action.disabled}
        >
          <Icon name={action.icon} size="16px" />
        </button>
      ))}
    </div>
  );
}
