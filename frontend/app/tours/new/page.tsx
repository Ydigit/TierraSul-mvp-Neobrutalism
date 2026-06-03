"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lightbulb } from "lucide-react";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { BrutalButton } from "@/components/ui/brutal-button";
import { BrutalInput } from "@/components/ui/brutal-input";
import { BrutalDatePicker } from "@/components/ui/brutal-date-picker";
import { CityAutocomplete } from "@/components/ui/city-autocomplete";
import { BrutalTextarea } from "@/components/ui/brutal-textarea";
import { BrutalSelect } from "@/components/ui/brutal-select";
import { countries, tourTypes, languages } from "@/data/mock-data";
import { RequireRole } from "@/components/auth/require-role";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";

const COUNTRY_LABELS: Record<string, { name: string; flag: string }> = {
  BO: { name: "BOLIVIA", flag: "🇧🇴" },
  PE: { name: "PERU", flag: "🇵🇪" },
  CL: { name: "CHILE", flag: "🇨🇱" },
  AR: { name: "ARGENTINA", flag: "🇦🇷" },
};

const COLOR_BY_TYPE: Record<string, string> = {
  trek: "#C6FF00",
  desert: "#FFEB3B",
  beach: "#00E5FF",
  city: "#FF6B9D",
  wildlife: "#FFEB3B",
  cultural: "#00E5FF",
  adventure: "#FF6B35",
  mixed: "#FF6B9D",
};

interface FormErrors {
  title?: string;
  country?: string;
  city?: string;
  startDate?: string;
  endDate?: string;
  type?: string;
  participants?: string;
  description?: string;
}

export default function CreateTourPage() {
  return (
    <RequireRole role={["traveler", "admin"]}>
      <CreateTourForm />
    </RequireRole>
  );
}

