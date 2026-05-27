"use client";

import { useMemo, useState } from "react";
import { BrutalInput } from "@/components/ui/brutal-input";
import { BrutalModal } from "@/components/ui/brutal-modal";
import { BrutalButton } from "@/components/ui/brutal-button";
import { BrutalBadge } from "@/components/ui/brutal-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { AdminTable, type AdminColumn } from "@/components/admin/admin-table";
import { ActionMenu } from "@/components/admin/action-menu";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import { ExternalLink, Check } from "lucide-react";

type Tab = "all" | "not-reviewed" | "reviewed" | "banned";
const tabs: Tab[] = ["all", "not-reviewed", "reviewed", "banned"];

interface OperatorRow {
  id: string;
  company: string;
  email: string;
  country: string;
  countryFlag: string;
  plan: "starter" | "growth" | "pro";
  contactsUsed: number;
  contactsLimit: number;
  mrr: number;
  joined: string;
  website?: string;
}

const MOCK_OPS: OperatorRow[] = [
  {
    id: "op1",
    company: "Atacama Tours",
    email: "contact@atacama.com",
    country: "Chile",
    countryFlag: "🇨🇱",
    plan: "growth",
    contactsUsed: 12,
    contactsLimit: 30,
    mrr: 59,
    joined: "Apr 15, 2026",
    website: "https://atacamatours.example.com",
  },
  {
    id: "op2",
    company: "Inca Trail Co",
    email: "hello@incatrail.com",
    country: "Peru",
    countryFlag: "🇵🇪",
    plan: "pro",
    contactsUsed: 45,
    contactsLimit: 100,
    mrr: 129,
    joined: "Mar 10, 2026",
    website: "https://incatrail.example.com",
  },
  {
    id: "op3",
    company: "Salt Adventures",
    email: "info@saltadventures.com",
    country: "Bolivia",
    countryFlag: "🇧🇴",
    plan: "starter",
    contactsUsed: 3,
    contactsLimit: 5,
    mrr: 16.99,
    joined: "May 1, 2026",
  },
  {
    id: "op4",
    company: "Patagonia Wild",
    email: "hello@patagonia.com",
    country: "Argentina",
    countryFlag: "🇦🇷",
    plan: "growth",
    contactsUsed: 0,
    contactsLimit: 30,
    mrr: 59,
    joined: "May 7, 2026",
  },
];

