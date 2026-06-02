"use client";

import { X } from "lucide-react";
import { BrutalSelect } from "../ui/brutal-select";
import { BrutalButton } from "../ui/brutal-button";
import { countries, tourTypes } from "@/data/mock-data";

/**
 * Sort keys.
 *
 * Note (2026-06-02): `soonest-departure` previously named `closing-soon`.
 * Renamed because "CLOSING SOON" already means something else in the UI —
 * the 48h badge on tours inside their closing window. Using the same label
 * for a sort criterion would conflate the two ideas. The backend should
 * mirror this rename so payloads/queries stay coherent.
 */
export type SortBy =
  | "newest"
  | "soonest-departure"
  | "price-low"
  | "price-high";

export interface TourFilterValues {
  country: string;
  type: string;
  size: string;
  sortBy: SortBy;
}

export const DEFAULT_FILTERS: TourFilterValues = {
  country: "all",
  type: "all",
  size: "all",
  sortBy: "newest",
};

interface TourFiltersProps {
  values: TourFilterValues;
  onChange: (values: TourFilterValues) => void;
  className?: string;
}

const sortOptions = [
  { value: "newest", label: "NEWEST" },
  { value: "soonest-departure", label: "SOONEST DEPARTURE" },
  { value: "price-low", label: "PRICE LOW → HIGH" },
  { value: "price-high", label: "PRICE HIGH → LOW" },
];

const sizeOptions = [
  { value: "all", label: "ANY SIZE" },
  { value: "small", label: "2-4 PEOPLE" },
  { value: "medium", label: "5-8 PEOPLE" },
  { value: "large", label: "9+ PEOPLE" },
];

export function TourFilters({
  values,
  onChange,
  className = "",
}: TourFiltersProps) {
  // Country dropdown shows every country — it's a UI filter, never a permission.
  const filteredCountries = countries;

  const update = (patch: Partial<TourFilterValues>) =>
    onChange({ ...values, ...patch });

  const reset = () => onChange(DEFAULT_FILTERS);

  const activeChips: { label: string; clear: () => void }[] = [];
  if (values.country !== "all") {
    const c = countries.find((x) => x.value === values.country);
    activeChips.push({
      label: c?.label ?? values.country,
      clear: () => update({ country: "all" }),
    });
  }
  if (values.type !== "all") {
    const t = tourTypes.find((x) => x.value === values.type);
    activeChips.push({
      label: t?.label ?? values.type,
      clear: () => update({ type: "all" }),
    });
  }
  if (values.size !== "all") {
    const s = sizeOptions.find((x) => x.value === values.size);
    activeChips.push({
      label: s?.label ?? values.size,
      clear: () => update({ size: "all" }),
    });
  }

  return (
    <div className={className}>
      <div className="grid md:grid-cols-5 gap-4">
        <BrutalSelect
          options={filteredCountries}
          value={values.country}
          onChange={(e) => update({ country: e.target.value })}
        />
        <BrutalSelect
          options={tourTypes}
          value={values.type}
          onChange={(e) => update({ type: e.target.value })}
        />
        <BrutalSelect
          options={sizeOptions}
          value={values.size}
          onChange={(e) => update({ size: e.target.value })}
        />
        <BrutalSelect
          options={sortOptions}
          value={values.sortBy}
          onChange={(e) => update({ sortBy: e.target.value as SortBy })}
        />
        <BrutalButton variant="secondary" size="sm" onClick={reset}>
          RESET FILTERS
        </BrutalButton>
      </div>

      {activeChips.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-4">
          {activeChips.map((chip, i) => (
            <button
              key={i}
              onClick={chip.clear}
              className="bg-[#FFEB3B] border-3 border-black px-4 py-2 font-bold uppercase text-xs flex items-center gap-2 shadow-[3px_3px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0_#000] transition-all"
            >
              {chip.label} <X className="w-3 h-3" strokeWidth={3} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Pure helper: apply filters + sort to a tour list. */
export function applyFilters<
  T extends {
    country: string;
    type: string;
    maxMembers: number;
    price: number;
    dateStart: string;
    status: string;
  },
>(tours: T[], values: TourFilterValues): T[] {
  let result = tours.slice();

  if (values.country !== "all") {
    const map: Record<string, string> = {
      BO: "BOLIVIA",
      PE: "PERU",
      CL: "CHILE",
      AR: "ARGENTINA",
    };
    const target = map[values.country] ?? values.country.toUpperCase();
    result = result.filter((t) => t.country === target);
  }
  if (values.type !== "all") {
    result = result.filter(
      (t) => t.type.toLowerCase() === values.type.toLowerCase()
    );
  }
  if (values.size !== "all") {
    result = result.filter((t) => {
      if (values.size === "small") return t.maxMembers <= 4;
      if (values.size === "medium")
        return t.maxMembers >= 5 && t.maxMembers <= 8;
      if (values.size === "large") return t.maxMembers >= 9;
      return true;
    });
  }

  switch (values.sortBy) {
    case "price-low":
      result.sort((a, b) => a.price - b.price);
      break;
    case "price-high":
      result.sort((a, b) => b.price - a.price);
      break;
    case "soonest-departure":
      result.sort((a, b) => a.dateStart.localeCompare(b.dateStart));
      break;
    case "newest":
    default:
      // tours already arrive newest-first from store (custom prepended)
      break;
  }

  return result;
}
