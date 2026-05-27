"use client";

import { useState } from "react";
import { Download, AlertTriangle } from "lucide-react";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { BrutalButton } from "@/components/ui/brutal-button";
import { BrutalModal } from "@/components/ui/brutal-modal";
import { DangerZone } from "@/components/ui/danger-zone";
import { StatusBadge } from "@/components/ui/status-badge";
import { PlanProgress } from "@/components/operator/plan-progress";
import { SubscriptionBanner } from "@/components/operator/subscription-banner";
import { useAuth, planLabel, planPrice } from "@/lib/auth";
import { useToast } from "@/components/ui/toast";

const MOCK_INVOICES = [
  { date: "May 1, 2026", amount: 59, status: "paid", id: "INV-2026-005" },
  { date: "Apr 1, 2026", amount: 59, status: "paid", id: "INV-2026-004" },
  { date: "Mar 1, 2026", amount: 59, status: "paid", id: "INV-2026-003" },
];

export default function OperatorBillingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [confirmCancel, setConfirmCancel] = useState(false);

  if (!user || user.role !== "operator") return null;
  const sub = user.subscription;

  const portalToast = (label: string) =>
    toast(`${label} → would open Stripe Customer Portal`, "info");

  return (
    <div className="min-h-screen bg-[#FFF8E7]">
      <Header variant="operator" />

      <div className="max-w-5xl mx-auto px-6 py-12">
        <SubscriptionBanner subscription={sub} />

        <h1 className="text-5xl md:text-6xl font-black uppercase leading-none mb-12">
          BILLING & PLAN
        </h1>

        {sub ? (
          <div className="bg-[#FFEB3B] border-4 border-black p-6 md:p-8 shadow-[12px_12px_0_#000] mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
              <div>
                <h2 className="text-3xl md:text-4xl font-black uppercase mb-2">
                  {planLabel(sub.plan)} PLAN
                </h2>
                <p className="text-xl md:text-2xl font-bold">
                  €{planPrice(sub.plan, sub.isFoundingMember)}/MONTH
                </p>
                {sub.isFoundingMember && (
                  <p className="text-xs font-bold uppercase mt-2 inline-block bg-[#FF6B9D] px-2 py-1 border-2 border-black">
                    ★ Founding 50 lock-in
                  </p>
                )}
              </div>
              <StatusBadge status={sub.status} />
            </div>

            <div className="mb-6">
              <div className="flex justify-between mb-2 flex-wrap gap-2">
                <span className="font-black uppercase text-sm">
                  CONTACTS USED
                </span>
                <span className="font-black text-base md:text-xl">
                  {sub.contactsUsed} / {sub.contactsLimit}
                </span>
              </div>
              <PlanProgress
                used={sub.contactsUsed}
                limit={sub.contactsLimit}
                size="lg"
              />
            </div>

            <div className="bg-white border-3 border-black p-4 mb-6">
              <p className="font-bold text-sm uppercase">
                {sub.cancelScheduled ? "ACCESS UNTIL" : "NEXT BILLING DATE"}
              </p>
              <p className="text-base md:text-xl font-black">
                €{planPrice(sub.plan, sub.isFoundingMember)} on{" "}
                {new Date(sub.renewsAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <BrutalButton
                variant="black"
                size="md"
                onClick={() => portalToast("Upgrade")}
              >
                UPGRADE
              </BrutalButton>
              <BrutalButton
                variant="secondary"
                size="md"
                onClick={() => portalToast("Downgrade")}
              >
                DOWNGRADE
              </BrutalButton>
              <BrutalButton
                variant="secondary"
                size="md"
                onClick={() => portalToast("Update payment method")}
              >
                UPDATE PAYMENT
              </BrutalButton>
            </div>
          </div>
        ) : (
          <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0_#000] mb-8 text-center">
            <h2 className="text-3xl font-black uppercase mb-4">
              NO ACTIVE SUBSCRIPTION
            </h2>
            <p className="font-medium mb-6">
              Pick a plan to start unlocking pre-formed groups.
            </p>
            <BrutalButton href="/pricing" variant="primary" size="lg">
              SEE PLANS →
            </BrutalButton>
          </div>
        )}

        <div className="bg-white border-4 border-black p-6 md:p-8 shadow-[6px_6px_0_#000] mb-8">
          <h2 className="text-2xl md:text-3xl font-black uppercase mb-6">
            PAYMENT METHOD
          </h2>

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-16 h-12 bg-[#FFEB3B] border-3 border-black flex items-center justify-center font-black">
                VISA
              </div>
              <div>
                <p className="font-bold">•••• •••• •••• 4242</p>
                <p className="text-sm font-medium">Expires 12/27</p>
              </div>
            </div>
            <BrutalButton
              variant="secondary"
              size="sm"
              onClick={() => portalToast("Update card")}
            >
              UPDATE
            </BrutalButton>
          </div>
        </div>

        <div className="bg-white border-4 border-black shadow-[6px_6px_0_#000] mb-8">
          <div className="bg-[#FFF8E7] border-b-4 border-black px-6 py-4">
            <h2 className="text-2xl font-black uppercase">INVOICES</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="border-b-2 border-black">
                <tr>
                  <th className="px-6 py-4 text-left font-black uppercase text-sm">
                    DATE
                  </th>
                  <th className="px-6 py-4 text-left font-black uppercase text-sm">
                    AMOUNT
                  </th>
                  <th className="px-6 py-4 text-left font-black uppercase text-sm">
                    STATUS
                  </th>
                  <th className="px-6 py-4 text-left font-black uppercase text-sm">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left font-black uppercase text-sm">
                    DOWNLOAD
                  </th>
                </tr>
              </thead>
              <tbody>
                {MOCK_INVOICES.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-b-2 border-[#FFF8E7] last:border-0"
                  >
                    <td className="px-6 py-4 font-bold">{inv.date}</td>
                    <td className="px-6 py-4 font-bold">€{inv.amount}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="px-6 py-4 font-medium text-sm">{inv.id}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() =>
                          toast("PDF link → Stripe-hosted invoice", "info")
                        }
                        className="font-bold uppercase text-sm hover:underline flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" strokeWidth={3} />
                        PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {sub && sub.status !== "ended" && !sub.cancelScheduled && (
          <DangerZone title="CANCEL SUBSCRIPTION">
            <p className="font-medium mb-6">
              Your subscription remains active until the end of the current
              billing period (
              {new Date(sub.renewsAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
              })}
              ).
            </p>
            <BrutalButton
              variant="danger"
              size="md"
              onClick={() => setConfirmCancel(true)}
            >
              CANCEL PLAN
            </BrutalButton>
          </DangerZone>
        )}
      </div>

      <BrutalModal
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        title="CANCEL SUBSCRIPTION?"
        size="md"
      >
        <div className="bg-[#FFEB3B] border-4 border-black p-5 mb-6">
          <p className="font-black uppercase flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" strokeWidth={3} />
            ACCESS CONTINUES UNTIL{" "}
            {sub &&
              new Date(sub.renewsAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
              })}
          </p>
        </div>
        <p className="font-medium mb-8">
          You can reactivate any time before then to avoid losing access.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <BrutalButton
            variant="danger"
            size="lg"
            className="flex-1"
            onClick={() => {
              setConfirmCancel(false);
              portalToast("Cancel");
            }}
          >
            YES, CANCEL
          </BrutalButton>
          <BrutalButton
            variant="secondary"
            size="lg"
            onClick={() => setConfirmCancel(false)}
          >
            KEEP IT
          </BrutalButton>
        </div>
      </BrutalModal>

      <Footer />
    </div>
  );
}
