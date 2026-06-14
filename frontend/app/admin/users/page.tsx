"use client";

import { useMemo, useState } from "react";
import { BrutalInput } from "@/components/ui/brutal-input";
import { BrutalModal } from "@/components/ui/brutal-modal";
import { BrutalButton } from "@/components/ui/brutal-button";
import { BrutalTextarea } from "@/components/ui/brutal-textarea";
import { StatusBadge } from "@/components/ui/status-badge";
import { BrutalBadge } from "@/components/ui/brutal-badge";
import { AdminTable, type AdminColumn } from "@/components/admin/admin-table";
import { ActionMenu } from "@/components/admin/action-menu";
import { GroupProfileView } from "@/components/profile/group-profile-view";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import type { AuthUser } from "@/lib/auth";

type Tab = "all" | "travelers" | "operators" | "admins";
const tabs: Tab[] = ["all", "travelers", "operators", "admins"];

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: "traveler" | "operator" | "admin";
  country: string;
  countryFlag: string;
  tours: number;
  joined: string;
  // Full profile data — admin sees everything
  city?: string;
  age?: number;
  phone?: string;
  bio?: string;
  languages?: string[];
  avatarUrl?: string;
  photos?: string[];
  // Operator-only
  companyName?: string;
  website?: string;
  description?: string;
  lastLogin?: string;
  ipCountry?: string;
}

const MOCK_USERS: UserRow[] = [
  {
    id: "u1",
    name: "Maria Silva",
    email: "maria@example.com",
    role: "traveler",
    country: "Spain",
    countryFlag: "🇪🇸",
    tours: 3,
    joined: "May 1, 2026",
    city: "Barcelona",
    age: 28,
    phone: "+34 600 123 456",
    bio: "Photographer, slow traveler. 3 months into South America.",
    languages: ["en", "es"],
    avatarUrl: "https://picsum.photos/seed/maria/200/200",
    photos: [
      "https://picsum.photos/seed/maria1/600/600",
      "https://picsum.photos/seed/maria2/600/600",
    ],
    lastLogin: "2 hours ago",
    ipCountry: "🇨🇱 Chile (Santiago)",
  },
  {
    id: "u2",
    name: "John Smith",
    email: "john@example.com",
    role: "traveler",
    country: "UK",
    countryFlag: "🇬🇧",
    tours: 1,
    joined: "May 5, 2026",
    city: "London",
    age: 25,
    bio: "Solo backpacker, into trekking.",
    languages: ["en"],
    avatarUrl: "https://picsum.photos/seed/john/200/200",
    photos: ["https://picsum.photos/seed/john1/600/600"],
    lastLogin: "Yesterday",
    ipCountry: "🇬🇧 UK (London)",
  },
  {
    id: "u3",
    name: "Atacama Tours",
    email: "contact@atacama.com",
    role: "operator",
    country: "Chile",
    countryFlag: "🇨🇱",
    tours: 0,
    joined: "Apr 15, 2026",
    city: "San Pedro de Atacama",
    phone: "+56 9 1234 5678",
    languages: ["es", "en"],
    companyName: "Atacama Tours",
    website: "https://atacamatours.example.com",
    description: "Family-run desert tours in San Pedro since 2018.",
    avatarUrl: "https://picsum.photos/seed/atacama/200/200",
    lastLogin: "5 minutes ago",
    ipCountry: "🇨🇱 Chile (Atacama)",
  },
  {
    id: "u4",
    name: "Inca Trail Co",
    email: "hello@incatrail.com",
    role: "operator",
    country: "Peru",
    countryFlag: "🇵🇪",
    tours: 0,
    joined: "Apr 10, 2026",
    city: "Cusco",
    phone: "+51 984 555 222",
    languages: ["es", "en", "qu"],
    companyName: "Inca Trail Co",
    website: "https://incatrail.example.com",
    description: "Classic Inca Trail + Salkantay treks with native guides.",
    avatarUrl: "https://picsum.photos/seed/inca/200/200",
    lastLogin: "1 hour ago",
    ipCountry: "🇵🇪 Peru (Cusco)",
  },
  {
    id: "u5",
    name: "Admin User",
    email: "admin@tierrasul.com",
    role: "admin",
    country: "Spain",
    countryFlag: "🇪🇸",
    tours: 0,
    joined: "Jan 1, 2026",
    city: "Madrid",
    languages: ["en", "es", "pt"],
    avatarUrl: "https://picsum.photos/seed/admin/200/200",
    lastLogin: "Just now",
    ipCountry: "🇪🇸 Spain (Madrid)",
  },
  {
    id: "u6",
    name: "Spam Account",
    email: "spam@temp.com",
    role: "traveler",
    country: "—",
    countryFlag: "🏴",
    tours: 0,
    joined: "May 8, 2026",
    bio: "asdf asdf",
    languages: [],
    lastLogin: "3 days ago",
    ipCountry: "🏴 Unknown (TOR exit)",
  },
];

