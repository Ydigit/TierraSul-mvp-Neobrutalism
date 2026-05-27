interface DangerZoneProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function DangerZone({
  title = "DANGER ZONE",
  children,
  className = "",
}: DangerZoneProps) {
  return (
    <div
      className={`bg-white border-4 border-[#FF3B3B] p-8 shadow-[8px_8px_0_#FF3B3B] ${className}`}
    >
      <h2 className="text-3xl font-black uppercase mb-4 text-[#FF3B3B]">
        {title}
      </h2>
      {children}
    </div>
  );
}
