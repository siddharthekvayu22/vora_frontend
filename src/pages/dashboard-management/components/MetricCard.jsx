function MetricCard({ icon, label, value, trend, trendColor, subtitle }) {
  return (
    <div className="rounded-2xl border border-border bg-accent py-2 px-3">
      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-popover-foreground/10">
        {icon}
      </div>

      <p className="text-xs tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-2 text-4xl font-bold text-foreground">{value}</p>
      <p className={`mt-3 text-sm font-semibold ${trendColor}`}>{trend}</p>
      {subtitle && (
        <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}

export default MetricCard;
