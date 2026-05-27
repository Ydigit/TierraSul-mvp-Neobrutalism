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
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";

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
  },
];

export default function AdminUsersPage() {
  const { isBanned, banUser, unbanUser } = useStore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [banModal, setBanModal] = useState<UserRow | null>(null);
  const [reason, setReason] = useState("");

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
        return (
          <div className="flex justify-end">
            <ActionMenu
              ariaLabel={`Actions for ${u.name}`}
              items={[
                {
                  label: "View profile",
                  onClick: () => toast(`Open profile for ${u.email}`, "info"),
                },
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
                {
                  label: "Reset password",
                  onClick: () =>
                    toast(`Password reset email sent to ${u.email}`, "info"),
                },
                {
                  label: "Send email",
                  onClick: () => toast(`Compose email to ${u.email}`, "info"),
                },
                {
                  label: "Delete (GDPR)",
                  onClick: () =>
                    toast(`Delete request created for ${u.email}`, "info"),
                  destructive: true,
                },
              ]}
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
    </>
  );
}
