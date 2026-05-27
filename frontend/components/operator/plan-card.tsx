import { BrutalBadge } from "../ui/brutal-badge";
import { BrutalButton } from "../ui/brutal-button";
import { Check, X } from "lucide-react";

interface PlanFeature {
  text: string;
  included: boolean;
}

interface PlanCardProps {
  name: string;
  price: number;
  priceSuffix?: string;
  tagline?: string;
  features: PlanFeature[];
  ctaLabel: string;
  ctaHref: string;
  highlight?: boolean;
  bgColor?: string;
}

export function PlanCard({
  name,
  price,
  priceSuffix = "/MONTH",
  tagline,
  features,
  ctaLabel,
  ctaHref,
  highlight = false,
  bgColor,
}: PlanCardProps) {
  const bg = bgColor ?? (highlight ? "#FFEB3B" : "#FFF8E7");
  const shadow = highlight
    ? "shadow-[12px_12px_0_#000]"
    : "shadow-[8px_8px_0_#000]";

  return (
    <div
      className={`relative border-4 border-black p-8 ${shadow}`}
      style={{
        backgroundColor: bg,
        transform: highlight ? "scale(1.02)" : undefined,
      }}
    >
      {highlight && (
        <BrutalBadge
          variant="pink"
          rotation={-6}
          className="absolute -top-3 -right-3"
        >
          MOST POPULAR
        </BrutalBadge>
      )}

      <h3 className="text-sm font-black uppercase mb-2">{name}</h3>
      <div className="text-5xl md:text-6xl font-black mb-1">€{price}</div>
      <p className="font-bold uppercase text-sm mb-2 opacity-70">
        {priceSuffix}
      </p>
      {tagline && (
        <p className="font-bold uppercase text-xs mb-6">{tagline}</p>
      )}
      {!tagline && <div className="mb-6" />}

      <ul className="space-y-3 mb-8">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2">
            {f.included ? (
              <Check className="w-5 h-5 mt-1 shrink-0" strokeWidth={3} />
            ) : (
              <X
                className="w-5 h-5 mt-1 shrink-0 text-[#FF3B3B]"
                strokeWidth={3}
              />
            )}
            <span
              className={`font-medium ${f.included ? "" : "text-[#999]"}`}
            >
              {f.text}
            </span>
          </li>
        ))}
      </ul>

      <BrutalButton
        href={ctaHref}
        variant={highlight ? "black" : "secondary"}
        size="md"
        className="w-full"
      >
        {ctaLabel}
      </BrutalButton>
    </div>
  );
}
