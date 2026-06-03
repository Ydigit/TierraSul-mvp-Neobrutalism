"use client";

import { useMemo, useRef, useState } from "react";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { BrutalButton } from "@/components/ui/brutal-button";
import { BrutalInput } from "@/components/ui/brutal-input";
import { BrutalTextarea } from "@/components/ui/brutal-textarea";
import { BrutalSelect } from "@/components/ui/brutal-select";
import { BrutalModal } from "@/components/ui/brutal-modal";
import { DangerZone } from "@/components/ui/danger-zone";
import { User, Camera, Plus, X, ArrowUp, ArrowDown } from "lucide-react";
import { languages } from "@/data/mock-data";
import {
  worldCountryOptions,
  southAmericaOptions,
} from "@/data/countries-world";
import { CityAutocomplete } from "@/components/ui/city-autocomplete";
import {
  PhotoPrivacyModal,
  hasPhotoConsent,
} from "@/components/profile/photo-privacy-modal";
import { validateImageFile } from "@/lib/image-validate";
import { RequireRole } from "@/components/auth/require-role";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";

const MAX_GALLERY = 5;

/**
 * Resize an image File via canvas to a max dimension and return a JPEG data URL.
 * Keeps localStorage usage in check (avatars stay <50KB, gallery photos <150KB).
 */
async function resizeImage(
  file: File,
  maxDim: number,
  quality = 0.78
): Promise<string> {
  const dataUrl: string = await new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = dataUrl;
  });
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", quality);
}

export default function ProfilePage() {
  return (
    <RequireRole role={["traveler", "operator", "admin"]}>
      <ProfileForm />
    </RequireRole>
  );
}

