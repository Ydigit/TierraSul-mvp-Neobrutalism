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
    const closed = allTours.filter((t) => t.status === "closed");
    const restricted = sub
      ? closed.filter((t) =>
          sub.countriesServed.includes(countryISO(t.country))
        )
      : closed;
    return applyFilters(restricted, filters);
  }, [allTours, filters, sub, canAccess]);

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
          {sub
            ? `${visibleSet.length} groups available across ${sub.countriesServed.length} ${sub.countriesServed.length === 1 ? "country" : "countries"} on your plan`
            : "Subscribe to access groups"}
        </p>

        {canAccess ? (
          <>
            <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0_#000] mb-12">
              <TourFilters
                values={filters}
                onChange={setFilters}
                allowedCountries={sub?.countriesServed}
              />
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

function countryISO(name: string): string {
  const map: Record<string, string> = {
    BOLIVIA: "BO",
    PERU: "PE",
    CHILE: "CL",
    ARGENTINA: "AR",
  };
  return map[name.toUpperCase()] ?? name;
}
