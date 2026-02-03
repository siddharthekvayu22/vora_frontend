/**
 * Modern Icon Component using React Icons
 * Provides professional icons from react-icons library
 */

import {
  // Navigation & Dashboard
  MdDashboard,
  MdHome,
  MdMenu,

  // Documents & Files
  MdDescription,
  MdFolder,
  MdFolderOpen,
  MdInsertDriveFile,
  MdUpload,
  MdDownload,
  MdPictureAsPdf,
  MdTableChart,

  // Users & Profile
  MdPerson,
  MdPeople,
  MdPersonAdd,
  MdPersonRemove,
  MdAccountCircle,

  // Actions
  MdAdd,
  MdEdit,
  MdDelete,
  MdClose,
  MdRefresh,
  MdRemove,
  MdVisibility,
  MdVisibilityOff,

  // Status & Alerts
  MdCheck,
  MdCheckCircle,
  MdCancel,
  MdWarning,
  MdError,
  MdInfo,

  // Arrows & Navigation
  MdArrowUpward,
  MdArrowDownward,
  MdArrowBack,
  MdArrowForward,
  MdKeyboardArrowDown,
  MdKeyboardArrowLeft,

  // Time & Calendar
  MdAccessTime,
  MdCalendarToday,
  MdSchedule,

  // Communication
  MdEmail,
  MdPhone,
  MdMessage,
  MdNotifications,

  // Settings & Tools
  MdSettings,
  MdBuild,
  MdSearch,
  MdAnalytics,

  // Security & Framework
  MdSecurity,
  MdLock,
  MdShield,
  MdVerifiedUser,
  MdVerified,

  // Charts & Reports
  MdBarChart,
  MdShowChart,
  MdAssessment,
  MdReport,

  // Theme
  MdLightMode,
  MdDarkMode,

  // Misc
  MdStar,
  MdFavorite,
  MdLink,
  MdLabel,
  MdLightbulb,
  MdPowerSettingsNew,
  MdList,
  MdBook,
  MdWork,
} from "react-icons/md";

import {
  // Additional icons from other icon sets
  FiActivity,
  FiClock,
  FiUser,
  FiUsers,
  FiUserPlus,
  FiUserMinus,
  FiUserCheck,
} from "react-icons/fi";

import {
  // Heroicons for additional variety
  HiOutlineDocumentText,
  HiOutlineClipboardList,
} from "react-icons/hi";

