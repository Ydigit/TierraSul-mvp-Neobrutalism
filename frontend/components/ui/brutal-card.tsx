interface BrutalCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  rotation?: number;
}

export function BrutalCard({
  children,
  className = "",
  onClick,
  rotation = 0,
}: BrutalCardProps) {
  const isClickable = !!onClick;
  const rotationStyle =
    rotation !== 0 ? { transform: `rotate(${rotation}deg)` } : {};

  return (
    <div
      className={`bg-white border-4 border-black shadow-[8px_8px_0_#000] ${
        isClickable
          ? "cursor-pointer hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[5px_5px_0_#000] transition-all duration-100"
          : ""
      } ${className}`}
      onClick={onClick}
      style={rotationStyle}
    >
      {children}
    </div>
  );
}
