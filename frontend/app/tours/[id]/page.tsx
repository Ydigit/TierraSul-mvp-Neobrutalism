"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, DollarSign, MapPin, Edit, Share2, Hourglass } from "lucide-react";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { BrutalButton } from "@/components/ui/brutal-button";
import { BrutalBadge } from "@/components/ui/brutal-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { TourProgress } from "@/components/tour/tour-progress";
import { TourCard } from "@/components/tour/tour-card";
import { MemberList, type Member } from "@/components/tour/member-list";
import { JoinModal } from "@/components/tour/join-modal";
import { LeaveModal } from "@/components/tour/leave-modal";
import { GroupProfileView } from "@/components/profile/group-profile-view";
import { displayName } from "@/lib/profile-view";
import {
  isClosingSoon,
  closingWindowMsLeft,
  formatCountdown,
} from "@/lib/group-state";
import { useStore } from "@/lib/store";
import { useAuth, type AuthUser } from "@/lib/auth";
import { useToast } from "@/components/ui/toast";

/** Re-renders every `intervalMs` while `enabled` — used to tick the live countdown. */
function useNow(enabled: boolean, intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!enabled) return;
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [enabled, intervalMs]);
  return now;
}

export default function TourDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;
  const { user } = useAuth();
  const { toursById, allTours, isMember, membersOf, submitReport } =
    useStore();
  const { toast } = useToast();
  const [showJoin, setShowJoin] = useState(false);
  const [showLeave, setShowLeave] = useState(false);
  const [viewingMember, setViewingMember] = useState<Member | null>(null);

  const tour = id ? toursById[id] : undefined;

  if (!tour) {
    return (
      <div className="min-h-screen bg-[#FFF8E7]">
        <Header variant="public" />
        <div className="max-w-7xl mx-auto px-6 py-32 text-center">
          <h1 className="text-6xl font-black uppercase mb-6">TOUR NOT FOUND</h1>
          <p className="font-medium mb-8">
            This group may have been removed or never existed.
          </p>
          <BrutalButton href="/tours" variant="primary" size="lg">
            BACK TO TOURS
          </BrutalButton>
        </div>
        <Footer />
      </div>
    );
  }

  const userIsMember = !!user && isMember(tour.id, user.email);
  const isCreator =
    user?.role === "traveler" &&
    tour.id.startsWith("custom-"); // custom tours belong to current user in mock
  const isUnavailable =
    tour.status === "expired" ||
    tour.status === "cancelled" ||
    tour.status === "completed";
  const operatorsContacted = 0; // mock — real backend will surface this

  const similarTours = allTours
    .filter(
      (t) =>
        t.id !== tour.id &&
        t.country === tour.country &&
        (t.status === "open" || t.status === "closed")
    )
    .slice(0, 3);

  const memberRecords = membersOf(tour.id);
  // Mock: blend store memberships with seed data names + richer fake profiles.
  // Picsum URLs are stable placeholder photos — fine for demo.
  const seededProfiles = [
    {
      name: "Maria Silva", country: "Spain", flag: "🇪🇸", age: 28,
      bio: "Photographer, slow traveler. 3 months into South America.",
      languages: ["en", "es"],
      avatarUrl: "https://picsum.photos/seed/maria/200/200",
      photos: ["https://picsum.photos/seed/maria1/600/600", "https://picsum.photos/seed/maria2/600/600"],
    },
    {
      name: "John Smith", country: "UK", flag: "🇬🇧", age: 25,
      bio: "Solo backpacker, into trekking.",
      languages: ["en"],
      avatarUrl: "https://picsum.photos/seed/john/200/200",
      photos: ["https://picsum.photos/seed/john1/600/600"],
    },
    {
      name: "Yuki Tanaka", country: "Japan", flag: "🇯🇵", age: 30,
      bio: "First time in LatAm. Loves food markets.",
      languages: ["en", "es"],
      avatarUrl: "https://picsum.photos/seed/yuki/200/200",
      photos: [],
    },
    {
      name: "Carlos Santos", country: "Brazil", flag: "🇧🇷", age: 27,
      bio: "Surfer + mountaineer. Always down for a campfire.",
      languages: ["pt", "es", "en"],
      avatarUrl: "https://picsum.photos/seed/carlos/200/200",
      photos: ["https://picsum.photos/seed/carlos1/600/600", "https://picsum.photos/seed/carlos2/600/600", "https://picsum.photos/seed/carlos3/600/600"],
    },
    {
      name: "Anna Mueller", country: "Germany", flag: "🇩🇪", age: 26,
      bio: "On a gap year before med school.",
      languages: ["de", "en"],
      avatarUrl: "https://picsum.photos/seed/anna/200/200",
      photos: ["https://picsum.photos/seed/anna1/600/600"],
    },
    {
      name: "David Lee", country: "Australia", flag: "🇦🇺", age: 29,
      bio: "Freelance dev, working remote while travelling.",
      languages: ["en"],
      avatarUrl: "https://picsum.photos/seed/david/200/200",
      photos: [],
    },
  ];
  const filledMembers: Member[] = Array.from({
    length: tour.currentMembers,
  }).map((_, i) => {
    const m = memberRecords[i];
    const seed = seededProfiles[i % seededProfiles.length];
    const isCurrentUser = !!user && m?.userEmail === user.email;
    return {
      email: m?.userEmail ?? `member-${i}@example.com`,
      name: isCurrentUser ? user.name : seed.name,
      country: seed.country,
      countryFlag: seed.flag,
      age: seed.age,
      bio: isCurrentUser ? user.bio : seed.bio,
      languages: isCurrentUser ? user.languages : seed.languages,
      avatarUrl: isCurrentUser ? user.avatarUrl : seed.avatarUrl,
      photos: isCurrentUser ? user.photos : seed.photos,
    };
  });

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      await navigator.clipboard.writeText(url);
      toast("Link copied to clipboard", "success");
    } catch {
      toast("Could not copy — select & copy manually", "error");
    }
  };

  const memberToAuthUser = (m: Member): AuthUser => ({
    id: m.email,
    role: "traveler",
    email: m.email,
    name: m.name,
    emailVerified: true,
    status: "active",
    country: m.country,
    age: m.age,
    bio: m.bio,
    languages: m.languages,
    avatarUrl: m.avatarUrl,
    photos: m.photos,
  });

  return (
    <div className="min-h-screen bg-[#FFF8E7]">
      <Header variant="public" />

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="font-bold uppercase text-sm">
          <Link href="/" className="hover:underline">
            HOME
          </Link>
          {" › "}
          <Link href="/tours" className="hover:underline">
            TOURS
          </Link>
          {" › "}
          <span className="text-[#FF6B9D]">{tour.country}</span>
          {" › "}
          <span className="break-words">
            {tour.title.length > 60
              ? `${tour.title.slice(0, 57)}…`
              : tour.title}
          </span>
        </div>
      </div>

      {/* Hero */}
      <div
        className="h-72 md:h-96 border-y-4 border-black relative flex items-center justify-center"
        style={{ backgroundColor: tour.bgColor ?? "#FFEB3B" }}
      >
        <MapPin
          className="w-24 h-24 md:w-40 md:h-40 text-black opacity-20"
          strokeWidth={3}
        />
        <div className="absolute top-6 left-6">
          <BrutalBadge variant="cyan">
            {tour.countryFlag} {tour.country}
          </BrutalBadge>
        </div>
        <div className="absolute top-6 right-6">
          <StatusBadge status={tour.status} />
        </div>
      </div>

      {/* Unavailable banner (variant 4) */}
      {isUnavailable && (
        <div className="max-w-7xl mx-auto px-6 mt-6">
          <div className="bg-[#FF3B3B] text-white border-4 border-black p-5 shadow-[6px_6px_0_#000]">
            <p className="font-black uppercase">
              ⚠ This tour is no longer available ({tour.status.toUpperCase()})
            </p>
            <p className="font-medium text-sm mt-1">
              Browse other groups looking for travelers like you.
            </p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-12 gap-8">
          {/* Main */}
          <div className="md:col-span-8">
            <div className="flex items-start justify-between gap-4 mb-6">
              <h1 className="text-4xl md:text-6xl font-black uppercase leading-none break-words min-w-0 flex-1">
                {tour.title}
              </h1>
              <button
                onClick={share}
                aria-label="Share tour"
                className="border-3 border-black bg-white p-3 hover:bg-[#FFEB3B] transition-colors shrink-0"
              >
                <Share2 className="w-5 h-5" strokeWidth={3} />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-[#FFEB3B] border-3 border-black" />
              <div>
                <p className="font-bold uppercase text-sm">MARIA FROM SPAIN</p>
                <p className="text-sm font-medium">POSTED 3 DAYS AGO</p>
              </div>
            </div>

            <div className="bg-white border-4 border-black p-8 shadow-[6px_6px_0_#000] mb-8">
              <h2 className="text-2xl font-black uppercase mb-4">
                ABOUT THIS TRIP
              </h2>
              <p className="font-medium leading-relaxed mb-4">
                Looking to explore {tour.country.toLowerCase()} with a chill
                group of backpackers. The plan is {tour.days} days covering
                the highlights at a flexible pace.
              </p>
              <p className="font-medium leading-relaxed">
                Budget-conscious but happy to split costs for quality experiences
                — looking for people who like photography and don&apos;t mind
                roughing it a little.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 mb-8">
              <BrutalBadge variant="cyan">🇪🇸 ESPAÑOL</BrutalBadge>
              <BrutalBadge variant="yellow">🇬🇧 ENGLISH</BrutalBadge>
              <BrutalBadge variant="white">{tour.type.toUpperCase()}</BrutalBadge>
              {tour.days > 1 && (
                <BrutalBadge variant="white">MULTI-DAY</BrutalBadge>
              )}
            </div>

            {/*
              Member list visible to any authenticated traveler — joined or not.
              Allows a "vibe check" before commitment. Anonymized name ("Ana S.")
              and no contact info means privacy is still preserved.
              Visitors (no session) still see nothing — only the country summary
              above is public.
            */}
            {user?.role === "traveler" && filledMembers.length > 0 && (
              <div className="bg-[#C6FF00] border-4 border-black p-6 shadow-[8px_8px_0_#000] mb-8">
                <div className="flex flex-wrap items-baseline gap-3 mb-5">
                  <h2 className="text-2xl font-black uppercase">
                    {userIsMember ? "★ YOUR GROUP" : "★ THE GROUP"} (
                    {filledMembers.length})
                  </h2>
                  {!userIsMember && (
                    <p className="font-bold uppercase text-xs text-[#666]">
                      Click any member for a preview — no contact info shared
                    </p>
                  )}
                </div>
                <MemberList
                  members={filledMembers}
                  emptySlots={tour.maxMembers - tour.currentMembers}
                  formatName={(m) =>
                    user && m.email === user.email
                      ? m.name
                      : displayName(m.name, "OTHER_TRAVELER")
                  }
                  onMemberClick={(m) => {
                    if (user && m.email === user.email) {
                      router.push("/profile");
                      return;
                    }
                    setViewingMember(m);
                  }}
                />
              </div>
            )}
          </div>

          {/* Sticky sidebar */}
          <aside className="md:col-span-4">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0_#000]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-black uppercase">STATUS</h3>
                  <StatusBadge status={tour.status} />
                </div>

                <ClosingWindow tour={tour} />

                <div className="mb-4">
                  <p className="font-black text-3xl mb-2">
                    {tour.currentMembers} OF {tour.maxMembers}
                  </p>
                  <TourProgress
                    current={tour.currentMembers}
                    max={tour.maxMembers}
                    size="lg"
                  />
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5" strokeWidth={3} />
                    <span className="font-bold uppercase text-sm">
                      {tour.dateStart} – {tour.dateEnd} · {tour.days} DAY
                      {tour.days > 1 ? "S" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5" strokeWidth={3} />
                    <span className="font-bold uppercase text-sm">
                      €{tour.price}/PERSON
                    </span>
                  </div>
                </div>

                {/* CTA varies by viewer */}
                {isUnavailable ? (
                  <BrutalButton
                    href="/tours"
                    variant="secondary"
                    size="md"
                    className="w-full"
                  >
                    BROWSE OTHER TOURS
                  </BrutalButton>
                ) : !user ? (
                  <>
                    <BrutalButton
                      href={`/sign-up?next=${encodeURIComponent(`/tours/${tour.id}`)}`}
                      variant="primary"
                      size="md"
                      className="w-full mb-3"
                    >
                      SIGN UP TO JOIN
                    </BrutalButton>
                    <p className="text-xs font-bold uppercase text-center">
                      Free for travelers
                    </p>
                  </>
                ) : user.role === "operator" ? (
                  <>
                    <BrutalButton
                      href={`/operator/groups/${tour.id}`}
                      variant="primary"
                      size="md"
                      className="w-full"
                    >
                      VIEW AS OPERATOR
                    </BrutalButton>
                    <p className="text-xs font-bold uppercase text-center mt-3">
                      Closed groups can be unlocked from the operator console.
                    </p>
                  </>
                ) : userIsMember ? (
                  <>
                    {isCreator && (
                      <BrutalButton
                        href={`/tours/${tour.id}/edit`}
                        variant="secondary"
                        size="md"
                        className="w-full mb-3"
                      >
                        <Edit
                          className="inline w-4 h-4 mr-2"
                          strokeWidth={3}
                        />
                        EDIT TOUR
                      </BrutalButton>
                    )}
                    <BrutalButton
                      variant="danger"
                      size="md"
                      className="w-full"
                      onClick={() => setShowLeave(true)}
                    >
                      LEAVE GROUP
                    </BrutalButton>
                    <p className="text-xs font-bold uppercase text-center mt-3">
                      You&apos;re a member of this group
                    </p>
                  </>
                ) : tour.currentMembers >= tour.maxMembers ? (
                  <div className="bg-[#FF3B3B] border-4 border-black p-4 text-white text-center font-black uppercase">
                    GROUP IS FULL
                  </div>
                ) : (
                  <>
                    <BrutalButton
                      variant="primary"
                      size="md"
                      className="w-full mb-3"
                      onClick={() => setShowJoin(true)}
                    >
                      JOIN GROUP
                    </BrutalButton>
                    <p className="text-xs font-bold uppercase text-center">
                      No deposit yet — just confirm your spot
                    </p>
                  </>
                )}
              </div>
            </div>
          </aside>
        </div>

        {/* Similar tours */}
        {similarTours.length > 0 && (
          <div className="mt-24">
            <h2 className="text-4xl md:text-5xl font-black uppercase mb-12">
              MORE GROUPS<br />LIKE THIS
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {similarTours.map((t) => (
                <TourCard key={t.id} tour={t} />
              ))}
            </div>
          </div>
        )}
      </div>

      <JoinModal open={showJoin} onClose={() => setShowJoin(false)} tour={tour} />
      <LeaveModal
        open={showLeave}
        onClose={() => setShowLeave(false)}
        tour={tour}
        operatorsContacted={operatorsContacted}
      />
      {viewingMember && (
        <GroupProfileView
          open={!!viewingMember}
          onClose={() => setViewingMember(null)}
          user={memberToAuthUser(viewingMember)}
          context="OTHER_TRAVELER"
          onReport={(reason) => {
            submitReport({
              reportedEmail: viewingMember.email,
              reportedName: viewingMember.name,
              reporterEmail: user?.email ?? "unknown@example.com",
              reason,
            });
          }}
        />
      )}

      <Footer />
    </div>
  );
}

/**
 * Live "OPEN (closing soon)" badge + 48h countdown. Only renders when the
 * tour is actually inside its closing window. Re-renders every second so the
 * countdown visibly moves.
 */
function ClosingWindow({ tour }: { tour: import("@/components/tour/tour-card").Tour }) {
  const active = isClosingSoon(tour);
  useNow(active, 1000);
  if (!active) return null;
  const msLeft = closingWindowMsLeft(tour) ?? 0;
  return (
    <div className="bg-[#FF6B9D] border-3 border-black px-3 py-2 mb-4 shadow-[3px_3px_0_#000] flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-white">
        <Hourglass className="w-4 h-4 shrink-0" strokeWidth={3} />
        <p className="font-black uppercase text-xs tracking-wider">
          CLOSING IN
        </p>
      </div>
      <p className="font-black tabular-nums text-sm bg-white px-2 py-0.5 border-2 border-black">
        {formatCountdown(msLeft)}
      </p>
    </div>
  );
}