function CreateTourForm() {
  const router = useRouter();
  const { createTour } = useStore();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [country, setCountry] = useState("BO");
  const [city, setCity] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  // Today + 5 days (rule: tours can't start sooner) — ISO yyyy-MM-dd.
  const minStartDateIso = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().slice(0, 10);
  })();
  const [type, setType] = useState("");
  const [minP, setMinP] = useState("4");
  const [maxP, setMaxP] = useState("8");
  const [budget, setBudget] = useState("");
  const [description, setDescription] = useState("");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["en"]);
  const [flexible, setFlexible] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (title.trim().length < 5) e.title = "At least 5 characters";
    if (title.trim().length > 120) e.title = "Max 120 characters";
    if (!city.trim()) e.city = "Required";
    if (!startDate) e.startDate = "Required";
    if (!endDate) e.endDate = "Required";
    if (startDate && endDate && startDate > endDate) {
      e.endDate = "Must be after start date";
    }
    if (startDate) {
      const today = new Date();
      const min = new Date(today);
      min.setDate(today.getDate() + 5);
      if (new Date(startDate) < min) {
        e.startDate = "Must be at least 5 days from today";
      }
    }
    if (!type) e.type = "Pick a tour type";
    const minN = Number(minP);
    const maxN = Number(maxP);
    const HARD_MAX = 30; // sanity cap — no real group is 2222222 people
    if (!Number.isFinite(minN) || !Number.isFinite(maxN)) {
      e.participants = "Both fields are required";
    } else if (minN < 2 || maxN < 2) {
      e.participants = "Min 2 people";
    } else if (maxN > HARD_MAX) {
      e.participants = `Max participants cannot exceed ${HARD_MAX}`;
    } else if (minN > maxN) {
      e.participants = "Min must be ≤ max";
    } else if (!Number.isInteger(minN) || !Number.isInteger(maxN)) {
      e.participants = "Whole numbers only";
    }
    if (description.trim().length < 30) {
      e.description = "Description must be at least 30 characters";
    } else if (description.trim().length > 2000) {
      e.description = "Max 2000 characters";
    }
    return e;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) {
      toast("Fix the form errors and try again", "error");
      return;
    }
    setSubmitting(true);
    const cInfo = COUNTRY_LABELS[country] ?? COUNTRY_LABELS.BO;
    const days =
      startDate && endDate
        ? Math.max(
            1,
            Math.ceil(
              (new Date(endDate).getTime() - new Date(startDate).getTime()) /
                (1000 * 60 * 60 * 24)
            )
          )
        : 1;
    const tour = createTour({
      title: title.toUpperCase(),
      country: cInfo.name,
      countryFlag: cInfo.flag,
      city,
      dateStart: formatDate(startDate),
      dateEnd: formatDate(endDate),
      days,
      price: Number(budget) || 0,
      minMembers: Number(minP),
      maxMembers: Number(maxP),
      type: type[0].toUpperCase() + type.slice(1),
      bgColor: COLOR_BY_TYPE[type] ?? "#FFEB3B",
    });
    toast(`Tour "${tour.title}" posted!`, "success");
    router.push(`/tours/${tour.id}`);
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
          <span className="text-[#FF6B9D]">NEW TOUR</span>
        </div>

        <div className="grid md:grid-cols-12 gap-8">
          <form onSubmit={submit} className="md:col-span-8 space-y-6">
            <h1 className="text-5xl md:text-6xl font-black uppercase leading-none mb-8">
              POST A{" "}
              <span className="bg-[#FFEB3B] px-3 border-4 border-black shadow-[4px_4px_0_#000]">
                NEW TOUR
              </span>
            </h1>

            <FieldError msg={errors.title}>
              <BrutalInput
                label="TOUR TITLE *"
                type="text"
                placeholder="Salar de Uyuni 4D/3N"
                helper={`Be specific: include destination + duration · ${title.length}/120`}
                value={title}
                maxLength={120}
                onChange={(e) => setTitle(e.target.value)}
              />
            </FieldError>

            <div className="grid md:grid-cols-2 gap-6">
              <BrutalSelect
                label="COUNTRY *"
                options={countries.filter((c) => c.value !== "all")}
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  // Reset the city so stale matches don't carry over (e.g. "Uyuni"
                  // typed under BO must not bleed into PE).
                  setCity("");
                }}
              />
              <FieldError msg={errors.city}>
                <CityAutocomplete
                  label="CITY *"
                  country={country}
                  value={city}
                  onChange={setCity}
                  placeholder="Uyuni"
                />
              </FieldError>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <FieldError msg={errors.startDate}>
                <BrutalDatePicker
                  label="START DATE"
                  required
                  value={startDate}
                  onChange={setStartDate}
                  min={minStartDateIso}
                  helper="Must be at least 5 days from today · dd/mm/yyyy"
                />
              </FieldError>
              <FieldError msg={errors.endDate}>
                <BrutalDatePicker
                  label="END DATE"
                  required
                  value={endDate}
                  onChange={setEndDate}
                  min={startDate || minStartDateIso}
                  helper="dd/mm/yyyy"
                />
              </FieldError>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={flexible}
                onChange={(e) => setFlexible(e.target.checked)}
                className="w-6 h-6 border-4 border-black accent-black"
              />
              <span className="font-bold uppercase text-sm">
                DATES FLEXIBLE ±2 DAYS
              </span>
            </label>

            <div>
              <label className="block mb-3 font-bold uppercase text-sm">
                TOUR TYPE *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {tourTypes
                  .filter((t) => t.value !== "all")
                  .map((t) => (
                    <button
                      type="button"
                      key={t.value}
                      onClick={() => setType(t.value)}
                      className={`border-4 border-black px-3 py-3 font-bold uppercase text-sm shadow-[4px_4px_0_#000] transition-all ${
                        type === t.value
                          ? "bg-[#FFEB3B] translate-x-[2px] translate-y-[2px] shadow-[2px_2px_0_#000]"
                          : "bg-white hover:bg-[#FFF8E7]"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
              </div>
              {errors.type && (
                <p className="text-[#FF3B3B] font-bold text-xs mt-2">
                  ⚠ {errors.type}
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <BrutalInput
                label="MIN PARTICIPANTS *"
                type="number"
                min="2"
                max="30"
                step="1"
                value={minP}
                onChange={(e) => setMinP(e.target.value)}
              />
              <BrutalInput
                label="MAX PARTICIPANTS *"
                type="number"
                min="2"
                max="30"
                step="1"
                value={maxP}
                onChange={(e) => setMaxP(e.target.value)}
              />
            </div>
            {errors.participants && (
              <p className="text-[#FF3B3B] font-bold text-xs">
                ⚠ {errors.participants}
              </p>
            )}

            <BrutalInput
              label="BUDGET PER PERSON (€)"
              type="number"
              min="0"
              placeholder="120"
              helper="Estimated cost per person — operators use this to gauge fit"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />

            <FieldError msg={errors.description}>
              <BrutalTextarea
                label="DESCRIPTION *"
                placeholder="What's the vibe? Photography? Party? Chill? Tell people what makes this tour special."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                showCount
                maxCount={2000}
                maxLength={2000}
                helper="30–2000 characters"
              />
            </FieldError>

            <div>
              <label className="block mb-3 font-bold uppercase text-sm">
                LANGUAGES SPOKEN
              </label>
              <div className="flex flex-wrap gap-3">
                {languages.map((lang) => (
                  <button
                    type="button"
                    key={lang.value}
                    onClick={() => toggleLanguage(lang.value)}
                    className={`border-3 border-black px-4 py-2 font-bold uppercase text-xs shadow-[3px_3px_0_#000] transition-all ${
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
                type="button"
                variant="secondary"
                size="lg"
                onClick={() => toast("Draft saved (mock)", "info")}
              >
                SAVE DRAFT
              </BrutalButton>
              <BrutalButton
                type="submit"
                variant="primary"
                size="lg"
                disabled={submitting}
              >
                {submitting ? "POSTING…" : "POST TOUR →"}
              </BrutalButton>
            </div>
          </form>

          <aside className="md:col-span-4">
            <div className="sticky top-24 bg-[#FFEB3B] border-4 border-black p-6 shadow-[8px_8px_0_#000]">
              <Lightbulb className="w-10 h-10 mb-3" strokeWidth={3} />
              <h3 className="text-xl font-black uppercase mb-3">★ TIPS</h3>
              <ul className="space-y-3 font-medium text-sm">
                <li>★ Specific dates get 2× more joins than &quot;flexible&quot;</li>
                <li>★ Be honest about budget — saves time</li>
                <li>★ Mention your vibe (party / chill / photography)</li>
                <li>★ Most groups fill at 4–6 people</li>
                <li>★ Tours start no sooner than 5 days from posting</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function FieldError({
  msg,
  children,
}: {
  msg?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      {children}
      {msg && (
        <p className="text-[#FF3B3B] font-bold text-xs mt-2">⚠ {msg}</p>
      )}
    </div>
  );
}

function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
