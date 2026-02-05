function CardWrapper({ title, right, children, className = "" }) {
  const isFlexContainer = className.includes("flex flex-col");

  return (
    <div
      className={`rounded-2xl border border-border bg-gradient-to-br from-background to-card shadow-xl ${className}`}
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {right}
      </div>
      <div className={`p-4 ${isFlexContainer ? "flex-1 flex flex-col" : ""}`}>
        {children}
      </div>
    </div>
  );
}

export default CardWrapper;
