"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Users, Calendar, DollarSign, Globe } from "lucide-react";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { BrutalButton } from "@/components/ui/brutal-button";
import { BrutalBadge } from "@/components/ui/brutal-badge";
import { BrutalModal } from "@/components/ui/brutal-modal";
import { EmptyState } from "@/components/ui/empty-state";
import { SubscriptionBanner } from "@/components/operator/subscription-banner";
import { ContactList, type ContactRow } from "@/components/operator/contact-list";
import { useAuth, canOperatorAccessGroups } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";

const MOCK_CONTACTS: ContactRow[] = [
  {
    name: "Maria Silva",
    country: "Spain",
    countryFlag: "🇪🇸",
    age: 28,
    email: "maria.silva@example.com",
    phone: "+34 600 123 456",
    languages: ["ES", "EN"],
    bio: "Backpacking SA for 6 months. Photography and slow travel.",
  },
  {
    name: "John Smith",
    country: "UK",
    countryFlag: "🇬🇧",
    age: 25,
    email: "john.smith@example.com",
    languages: ["EN"],
    bio: "First time in South America — flexible on schedule.",
  },
  {
    name: "Yuki Tanaka",
    country: "Japan",
    countryFlag: "🇯🇵",
    age: 30,
    email: "yuki.tanaka@example.com",
    phone: "+81 90 1234 5678",
    languages: ["EN", "ES"],
    bio: "Solo traveler. Loves landscape photography.",
  },
  {
    name: "Carlos Santos",
    country: "Brazil",
    countryFlag: "🇧🇷",
    age: 27,
    email: "carlos.santos@example.com",
    phone: "+55 11 98765 4321",
    languages: ["PT", "ES", "EN"],
    bio: "Climber and hiker. Good for high-altitude tours.",
  },
  {
    name: "Anna Mueller",
    country: "Germany",
    countryFlag: "🇩🇪",
    age: 26,
    email: "anna.mueller@example.com",
    languages: ["EN", "DE"],
    bio: "Vegan, prefers small groups.",
  },
  {
    name: "David Lee",
    country: "Australia",
    countryFlag: "🇦🇺",
    age: 29,
    email: "david.lee@example.com",
    phone: "+61 400 123 456",
    languages: ["EN"],
    bio: "Long road trips. Easy-going.",
  },
];

