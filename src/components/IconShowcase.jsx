import Icon from "./Icon";

/**
 * Icon Showcase Component - Shows all available icons
 * Use this to see all icons in your theme
 */
export default function IconShowcase() {
  const iconCategories = {
    "User & Profile": ["user", "users", "profile"],
    Actions: ["plus", "edit", "trash", "delete", "eye", "refresh"],
    Navigation: ["arrow-up", "arrow-down", "arrow-left", "arrow-right"],
    Communication: ["mail", "phone", "message", "notification"],
    "Time & Calendar": ["clock", "calendar"],
    "Files & Folders": ["folder", "folder-open", "document", "file"],
    Status: ["check", "warning", "error", "info", "success"],
    "Search & Analysis": ["search", "analyze", "audit"],
    Settings: ["settings", "gear"],
    Misc: ["home", "star", "heart", "lightbulb", "sun", "moon"],
  };

  return (
    <div className="p-6 bg-card rounded-xl border border-border">
      <h2 className="text-2xl font-bold text-foreground mb-6">
        Available Icons
      </h2>

      {Object.entries(iconCategories).map(([category, icons]) => (
        <div key={category} className="mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-primary rounded"></div>
            {category}
          </h3>
          <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-4">
            {icons.map((iconName) => (
              <div
                key={iconName}
                className="flex flex-col items-center gap-2 p-3 bg-muted rounded-lg hover:bg-accent transition-colors duration-200"
              >
                <Icon name={iconName} size="24px" className="text-foreground" />
                <span className="text-xs text-muted-foreground text-center">
                  {iconName}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="mt-8 p-4 bg-muted/50 rounded-lg">
        <h4 className="font-semibold text-foreground mb-2">Usage Example:</h4>
        <code className="text-sm text-muted-foreground">
          {`<Icon name="user" size="16px" className="text-primary" />`}
        </code>
      </div>
    </div>
  );
}