export default function AdminUsersPage() {
  const { isBanned, banUser, unbanUser } = useStore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [banModal, setBanModal] = useState<UserRow | null>(null);
  const [reason, setReason] = useState("");
  const [profileView, setProfileView] = useState<UserRow | null>(null);

  const rows = useMemo(() => {
    let pool = MOCK_USERS;
    if (activeTab !== "all") {
      const map = {
        travelers: "traveler",
        operators: "operator",
        admins: "admin",
      } as const;
      pool = pool.filter((u) => u.role === map[activeTab]);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      pool = pool.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      );
    }
    return pool;
  }, [activeTab, search]);

  const submitBan = () => {
    if (!banModal || !reason.trim()) return;
    banUser(banModal.email, reason.trim());
    toast(`Banned ${banModal.email}`, "info");
    setBanModal(null);
    setReason("");
  };

  const columns: AdminColumn<UserRow>[] = [
    {
      key: "name",
      header: "NAME",
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FFEB3B] border-3 border-black flex items-center justify-center font-black text-xs shrink-0">
            {u.name
              .split(" ")
              .slice(0, 2)
              .map((s) => s[0])
              .join("")
              .toUpperCase()}
          </div>
          <span className="font-bold">{u.name}</span>
        </div>
      ),
    },
    {
      key: "email",
      header: "EMAIL",
      render: (u) => <span className="font-medium text-sm">{u.email}</span>,
    },
    {
      key: "role",
      header: "ROLE",
      render: (u) => (
        <BrutalBadge
          variant={
            u.role === "traveler"
              ? "cyan"
              : u.role === "operator"
                ? "pink"
                : "black"
          }
        >
          {u.role}
        </BrutalBadge>
      ),
    },
    {
      key: "country",
      header: "COUNTRY",
      render: (u) => (
        <span className="font-medium text-sm">
          {u.countryFlag} {u.country}
        </span>
      ),
    },
    {
      key: "tours",
      header: "TOURS",
      render: (u) => <span className="font-bold">{u.tours}</span>,
    },
    {
      key: "status",
      header: "STATUS",
      render: (u) => (
        <StatusBadge status={isBanned(u.email) ? "banned" : "active"} />
      ),
    },
    {
      key: "joined",
      header: "JOINED",
      render: (u) => <span className="font-medium text-sm">{u.joined}</span>,
    },
    {
      key: "actions",
      header: "ACTIONS",
      className: "text-right",
      render: (u) => {
        const banned = isBanned(u.email);
        const isAdmin = u.role === "admin";
        // Admins are never banneable or deletable from this UI — prevents
        // accidental self-lockout and matches the principle that ops on
        // peer-admins go through a separate elevated flow.
        const items = [
          {
            label: "View profile",
            onClick: () => setProfileView(u),
          },
          ...(isAdmin
            ? []
            : [
                banned
                  ? {
                      label: "Unban",
                      onClick: () => {
                        unbanUser(u.email);
                        toast(`Unbanned ${u.email}`, "success");
                      },
                    }
                  : {
                      label: "Ban user",
                      onClick: () => setBanModal(u),
                      destructive: true,
                    },
              ]),
          {
            label: "Reset password",
            onClick: () =>
              toast(`Password reset email sent to ${u.email}`, "info"),
          },
          {
            label: "Send email",
            onClick: () => toast(`Compose email to ${u.email}`, "info"),
          },
          ...(isAdmin
            ? []
            : [
                {
                  label: "Delete (GDPR)",
                  onClick: () =>
                    toast(
                      `Delete request created for ${u.email}`,
                      "info"
                    ),
                  destructive: true,
                },
              ]),
        ];
        return (
          <div className="flex justify-end">
            <ActionMenu
              ariaLabel={`Actions for ${u.name}`}
              items={items}
            />
          </div>
        );
      },
    },
  ];

  return (
    <>
      <h1 className="text-4xl md:text-6xl font-black uppercase mb-8">
        ALL USERS
      </h1>

      <div className="flex gap-3 mb-6 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 font-black uppercase text-sm border-4 border-black shadow-[4px_4px_0_#000] transition-all ${
              activeTab === tab
                ? "bg-[#FFEB3B] translate-x-[2px] translate-y-[2px] shadow-[2px_2px_0_#000]"
                : "bg-white hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0_#000]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mb-8 max-w-md">
        <BrutalInput
          type="search"
          placeholder="Search name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="mb-2 text-sm font-bold uppercase">
        {rows.length} {rows.length === 1 ? "RESULT" : "RESULTS"}
      </div>

      <AdminTable<UserRow>
        columns={columns}
        rows={rows}
        rowKey={(u) => u.id}
        emptyMessage="No users match"
      />

      <BrutalModal
        open={!!banModal}
        onClose={() => {
          setBanModal(null);
          setReason("");
        }}
        title="BAN USER?"
        size="md"
      >
        {banModal && (
          <p className="font-medium mb-4">
            Banning <strong>{banModal.email}</strong>. They&apos;ll be unable
            to sign in and will see the suspended page.
          </p>
        )}
        <BrutalTextarea
          label="REASON (REQUIRED)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="What policy was violated?"
          className="mb-6"
        />
        <div className="flex flex-col sm:flex-row gap-3">
          <BrutalButton
            variant="danger"
            size="lg"
            className="flex-1"
            disabled={!reason.trim()}
            onClick={submitBan}
          >
            BAN USER
          </BrutalButton>
          <BrutalButton
            variant="secondary"
            size="lg"
            onClick={() => {
              setBanModal(null);
              setReason("");
            }}
          >
            CANCEL
          </BrutalButton>
        </div>
      </BrutalModal>

      {profileView && (
        <GroupProfileView
          open={!!profileView}
          onClose={() => setProfileView(null)}
          user={{
            ...rowToAuthUser(profileView),
            status: isBanned(profileView.email) ? "banned" : "active",
          }}
          context="ADMIN"
          adminMeta={{
            joined: profileView.joined,
            lastLogin: profileView.lastLogin,
            ipCountry: profileView.ipCountry,
            toursCount: profileView.tours,
            banReason: isBanned(profileView.email)
              ? "Policy violation (mock)"
              : undefined,
          }}
        />
      )}
    </>
  );
}

function rowToAuthUser(u: UserRow): AuthUser {
  return {
    id: u.id,
    role: u.role,
    email: u.email,
    name: u.name,
    emailVerified: true,
    status: "active",
    country: u.country,
    city: u.city,
    age: u.age,
    phone: u.phone,
    bio: u.bio,
    languages: u.languages,
    avatarUrl:
      u.avatarUrl ??
      `https://picsum.photos/seed/${encodeURIComponent(u.email)}/200/200`,
    photos: u.photos,
    // Operator-only
    companyName: u.companyName,
    website: u.website,
    description: u.description,
  };
}
