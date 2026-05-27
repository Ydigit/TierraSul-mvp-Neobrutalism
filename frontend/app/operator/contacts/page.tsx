"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { BrutalButton } from "@/components/ui/brutal-button";
import { BrutalInput } from "@/components/ui/brutal-input";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { SubscriptionBanner } from "@/components/operator/subscription-banner";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";

type Filter = "all" | "closed" | "pending";

export default function OperatorContactsPage() {
  const { user } = useAuth();
  const { purchasesByOperator, toursById, setDealClosed } = useStore();
  const { toast } = useToast();
  const [filter, setFilter] = useState<Filter>("all");
  const [editingValue, setEditingValue] = useState<Record<string, string>>({});

  if (!user || user.role !== "operator") return null;
  const sub = user.subscription;

  const purchases = purchasesByOperator(user.email).slice().reverse();
  const filtered =
    filter === "all"
      ? purchases
      : filter === "closed"
        ? purchases.filter((p) => p.dealClosed)
        : purchases.filter((p) => !p.dealClosed);

  const totalContacted = purchases.length;
  const revenue = purchases
    .filter((p) => p.dealClosed && p.dealValue)
    .reduce((sum, p) => sum + (p.dealValue ?? 0), 0);

  const saveDeal = (id: string) => {
    const raw = editingValue[id];
    const value = raw ? Number(raw) : 0;
    if (Number.isNaN(value) || value < 0) {
      toast("Invalid value", "error");
      return;
    }
    setDealClosed(id, value);
    setEditingValue((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    toast(`Deal recorded: €${value.toLocaleString()}`, "success");
  };

  return (
    <div className="min-h-screen bg-[#FFF8E7]">
      <Header variant="operator" />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <SubscriptionBanner subscription={sub} />

        <h1 className="text-5xl md:text-6xl font-black uppercase leading-none mb-12">
          MY CONTACTS
        </h1>

        <div className="grid sm:grid-cols-2 gap-6 mb-10">
          <div className="bg-[#00E5FF] border-4 border-black p-6 md:p-8 shadow-[8px_8px_0_#000]">
            <div className="text-4xl md:text-5xl font-black mb-2">
              {totalContacted}
            </div>
            <div className="text-sm font-bold uppercase">GROUPS CONTACTED</div>
          </div>
          <div className="bg-[#C6FF00] border-4 border-black p-6 md:p-8 shadow-[8px_8px_0_#000]">
            <div className="text-4xl md:text-5xl font-black mb-2">
              €{revenue.toLocaleString()}
            </div>
            <div className="text-sm font-bold uppercase">REVENUE TRACKED</div>
          </div>
        </div>

        <div className="flex gap-3 mb-8 flex-wrap">
          {(["all", "closed", "pending"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 font-black uppercase text-sm border-3 border-black shadow-[3px_3px_0_#000] transition-all ${
                filter === f
                  ? "bg-[#FFEB3B] translate-x-[2px] translate-y-[2px] shadow-[1px_1px_0_#000]"
                  : "bg-white hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#000]"
              }`}
            >
              {f === "all"
                ? `ALL (${purchases.length})`
                : f === "closed"
                  ? `CLOSED (${purchases.filter((p) => p.dealClosed).length})`
                  : `PENDING (${purchases.filter((p) => !p.dealClosed).length})`}
            </button>
          ))}
        </div>

        {filtered.length > 0 ? (
          <div className="bg-white border-4 border-black shadow-[8px_8px_0_#000]">
            <div className="bg-[#FFF8E7] border-b-4 border-black px-6 py-4">
              <h2 className="text-xl md:text-2xl font-black uppercase">
                CONTACTED GROUPS
              </h2>
            </div>
            <div className="divide-y-2 divide-black">
              {filtered.map((p) => {
                const tour = toursById[p.tourId];
                const editing = editingValue[p.id] !== undefined;
                return (
                  <div key={p.id} className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl md:text-2xl font-black uppercase mb-2 truncate">
                          {tour?.title ?? p.tourId}
                        </h3>
                        {tour && (
                          <div className="flex flex-wrap gap-3 text-sm font-bold mb-1">
                            <span>
                              {tour.countryFlag} {tour.country}
                            </span>
                            <span>·</span>
                            <span>{tour.maxMembers} travelers</span>
                            <span>·</span>
                            <span>
                              Tour: {tour.dateStart} – {tour.dateEnd}
                            </span>
                          </div>
                        )}
                        <p className="text-xs font-medium text-[#666]">
                          Contacted {formatRelative(p.purchasedAt)}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 shrink-0">
                        {p.dealClosed && p.dealValue ? (
                          <StatusBadge status="paid" />
                        ) : null}
                        <BrutalButton
                          href={`/operator/groups/${p.tourId}`}
                          variant="secondary"
                          size="sm"
                        >
                          VIEW{" "}
                          <ExternalLink
                            className="inline w-4 h-4 ml-1"
                            strokeWidth={3}
                          />
                        </BrutalButton>
                      </div>
                    </div>

                    <div className="bg-[#FFF8E7] border-3 border-black p-4">
                      <label className="flex items-center gap-3 mb-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={p.dealClosed}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditingValue((prev) => ({
                                ...prev,
                                [p.id]: String(p.dealValue ?? ""),
                              }));
                            } else {
                              setDealClosed(p.id, null);
                              toast("Deal removed", "info");
                            }
                          }}
                          className="w-6 h-6 border-3 border-black accent-black"
                        />
                        <span className="font-black uppercase text-sm">
                          MARK AS CLOSED DEAL
                          {p.dealValue
                            ? ` — €${p.dealValue.toLocaleString()}`
                            : ""}
                        </span>
                      </label>

                      {p.dealClosed && !editing && (
                        <button
                          onClick={() =>
                            setEditingValue((prev) => ({
                              ...prev,
                              [p.id]: String(p.dealValue ?? ""),
                            }))
                          }
                          className="font-bold uppercase text-xs hover:underline"
                        >
                          EDIT VALUE →
                        </button>
                      )}

                      {editing && (
                        <div className="flex flex-col sm:flex-row items-stretch gap-3">
                          <BrutalInput
                            type="number"
                            min="0"
                            placeholder="Deal value (€)"
                            value={editingValue[p.id]}
                            onChange={(e) =>
                              setEditingValue((prev) => ({
                                ...prev,
                                [p.id]: e.target.value,
                              }))
                            }
                            className="flex-1"
                          />
                          <BrutalButton
                            variant="primary"
                            size="sm"
                            onClick={() => saveDeal(p.id)}
                          >
                            SAVE
                          </BrutalButton>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <EmptyState
            title="NO CONTACTS YET"
            description="Browse open groups and unlock contacts to see them here."
            cta={{ label: "BROWSE GROUPS →", href: "/operator/groups" }}
          />
        )}
      </div>

      <Footer />
    </div>
  );
}

function formatRelative(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30)
    return `${Math.floor(days / 7)} week${days >= 14 ? "s" : ""} ago`;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
