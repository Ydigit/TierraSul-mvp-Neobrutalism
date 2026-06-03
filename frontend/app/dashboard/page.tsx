"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { BrutalButton } from "@/components/ui/brutal-button";
import { TourCard } from "@/components/tour/tour-card";
import { EmptyState } from "@/components/ui/empty-state";
import { BrutalModal } from "@/components/ui/brutal-modal";
import { ActionMenu } from "@/components/admin/action-menu";
import { StatusBadge } from "@/components/ui/status-badge";
import { TourProgress } from "@/components/tour/tour-progress";
import { RequireRole } from "@/components/auth/require-role";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import { daysUntilStart } from "@/lib/group-state";
import Link from "next/link";

export default function TravelerDashboardPage() {
  return (
    <RequireRole role="traveler">
      <DashboardContent />
    </RequireRole>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const { allTours, state, cancelTour, deleteTour, leaveTour, isMember } =
    useStore();
  const { toast } = useToast();
  const [confirm, setConfirm] = useState<{
    type: "cancel" | "delete" | "leave";
    tourId: string;
  } | null>(null);

  if (!user) return null;
  const firstName = user.name.split(" ")[0];

  const myTours = allTours.filter((t) => t.id.startsWith("custom-"));
  const joinedTours = allTours.filter(
    (t) => !t.id.startsWith("custom-") && isMember(t.id, user.email)
  );

  const performAction = () => {
    if (!confirm) return;
    const t = allTours.find((x) => x.id === confirm.tourId);
    if (!t) return;
    if (confirm.type === "cancel") {
      cancelTour(confirm.tourId);
      toast(`Cancelled "${t.title}". Members will be notified.`, "info");
    } else if (confirm.type === "delete") {
      deleteTour(confirm.tourId);
      toast(`Deleted "${t.title}".`, "info");
    } else if (confirm.type === "leave") {
      leaveTour(confirm.tourId, user.email);
      toast(`Left "${t.title}".`, "info");
    }
    setConfirm(null);
  };

  return (
    <div className="min-h-screen bg-[#FFF8E7]">
      <Header variant="traveler" />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-4">
          <div>
            <h1 className="text-5xl md:text-7xl font-black uppercase leading-none">
              HEY {firstName} 🎒
            </h1>
            {!user.emailVerified && (
              <p className="font-bold uppercase text-xs mt-3 bg-[#FFEB3B] inline-block px-3 py-1 border-3 border-black">
                ⚠ Email not verified —{" "}
                <Link href="/verify-email" className="underline">
                  finish verification
                </Link>
              </p>
            )}
          </div>
          <BrutalButton href="/tours/new" variant="primary" size="lg">
            <Plus className="inline w-5 h-5 mr-2" strokeWidth={3} />
            POST A NEW TOUR
          </BrutalButton>
        </div>

        {/* My tours */}
        <section className="mb-16">
          <h2 className="text-3xl md:text-4xl font-black uppercase mb-8">
            TOURS I CREATED
          </h2>
          {myTours.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {myTours.map((tour) => (
                <div key={tour.id} className="relative">
                  <TourCard tour={tour} showStatus />
                  {/* Floating action menu — below the price badge so it
                       never overlaps the status pill in the top-left */}
                  <div className="absolute top-14 right-3 z-10">
                    <ActionMenu
                      ariaLabel={`Actions for ${tour.title}`}
                      items={[
                        {
                          label: "Edit",
                          onClick: () => {
                            window.location.href = `/tours/${tour.id}/edit`;
                          },
                        },
                        {
                          label: "Cancel tour",
                          onClick: () =>
                            setConfirm({ type: "cancel", tourId: tour.id }),
                          destructive: true,
                        },
                        ...(tour.currentMembers === 1
                          ? [
                              {
                                label: "Delete tour",
                                onClick: () =>
                                  setConfirm({
                                    type: "delete",
                                    tourId: tour.id,
                                  }),
                                destructive: true,
                              },
                            ]
                          : []),
                      ]}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="GOT A DESTINATION IN MIND?"
              description="Post a new tour and other backpackers will join you. It's free for travelers, always."
              cta={{ label: "CREATE YOUR FIRST TOUR", href: "/tours/new" }}
            />
          )}
        </section>

        {/* Joined tours */}
        <section>
          <h2 className="text-3xl md:text-4xl font-black uppercase mb-8">
            TOURS I JOINED
          </h2>
          {joinedTours.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {joinedTours.map((tour) => (
                <div
                  key={tour.id}
                  className="bg-white border-4 border-black shadow-[8px_8px_0_#000]"
                >
                  <Link
                    href={`/tours/${tour.id}`}
                    className="block p-6 hover:bg-[#FFF8E7] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="text-2xl font-black uppercase leading-none">
                        {tour.title}
                      </h3>
                      <StatusBadge status={tour.status} />
                    </div>
                    <p className="font-bold uppercase text-sm mb-3">
                      {tour.countryFlag} {tour.country} · {tour.dateStart} –{" "}
                      {tour.dateEnd}
                    </p>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex-1">
                        <TourProgress
                          current={tour.currentMembers}
                          max={tour.maxMembers}
                        />
                      </div>
                      <span className="font-bold text-sm">
                        {tour.currentMembers}/{tour.maxMembers}
                      </span>
                    </div>
                    <p className="font-bold uppercase text-xs text-[#666]">
                      ★ {daysUntil(tour.dateStart)} until tour starts
                    </p>
                  </Link>
                  <div className="border-t-3 border-black p-3 flex justify-end">
                    {(() => {
                      const d = daysUntilStart(tour.dateStart);
                      const blocked = d !== null && d <= 5;
                      return (
                        <button
                          onClick={() =>
                            !blocked &&
                            setConfirm({ type: "leave", tourId: tour.id })
                          }
                          disabled={blocked}
                          title={
                            blocked && d !== null
                              ? `This tour starts in ${d} day${d === 1 ? "" : "s"}. To cancel, contact the operators directly.`
                              : undefined
                          }
                          className={`font-bold uppercase text-xs ${
                            blocked
                              ? "text-[#999] cursor-not-allowed"
                              : "text-[#FF3B3B] hover:underline"
                          }`}
                        >
                          {blocked ? "TOO LATE TO LEAVE" : "LEAVE GROUP →"}
                        </button>
                      );
                    })()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="LOOKING TO TRAVEL?"
              description="Browse open groups and find your tribe."
              cta={{ label: "BROWSE OPEN GROUPS", href: "/tours" }}
            />
          )}
        </section>
      </div>

      {/* Confirm modal */}
      <BrutalModal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={
          confirm?.type === "delete"
            ? "DELETE TOUR?"
            : confirm?.type === "cancel"
              ? "CANCEL TOUR?"
              : "LEAVE GROUP?"
        }
        size="sm"
      >
        <p className="font-medium mb-8">
          {confirm?.type === "delete"
            ? "Permanently removes this tour. This cannot be undone."
            : confirm?.type === "cancel"
              ? "All members will be notified by email and removed from the tour."
              : "You can rejoin while there are open spots."}
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <BrutalButton
            variant="danger"
            size="lg"
            className="flex-1"
            onClick={performAction}
          >
            YES, CONTINUE
          </BrutalButton>
          <BrutalButton
            variant="secondary"
            size="lg"
            onClick={() => setConfirm(null)}
          >
            CANCEL
          </BrutalButton>
        </div>
      </BrutalModal>

      <Footer />
    </div>
  );
}

function daysUntil(dateStart: string): string {
  // Mock: dateStart is "May 15" — return a friendly placeholder
  return `${dateStart}`;
}