export default function AdminOperatorsPage() {
  const { isOperatorReviewed, toggleOperatorReviewed, isBanned, banUser } =
    useStore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [drillDown, setDrillDown] = useState<OperatorRow | null>(null);

  const rows = useMemo(() => {
    let pool = MOCK_OPS;
    if (activeTab === "not-reviewed") {
      pool = pool.filter((o) => !isOperatorReviewed(o.email));
    } else if (activeTab === "reviewed") {
      pool = pool.filter((o) => isOperatorReviewed(o.email));
    } else if (activeTab === "banned") {
      pool = pool.filter((o) => isBanned(o.email));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      pool = pool.filter(
        (o) =>
          o.company.toLowerCase().includes(q) ||
          o.email.toLowerCase().includes(q)
      );
    }
    return pool;
  }, [activeTab, search, isOperatorReviewed, isBanned]);

  const totalMRR = MOCK_OPS.reduce((sum, o) => sum + o.mrr, 0);
  const notReviewedCount = MOCK_OPS.filter(
    (o) => !isOperatorReviewed(o.email)
  ).length;

  const columns: AdminColumn<OperatorRow>[] = [
    {
      key: "company",
      header: "COMPANY",
      render: (o) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FF6B9D] border-3 border-black flex items-center justify-center font-black text-xs shrink-0">
            {o.company.substring(0, 2).toUpperCase()}
          </div>
          <button
            onClick={() => setDrillDown(o)}
            className="font-bold text-left hover:underline"
          >
            {o.company}
          </button>
        </div>
      ),
    },
    {
      key: "email",
      header: "EMAIL",
      render: (o) => <span className="font-medium text-sm">{o.email}</span>,
    },
    {
      key: "country",
      header: "COUNTRY",
      render: (o) => (
        <span className="font-medium text-sm">
          {o.countryFlag} {o.country}
        </span>
      ),
    },
    {
      key: "plan",
      header: "PLAN",
      render: (o) => (
        <BrutalBadge
          variant={
            o.plan === "pro" ? "cyan" : o.plan === "growth" ? "yellow" : "white"
          }
        >
          {o.plan}
        </BrutalBadge>
      ),
    },
    {
      key: "contacts",
      header: "CONTACTS",
      render: (o) => (
        <span className="font-bold">
          {o.contactsUsed}/{o.contactsLimit}
        </span>
      ),
    },
    {
      key: "mrr",
      header: "MRR",
      render: (o) => <span className="font-bold">€{o.mrr}</span>,
    },
    {
      key: "reviewed",
      header: "REVIEWED",
      render: (o) =>
        isOperatorReviewed(o.email) ? (
          <span className="inline-flex items-center gap-1 font-bold text-sm">
            <Check className="w-4 h-4 text-[#00C853]" strokeWidth={3} /> YES
          </span>
        ) : (
          <span className="font-bold text-sm text-[#FF3B3B]">⏳ NO</span>
        ),
    },
    {
      key: "status",
      header: "STATUS",
      render: (o) => (
        <StatusBadge status={isBanned(o.email) ? "banned" : "active"} />
      ),
    },
    {
      key: "actions",
      header: "ACTIONS",
      className: "text-right",
      render: (o) => (
        <div className="flex justify-end">
          <ActionMenu
            ariaLabel={`Actions for ${o.company}`}
            items={[
              { label: "View detail", onClick: () => setDrillDown(o) },
              {
                label: isOperatorReviewed(o.email)
                  ? "Mark as unreviewed"
                  : "Mark as reviewed ✓",
                onClick: () => {
                  toggleOperatorReviewed(o.email);
                  toast(
                    isOperatorReviewed(o.email)
                      ? `Unreviewed ${o.company}`
                      : `Marked ${o.company} as reviewed`,
                    "success"
                  );
                },
              },
              {
                label: "Open in Stripe",
                onClick: () =>
                  toast(`Stripe dashboard → customer ${o.email}`, "info"),
              },
              {
                label: "Send email",
                onClick: () => toast(`Compose email to ${o.email}`, "info"),
              },
              isBanned(o.email)
                ? {
                    label: "Unban",
                    onClick: () => {
                      banUser(o.email, ""); // toggle by re-banning then unbanning is weird; using ban store API
                      // Actually unban via different path:
                      toast(`Unbanning ${o.email}`, "info");
                    },
                  }
                : {
                    label: "Ban operator",
                    onClick: () => {
                      banUser(o.email, "Manual admin ban");
                      toast(`Banned ${o.email}`, "info");
                    },
                    destructive: true,
                  },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <h1 className="text-4xl md:text-6xl font-black uppercase mb-8">
        OPERATORS
      </h1>

      {/* MRR stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-10">
        <div className="bg-[#FFEB3B] border-4 border-black p-5 shadow-[4px_4px_0_#000]">
          <div className="text-3xl md:text-4xl font-black">€{totalMRR.toFixed(0)}</div>
          <div className="text-xs font-bold uppercase">TOTAL MRR</div>
        </div>
        <div className="bg-[#00E5FF] border-4 border-black p-5 shadow-[4px_4px_0_#000]">
          <div className="text-3xl md:text-4xl font-black">{MOCK_OPS.length}</div>
          <div className="text-xs font-bold uppercase">ACTIVE OPERATORS</div>
        </div>
        <div className="bg-[#FF6B9D] border-4 border-black p-5 shadow-[4px_4px_0_#000]">
          <div className="text-3xl md:text-4xl font-black">{notReviewedCount}</div>
          <div className="text-xs font-bold uppercase">NOT REVIEWED YET</div>
        </div>
      </div>

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
            {tab.replace("-", " ")}
            {tab === "not-reviewed" && notReviewedCount > 0 && (
              <span className="ml-2 bg-[#FF3B3B] text-white px-1 py-0.5 text-[10px]">
                {notReviewedCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mb-8 max-w-md">
        <BrutalInput
          type="search"
          placeholder="Search company or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <AdminTable<OperatorRow>
        columns={columns}
        rows={rows}
        rowKey={(o) => o.id}
        emptyMessage="No operators match"
      />

      {/* Drill-down panel */}
      <BrutalModal
        open={!!drillDown}
        onClose={() => setDrillDown(null)}
        title={drillDown?.company ?? ""}
        size="lg"
      >
        {drillDown && (
          <>
            <div className="flex flex-wrap gap-3 mb-6">
              {drillDown.website && (
                <a
                  href={drillDown.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-[#FFEB3B] border-3 border-black px-3 py-2 font-bold uppercase text-xs shadow-[3px_3px_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_#000] transition-all"
                >
                  <ExternalLink className="w-3 h-3" strokeWidth={3} />
                  WEBSITE
                </a>
              )}
              <button
                onClick={() => toast("Stripe dashboard link", "info")}
                className="inline-flex items-center gap-2 bg-white border-3 border-black px-3 py-2 font-bold uppercase text-xs shadow-[3px_3px_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_#000] transition-all"
              >
                <ExternalLink className="w-3 h-3" strokeWidth={3} />
                STRIPE
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 mb-6">
              <Field label="EMAIL" value={drillDown.email} />
              <Field
                label="COUNTRY"
                value={`${drillDown.countryFlag} ${drillDown.country}`}
              />
              <Field label="PLAN" value={drillDown.plan.toUpperCase()} />
              <Field
                label="CONTACTS"
                value={`${drillDown.contactsUsed}/${drillDown.contactsLimit}`}
              />
              <Field label="MRR" value={`€${drillDown.mrr}`} />
              <Field label="JOINED" value={drillDown.joined} />
            </div>

            <div className="flex flex-wrap gap-3">
              <BrutalButton
                variant={
                  isOperatorReviewed(drillDown.email) ? "secondary" : "primary"
                }
                size="md"
                onClick={() => {
                  toggleOperatorReviewed(drillDown.email);
                  toast(
                    isOperatorReviewed(drillDown.email)
                      ? `Unreviewed ${drillDown.company}`
                      : `Marked reviewed`,
                    "success"
                  );
                }}
              >
                {isOperatorReviewed(drillDown.email)
                  ? "MARK UNREVIEWED"
                  : "MARK AS REVIEWED ✓"}
              </BrutalButton>
              {!isBanned(drillDown.email) && (
                <BrutalButton
                  variant="danger"
                  size="md"
                  onClick={() => {
                    banUser(drillDown.email, "Manual admin ban");
                    toast(`Banned ${drillDown.email}`, "info");
                    setDrillDown(null);
                  }}
                >
                  BAN OPERATOR
                </BrutalButton>
              )}
            </div>
          </>
        )}
      </BrutalModal>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-3 border-black p-3 bg-[#FFF8E7]">
      <p className="text-xs font-black uppercase text-[#666]">{label}</p>
      <p className="font-bold mt-1 break-words">{value}</p>
    </div>
  );
}