// Icon mapping from old names to React Icons components
const iconMap = {
  // Navigation icons
  dashboard: MdDashboard,
  "icon-dashboard": MdDashboard,
  home: MdHome,
  "icon-home": MdHome,
  menu: MdMenu,
  "icon-menu": MdMenu,

  // Document icons
  document: MdDescription,
  "icon-document": MdDescription,
  file: MdInsertDriveFile,
  "icon-file": MdInsertDriveFile,
  docs: HiOutlineDocumentText,

  // Upload/Download icons
  upload: MdUpload,
  "icon-upload": MdUpload,
  download: MdDownload,
  "icon-download": MdDownload,

  // Search/Analysis icons
  search: MdSearch,
  "icon-search": MdSearch,
  analyze: MdAnalytics,
  analytics: MdShowChart,

  // Security & Framework icons
  shield: MdShield,
  "icon-shield": MdShield,
  "shield-check": MdVerified,
  security: MdSecurity,
  "icon-security": MdSecurity,
  lock: MdLock,
  "icon-lock": MdLock,
  eye: MdVisibility,
  "icon-eye": MdVisibility,
  "eye-off": MdVisibilityOff,
  "icon-eye-off": MdVisibilityOff,

  // Chart/Analytics icons
  chart: MdBarChart,
  "icon-chart": MdBarChart,

  // Settings/Config icons
  settings: MdSettings,
  "icon-settings": MdSettings,
  gear: MdBuild,

  // Book/Documentation icons
  book: MdBook,
  "icon-book": MdBook,

  // User/Profile icons
  user: FiUser,
  "icon-user": FiUser,
  users: FiUsers,
  "icon-users": FiUsers,
  profile: MdAccountCircle,
  "user-plus": FiUserPlus,
  "user-minus": FiUserMinus,
  "user-check": FiUserCheck,

  // Status icons
  check: MdCheck,
  "icon-check": MdCheck,
  checkmark: MdCheck,
  success: MdCheckCircle,
  "check-circle": MdCheckCircle,
  warning: MdWarning,
  "icon-warning": MdWarning,
  error: MdError,
  "icon-error": MdError,
  info: MdInfo,
  "icon-info": MdInfo,
  "x-circle": MdCancel,

  // Arrow icons
  "arrow-up": MdArrowUpward,
  "icon-arrow-up": MdArrowUpward,
  "arrow-down": MdArrowDownward,
  "icon-arrow-down": MdArrowDownward,
  "arrow-left": MdArrowBack,
  "icon-arrow-left": MdArrowBack,
  "arrow-right": MdArrowForward,
  "icon-arrow-right": MdArrowForward,

  // Action icons
  plus: MdAdd,
  "icon-plus": MdAdd,
  add: MdAdd,
  minus: MdRemove,
  "icon-minus": MdRemove,
  close: MdClose,
  "icon-close": MdClose,
  x: MdClose,
  "icon-x": MdClose,
  delete: MdDelete,
  "icon-delete": MdDelete,
  trash: MdDelete,
  "icon-trash": MdDelete,
  edit: MdEdit,
  "icon-edit": MdEdit,

  // Time icons
  clock: FiClock,
  "icon-clock": FiClock,
  time: MdAccessTime,
  calendar: MdCalendarToday,
  "icon-calendar": MdCalendarToday,

  // Folder icons
  folder: MdFolder,
  "icon-folder": MdFolder,
  "folder-open": MdFolderOpen,

  // List icons
  list: MdList,
  "icon-list": MdList,

  // Communication icons
  mail: MdEmail,
  "icon-mail": MdEmail,
  email: MdEmail,
  "icon-email": MdEmail,
  phone: MdPhone,
  "icon-phone": MdPhone,
  message: MdMessage,
  notification: MdNotifications,
  "icon-notification": MdNotifications,

  // Theme icons
  sun: MdLightMode,
  "icon-sun": MdLightMode,
  moon: MdDarkMode,
  "icon-moon": MdDarkMode,

  // Misc icons
  star: MdStar,
  "icon-star": MdStar,
  heart: MdFavorite,
  "icon-heart": MdFavorite,
  refresh: MdRefresh,
  "icon-refresh": MdRefresh,
  link: MdLink,
  "icon-link": MdLink,
  tag: MdLabel,
  "icon-tag": MdLabel,
  lightbulb: MdLightbulb,
  "icon-lightbulb": MdLightbulb,
  power: MdPowerSettingsNew,
  "icon-power": MdPowerSettingsNew,

  // Compliance/Audit specific
  audit: MdSearch,
  "icon-audit": MdSearch,
  compliance: MdVerifiedUser,
  "icon-compliance": MdVerifiedUser,
  framework: MdWork,
  "icon-framework": MdWork,
  report: HiOutlineClipboardList,
  "icon-report": HiOutlineClipboardList,

  // File type icons
  pdf: MdPictureAsPdf,
  "icon-pdf": MdPictureAsPdf,
  doc: MdDescription,
  "icon-doc": MdDescription,
  excel: MdTableChart,
  "icon-excel": MdTableChart,
  ppt: MdDescription,
  "icon-ppt": MdDescription,
  csv: MdTableChart,
  "icon-csv": MdTableChart,
  zip: MdFolder,
  "icon-zip": MdFolder,

  // Activity specific
  activity: FiActivity,
};

export default function Icon({
  name,
  size = "1em",
  style = {},
  className = "",
}) {
  // Get the icon component from the map
  const IconComponent = iconMap[name] || iconMap[`icon-${name}`] || MdInfo;

  // Convert size to number if it's a string with 'px'
  const iconSize =
    typeof size === "string" && size.includes("px")
      ? parseInt(size.replace("px", ""))
      : size;

  return (
    <IconComponent
      className={className}
      style={{
        fontSize: iconSize,
        width: iconSize,
        height: iconSize,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
      aria-label={name}
    />
  );
}

// Export the icon map for reference
export { iconMap };
