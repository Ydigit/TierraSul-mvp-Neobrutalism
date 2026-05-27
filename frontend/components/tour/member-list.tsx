interface Member {
  email: string;
  name: string;
  country: string;
  countryFlag: string;
  age?: number;
}

interface MemberListProps {
  members: Member[];
  emptySlots: number;
}

const swatchColors = [
  "#FFEB3B",
  "#FF6B9D",
  "#00E5FF",
  "#C6FF00",
  "#FF6B35",
];

export function MemberList({ members, emptySlots }: MemberListProps) {
  return (
    <div className="space-y-3">
      {members.map((m, i) => (
        <div
          key={m.email}
          className="flex items-center gap-3 bg-white border-3 border-black p-3"
        >
          <div
            className="w-10 h-10 border-2 border-black flex items-center justify-center font-black text-sm"
            style={{ backgroundColor: swatchColors[i % swatchColors.length] }}
          >
            {m.name
              .split(" ")
              .slice(0, 2)
              .map((s) => s[0])
              .join("")
              .toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold uppercase text-sm truncate">{m.name}</p>
            <p className="text-xs font-medium">
              {m.countryFlag} {m.country}
              {m.age ? ` · ${m.age}y` : ""}
            </p>
          </div>
        </div>
      ))}
      {Array.from({ length: emptySlots }).map((_, i) => (
        <div
          key={`empty-${i}`}
          className="flex items-center gap-3 bg-[#FFF8E7] border-3 border-dashed border-black p-3"
        >
          <div className="w-10 h-10 border-2 border-black border-dashed bg-white" />
          <p className="font-bold uppercase text-sm text-[#666]">
            OPEN SPOT — WAITING
          </p>
        </div>
      ))}
    </div>
  );
}
