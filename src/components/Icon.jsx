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

  // Time & Calendar
  MdAccessTime,
  MdCalendarToday,

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

import { TbRefresh } from "react-icons/tb";

import {
  // Additional icons from Feather Icons
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
  HiDotsVertical,
} from "react-icons/hi";
import { FaAngleDoubleLeft, FaAngleDoubleRight, FaAngleDown, FaAngleLeft, FaAngleRight } from "react-icons/fa";
import { RiRobot2Fill } from "react-icons/ri";

// Icon mapping from old names to React Icons components
const iconMap = {
  // Navigation icons
  dashboard: MdDashboard,
  home: MdHome,
  menu: MdMenu,

  // Document icons
  document: MdDescription,
  file: MdInsertDriveFile,
  docs: HiOutlineDocumentText,

  // Upload/Download icons
  upload: MdUpload,
  download: MdDownload,

  // Search/Analysis icons
  search: MdSearch,
  analyze: MdAnalytics,
  analytics: MdShowChart,

  // Security & Framework icons
  shield: MdShield,
  "shield-check": MdVerified,
  security: MdSecurity,
  lock: MdLock,
  eye: MdVisibility,
  "eye-off": MdVisibilityOff,

  // Chart/Analytics icons
  chart: MdBarChart,

  // Settings/Config icons
  settings: MdSettings,
  gear: MdBuild,

  // Book/Documentation icons
  book: MdBook,

  // User/Profile icons
  user: FiUser,
  users: FiUsers,
  profile: MdAccountCircle,
  "user-plus": FiUserPlus,
  "user-minus": FiUserMinus,
  "user-check": FiUserCheck,

  // Status icons
  check: MdCheck,
  checkmark: MdCheck,
  success: MdCheckCircle,
  "check-circle": MdCheckCircle,
  warning: MdWarning,
  error: MdError,
  info: MdInfo,
  "x-circle": MdCancel,

  // Arrow icons
  "arrow-up": MdArrowUpward,
  "arrow-down": MdArrowDownward,
  "arrow-left": FaAngleLeft,
  "arrow-right": FaAngleRight,
  "chevron-down": MdKeyboardArrowDown,
  "left-dubble-arrow": FaAngleDoubleLeft,
  "right-dubble-arrow": FaAngleDoubleRight,

  // Action icons
  plus: MdAdd,
  add: MdAdd,
  minus: MdRemove,
  close: MdClose,
  x: MdClose,
  delete: MdDelete,
  trash: MdDelete,
  edit: MdEdit,
  "more-vertical": HiDotsVertical,

  // Time icons
  clock: FiClock,
  time: MdAccessTime,
  calendar: MdCalendarToday,

  // Folder icons
  folder: MdFolder,
  "folder-open": MdFolderOpen,

  // List icons
  list: MdList,

  // Communication icons
  mail: MdEmail,
  email: MdEmail,
  phone: MdPhone,
  message: MdMessage,
  notification: MdNotifications,

  // Theme icons
  sun: MdLightMode,
  moon: MdDarkMode,

  // Misc icons
  star: MdStar,
  heart: MdFavorite,
  link: MdLink,
  tag: MdLabel,
  lightbulb: MdLightbulb,
  power: MdPowerSettingsNew,

  // Compliance/Audit specific
  audit: MdSearch,
  compliance: MdVerifiedUser,
  framework: MdWork,
  report: HiOutlineClipboardList,

  // File type icons
  pdf: MdPictureAsPdf,
  doc: MdDescription,
  excel: MdTableChart,
  ppt: MdDescription,
  csv: MdTableChart,
  zip: MdFolder,
  refresh: TbRefresh,

  // Ai icons
  "ai-bot": RiRobot2Fill,

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
  const IconComponent = iconMap[name] || MdInfo;

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
