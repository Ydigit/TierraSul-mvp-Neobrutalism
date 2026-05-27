"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, landingPathForRole } from "@/lib/auth";

interface RequireBannedProps {
  children: React.ReactNode;
}

/**
 * Only banned users may render. Visitors → `/`. Authed non-banned → role home.
 */
export function RequireBanned({ children }: RequireBannedProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/");
      return;
    }
    if (user.status !== "banned") {
      router.replace(landingPathForRole(user.role));
    }
  }, [user, loading, router]);

  if (loading || !user || user.status !== "banned") {
    return (
      <div className="min-h-screen bg-[#FFF8E7] flex items-center justify-center p-6">
        <div className="bg-white border-4 border-black shadow-[8px_8px_0_#000] px-8 py-6">
          <p className="font-black uppercase tracking-tight">CHECKING ACCESS…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