export default function OperatorGroupDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { user } = useAuth();
  const { toursById, hasPurchased, purchaseContacts } = useStore();
  const { toast } = useToast();
  const [confirming, setConfirming] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!user || user.role !== "operator") return null;
  const sub = user.subscription;
  const canAccess = canOperatorAccessGroups(user);

  const tour = id ? toursById[id] : undefined;

  if (!tour) {
    return (
      <div className="min-h-screen bg-[#FFF8E7]">
        <Header variant="operator" />
        <div className="max-w-7xl mx-auto px-6 py-32 text-center">
          <h1 className="text-5xl font-black uppercase mb-4">GROUP NOT FOUND</h1>
          <BrutalButton href="/operator/groups" variant="primary" size="lg">
            BACK TO GROUPS
          </BrutalButton>
        </div>
        <Footer />
      </div>
    );
  }

  const purchased = hasPurchased(tour.id, user.email);
  const contacts = purchased ? MOCK_CONTACTS.slice(0, tour.maxMembers) : [];
  const countryByMember: Record<string, number> = {};
  MOCK_CONTACTS.slice(0, tour.maxMembers).forEach((c) => {
    countryByMember[`${c.countryFlag} ${c.country}`] =
      (countryByMember[`${c.countryFlag} ${c.country}`] ?? 0) + 1;
  });

  // Validation rules from spec
  const blockedReason: string | null = (() => {
    if (!canAccess) return "Subscription not active";
    if (sub && sub.contactsUsed >= sub.contactsLimit) return "Plan limit reached";
    if (sub && !sub.countriesServed.includes(countryISO(tour.country))) {
      return `${tour.country} not in your plan`;
    }
    if (tour.status !== "closed") return "Tour is not yet closed";
    return null;
  })();

  const operatorsContacted: number = 2; // mock — backend will surface this

  const performPurchase = () => {
    const result = purchaseContacts(tour.id, user.email);
    if (result) {
      setConfirming(false);
      setSuccess(true);
      toast(`Unlocked ${tour.maxMembers} contacts.`, "success");
    } else {
      toast("Already purchased — refresh.", "info");
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8E7]">
      <Header variant="operator" />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <SubscriptionBanner subscription={sub} />

        <div className="font-bold uppercase text-sm mb-6">
          <Link href="/operator" className="hover:underline">
            DASHBOARD
          </Link>
          {" › "}
          <Link href="/operator/groups" className="hover:underline">
            BROWSE
          </Link>
          {" › "}
          <span className="text-[#FF6B9D]">{tour.title}</span>
        </div>

        <div className="grid md:grid-cols-12 gap-8">
          {/* Group info */}
          <div className="md:col-span-8">
            <h1 className="text-4xl md:text-6xl font-black uppercase leading-none mb-6">
              {tour.title}
            </h1>

            <div className="flex flex-wrap gap-3 mb-8">
              <BrutalBadge variant="cyan">
                {tour.countryFlag} {tour.country}
              </BrutalBadge>
              <BrutalBadge variant="white">{tour.type.toUpperCase()}</BrutalBadge>
              <BrutalBadge variant="lime">
                {tour.maxMembers} TRAVELERS
              </BrutalBadge>
            </div>

            <div className="bg-white border-4 border-black p-6 md:p-8 shadow-[6px_6px_0_#000] mb-8">
              <h2 className="text-xl md:text-2xl font-black uppercase mb-4">
                GROUP DETAILS
              </h2>
              <p className="font-medium leading-relaxed mb-6">
                Travelers want a {tour.days}-day tour through{" "}
                {tour.country.toLowerCase()} starting around {tour.dateStart}.
                Budget-conscious but willing to pay for quality. Mix of
                photography and adventure interests.
              </p>

              <div className="grid sm:grid-cols-3 gap-6">
                <Stat
                  icon={<Users className="w-6 h-6" strokeWidth={3} />}
                  label="TRAVELERS"
                  value={`${tour.maxMembers} people`}
                />
                <Stat
                  icon={<Calendar className="w-6 h-6" strokeWidth={3} />}
                  label="DATES"
                  value={`${tour.dateStart} – ${tour.dateEnd}`}
                />
                <Stat
                  icon={<DollarSign className="w-6 h-6" strokeWidth={3} />}
                  label="BUDGET/PERSON"
                  value={`€${tour.price}`}
                />
              </div>
            </div>

            {/* Country breakdown — visible always */}
            <div className="bg-white border-4 border-black p-6 md:p-8 shadow-[6px_6px_0_#000] mb-8">
              <h3 className="text-xl font-black uppercase mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5" strokeWidth={3} />
                MEMBERS BY COUNTRY
              </h3>
              <div className="flex flex-wrap gap-3">
                {Object.entries(countryByMember).map(([k, v]) => (
                  <span
                    key={k}
                    className="bg-[#FFF8E7] border-2 border-black px-3 py-1 font-bold text-sm"
                  >
                    {k} ({v})
                  </span>
                ))}
              </div>
              {!purchased && operatorsContacted > 0 && (
                <p className="font-bold uppercase text-xs mt-5 text-[#FF6B9D]">
                  ⚡ {operatorsContacted} operator{operatorsContacted === 1 ? "" : "s"}{" "}
                  already contacted this group
                </p>
              )}
            </div>

            {/* Contacts (visible after purchase) */}
            {purchased && contacts.length > 0 && (
              <div className="bg-[#C6FF00] border-4 border-black p-6 md:p-8 shadow-[8px_8px_0_#000] mb-8">
                <h2 className="text-2xl md:text-3xl font-black uppercase mb-6">
                  ★ TRAVELER CONTACTS
                </h2>
                <ContactList contacts={contacts} />
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <BrutalButton
                    variant="secondary"
                    size="md"
                    onClick={() => toast("CSV exported (mock)", "success")}
                  >
                    EXPORT TO CSV
                  </BrutalButton>
                  <BrutalButton
                    href="/operator/contacts"
                    variant="black"
                    size="md"
                  >
                    VIEW IN MY CONTACTS
                  </BrutalButton>
                </div>
              </div>
            )}
          </div>

          {/* Sticky purchase sidebar */}
          <aside className="md:col-span-4">
            <div className="sticky top-24">
              {!purchased ? (
                <div className="bg-[#FFEB3B] border-4 border-black p-6 md:p-8 shadow-[12px_12px_0_#000]">
                  <h3 className="text-2xl md:text-3xl font-black uppercase mb-4">
                    GET CONTACTS
                  </h3>
                  <div className="text-5xl md:text-6xl font-black mb-1">
                    1
                  </div>
                  <div className="text-xs font-bold uppercase mb-6">
                    CREDIT
                  </div>
                  {sub && (
                    <div className="bg-white border-3 border-black p-4 mb-6">
                      <p className="font-bold text-sm">
                        {sub.contactsLimit - sub.contactsUsed} CREDITS LEFT
                        THIS MONTH
                      </p>
                    </div>
                  )}
                  <div className="space-y-2 mb-6 text-sm font-medium">
                    <p>YOU&apos;LL RECEIVE:</p>
                    <p>✓ {tour.maxMembers} names + countries</p>
                    <p>✓ {tour.maxMembers} verified emails</p>
                    <p>✓ Phone numbers (where shared)</p>
                  </div>

                  {blockedReason ? (
                    <div className="bg-[#FF3B3B] border-3 border-black text-white px-4 py-3 mb-3 font-bold uppercase text-xs">
                      ⚠ {blockedReason}
                    </div>
                  ) : (
                    <BrutalButton
                      variant="black"
                      size="lg"
                      className="w-full"
                      onClick={() => setConfirming(true)}
                    >
                      PURCHASE NOW
                    </BrutalButton>
                  )}
                </div>
              ) : (
                <div className="bg-[#C6FF00] border-4 border-black p-6 md:p-8 shadow-[12px_12px_0_#000] text-center">
                  <div className="text-5xl mb-3">✅</div>
                  <h3 className="text-2xl md:text-3xl font-black uppercase mb-3">
                    UNLOCKED!
                  </h3>
                  <p className="font-bold mb-6 text-sm">
                    All traveler contacts are visible. Reach out before they
                    book elsewhere.
                  </p>
                  <BrutalButton
                    href="/operator/contacts"
                    variant="black"
                    size="md"
                    className="w-full"
                  >
                    VIEW IN MY CONTACTS
                  </BrutalButton>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Final confirmation modal */}
      <BrutalModal
        open={confirming}
        onClose={() => setConfirming(false)}
        title="CONFIRM PURCHASE"
        size="md"
      >
        <p className="font-medium mb-4">
          You&apos;re about to spend{" "}
          <strong>1 credit</strong> to unlock contacts for{" "}
          <strong>{tour.title}</strong>.
        </p>
        <ul className="space-y-2 text-sm mb-8">
          <li>★ {tour.maxMembers} traveler emails</li>
          <li>★ Phones where shared</li>
          <li>★ Profile bios + languages</li>
        </ul>

        <div className="flex flex-col sm:flex-row gap-3">
          <BrutalButton
            variant="primary"
            size="lg"
            className="flex-1"
            onClick={performPurchase}
          >
            CONFIRM — 1 CREDIT
          </BrutalButton>
          <BrutalButton
            variant="secondary"
            size="lg"
            onClick={() => setConfirming(false)}
          >
            CANCEL
          </BrutalButton>
        </div>
      </BrutalModal>

      {/* Success modal — celebratory after purchase */}
      <BrutalModal
        open={success}
        onClose={() => setSuccess(false)}
        title="UNLOCKED!"
        size="sm"
      >
        <p className="font-medium mb-6">
          {tour.maxMembers} traveler contacts are now visible. Reach out
          quickly — competitor operators may have unlocked the same group.
        </p>
        <BrutalButton
          variant="primary"
          size="lg"
          className="w-full"
          onClick={() => setSuccess(false)}
        >
          SEE CONTACTS
        </BrutalButton>
      </BrutalModal>

      <Footer />
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      {icon}
      <div>
        <p className="font-black text-xs uppercase">{label}</p>
        <p className="font-bold text-base">{value}</p>
      </div>
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
