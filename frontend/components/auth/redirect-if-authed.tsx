"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, landingPathForRole } from "@/lib/auth";

interface RedirectIfAuthedProps {
  /** Allow already-authenticated users to stay (rarely needed). Default `false`. */
  allowAuthed?: boolean;
  children: React.ReactNode;
}

/**
 * Wraps pages that should bounce already-authenticated users to their dashboard.
 * Use on /sign-in, /sign-up, /forgot-password, /verify-email.
 * Banned users always go to /banned regardless of `allowAuthed`.
 */
export function RedirectIfAuthed({ children }: RedirectIfAuthedProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    if (loading || !user) return;
    if (user.status === "banned") {
      router.replace("/banned");
      return;
    }
    // Unverified users belong on /verify-email regardless of which auth page
    // they're sitting on (matches the post-signup flow without racing the
    // form's own router.push).
    if (!user.emailVerified) {
      router.replace(
        `/verify-email?email=${encodeURIComponent(user.email)}`
      );
      return;
    }
    const next = params.get("next");
    router.replace(next ?? landingPathForRole(user.role));
  }, [user, loading, params, router]);

  if (!loading && user) {
    return (
      <div className="min-h-screen bg-[#FFF8E7] flex items-center justify-center p-6">
        <div className="bg-white border-4 border-black shadow-[8px_8px_0_#000] px-8 py-6">
          <p className="font-black uppercase tracking-tight">REDIRECTING…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
