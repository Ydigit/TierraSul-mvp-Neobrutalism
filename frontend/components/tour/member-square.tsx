interface MemberSquareProps {
  filled: boolean;
  color?: string;
  number?: number;
}

export function MemberSquare({
  filled,
  color = "#FFEB3B",
  number,
}: MemberSquareProps) {
  if (!filled) {
    return <div className="w-16 h-16 border-4 border-black bg-white"></div>;
  }

  return (
    <div
      className="w-16 h-16 border-4 border-black flex items-center justify-center font-black text-2xl"
      style={{ backgroundColor: color }}
    >
      {number || ""}
    </div>
  );
}

interface MemberGridProps {
  current: number;
  max: number;
}

export function MemberGrid({ current, max }: MemberGridProps) {
  const colors = ["#FFEB3B", "#FF6B9D", "#00E5FF", "#C6FF00", "#FF6B35", "#FFEB3B"];

  return (
    <div className="grid grid-cols-3 gap-3">
      {Array.from({ length: max }).map((_, i) => (
        <MemberSquare
          key={i}
          filled={i < current}
          color={colors[i % colors.length]}
          number={i < current ? i + 1 : undefined}
        />
      ))}
    </div>
  );
}
