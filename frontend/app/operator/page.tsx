"use client";

import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { BrutalButton } from "@/components/ui/brutal-button";
import { BrutalBadge } from "@/components/ui/brutal-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { GroupCard } from "@/components/operator/group-card";
import { PlanProgress } from "@/components/operator/plan-progress";
import { SubscriptionBanner } from "@/components/operator/subscription-banner";
import { Users, Calendar, TrendingUp, DollarSign } from "lucide-react";
import { useAuth, planLabel, canOperatorAccessGroups } from "@/lib/auth";
import { useStore } from "@/lib/store";

export default function OperatorDashboardPage() {
  const { user } = useAuth();
  const { allTours, hasPurchased, purchasesByOperator, toursById } = useStore();

  if (!user || user.role !== "operator") return null;
  const sub = user.subscription;
  const canAccess = canOperatorAccessGroups(user);
  const firstName = user.companyName ?? user.name;

  // New closed groups, regardless of country. Country is a UI filter on the
  // browse page, not a plan permission (MVP decision 2026-05-28).
  const availableGroups = allTours
    .filter((t) => t.status === "closed")
    .filter((t) => !hasPurchased(t.id, user.email))
    .slice(0, 6);

  const purchases = purchasesByOperator(user.email)
    .slice()
    .sort((a, b) => b.purchasedAt.localeCompare(a.purchasedAt))
    .slice(0, 5);

  const closedDealsCount = purchases.filter((p) => p.dealClosed).length;
  const revenueTracked = purchases
    .filter((p) => p.dealClosed && p.dealValue)
    .reduce((sum, p) => sum + (p.dealValue ?? 0), 0);

  return (
    <div className="min-h-screen bg-[#FFF8E7]">
      <Header variant="operator" />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <SubscriptionBanner subscription={sub} />

        {/* Welcome */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-4">
          <div>
            <h1 className="text-4xl md:text-6xl font-black uppercase leading-none mb-4">
              HEY {firstName.toUpperCase()}
            </h1>
            {sub && (
              <BrutalBadge variant="yellow">
                {planLabel(sub.plan)} PLAN
              </BrutalBadge>
            )}
          </div>
          <BrutalButton href="/operator/groups" variant="primary" size="lg">
            BROWSE ALL GROUPS →
          </BrutalButton>
        </div>

        {/* KPIs */}
        {sub ? (
          <section className="grid md:grid-cols-4 gap-6 mb-12">
            <KpiCard
              icon={<Users className="w-8 h-8" strokeWidth={3} />}
              value={`${sub.contactsUsed} / ${sub.contactsLimit}`}
              label="CONTACTS USED"
              bg="#FFEB3B"
              extra={
                <PlanProgress
                  used={sub.contactsUsed}
                  limit={sub.contactsLimit}
                  size="sm"
                />
              }
            />
            <KpiCard
              icon={<Calendar className="w-8 h-8" strokeWidth={3} />}
              value={daysUntil(sub.renewsAt).toString()}
              label="DAYS UNTIL RESET"
              bg="#00E5FF"
            />
            <KpiCard
              icon={<TrendingUp className="w-8 h-8" strokeWidth={3} />}
              value={String(closedDealsCount)}
              label="BOOKINGS CLOSED"
              bg="#C6FF00"
            />
            <KpiCard
              icon={<DollarSign className="w-8 h-8" strokeWidth={3} />}
              value={`€${revenueTracked.toLocaleString()}`}
              label="REVENUE TRACKED"
              bg="#FF6B9D"
            />
          </section>
        ) : null}

        {/* New groups */}
        <section className="mb-16">
          <h2 className="text-3xl md:text-4xl font-black uppercase mb-8">
            NEW GROUPS IN YOUR REGION
          </h2>

          {!canAccess ? (
            <EmptyState
              title="SUBSCRIBE TO ACCESS GROUPS"
              description="Reactivate your subscription or pick a plan to start unlocking pre-formed groups."
              cta={{ label: "SEE PLANS", href: "/pricing" }}
            />
          ) : availableGroups.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableGroups.map((tour) => (
                <GroupCard key={tour.id} tour={tour} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="NO NEW GROUPS THIS WEEK"
              description="Check back soon — new groups close every day."
              cta={{ label: "BROWSE ALL", href: "/operator/groups" }}
            />
          )}
        </section>

        {/* Recent purchases */}
        <section>
          <h2 className="text-3xl md:text-4xl font-black uppercase mb-8">
            RECENT PURCHASES
          </h2>
          {purchases.length > 0 ? (
            <div className="bg-white border-4 border-black shadow-[6px_6px_0_#000] overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead className="bg-[#FFF8E7] border-b-4 border-black">
                  <tr>
                    <th className="px-6 py-4 text-left font-black uppercase text-sm">
                      TOUR
                    </th>
                    <th className="px-6 py-4 text-left font-black uppercase text-sm">
                      DATE
                    </th>
                    <th className="px-6 py-4 text-left font-black uppercase text-sm">
                      DEAL
                    </th>
                    <th className="px-6 py-4 text-left font-black uppercase text-sm">
                      ACTION
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((p) => {
                    const tour = toursById[p.tourId];
                    return (
                      <tr
                        key={p.id}
                        className="border-b-2 border-black/30 last:border-0"
                      >
                        <td className="px-6 py-4 font-bold">
                          {tour?.title ?? p.tourId}
                        </td>
                        <td className="px-6 py-4 font-medium">
                          {formatRelative(p.purchasedAt)}
                        </td>
                        <td className="px-6 py-4">
                          {p.dealClosed ? (
                            <StatusBadge status="paid" />
                          ) : (
                            <StatusBadge status="pending" />
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <BrutalButton
                            href={`/operator/groups/${p.tourId}`}
                            variant="secondary"
                            size="sm"
                          >
                            VIEW
                          </BrutalButton>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="NO PURCHASES YET"
              description="Browse open groups to unlock contacts."
              cta={{ label: "BROWSE GROUPS", href: "/operator/groups" }}
            />
          )}
        </section>
      </div>

      <Footer />
    </div>
  );
}

interface KpiCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  bg: string;
  extra?: React.ReactNode;
}
function KpiCard({ icon, value, label, bg, extra }: KpiCardProps) {
  return (
    <div
      className="border-4 border-black p-6 shadow-[6px_6px_0_#000]"
      style={{ backgroundColor: bg }}
    >
      <div className="mb-3">{icon}</div>
      <div className="text-3xl md:text-4xl font-black mb-1">{value}</div>
      <div className="text-xs font-bold uppercase mb-3">{label}</div>
      {extra}
    </div>
  );
}

function daysUntil(iso: string): number {
  const target = new Date(iso).getTime();
  const now = Date.now();
  return Math.max(0, Math.ceil((target - now) / (1000 * 60 * 60 * 24)));
}

function formatRelative(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${days >= 14 ? "s" : ""} ago`;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

