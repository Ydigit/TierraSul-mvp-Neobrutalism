"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Lightbulb } from "lucide-react";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { BrutalButton } from "@/components/ui/brutal-button";
import { BrutalInput } from "@/components/ui/brutal-input";
import { BrutalTextarea } from "@/components/ui/brutal-textarea";
import { BrutalSelect } from "@/components/ui/brutal-select";
import { BrutalModal } from "@/components/ui/brutal-modal";
import { DangerZone } from "@/components/ui/danger-zone";
import { StatusBadge } from "@/components/ui/status-badge";
import { countries, tourTypes, languages } from "@/data/mock-data";
import { RequireRole } from "@/components/auth/require-role";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";

export default function EditTourPage() {
  return (
    <RequireRole role={["traveler", "admin"]}>
      <EditTourForm />
    </RequireRole>
  );
}

function EditTourForm() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;
  const { user } = useAuth();
  const { toursById, updateTour, cancelTour, deleteTour } = useStore();
  const { toast } = useToast();
  const tour = id ? toursById[id] : undefined;

  // Travelers can only edit tours they created. Admins can edit any.
  // Convention: user-created tours have ids prefixed with "custom-" (see dashboard).
  useEffect(() => {
    if (!user || !tour) return;
    if (user.role === "admin") return;
    if (!tour.id.startsWith("custom-")) {
      router.replace(`/tours/${tour.id}`);
    }
  }, [user, tour, router]);

  const [title, setTitle] = useState("");
  const [city, setCity] = useState("");
  const [budget, setBudget] = useState("");
  const [description, setDescription] = useState("");
  const [maxP, setMaxP] = useState("");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([
    "en",
  ]);
  const [type, setType] = useState("desert");
  const [confirmAction, setConfirmAction] = useState<
    "cancel" | "delete" | null
  >(null);

  useEffect(() => {
    if (tour) {
      setTitle(tour.title);
      setCity(tour.city ?? "");
      setBudget(String(tour.price));
      setMaxP(String(tour.maxMembers));
      setType(tour.type.toLowerCase());
    }
  }, [tour?.id, tour]);

  if (!tour) {
    return (
      <div className="min-h-screen bg-[#FFF8E7]">
        <Header variant="traveler" />
        <div className="max-w-7xl mx-auto px-6 py-32 text-center">
          <h1 className="text-5xl font-black uppercase mb-4">TOUR NOT FOUND</h1>
          <BrutalButton href="/dashboard" variant="primary" size="lg">
            BACK TO DASHBOARD
          </BrutalButton>
        </div>
        <Footer />
      </div>
    );
  }

  const readOnly =
    tour.status === "expired" ||
    tour.status === "completed" ||
    tour.status === "cancelled";

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    updateTour(tour.id, {
      title: title.toUpperCase(),
      city,
      price: Number(budget) || tour.price,
      maxMembers: Number(maxP) || tour.maxMembers,
      type: type[0].toUpperCase() + type.slice(1),
    });
    toast("Tour updated", "success");
    router.push(`/tours/${tour.id}`);
  };

  const performAction = () => {
    if (confirmAction === "cancel") {
      cancelTour(tour.id);
      toast(`Cancelled "${tour.title}". Members will be notified.`, "info");
      router.push("/dashboard");
    } else if (confirmAction === "delete") {
      deleteTour(tour.id);
      toast(`Deleted "${tour.title}".`, "info");
      router.push("/dashboard");
    }
    setConfirmAction(null);
  };

  return (
    <div className="min-h-screen bg-[#FFF8E7]">
      <Header variant="traveler" />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="font-bold uppercase text-sm mb-6">
          <Link href="/dashboard" className="hover:underline">
            DASHBOARD
          </Link>
          {" › "}
          <span className="truncate">{tour.title}</span>
          {" › "}
          <span className="text-[#FF6B9D]">EDIT</span>
        </div>

        <div className="grid md:grid-cols-12 gap-8">
          <form onSubmit={save} className="md:col-span-8 space-y-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <h1 className="text-5xl md:text-6xl font-black uppercase leading-none">
                EDIT{" "}
                <span className="bg-[#FFEB3B] px-3 border-4 border-black shadow-[4px_4px_0_#000]">
                  TOUR
                </span>
              </h1>
              <StatusBadge status={tour.status} />
            </div>

            {readOnly && (
              <div className="bg-[#FFEB3B] border-4 border-black p-5 my-2">
                <p className="font-black uppercase">
                  ⚠ This tour is {tour.status} — read-only
                </p>
                <p className="font-medium text-sm mt-1">
                  You can still cancel it from the danger zone below.
                </p>
              </div>
            )}

            <BrutalInput
              label="TOUR TITLE"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={readOnly}
            />

            <div className="grid md:grid-cols-2 gap-6">
              <BrutalSelect
                label="COUNTRY"
                options={countries.filter((c) => c.value !== "all")}
                defaultValue={tour.country.slice(0, 2).toUpperCase()}
                disabled={readOnly}
              />
              <BrutalInput
                label="CITY"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={readOnly}
              />
            </div>

            <div>
              <label className="block mb-3 font-bold uppercase text-sm">
                TOUR TYPE
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {tourTypes
                  .filter((t) => t.value !== "all")
                  .map((t) => (
                    <button
                      type="button"
                      key={t.value}
                      onClick={() => !readOnly && setType(t.value)}
                      disabled={readOnly}
                      className={`border-4 border-black px-3 py-3 font-bold uppercase text-sm shadow-[4px_4px_0_#000] transition-all disabled:opacity-50 ${
                        type === t.value
                          ? "bg-[#FFEB3B]"
                          : "bg-white hover:bg-[#FFF8E7]"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <BrutalInput
                label="MAX PARTICIPANTS"
                type="number"
                min="2"
                value={maxP}
                onChange={(e) => setMaxP(e.target.value)}
                disabled={readOnly}
              />
              <BrutalInput
                label="BUDGET PER PERSON (€)"
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                disabled={readOnly}
              />
            </div>

            <BrutalTextarea
              label="DESCRIPTION"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={readOnly}
              showCount
              maxCount={2000}
            />

            <div>
              <label className="block mb-3 font-bold uppercase text-sm">
                LANGUAGES
              </label>
              <div className="flex flex-wrap gap-3">
                {languages.map((lang) => (
                  <button
                    type="button"
                    key={lang.value}
                    onClick={() => !readOnly && toggleLanguage(lang.value)}
                    disabled={readOnly}
                    className={`border-3 border-black px-4 py-2 font-bold uppercase text-xs shadow-[3px_3px_0_#000] transition-all disabled:opacity-50 ${
                      selectedLanguages.includes(lang.value)
                        ? "bg-[#00E5FF]"
                        : "bg-white"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <BrutalButton
                href="/dashboard"
                variant="secondary"
                size="lg"
              >
                CANCEL
              </BrutalButton>
              <BrutalButton
                type="submit"
                variant="primary"
                size="lg"
                disabled={readOnly}
              >
                SAVE CHANGES
              </BrutalButton>
            </div>

            {/* Danger zone */}
            <div className="pt-12">
              <DangerZone>
                <p className="font-medium mb-6">
                  These actions are permanent and notify all members.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  {tour.status !== "cancelled" && (
                    <BrutalButton
                      variant="danger"
                      size="md"
                      onClick={() => setConfirmAction("cancel")}
                    >
                      CANCEL TOUR
                    </BrutalButton>
                  )}
                  {tour.currentMembers <= 1 && (
                    <BrutalButton
                      variant="danger"
                      size="md"
                      onClick={() => setConfirmAction("delete")}
                    >
                      DELETE TOUR
                    </BrutalButton>
                  )}
                </div>
                {tour.currentMembers > 1 && (
                  <p className="text-sm font-medium mt-4 text-[#666]">
                    Delete is only available with 0 other members.
                  </p>
                )}
              </DangerZone>
            </div>
          </form>

          <aside className="md:col-span-4">
            <div className="sticky top-24 space-y-6">
              <div className="bg-[#FFEB3B] border-4 border-black p-6 shadow-[8px_8px_0_#000]">
                <Lightbulb className="w-10 h-10 mb-3" strokeWidth={3} />
                <h3 className="text-xl font-black uppercase mb-3">★ TIPS</h3>
                <ul className="space-y-3 font-medium text-sm">
                  <li>★ Date changes notify all members</li>
                  <li>★ Reducing max may kick members</li>
                  <li>★ Cancelling sends an email to everyone</li>
                </ul>
              </div>

              <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0_#000]">
                <h3 className="text-lg font-black uppercase mb-4">
                  CURRENT STATUS
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="font-bold">Status:</span>
                    <StatusBadge status={tour.status} />
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold">Members:</span>
                    <span className="font-black">
                      {tour.currentMembers}/{tour.maxMembers}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <BrutalModal
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        title={
          confirmAction === "delete" ? "DELETE TOUR?" : "CANCEL TOUR?"
        }
        size="sm"
      >
        <p className="font-medium mb-8">
          {confirmAction === "delete"
            ? "This permanently deletes the tour. It cannot be restored."
            : "All members will receive an email and lose their spot."}
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <BrutalButton
            variant="danger"
            size="lg"
            className="flex-1"
            onClick={performAction}
          >
            YES, {confirmAction?.toUpperCase()}
          </BrutalButton>
          <BrutalButton
            variant="secondary"
            size="lg"
            onClick={() => setConfirmAction(null)}
          >
            BACK
          </BrutalButton>
        </div>
      </BrutalModal>

      <Footer />
    </div>
  );
}
