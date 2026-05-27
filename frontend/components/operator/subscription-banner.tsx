"use client";

import { BrutalButton } from "../ui/brutal-button";
import type { OperatorSubscription } from "@/lib/auth";

interface SubscriptionBannerProps {
  subscription?: OperatorSubscription;
}

/**
 * Persistent banner that surfaces subscription edge states on every operator
 * page. Returns null when the subscription is healthy.
 */
export function SubscriptionBanner({ subscription }: SubscriptionBannerProps) {
  if (!subscription) {
    return (
      <Banner
        tone="info"
        title="No active subscription"
        description="Subscribe to start accessing pre-formed groups."
        ctaLabel="See plans"
        ctaHref="/pricing"
      />
    );
  }

  if (subscription.paymentFailed) {
    return (
      <Banner
        tone="error"
        title="Last payment failed"
        description="Update your payment method to keep accessing groups."
        ctaLabel="Update payment"
        ctaHref="/operator/billing"
      />
    );
  }

  if (subscription.status === "ended" || subscription.status === "cancelled") {
    return (
      <Banner
        tone="warning"
        title="Subscription ended"
        description="Reactivate to access new groups again."
        ctaLabel="Reactivate"
        ctaHref="/pricing"
      />
    );
  }

  if (subscription.cancelScheduled) {
    return (
      <Banner
        tone="warning"
        title={`Subscription ends ${formatDate(subscription.renewsAt)}`}
        description="You'll keep access until the end of the current period."
        ctaLabel="Reactivate"
        ctaHref="/operator/billing"
      />
    );
  }

  if (subscription.status === "trialing" && subscription.trialEndsAt) {
    return (
      <Banner
        tone="info"
        title={`Free trial — ends ${formatDate(subscription.trialEndsAt)}`}
        description={
          subscription.isFoundingMember
            ? "Founding 50 lock-in price kicks in after the trial."
            : "Your card will be charged when the trial ends."
        }
        ctaLabel="View billing"
        ctaHref="/operator/billing"
      />
    );
  }

  if (subscription.contactsUsed >= subscription.contactsLimit) {
    return (
      <Banner
        tone="warning"
        title="Contact limit reached"
        description={`You've used ${subscription.contactsUsed}/${subscription.contactsLimit} this period. Resets ${formatDate(subscription.renewsAt)}.`}
        ctaLabel="Upgrade plan"
        ctaHref="/operator/billing"
      />
    );
  }

  return null;
}

interface BannerProps {
  tone: "info" | "warning" | "error";
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
}

function Banner({ tone, title, description, ctaLabel, ctaHref }: BannerProps) {
  const bg =
    tone === "error"
      ? "bg-[#FF3B3B] text-white"
      : tone === "warning"
        ? "bg-[#FFEB3B] text-black"
        : "bg-[#00E5FF] text-black";

  return (
    <div
      className={`${bg} border-4 border-black p-6 shadow-[6px_6px_0_#000] mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4`}
    >
      <div>
        <p className="font-black uppercase text-sm">⚠ {title}</p>
        <p className="font-medium text-sm mt-1">{description}</p>
      </div>
      <BrutalButton href={ctaHref} variant="black" size="sm">
        {ctaLabel}
      </BrutalButton>
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}
