import Icon from "./Icon";

/**
 * Icon Showcase Component - Shows all available react-icons
 * Use this to see all icons available in your application
 */
export default function IconShowcase() {
  const iconCategories = {
    "User & Profile": [
      "user",
      "users",
      "profile",
      "user-plus",
      "user-minus",
      "user-check",
    ],
    Actions: [
      "plus",
      "edit",
      "trash",
      "delete",
      "eye",
      "eye-off",
      "refresh",
      "close",
      "add",
      "minus",
    ],
    Navigation: [
      "arrow-up",
      "arrow-down",
      "arrow-left",
      "arrow-right",
      "dashboard",
      "home",
      "menu",
    ],
    Communication: ["mail", "phone", "message", "notification", "email"],
    "Time & Calendar": ["clock", "calendar", "time"],
    "Files & Folders": [
      "folder",
      "folder-open",
      "document",
      "file",
      "upload",
      "download",
    ],
    "Status & Alerts": [
      "check",
      "check-circle",
      "warning",
      "error",
      "info",
      "success",
      "x-circle",
    ],
    "Security & Framework": [
      "shield",
      "shield-check",
      "security",
      "lock",
      "framework",
      "compliance",
    ],
    "Charts & Analytics": ["chart", "analytics", "report", "activity"],
    "Search & Tools": ["search", "analyze", "audit", "settings", "gear"],
    "Theme & UI": ["sun", "moon", "star", "heart", "lightbulb", "power"],
    Documents: ["pdf", "doc", "excel", "csv", "book", "docs"],
  };

  return (
    <div className="p-6 bg-card rounded-xl border border-border">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          React Icons Showcase
        </h2>
        <p className="text-muted-foreground">
          Professional icons powered by react-icons library. All icons are now
          vector-based and fully customizable.
        </p>
      </div>

      {Object.entries(iconCategories).map(([category, icons]) => (
        <div key={category} className="mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-primary rounded"></div>
            {category}
          </h3>
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4">
            {icons.map((iconName) => (
              <div
                key={iconName}
                className="flex flex-col items-center gap-2 p-3 bg-muted rounded-lg hover:bg-accent transition-colors duration-200 group"
              >
                <Icon
                  name={iconName}
                  size="24px"
                  className="text-foreground group-hover:text-primary transition-colors duration-200"
                />
                <span className="text-xs text-muted-foreground text-center font-mono">
                  {iconName}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="mt-8 space-y-4">
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-semibold text-foreground mb-2">
            Usage Examples:
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <code className="text-muted-foreground bg-background px-2 py-1 rounded">
                {`<Icon name="user" size="16px" className="text-primary" />`}
              </code>
              <Icon name="user" size="16px" className="text-primary" />
            </div>
            <div className="flex items-center gap-2">
              <code className="text-muted-foreground bg-background px-2 py-1 rounded">
                {`<Icon name="shield-check" size="20px" className="text-green-500" />`}
              </code>
              <Icon
                name="shield-check"
                size="20px"
                className="text-green-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <code className="text-muted-foreground bg-background px-2 py-1 rounded">
                {`<Icon name="chart" size="24px" className="text-blue-500" />`}
              </code>
              <Icon name="chart" size="24px" className="text-blue-500" />
            </div>
          </div>
        </div>

        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <h4 className="font-semibold text-green-800 dark:text-green-400 mb-2">
            ✅ Migration Complete!
          </h4>
          <p className="text-green-700 dark:text-green-300 text-sm">
            Your project now uses professional react-icons instead of Unicode
            symbols. All existing icon names work exactly the same, but now
            render as scalable vector icons.
          </p>
        </div>
      </div>
    </div>
  );
}
