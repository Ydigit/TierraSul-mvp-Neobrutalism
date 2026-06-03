"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BrutalButton } from "@/components/ui/brutal-button";
import { BrutalInput } from "@/components/ui/brutal-input";
import { RedirectIfAuthed } from "@/components/auth/redirect-if-authed";
import {
  useAuth,
  landingPathForRole,
  detectRoleFromEmail,
  type Role,
} from "@/lib/auth";

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInFallback />}>
      <RedirectIfAuthed>
        <SignInForm />
      </RedirectIfAuthed>
    </Suspense>
  );
}

function SignInFallback() {
  return (
    <div className="min-h-screen bg-[#FFF8E7] flex items-center justify-center p-6">
      <div className="bg-white border-4 border-black shadow-[8px_8px_0_#000] px-8 py-6">
        <p className="font-black uppercase tracking-tight">LOADING…</p>
      </div>
    </div>
  );
}

function SignInForm() {
  const { signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const prefillEmail = searchParams.get("email") ?? "";
  const justVerified = searchParams.get("verified") === "1";
  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const enterAs = (role: Role) => {
    signIn(role);
    router.push(next ?? landingPathForRole(role));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Enter your email and password");
      return;
    }
    setError(null);
    // Mock: password is not verified; role is inferred from the email so the
    // user lands on the correct dashboard. Real impl will validate via Supabase.
    const role = detectRoleFromEmail(email);
    signIn(role, { email: email.trim() });
    router.push(next ?? landingPathForRole(role));
  };

  return (
    <div className="min-h-screen bg-[#FFF8E7] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <Link href="/" className="block text-center mb-8">
          <h1 className="text-4xl font-black uppercase">TierraSul</h1>
        </Link>

        <div className="bg-white border-4 border-black shadow-[12px_12px_0_#000] p-8 md:p-12">
          <h1 className="text-5xl font-black uppercase leading-none mb-8">
            WELCOME<br />BACK
          </h1>

          {justVerified && (
            <div className="bg-[#C6FF00] border-4 border-black shadow-[4px_4px_0_#000] px-4 py-3 mb-6 font-bold uppercase text-sm flex items-center gap-3">
              <span aria-hidden className="text-xl leading-none">✓</span>
              <span>EMAIL VERIFIED — SIGN IN TO CONTINUE</span>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4 mb-6" noValidate>
            <BrutalInput
              label="EMAIL"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <BrutalInput
              label="PASSWORD"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <p className="font-bold uppercase text-xs text-[#FF3B3B]">
                {error}
              </p>
            )}

            <BrutalButton
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
            >
              SIGN IN
            </BrutalButton>
          </form>

          {/*
            TODO (backend handoff): env-gate this whole block before first
            production deploy. Either:
              {process.env.NODE_ENV === 'development' && (<DemoButtons />)}
            or with an explicit toggle:
              {process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true' && (<DemoButtons />)}
            Reason: ENTER AS ADMIN etc. would otherwise be a public lockpick.
          */}
          <div className="border-t-4 border-black pt-6 mb-6">
            <p className="font-black uppercase text-xs text-center mb-4 tracking-wider">
              ★ DEMO MODE — INSTANT ACCESS ★
            </p>
            <div className="space-y-3">
              <BrutalButton
                variant="primary"
                size="md"
                className="w-full"
                onClick={() => enterAs("traveler")}
              >
                ENTER AS TRAVELER 🎒
              </BrutalButton>
              <BrutalButton
                variant="secondary"
                size="md"
                className="w-full"
                onClick={() => enterAs("operator")}
              >
                ENTER AS OPERATOR 💼
              </BrutalButton>
              <BrutalButton
                variant="black"
                size="md"
                className="w-full"
                onClick={() => enterAs("admin")}
              >
                ENTER AS ADMIN 🛡️
              </BrutalButton>
            </div>
          </div>

          <div className="text-center space-y-3">
            <Link
              href="/forgot-password"
              className="block font-bold uppercase text-sm hover:underline"
            >
              FORGOT PASSWORD?
            </Link>
            <Link
              href="/sign-up"
              className="block font-bold uppercase text-sm hover:underline"
            >
              DON&apos;T HAVE ACCOUNT? SIGN UP
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
