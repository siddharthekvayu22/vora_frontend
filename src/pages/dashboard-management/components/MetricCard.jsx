function MetricCard({ icon, label, value, trend, trendColor }) {
  return (
    <div className="rounded-2xl border border-border bg-accent p-6">
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-popover-foreground/10">
        {icon}
      </div>

      <p className="text-xs tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-2 text-4xl font-bold text-foreground">{value}</p>
      <p className={`mt-3 text-sm font-semibold ${trendColor}`}>{trend}</p>
    </div>
  );
}

export default MetricCard;
