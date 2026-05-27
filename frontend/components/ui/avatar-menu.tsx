"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { ChevronDown, LogOut, User, LayoutDashboard, Briefcase, ShieldCheck } from "lucide-react";

interface MenuLink {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

export function AvatarMenu() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();

  const links: MenuLink[] = (() => {
    if (user.role === "traveler") {
      return [
        {
          label: "Dashboard",
          href: "/dashboard",
          icon: <LayoutDashboard className="w-4 h-4" strokeWidth={3} />,
        },
        {
          label: "Profile",
          href: "/profile",
          icon: <User className="w-4 h-4" strokeWidth={3} />,
        },
      ];
    }
    if (user.role === "operator") {
      return [
        {
          label: "Dashboard",
          href: "/operator",
          icon: <LayoutDashboard className="w-4 h-4" strokeWidth={3} />,
        },
        {
          label: "Billing",
          href: "/operator/billing",
          icon: <Briefcase className="w-4 h-4" strokeWidth={3} />,
        },
        {
          label: "Profile",
          href: "/profile",
          icon: <User className="w-4 h-4" strokeWidth={3} />,
        },
      ];
    }
    return [
      {
        label: "Admin Panel",
        href: "/admin",
        icon: <ShieldCheck className="w-4 h-4" strokeWidth={3} />,
      },
    ];
  })();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        className="flex items-center gap-2 border-3 border-black bg-[#FFEB3B] px-3 py-2 font-black uppercase text-xs shadow-[3px_3px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0_#000] transition-all"
      >
        <span className="w-6 h-6 bg-black text-[#FFEB3B] flex items-center justify-center font-black text-[10px]">
          {initials}
        </span>
        <span className="hidden sm:inline truncate max-w-[100px]">
          {user.name}
        </span>
        <ChevronDown className="w-4 h-4" strokeWidth={3} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 bg-white border-4 border-black shadow-[6px_6px_0_#000] py-2"
        >
          <div className="px-4 py-3 border-b-2 border-black">
            <p className="font-black text-sm uppercase truncate">{user.name}</p>
            <p className="text-xs font-medium truncate text-[#666]">
              {user.email}
            </p>
          </div>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 font-bold uppercase text-xs hover:bg-[#FFEB3B] transition-colors"
            >
              {l.icon}
              {l.label}
            </Link>
          ))}
          <button
            onClick={() => {
              setOpen(false);
              signOut();
            }}
            role="menuitem"
            className="w-full flex items-center gap-3 px-4 py-3 font-bold uppercase text-xs hover:bg-[#FF6B9D] transition-colors border-t-2 border-black text-left"
          >
            <LogOut className="w-4 h-4" strokeWidth={3} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
