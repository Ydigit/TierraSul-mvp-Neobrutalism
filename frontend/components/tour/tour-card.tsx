import { MapPin, Users } from "lucide-react";
import Link from "next/link";
import { BrutalBadge } from "../ui/brutal-badge";

export interface Tour {
  id: string;
  title: string;
  country: string;
  countryFlag: string;
  city?: string;
  dateStart: string;
  dateEnd: string;
  days: number;
  price: number;
  currentMembers: number;
  /** Threshold that triggers the 48h closing window when first reached. */
  minMembers: number;
  maxMembers: number;
  status: "open" | "closed" | "expired" | "cancelled" | "completed" | "draft";
  /**
   * ISO timestamp of the moment the group first hit `minMembers`. Once set,
   * NEVER resets (cumulative — see 2026-05-28 closing-window decision).
   */
  minReachedAt?: string;
  /** ISO timestamp of when the group closed (max reached OR 48h elapsed). */
  closedAt?: string;
  /**
   * ISO timestamp set when the group dipped to `minMembers - 1` after closing
   * with NO operators contacted. Marks entry into CLOSED-DEFICIT state. The
   * sub-state lasts up to 24h — see `lib/group-state.ts` for transitions.
   * Cleared in any direction (recovery, second leave that reopens, operator
   * purchase, or 24h expiry).
   */
  gracePeriodStartedAt?: string;
  type: string;
  bgColor?: string;
  isHot?: boolean;
}

interface TourCardProps {
  tour: Tour;
  showStatus?: boolean;
}

export function TourCard({ tour, showStatus = false }: TourCardProps) {
  const progress = (tour.currentMembers / tour.maxMembers) * 100;

  return (
    <Link href={`/tours/${tour.id}`}>
      <div className="bg-white border-4 border-black shadow-[8px_8px_0_#000] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[5px_5px_0_#000] transition-all duration-100 cursor-pointer relative overflow-hidden">
        {tour.isHot && (
          <div className="absolute -top-4 -right-4 bg-[#C6FF00] border-3 border-black w-20 h-20 rounded-full flex items-center justify-center font-black -rotate-12 shadow-[4px_4px_0_#000] text-xs z-10">
            HOT!
          </div>
        )}

        <div
          className="border-b-[3px] border-black h-48 relative flex items-center justify-center"
          style={{ backgroundColor: tour.bgColor || "#FFEB3B" }}
        >
          <MapPin
            className="w-24 h-24 text-black opacity-20"
            strokeWidth={3}
          />
          <span className="absolute top-3 right-3 bg-[#FF6B9D] border-2 border-black px-3 py-1 text-sm font-bold">
            €{tour.price}
          </span>
          {showStatus && tour.status !== "open" && (
            <span className="absolute top-3 left-3 bg-[#FF3B3B] border-2 border-black px-3 py-1 text-sm font-bold text-white uppercase">
              {tour.status}
            </span>
          )}
        </div>

        <div className="p-6">
          <h3 className="text-3xl font-black uppercase leading-tight mb-3 break-words overflow-hidden">
            {tour.title}
          </h3>

          <div className="flex flex-wrap gap-2 mb-3">
            <BrutalBadge variant="cyan">
              {tour.countryFlag} {tour.country}
            </BrutalBadge>
            <BrutalBadge variant="white">
              {tour.days} DAY{tour.days > 1 ? "S" : ""}
            </BrutalBadge>
          </div>

          <p className="text-sm font-medium uppercase tracking-wide mb-4">
            {tour.dateStart} - {tour.dateEnd}
          </p>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-3 bg-[#FFF8E7] border-2 border-black">
              <div
                className="h-full bg-[#C6FF00]"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="font-bold text-sm flex items-center gap-1">
              <Users className="w-4 h-4" strokeWidth={3} />
              {tour.currentMembers}/{tour.maxMembers}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
