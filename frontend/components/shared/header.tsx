"use client";

import Link from "next/link";
import { BrutalButton } from "../ui/brutal-button";
import { AvatarMenu } from "../ui/avatar-menu";
import { useAuth } from "@/lib/auth";

interface HeaderProps {
  /** Fallback variant — only consulted when no user is signed in. */
  variant?: "public" | "traveler" | "operator" | "admin";
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
              <Link
                href="/tours"
                className="font-bold uppercase text-sm hover:underline decoration-4"
              >
                Tours
              </Link>
              <Link
                href="/for-operators"
                className="font-bold uppercase text-sm hover:underline decoration-4"
              >
                For Operators
              </Link>
              <Link
                href="/pricing"
                className="font-bold uppercase text-sm hover:underline decoration-4"
              >
                Pricing
              </Link>
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
              <Link
                href="/dashboard"
                className="font-bold uppercase text-sm hover:underline decoration-4"
              >
                Dashboard
              </Link>
              <Link
                href="/tours"
                className="font-bold uppercase text-sm hover:underline decoration-4"
              >
                Browse
              </Link>
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
              <Link
                href="/operator"
                className="font-bold uppercase text-sm hover:underline decoration-4"
              >
                Dashboard
              </Link>
              <Link
                href="/operator/groups"
                className="font-bold uppercase text-sm hover:underline decoration-4"
              >
                Browse
              </Link>
              <Link
                href="/operator/contacts"
                className="font-bold uppercase text-sm hover:underline decoration-4"
              >
                Contacts
              </Link>
              <Link
                href="/operator/billing"
                className="font-bold uppercase text-sm hover:underline decoration-4"
              >
                Billing
              </Link>
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
            <Link
              href="/admin"
              className="hidden sm:inline font-bold uppercase text-sm hover:underline decoration-4"
            >
              Admin Panel
            </Link>
            <AvatarMenu />
          </div>
        )}
      </div>
    </nav>
  );
}
