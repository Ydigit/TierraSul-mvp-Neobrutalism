"use client";

import { useMemo, useState } from "react";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { TourCard } from "@/components/tour/tour-card";
import { BrutalButton } from "@/components/ui/brutal-button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  TourFilters,
  DEFAULT_FILTERS,
  applyFilters,
  type TourFilterValues,
} from "@/components/tour/tour-filters";
import { useStore } from "@/lib/store";

const PAGE_SIZE = 9;

export default function BrowseToursPage() {
  const { allTours } = useStore();
  const [filters, setFilters] = useState<TourFilterValues>(DEFAULT_FILTERS);
  const [visible, setVisible] = useState(PAGE_SIZE);

  // Public browse: only show open tours that aren't deleted/cancelled/expired/completed.
  const visibleSet = useMemo(() => {
    const browseable = allTours.filter(
      (t) => t.status === "open" || t.status === "closed"
    );
    return applyFilters(browseable, filters);
  }, [allTours, filters]);

  const shown = visibleSet.slice(0, visible);
  const hasMore = visible < visibleSet.length;

  return (
    <div className="min-h-screen bg-[#FFF8E7]">
      <Header variant="public" />

      <section className="max-w-7xl mx-auto px-6 py-16">
        <h1 className="text-6xl md:text-9xl font-black uppercase leading-none mb-4">
          OPEN GROUPS<br />
          LOOKING FOR<br />
          <span className="text-[#FF6B9D]">YOU</span>
        </h1>
        <p className="text-xl font-medium mt-6">
          {visibleSet.length} groups across South America
        </p>
      </section>

      <section className="sticky top-[73px] z-40 bg-white border-y-4 border-black py-6">
        <div className="max-w-7xl mx-auto px-6">
          <TourFilters
            values={filters}
            onChange={(v) => {
              setFilters(v);
              setVisible(PAGE_SIZE);
            }}
          />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-12">
        {shown.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {shown.map((tour) => (
                <TourCard key={tour.id} tour={tour} showStatus />
              ))}
            </div>
            {hasMore && (
              <div className="text-center mt-12">
                <BrutalButton
                  variant="secondary"
                  size="lg"
                  onClick={() => setVisible((v) => v + PAGE_SIZE)}
                >
                  SHOW MORE ({visibleSet.length - visible} LEFT)
                </BrutalButton>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            title="NO GROUPS MATCH YOUR FILTERS"
            description="Try widening your search — broader country or date range usually helps."
            cta={{
              label: "RESET FILTERS",
              onClick: () => setFilters(DEFAULT_FILTERS),
            }}
          />
        )}
      </section>

      <Footer />
    </div>
  );
}
