"use client";

import { useMemo } from "react";
import Link from "next/link";
import { AlertTriangle, TrendingUp, Users, Building2, Activity } from "lucide-react";
import { useStore } from "@/lib/store";

export default function AdminOverviewPage() {
  const { allTours, state } = useStore();

  // Mock activity feed — in real app, comes from event log
  const activity = useMemo(
    () => [
      {
        time: "2 minutes ago",
        event: "New traveler signup",
        detail: "maria@example.com",
      },
      {
        time: "15 minutes ago",
        event: "Tour created",
        detail: "Salar de Uyuni 4D",
      },
      {
        time: "1 hour ago",
        event: "Operator purchased contacts",
        detail: "Atacama Tours · €1 credit",
      },
      {
        time: "3 hours ago",
        event: "Tour closed",
        detail: "Atacama Stargazing (5/5)",
      },
      {
        time: "Yesterday",
        event: "Operator subscription created",
        detail: "Inca Trail Co · Pro plan",
      },
    ],
    []
  );

  // Mock counts (in real app: derived from server data)
  const notReviewedCount = 3;
  const failedContactCount = allTours.filter((t) => t.status === "expired").length;
  const failedPaymentCount = 1;
  const cancelledThisWeek = state.cancelledTourIds.length;

  // Geographic distribution (simple bar by country)
  const byCountry: Record<string, { open: number; closed: number; total: number }> =
    {};
  allTours.forEach((t) => {
    const k = t.country;
    if (!byCountry[k]) byCountry[k] = { open: 0, closed: 0, total: 0 };
    if (t.status === "open") byCountry[k].open++;
    if (t.status === "closed") byCountry[k].closed++;
    byCountry[k].total++;
  });
  const maxCountry = Math.max(1, ...Object.values(byCountry).map((c) => c.total));

  return (
    <>
      <h1 className="text-4xl md:text-6xl font-black uppercase mb-12">
        ADMIN OVERVIEW
      </h1>

      {/* Alerts row */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <AlertCard
          tone="warning"
          label={`${notReviewedCount} OPERATORS NOT REVIEWED`}
          href="/admin/operators?reviewed=false"
        />
        <AlertCard
          tone="warning"
          label={`${cancelledThisWeek} CANCELLED THIS WEEK`}
          href="/admin/tours?filter=cancelled"
        />
        <AlertCard
          tone="warning"
          label={`${failedContactCount} EXPIRED WITHOUT CONTACTS`}
          href="/admin/tours?filter=expired"
        />
        <AlertCard
          tone="error"
          label={`${failedPaymentCount} FAILED PAYMENT`}
          href="/admin/operators?filter=payment_failed"
        />
      </div>

      {/* KPIs */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <KpiCard label="MRR" value="€1,247" color="#FFEB3B" icon={<TrendingUp className="w-6 h-6" strokeWidth={3} />} />
        <KpiCard
          label="ACTIVE OPERATORS"
          value="23"
          color="#00E5FF"
          icon={<Building2 className="w-6 h-6" strokeWidth={3} />}
        />
        <KpiCard
          label="TRAVELERS"
          value="487"
          color="#FF6B9D"
          icon={<Users className="w-6 h-6" strokeWidth={3} />}
        />
        <KpiCard
          label="TOURS CLOSED"
          value="34/MO"
          color="#C6FF00"
          icon={<Activity className="w-6 h-6" strokeWidth={3} />}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Activity feed */}
        <section>
          <h2 className="text-2xl md:text-3xl font-black uppercase mb-6">
            RECENT ACTIVITY
          </h2>
          <div className="bg-white border-4 border-black shadow-[6px_6px_0_#000] divide-y-2 divide-black">
            {activity.map((a, i) => (
              <div
                key={i}
                className="p-4 flex flex-col sm:flex-row sm:items-center gap-3"
              >
                <span className="font-bold text-xs uppercase text-[#666] shrink-0 w-32">
                  {a.time}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold uppercase text-sm">{a.event}</p>
                  <p className="text-xs font-medium text-[#666] truncate">
                    {a.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Geographic distribution */}
        <section>
          <h2 className="text-2xl md:text-3xl font-black uppercase mb-6">
            GEO DISTRIBUTION
          </h2>
          <div className="bg-white border-4 border-black shadow-[6px_6px_0_#000] p-6">
            <div className="space-y-4">
              {Object.entries(byCountry).map(([country, c]) => (
                <Link
                  key={country}
                  href={`/admin/tours?country=${encodeURIComponent(country)}`}
                  className="block group"
                >
                  <div className="flex items-center justify-between mb-1 text-sm font-bold">
                    <span className="uppercase">{country}</span>
                    <span>{c.total}</span>
                  </div>
                  <div className="h-5 bg-[#FFF8E7] border-2 border-black overflow-hidden flex">
                    <div
                      className="h-full bg-[#C6FF00] group-hover:opacity-80 transition-opacity"
                      style={{ width: `${(c.open / maxCountry) * 100}%` }}
                      title={`${c.open} open`}
                    />
                    <div
                      className="h-full bg-[#FFEB3B] group-hover:opacity-80 transition-opacity"
                      style={{ width: `${(c.closed / maxCountry) * 100}%` }}
                      title={`${c.closed} closed`}
                    />
                  </div>
                </Link>
              ))}
            </div>
            <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t-2 border-black/30 text-xs font-bold uppercase">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-[#C6FF00] border border-black" />{" "}
                Open
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-[#FFEB3B] border border-black" />{" "}
                Closed
              </span>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function AlertCard({
  tone,
  label,
  href,
}: {
  tone: "warning" | "error";
  label: string;
  href: string;
}) {
  const bg =
    tone === "error"
      ? "bg-[#FF3B3B] text-white"
      : "bg-[#FFEB3B] text-black";
  return (
    <Link
      href={href}
      className={`${bg} border-4 border-black p-5 shadow-[4px_4px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#000] transition-all duration-100 block`}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" strokeWidth={3} />
        <p className="font-black uppercase text-sm leading-tight">{label}</p>
      </div>
    </Link>
  );
}

function KpiCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: string;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className="border-4 border-black p-6 shadow-[6px_6px_0_#000] bg-white"
      style={{ borderLeftWidth: 12, borderLeftColor: color }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-bold uppercase">{label}</div>
        {icon}
      </div>
      <div className="text-3xl md:text-4xl font-black">{value}</div>
    </div>
  );
}
