function MetricCard({ icon, label, value, trend, trendColor, subtitle }) {
  // Helper to render trend/subtitle - supports both string and array formats
  const renderText = (content) => {
    if (Array.isArray(content)) {
      return (
        <span>
          {content.map((item, index) => (
            <span key={index}>
              <span className={item.color}>{item.text}</span>
              {index < content.length - 1 && (
                <span className="text-muted-foreground">, </span>
              )}
            </span>
          ))}
        </span>
      );
    }
    return content;
  };

  // Check if this is the TOTAL USERS card (has array trend)
  const isUserCard = Array.isArray(trend);

  return (
    <div className="rounded border border-border bg-accent p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-xs tracking-widest text-muted-foreground mb-2">
            {label}
          </p>

          {isUserCard ? (
            // For TOTAL USERS card - show value and trend side by side
            <>
              <div className="flex items-baseline gap-2 mb-1">
                <p className="text-3xl font-bold text-foreground leading-none">
                  {value}
                </p>
                <p className="text-xs font-medium">({renderText(trend)})</p>
              </div>
              {subtitle && (
                <p className="mt-2 text-sm font-semibold">
                  {renderText(subtitle)}
                </p>
              )}
            </>
          ) : (
            // For other cards - show value normally
            <>
              <p className="text-3xl font-bold text-foreground leading-none">
                {value}
              </p>
              <p className={`mt-2 text-sm font-semibold ${trendColor}`}>
                {renderText(trend)}
              </p>
            </>
          )}
        </div>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-popover-foreground/10">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default MetricCard;
