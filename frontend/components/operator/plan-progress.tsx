interface PlanProgressProps {
  used: number;
  limit: number;
  size?: "sm" | "md" | "lg";
}

export function PlanProgress({ used, limit, size = "md" }: PlanProgressProps) {
  const pct = Math.min((used / limit) * 100, 100);
  const heightClass = size === "sm" ? "h-2" : size === "lg" ? "h-5" : "h-3";
  const fillColor =
    pct >= 95 ? "#FF3B3B" : pct >= 75 ? "#FFEB3B" : "#C6FF00";

  return (
    <div
      className={`w-full ${heightClass} bg-white border-2 border-black overflow-hidden`}
      role="progressbar"
      aria-valuenow={used}
      aria-valuemin={0}
      aria-valuemax={limit}
    >
      <div
        className="h-full"
        style={{ width: `${pct}%`, backgroundColor: fillColor }}
      />
    </div>
  );
}
