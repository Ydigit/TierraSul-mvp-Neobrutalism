"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

/**
 * Global guard mounted in the root layout. If the current user is banned and
 * the path is not in the allowlist, force-redirects to /banned.
 *
 * Allowed paths for banned users: /banned (the suspension page itself) and
 * legal pages (/terms, /privacy) — per the route×role matrix.
 */
const ALLOWED_PATHS = ["/banned", "/terms", "/privacy"];

export function BannedSentinel() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading || !user) return;
    if (user.status !== "banned") return;
    if (ALLOWED_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
      return;
    }
    router.replace("/banned");
  }, [user, loading, pathname, router]);

  return null;
}
