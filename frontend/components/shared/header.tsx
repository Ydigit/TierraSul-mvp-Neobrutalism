"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrutalButton } from "../ui/brutal-button";
import { AvatarMenu } from "../ui/avatar-menu";
import { useAuth } from "@/lib/auth";

interface HeaderProps {
  /** Fallback variant — only consulted when no user is signed in. */
  variant?: "public" | "traveler" | "operator" | "admin";
}

interface NavLinkProps {
  href: string;
  /**
   * Active when the URL path matches one of these prefixes (on a path-boundary).
   * Falls back to `[href]` if absent.
   */
  match?: string[];
  /**
   * When true, ONLY exact path equality counts as active. Used by nav items
   * whose href is a prefix of other items (e.g. "/operator" vs "/operator/groups").
   */
  exact?: boolean;
  children: React.ReactNode;
}

/**
 * Persistent nav link with a brutalist active state — the underline is
 * always there when the current route matches, instead of only on hover.
 */
function NavLink({ href, match, exact, children }: NavLinkProps) {
  const pathname = usePathname();
  const targets = match ?? [href];
  const isActive = targets.some((p) => {
    if (exact) return pathname === p;
    if (p === "/") return pathname === "/";
    if (pathname === p) return true;
    return pathname.startsWith(p + "/");
  });
  return (
    <Link
      href={href}
      className={`font-bold uppercase text-sm decoration-4 underline-offset-4 ${
        isActive
          ? "underline text-black"
          : "hover:underline text-black/80 hover:text-black"
      }`}
    >
      {children}
    </Link>
  );
}

export function Header({ variant = "public" }: HeaderProps) {
  const { user, loading } = useAuth();
  const effective = loading ? variant : (user?.role ?? variant);
  const sub = user?.role === "operator" ? user.subscription : undefined;

  return (
    <nav className="border-b-4 border-black bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="text-2xl font-black uppercase tracking-tight hover:text-[#FFEB3B] transition-colors shrink-0"
        >
          TierraSul
        </Link>

        {effective === "public" && (
          <>
            <div className="hidden md:flex items-center gap-8">
              <NavLink href="/tours">Tours</NavLink>
              <NavLink href="/for-operators">For Operators</NavLink>
              <NavLink href="/pricing">Pricing</NavLink>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/sign-in"
                className="hidden sm:inline font-bold uppercase text-sm hover:underline decoration-4"
              >
                Sign in
              </Link>
              <BrutalButton href="/sign-up" variant="primary" size="sm">
                Sign up
              </BrutalButton>
            </div>
          </>
        )}

        {effective === "traveler" && (
          <>
            <div className="hidden md:flex items-center gap-8">
              <NavLink href="/dashboard">Dashboard</NavLink>
              <NavLink href="/tours" match={["/tours"]}>
                Browse
              </NavLink>
            </div>
            <div className="flex items-center gap-3">
              <BrutalButton href="/tours/new" variant="primary" size="sm">
                + Post Tour
              </BrutalButton>
              <AvatarMenu />
            </div>
          </>
        )}

        {effective === "operator" && (
          <>
            <div className="hidden md:flex items-center gap-6">
              <NavLink href="/operator" exact>
                Dashboard
              </NavLink>
              <NavLink href="/operator/groups">Browse</NavLink>
              <NavLink href="/operator/contacts">Contacts</NavLink>
              <NavLink href="/operator/billing">Billing</NavLink>
            </div>
            <div className="flex items-center gap-3">
              {sub && sub.status !== "ended" && (
                <div className="hidden md:flex items-center gap-2 bg-[#00E5FF] border-2 border-black px-3 py-1 font-bold text-xs">
                  <span>
                    {sub.plan === "starter"
                      ? "STARTER"
                      : sub.plan === "growth"
                        ? "GROWTH"
                        : "PRO"}
                  </span>
                  <span className="opacity-70">·</span>
                  <span>
                    {sub.contactsUsed}/{sub.contactsLimit}
                  </span>
                </div>
              )}
              <AvatarMenu />
            </div>
          </>
        )}

        {effective === "admin" && (
          <div className="flex items-center gap-3">
            <NavLink href="/admin">Admin Panel</NavLink>
            <AvatarMenu />
          </div>
        )}
      </div>
    </nav>
  );
}
