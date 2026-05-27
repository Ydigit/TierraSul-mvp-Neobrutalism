interface MarqueeProps {
  items: string[];
  bgColor?: string;
  textColor?: string;
}

export function Marquee({
  items,
  bgColor = "#FFEB3B",
  textColor = "#000",
}: MarqueeProps) {
  const doubledItems = [...items, ...items];

  return (
    <div
      className="border-y-4 border-black py-6 overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      <div
        className="flex whitespace-nowrap animate-marquee font-bold uppercase text-xl gap-12"
        style={{ color: textColor }}
      >
        {doubledItems.map((item, i) => (
          <span key={i}>{item}</span>
        ))}
      </div>
    </div>
  );
}
