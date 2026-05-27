interface TourProgressProps {
  current: number;
  max: number;
  size?: "sm" | "md" | "lg";
}

export function TourProgress({ current, max, size = "md" }: TourProgressProps) {
  const progress = (current / max) * 100;

  const sizeClasses = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
  };

  return (
    <div className={`w-full ${sizeClasses[size]} bg-[#FFF8E7] border-2 border-black`}>
      <div
        className="h-full bg-[#C6FF00]"
        style={{ width: `${Math.min(progress, 100)}%` }}
      ></div>
    </div>
  );
}
