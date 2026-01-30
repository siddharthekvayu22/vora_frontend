function MetricCard({ icon, label, value, trend, trendColor, subtitle }) {
  return (
    <div className="rounded-2xl border border-border bg-accent p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-xs tracking-widest text-muted-foreground mb-2">
            {label}
          </p>
          <p className="text-3xl font-bold text-foreground leading-none">
            {value}
          </p>
          <p className={`mt-2 text-sm font-semibold ${trendColor}`}>{trend}</p>
          {subtitle && (
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-popover-foreground/10">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default MetricCard;
