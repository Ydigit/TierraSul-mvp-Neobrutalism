"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth, landingPathForRole, type Role } from "@/lib/auth";

interface RequireRoleProps {
  role: Role | Role[];
  children: React.ReactNode;
}

export function RequireRole({ role, children }: RequireRoleProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const allowed = Array.isArray(role) ? role : [role];

  useEffect(() => {
    if (loading) return;
    if (!user) {
      const next = encodeURIComponent(pathname);
      router.replace(`/sign-in?next=${next}`);
      return;
    }
    if (user.status === "banned") {
      router.replace("/banned");
      return;
    }
    if (!allowed.includes(user.role)) {
      router.replace(landingPathForRole(user.role));
    }
    // allowed depends on `role` prop; spreading it would change identity per render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading, pathname, router]);

  if (
    loading ||
    !user ||
    user.status === "banned" ||
    !allowed.includes(user.role)
  ) {
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
