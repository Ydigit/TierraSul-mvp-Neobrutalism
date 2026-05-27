"use client";

import { useState } from "react";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { BrutalButton } from "@/components/ui/brutal-button";
import { BrutalInput } from "@/components/ui/brutal-input";
import { BrutalTextarea } from "@/components/ui/brutal-textarea";
import { BrutalSelect } from "@/components/ui/brutal-select";
import { BrutalModal } from "@/components/ui/brutal-modal";
import { DangerZone } from "@/components/ui/danger-zone";
import { User, Camera } from "lucide-react";
import { countries, languages } from "@/data/mock-data";
import { RequireRole } from "@/components/auth/require-role";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  return (
    <RequireRole role={["traveler", "operator", "admin"]}>
      <ProfileForm />
    </RequireRole>
  );
}

function ProfileForm() {
  const { user, updateUser, signOut } = useAuth();
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

  if (!user) return null;

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

  return (
    <div className="min-h-screen bg-[#FFF8E7]">
      <Header variant={user.role} />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-5xl md:text-6xl font-black uppercase leading-none mb-12">
          YOUR PROFILE
        </h1>

        {/* Avatar block */}
        <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0_#000] mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
            <div className="relative w-32 h-32 bg-[#FFEB3B] border-4 border-black flex items-center justify-center shrink-0">
              <User className="w-16 h-16" strokeWidth={3} />
              <button
                onClick={() =>
                  toast("Photo upload — connect Supabase Storage", "info")
                }
                aria-label="Change photo"
                className="absolute -bottom-3 -right-3 bg-[#FF6B9D] border-3 border-black w-10 h-10 flex items-center justify-center shadow-[3px_3px_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#000] transition-all"
              >
                <Camera className="w-5 h-5" strokeWidth={3} />
              </button>
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
          </div>
        </div>

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
                label="COUNTRY"
                options={countries.filter((c) => c.value !== "all")}
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>

            <BrutalInput
              label="CITY"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
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
