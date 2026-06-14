export interface Member {
  email: string;
  name: string;
  country: string;
  countryFlag: string;
  age?: number;
  bio?: string;
  languages?: string[];
  avatarUrl?: string;
  photos?: string[];
}

interface MemberListProps {
  members: Member[];
  emptySlots: number;
  /** Optional click handler. When present, rows render as interactive buttons. */
  onMemberClick?: (member: Member, index: number) => void;
  /**
   * If provided, the displayed name uses this function (to enable anonymization
   * like "Maria S." for OTHER_TRAVELER context). Otherwise full name.
   */
  formatName?: (member: Member, index: number) => string;
}

const swatchColors = [
  "#FFEB3B",
  "#FF6B9D",
  "#00E5FF",
  "#C6FF00",
  "#FF6B35",
];

export function MemberList({
  members,
  emptySlots,
  onMemberClick,
  formatName,
}: MemberListProps) {
  return (
    <div className="space-y-3">
      {members.map((m, i) => {
        const displayed = formatName ? formatName(m, i) : m.name;
        const initials = displayed
          .split(/\s+/)
          .slice(0, 2)
          .map((s) => s[0])
          .join("")
          .toUpperCase();
        const inner = (
          <>
            <div
              className="w-10 h-10 border-2 border-black flex items-center justify-center font-black text-sm shrink-0 overflow-hidden"
              style={{ backgroundColor: swatchColors[i % swatchColors.length] }}
            >
              {m.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.avatarUrl}
                  alt={`${displayed} avatar`}
                  className="w-full h-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="font-bold uppercase text-sm truncate">
                {displayed}
              </p>
              <p className="text-xs font-medium">
                {m.countryFlag} {m.country}
                {m.age ? ` · ${m.age}y` : ""}
              </p>
            </div>
          </>
        );
        const base =
          "flex items-center gap-3 bg-white border-3 border-black p-3 w-full";
        return onMemberClick ? (
          <button
            key={m.email}
            type="button"
            onClick={() => onMemberClick(m, i)}
            className={`${base} text-left hover:bg-[#FFEB3B] transition-colors`}
          >
            {inner}
          </button>
        ) : (
          <div key={m.email} className={base}>
            {inner}
          </div>
        );
      })}
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
