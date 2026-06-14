"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BrutalButton } from "@/components/ui/brutal-button";
import { BrutalInput } from "@/components/ui/brutal-input";
import { BrutalTextarea } from "@/components/ui/brutal-textarea";
import { BrutalSelect } from "@/components/ui/brutal-select";
import { User, Briefcase } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { RedirectIfAuthed } from "@/components/auth/redirect-if-authed";
import { useToast } from "@/components/ui/toast";
import {
  worldCountryOptions,
  southAmericaOptions,
} from "@/data/countries-world";

type SignUpRole = "traveler" | "operator";

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <RedirectIfAuthed>
        <SignUpForm />
      </RedirectIfAuthed>
    </Suspense>
  );
}

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuth();
  const { toast } = useToast();
  const initialRole = (searchParams.get("role") as SignUpRole) ?? null;
  const [role, setRole] = useState<SignUpRole | null>(initialRole);
  const [agreed, setAgreed] = useState(false);

  // Common fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Both roles start empty so the placeholder option is shown.
  const [country, setCountry] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  // Operator-only fields
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");

  const next = searchParams.get("next");

  // Date input max = today (avoids future DOB). 13-year minimum gate is
  // enforced softly via the max attribute below.
  const today = new Date();
  const maxDob = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate())
    .toISOString()
    .slice(0, 10);

  const formValid = (() => {
    if (!agreed || !email.trim() || !name.trim() || !password) return false;
    if (password.length < 8) return false;
    if (!country) return false;
    if (role === "traveler" && !dateOfBirth) return false;
    if (role === "operator" && !companyName.trim()) return false;
    return true;
  })();

  const passwordStrength = (() => {
    if (!password) return null;
    if (password.length < 8) return { label: "TOO SHORT", color: "#FF3B3B" };
    const hasMixedCase = /[a-z]/.test(password) && /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (password.length >= 12 && (hasMixedCase || hasNumber)) {
      return { label: "STRONG", color: "#00C853" };
    }
    return { label: "OK", color: "#FFEB3B" };
  })();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || !formValid) return;

    signIn(role, {
      name: name.trim(),
      email: email.trim(),
      override:
        role === "operator"
          ? {
              companyName: companyName.trim(),
              website: website.trim() || undefined,
              description: description.trim() || undefined,
              country,
              emailVerified: false,
            }
          : {
              country,
              dateOfBirth,
              emailVerified: false,
            },
    });

    toast(`We sent a 6-digit code to ${email.trim()}`, "success");
    router.push(`/verify-email?email=${encodeURIComponent(email.trim())}`);
    // Mock backend: real impl will trigger Supabase OTP from API route.
    void next;
    void password; // intentionally not persisted in mock
  };

  return (
    <div className="min-h-screen bg-[#FFF8E7] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <Link href="/" className="block text-center mb-8">
          <h1 className="text-4xl font-black uppercase">TierraSul</h1>
        </Link>

        <div className="bg-white border-4 border-black shadow-[12px_12px_0_#000] p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-black uppercase leading-none mb-8">
            JOIN{" "}
            <span className="bg-[#FFEB3B] px-2 border-3 border-black">
              TIERRASUL
            </span>
          </h1>

          {!role ? (
            <>
              <p className="font-bold uppercase text-sm mb-6">
                CHOOSE YOUR ROLE:
              </p>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <button
                  onClick={() => setRole("traveler")}
                  className="bg-[#FFEB3B] border-4 border-black p-8 shadow-[6px_6px_0_#000] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0_#000] transition-all duration-100 text-left"
                >
                  <User className="w-12 h-12 mb-4" strokeWidth={3} />
                  <h3 className="text-2xl font-black uppercase mb-2">
                    I&apos;M A TRAVELER
                  </h3>
                  <p className="font-medium">Find groups, travel cheaper</p>
                </button>
                <button
                  onClick={() => setRole("operator")}
                  className="bg-[#FF6B9D] border-4 border-black p-8 shadow-[6px_6px_0_#000] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0_#000] transition-all duration-100 text-left"
                >
                  <Briefcase className="w-12 h-12 mb-4" strokeWidth={3} />
                  <h3 className="text-2xl font-black uppercase mb-2">
                    I&apos;M AN OPERATOR
                  </h3>
                  <p className="font-medium">Get pre-formed groups</p>
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={submit}>
              <button
                type="button"
                onClick={() => setRole(null)}
                className="font-bold uppercase text-sm mb-6 hover:underline"
              >
                ← CHANGE ROLE
              </button>

              <div className="space-y-4 mb-6">
                <div>
                  <BrutalInput
                    label={
                      role === "operator"
                        ? "PRIMARY CONTACT NAME"
                        : "FULL NAME"
                    }
                    type="text"
                    placeholder="Maria Silva"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  {role === "operator" && (
                    <p className="font-bold uppercase text-xs text-[#666] mt-2">
                      ★ Person responsible for this company
                    </p>
                  )}
                </div>

                {role === "traveler" && (
                  <BrutalInput
                    label="DATE OF BIRTH"
                    type="date"
                    value={dateOfBirth}
                    max={maxDob}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    required
                  />
                )}

                <BrutalSelect
                  label={role === "operator" ? "COUNTRY (SOUTH AMERICA)" : "COUNTRY"}
                  options={[
                    { value: "", label: "SELECT COUNTRY…" },
                    ...(role === "operator"
                      ? southAmericaOptions
                      : worldCountryOptions),
                  ]}
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                />

                <BrutalInput
                  label="EMAIL"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div>
                  <BrutalInput
                    label="PASSWORD"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={8}
                    required
                    helper="At least 8 characters."
                  />
                  {password && password.length < 8 && (
                    <p className="text-[#FF3B3B] font-bold text-xs mt-2">
                      ⚠ Password must be at least 8 characters.
                    </p>
                  )}
                  {passwordStrength && password.length >= 8 && (
                    <p
                      className="font-black uppercase text-xs mt-2 inline-block px-2 py-0.5 border-2 border-black"
                      style={{ backgroundColor: passwordStrength.color }}
                    >
                      {passwordStrength.label}
                    </p>
                  )}
                </div>

                {role === "operator" && (
                  <>
                    <div className="bg-[#FFF8E7] border-3 border-black p-5 my-2">
                      <h3 className="font-black uppercase text-sm mb-4">
                        ★ COMPANY INFO
                      </h3>
                      <div className="space-y-4">
                        <BrutalInput
                          label="COMPANY NAME *"
                          type="text"
                          placeholder="Atacama Tours"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          required
                        />
                        <BrutalInput
                          label="WEBSITE"
                          type="url"
                          placeholder="https://yourcompany.com"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                        />
                        <BrutalTextarea
                          label="DESCRIPTION"
                          placeholder="Tell travelers what makes your tours special."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          showCount
                          maxCount={500}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              <label className="flex items-start gap-3 mb-6 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-6 h-6 border-4 border-black mt-1 shrink-0 accent-black"
                />
                <span className="font-bold text-sm">
                  I AGREE TO{" "}
                  <Link href="/terms" className="underline">
                    TERMS
                  </Link>{" "}
                  AND{" "}
                  <Link href="/privacy" className="underline">
                    PRIVACY POLICY
                  </Link>
                  {role === "traveler"
                    ? ", AND THAT VERIFIED OPERATORS MAY RECEIVE MY EMAIL TO PITCH TOURS"
                    : ""}
                </span>
              </label>

              <BrutalButton
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mb-4"
                disabled={!formValid}
              >
                SEND VERIFICATION CODE
              </BrutalButton>
            </form>
          )}

          <div className="text-center pt-6 border-t-3 border-black">
            <Link
              href="/sign-in"
              className="font-bold uppercase text-sm hover:underline"
            >
              ALREADY HAVE ACCOUNT? LOG IN
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
