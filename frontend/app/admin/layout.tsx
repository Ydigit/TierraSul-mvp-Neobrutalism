"use client";

import { LayoutDashboard, Users, Briefcase, Activity, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RequireRole } from "@/components/auth/require-role";
import { useAuth } from "@/lib/auth";

const navItems = [
  { path: "/admin", label: "Overview", icon: LayoutDashboard },
  { path: "/admin/tours", label: "Tours", icon: Activity },
  { path: "/admin/users", label: "Users", icon: Users },
  { path: "/admin/operators", label: "Operators", icon: Briefcase },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireRole role="admin">
      <AdminShell>{children}</AdminShell>
    </RequireRole>
  );
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-[#FFF8E7] flex">
      <aside className="w-64 bg-black border-r-4 border-black flex flex-col">
        <div className="p-6 border-b-4 border-[#FFEB3B]">
          <h1 className="text-2xl font-black uppercase text-[#FFEB3B]">
            TierraSul
          </h1>
          <p className="text-xs font-bold uppercase text-white mt-1">
            ADMIN PANEL
          </p>
        </div>
        <nav className="flex-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 mb-2 font-bold uppercase text-sm transition-all ${
                  isActive
                    ? "bg-[#FFEB3B] text-black border-3 border-[#FFEB3B]"
                    : "text-white hover:bg-white/10"
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={3} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t-4 border-[#FFEB3B]">
          {user && (
            <p className="text-xs font-bold uppercase text-white mb-3 truncate">
              {user.name}
            </p>
          )}
          <button
            onClick={signOut}
            className="flex items-center gap-3 w-full px-4 py-3 font-bold uppercase text-sm text-white hover:bg-white/10 transition-all"
          >
            <LogOut className="w-5 h-5" strokeWidth={3} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-12">{children}</main>
    </div>
  );
}
