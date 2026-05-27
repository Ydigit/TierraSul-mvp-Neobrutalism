interface BrutalBadgeProps {
  children: React.ReactNode;
  variant?:
    | "yellow"
    | "pink"
    | "cyan"
    | "lime"
    | "black"
    | "red"
    | "green"
    | "white";
  rotation?: number;
  className?: string;
}

export function BrutalBadge({
  children,
  variant = "yellow",
  rotation = 0,
  className = "",
}: BrutalBadgeProps) {
  const variantClasses = {
    yellow: "bg-[#FFEB3B] text-black",
    pink: "bg-[#FF6B9D] text-black",
    cyan: "bg-[#00E5FF] text-black",
    lime: "bg-[#C6FF00] text-black",
    black: "bg-black text-[#FFEB3B]",
    red: "bg-[#FF3B3B] text-white",
    green: "bg-[#00C853] text-white",
    white: "bg-white text-black",
  };

  const rotationStyle =
    rotation !== 0 ? { transform: `rotate(${rotation}deg)` } : {};

  return (
    <span
      className={`inline-block ${variantClasses[variant]} border-3 border-black px-3 py-1 font-black text-xs uppercase shadow-[3px_3px_0_#000] ${className}`}
      style={rotationStyle}
    >
      {children}
    </span>
  );
}
