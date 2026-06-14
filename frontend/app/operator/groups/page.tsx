"use client";

import { useMemo, useState } from "react";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { GroupCard } from "@/components/operator/group-card";
import { SubscriptionBanner } from "@/components/operator/subscription-banner";
import { EmptyState } from "@/components/ui/empty-state";
import {
  TourFilters,
  DEFAULT_FILTERS,
  applyFilters,
  type TourFilterValues,
} from "@/components/tour/tour-filters";
import { useAuth, canOperatorAccessGroups } from "@/lib/auth";
import { useStore } from "@/lib/store";

export default function OperatorGroupsPage() {
  const { user } = useAuth();
  const { allTours, hasPurchased } = useStore();
  const [filters, setFilters] = useState<TourFilterValues>(DEFAULT_FILTERS);
  const sub = user?.role === "operator" ? user.subscription : undefined;
  const canAccess = canOperatorAccessGroups(user);

  const visibleSet = useMemo(() => {
    if (!canAccess) return [];
    // MVP: country is NOT a permission. Operators see closed groups from every
    // country; the dropdown is a UI filter only.
    const closed = allTours.filter((t) => t.status === "closed");
    return applyFilters(closed, filters);
  }, [allTours, filters, canAccess]);

  if (!user || user.role !== "operator") return null;

  return (
    <div className="min-h-screen bg-[#FFF8E7]">
      <Header variant="operator" />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <SubscriptionBanner subscription={sub} />

        <h1 className="text-5xl md:text-9xl font-black uppercase leading-none mb-4">
          AVAILABLE<br />GROUPS
        </h1>
        <p className="text-lg md:text-xl font-medium mb-12">
          {canAccess
            ? `${visibleSet.length} groups available — filter to narrow down`
            : "Subscribe to access groups"}
        </p>

        {canAccess ? (
          <>
            <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0_#000] mb-12">
              <TourFilters values={filters} onChange={setFilters} />
            </div>

            {visibleSet.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleSet.map((tour) => (
                  <GroupCard
                    key={tour.id}
                    tour={tour}
                    purchased={hasPurchased(tour.id, user.email)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="NO GROUPS MATCH YOUR FILTERS"
                description="Try widening your country or date range."
                cta={{
                  label: "RESET FILTERS",
                  onClick: () => setFilters(DEFAULT_FILTERS),
                }}
              />
            )}
          </>
        ) : (
          <EmptyState
            title="SUBSCRIBE TO VIEW"
            description="Pick a plan to access pre-formed groups in your region."
            cta={{ label: "SEE PLANS", href: "/pricing" }}
          />
        )}
      </div>

      <Footer />
    </div>
  );
}

