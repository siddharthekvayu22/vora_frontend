const COLOR_VARIANTS = {
  red: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-400",
    border: "border-red-200 dark:border-red-800",
    dot: "bg-red-500",
  },
  blue: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800",
    dot: "bg-blue-500",
  },
  green: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-700 dark:text-green-400",
    border: "border-green-200 dark:border-green-800",
    dot: "bg-green-500",
  },
  yellow: {
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    text: "text-yellow-800 dark:text-yellow-400",
    border: "border-yellow-200 dark:border-yellow-800",
    dot: "bg-yellow-500",
  },
  gray: {
    bg: "bg-gray-100 dark:bg-gray-900/30",
    text: "text-gray-700 dark:text-gray-400",
    border: "border-gray-200 dark:border-gray-800",
    dot: "bg-gray-500",
  },
};

const CustomBadge = ({ label, color = "gray" }) => {
  const c = COLOR_VARIANTS[color] || COLOR_VARIANTS.gray;

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded text-xs font-semibold capitalize min-w-[80px]
      ${c.bg} ${c.text} border ${c.border}`}
    >
      <span className={`w-2 h-2 rounded-full ${c.dot}`} />
      {label}
    </span>
  );
};

export default CustomBadge;
