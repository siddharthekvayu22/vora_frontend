function CardWrapper({ title, right, children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-border bg-gradient-to-br from-background to-card shadow-xl ${className}`}
    >
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {right}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export default CardWrapper;
