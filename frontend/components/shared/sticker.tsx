interface StickerProps {
  children: React.ReactNode;
  bgColor?: string;
  rotation?: number;
  className?: string;
}

export function Sticker({
  children,
  bgColor = "#C6FF00",
  rotation = -12,
  className = "",
}: StickerProps) {
  return (
    <div
      className={`border-4 border-black w-32 h-32 rounded-full flex items-center justify-center font-black text-lg shadow-[6px_6px_0_#000] ${className}`}
      style={{
        transform: `rotate(${rotation}deg)`,
        backgroundColor: bgColor,
      }}
    >
      {children}
    </div>
  );
}