function ProfileForm() {
  const { user, updateUser, signOut } = useAuth();
  const { state, logPhotoUploads } = useStore();
  const { toast } = useToast();
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [name, setName] = useState(user?.name ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [age, setAge] = useState(String(user?.age ?? ""));
  const [country, setCountry] = useState(user?.country ?? "");
  const [city, setCity] = useState(user?.city ?? "");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(
    user?.languages ?? ["en"]
  );

  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  // Track which picker should open after consent so a single modal works for
  // both avatar and gallery uploads.
  const [pendingUpload, setPendingUpload] = useState<"avatar" | "gallery" | null>(
    null
  );

  const openPicker = (kind: "avatar" | "gallery") => {
    if (kind === "avatar") avatarInputRef.current?.click();
    else galleryInputRef.current?.click();
  };

  const requestUpload = (kind: "avatar" | "gallery") => {
    if (!hasPhotoConsent()) {
      setPendingUpload(kind);
      setPrivacyOpen(true);
      return;
    }
    openPicker(kind);
  };

  if (!user) return null;

  const isTraveler = user.role === "traveler";
  const isOperator = user.role === "operator";

  // Operator keeps the South-America-only list to mirror signup; traveler picks
  // from the worldwide list (matches their signup change).
  const countryOptions = useMemo(
    () => [
      { value: "", label: "SELECT COUNTRY…" },
      ...(isOperator ? southAmericaOptions : worldCountryOptions),
    ],
    [isOperator]
  );

  // Real tour count from the store — only meaningful for travelers.
  const tripCount = useMemo(
    () =>
      state.memberships.filter((m) => m.userEmail === user.email).length,
    [state.memberships, user.email]
  );

  const tripLevel = ((): { label: string; bg: string } => {
    if (tripCount === 0) return { label: "READY FOR ADVENTURE", bg: "#E5E5E5" };
    if (tripCount <= 3) return { label: "ROOKIE", bg: "#00E5FF" };
    if (tripCount <= 10) return { label: "EXPLORER", bg: "#C6FF00" };
    return { label: "WANDERER", bg: "#FF6B9D" };
  })();

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name: name.trim() || user.name,
      bio: bio.trim() || undefined,
      age: age ? Number(age) : undefined,
      country,
      city,
      languages: selectedLanguages,
    });
    toast("Profile saved", "success");
  };

  const handleDelete = () => {
    setConfirmDelete(false);
    signOut();
    toast("Account deleted", "info");
    router.push("/");
  };

  const onPickAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const v = validateImageFile(file);
    if (!v.ok) {
      toast(v.error ?? "Invalid image", "error");
      return;
    }
    try {
      const url = await resizeImage(file, 320, 0.82);
      updateUser({ avatarUrl: url });
      toast("Avatar updated", "success");
    } catch {
      toast("Couldn't read that file", "error");
    }
  };

  /** Legacy alias — kept for clarity at the call site. */
  const startGalleryUpload = () => requestUpload("gallery");

  const onPickGallery = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    // Validate up front; reject the batch if anything is bad.
    for (const f of files) {
      const v = validateImageFile(f);
      if (!v.ok) {
        toast(v.error ?? "Invalid image", "error");
        return;
      }
    }
    const existing = user.photos ?? [];
    const slotsLeft = MAX_GALLERY - existing.length;
    if (slotsLeft <= 0) {
      toast(`Gallery is full (max ${MAX_GALLERY})`, "info");
      return;
    }
    const picked = files.slice(0, slotsLeft);
    try {
      const urls = await Promise.all(
        picked.map((f) => resizeImage(f, 720, 0.78))
      );
      updateUser({ photos: [...existing, ...urls] });
      // Register the uploads so admin moderation queue sees them.
      logPhotoUploads(user.email, user.name, urls);
      toast(
        `${urls.length} photo${urls.length > 1 ? "s" : ""} added`,
        "success"
      );
    } catch {
      toast("Couldn't read one of the files", "error");
    }
  };

  const removePhoto = (idx: number) => {
    const next = (user.photos ?? []).filter((_, i) => i !== idx);
    updateUser({ photos: next });
  };

  const movePhoto = (idx: number, direction: -1 | 1) => {
    const arr = [...(user.photos ?? [])];
    const target = idx + direction;
    if (target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    updateUser({ photos: arr });
  };

  const photos = user.photos ?? [];

  return (
    <div className="min-h-screen bg-[#FFF8E7]">
      <Header variant={user.role} />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-5xl md:text-6xl font-black uppercase leading-none mb-12">
          YOUR PROFILE
        </h1>

        {/* Avatar block */}
        <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0_#000] mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative w-32 h-32 bg-[#FFEB3B] border-4 border-black flex items-center justify-center shrink-0 overflow-hidden">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt={`${user.name} avatar`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <User className="w-16 h-16 relative" strokeWidth={3} />
              )}
              <button
                type="button"
                onClick={() => requestUpload("avatar")}
                aria-label="Change photo"
                className="absolute -bottom-3 -right-3 bg-[#FF6B9D] border-3 border-black w-10 h-10 flex items-center justify-center shadow-[3px_3px_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#000] transition-all"
              >
                <Camera className="w-5 h-5" strokeWidth={3} />
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={onPickAvatar}
                className="hidden"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl md:text-3xl font-black uppercase break-words">
                {user.name}
              </h2>
              <p className="font-bold text-sm">{user.email}</p>
              <p className="font-medium text-sm mt-2">
                Member since {new Date().getFullYear()}
              </p>
            </div>
            {isTraveler && (
              <div className="w-full sm:w-auto">
                <div
                  className="border-4 border-black shadow-[6px_6px_0_#000] px-5 py-4 text-center"
                  style={{ background: tripLevel.bg }}
                >
                  <div className="text-4xl font-black leading-none">
                    {tripCount}
                  </div>
                  <div className="font-bold uppercase text-xs mt-1">
                    TOURS JOINED
                  </div>
                  <div className="font-black uppercase text-[10px] mt-2 tracking-wider">
                    ★ {tripLevel.label}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Gallery — traveler-only */}
        {isTraveler && (
          <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0_#000] mb-8">
            <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
              <h2 className="text-2xl md:text-3xl font-black uppercase">
                MY GALLERY
              </h2>
              <p className="font-bold uppercase text-xs text-[#666]">
                {photos.length}/{MAX_GALLERY} PHOTOS
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {photos.map((src, i) => (
                <div
                  key={i}
                  className="relative aspect-square border-4 border-black shadow-[4px_4px_0_#000] overflow-hidden bg-[#FFF8E7] group"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`Photo ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1 left-1 flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => movePhoto(i, -1)}
                      disabled={i === 0}
                      aria-label={`Move photo ${i + 1} up`}
                      className="bg-white border-3 border-black w-7 h-7 flex items-center justify-center shadow-[2px_2px_0_#000] hover:bg-[#FFEB3B] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-all"
                    >
                      <ArrowUp className="w-4 h-4" strokeWidth={3} />
                    </button>
                    <button
                      type="button"
                      onClick={() => movePhoto(i, 1)}
                      disabled={i === photos.length - 1}
                      aria-label={`Move photo ${i + 1} down`}
                      className="bg-white border-3 border-black w-7 h-7 flex items-center justify-center shadow-[2px_2px_0_#000] hover:bg-[#FFEB3B] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-all"
                    >
                      <ArrowDown className="w-4 h-4" strokeWidth={3} />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    aria-label={`Remove photo ${i + 1}`}
                    className="absolute top-1 right-1 bg-[#FF3B3B] text-white border-3 border-black w-7 h-7 flex items-center justify-center shadow-[2px_2px_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_#000] transition-all"
                  >
                    <X className="w-4 h-4" strokeWidth={3} />
                  </button>
                  <div className="absolute bottom-1 right-1 bg-black text-white font-black uppercase text-xs px-2 py-0.5 border-2 border-black">
                    {i + 1}
                  </div>
                </div>
              ))}

              {photos.length < MAX_GALLERY && (
                <button
                  type="button"
                  onClick={startGalleryUpload}
                  className="aspect-square border-4 border-dashed border-black bg-[#FFF8E7] flex flex-col items-center justify-center gap-2 hover:bg-[#FFEB3B] transition-colors"
                >
                  <Plus className="w-8 h-8" strokeWidth={3} />
                  <span className="font-bold uppercase text-xs">ADD PHOTO</span>
                </button>
              )}
            </div>
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={onPickGallery}
              className="hidden"
            />
            <p className="font-medium text-xs text-[#666] mt-4">
              Up to {MAX_GALLERY} photos. JPG/PNG/WebP, max 2 MB each. Resized
              client-side. Use ↑↓ to reorder; ✕ to remove.
            </p>
          </div>
        )}

        <PhotoPrivacyModal
          open={privacyOpen}
          onClose={() => {
            setPrivacyOpen(false);
            setPendingUpload(null);
          }}
          onAccept={() => {
            setPrivacyOpen(false);
            const kind = pendingUpload;
            setPendingUpload(null);
            // Open the system file picker right after consent so the flow
            // continues without a second click. Works for both avatar and
            // gallery — the same consent unlocks any photo upload for life.
            if (kind) setTimeout(() => openPicker(kind), 0);
          }}
        />

        {/* Form */}
        <form
          onSubmit={save}
          className="bg-white border-4 border-black p-8 shadow-[8px_8px_0_#000] mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-black uppercase mb-6">
            PERSONAL INFO
          </h2>

          <div className="space-y-6">
            <BrutalInput
              label="FULL NAME"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <BrutalTextarea
              label="BIO"
              placeholder="Tell people about yourself."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              showCount
              maxCount={500}
            />

            <div className="grid md:grid-cols-2 gap-6">
              <BrutalInput
                label="AGE"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
              <BrutalSelect
                label={isOperator ? "COUNTRY (SOUTH AMERICA)" : "COUNTRY"}
                options={countryOptions}
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  // Reset city so the new country's results aren't muddled by stale input.
                  setCity("");
                }}
              />
            </div>

            <CityAutocomplete
              id="profile-city"
              label="CITY"
              country={country || undefined}
              value={city}
              onChange={setCity}
              onSelect={(picked) => {
                // Keep { country, city } in sync — when Photon resolves a country
                // for the picked city, mirror it into the country select so the
                // pair stays consistent on save.
                setCity(picked.city);
                if (picked.country) setCountry(picked.country);
              }}
              placeholder="Start typing your city…"
            />

            <div>
              <label className="block mb-3 font-bold uppercase text-sm">
                LANGUAGES I SPEAK
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
          </div>

          <div className="mt-8">
            <BrutalButton type="submit" variant="primary" size="lg">
              SAVE CHANGES
            </BrutalButton>
          </div>
        </form>

        <DangerZone>
          <p className="font-medium mb-6">
            Once deleted, your account and all your data are gone forever.
            Active tour memberships will be removed.
          </p>
          <BrutalButton
            variant="danger"
            size="md"
            onClick={() => setConfirmDelete(true)}
          >
            DELETE ACCOUNT
          </BrutalButton>
        </DangerZone>
      </div>

      <BrutalModal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="DELETE ACCOUNT?"
        size="md"
      >
        <p className="font-bold uppercase text-sm mb-4 text-[#FF3B3B]">
          ⚠ THIS ACTION CANNOT BE UNDONE
        </p>
        <p className="font-medium mb-8">
          We&apos;ll remove your profile, all your created tours and any
          memberships. Tour operators who already paid to contact your past
          groups keep that data.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <BrutalButton
            variant="danger"
            size="lg"
            className="flex-1"
            onClick={handleDelete}
          >
            YES, DELETE EVERYTHING
          </BrutalButton>
          <BrutalButton
            variant="secondary"
            size="lg"
            onClick={() => setConfirmDelete(false)}
          >
            KEEP ACCOUNT
          </BrutalButton>
        </div>
      </BrutalModal>

      <Footer />
    </div>
  );
}
