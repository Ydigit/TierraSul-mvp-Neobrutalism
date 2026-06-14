import Link from "next/link";
import { Users, Calendar, Lock, Check, Zap } from "lucide-react";
import { BrutalBadge } from "../ui/brutal-badge";
import { BrutalButton } from "../ui/brutal-button";
import type { Tour } from "../tour/tour-card";

interface GroupCardProps {
  tour: Tour;
  /** Languages spoken by the group (mock or derived) */
  languages?: string[];
  /** Number of operators that already contacted */
  operatorsContacted?: number;
  /** Whether this operator already purchased */
  purchased?: boolean;
}

export function GroupCard({
  tour,
  languages = ["EN", "ES"],
  operatorsContacted = 0,
  purchased = false,
}: GroupCardProps) {
  return (
    <Link
      href={`/operator/groups/${tour.id}`}
      className="bg-white border-4 border-black shadow-[8px_8px_0_#000] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[5px_5px_0_#000] transition-all duration-100 block p-6"
    >
      <h3 className="text-2xl font-black uppercase mb-3 leading-none">
        {tour.title}
      </h3>

      <div className="space-y-3 mb-5">
        <BrutalBadge variant="cyan">
          {tour.countryFlag} {tour.country}
        </BrutalBadge>

        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" strokeWidth={3} />
          <span className="font-bold text-sm">
            {tour.currentMembers} TRAVELER
            {tour.currentMembers === 1 ? "" : "S"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" strokeWidth={3} />
          <span className="font-bold text-sm">
            {tour.dateStart} – {tour.dateEnd}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {languages.map((lang) => (
            <span
              key={lang}
              className="bg-[#FFF8E7] border-2 border-black px-2 py-1 font-bold text-xs"
            >
              {lang}
            </span>
          ))}
        </div>
      </div>

      {operatorsContacted > 0 && !purchased && (
        <p className="text-xs font-bold uppercase mb-4 text-[#FF6B9D] flex items-center gap-1">
          <Zap className="w-3.5 h-3.5" strokeWidth={3} />
          {operatorsContacted} operator{operatorsContacted === 1 ? "" : "s"}{" "}
          contacted
        </p>
      )}

      {purchased ? (
        <BrutalButton variant="black" size="sm" className="w-full">
          <Check className="inline w-4 h-4 mr-1" strokeWidth={3} />
          PURCHASED — VIEW
        </BrutalButton>
      ) : (
        <BrutalButton variant="primary" size="sm" className="w-full">
          <Lock className="inline w-4 h-4 mr-1" strokeWidth={3} />
          GET CONTACTS · 1 CREDIT
        </BrutalButton>
      )}
    </Link>
  );
}
