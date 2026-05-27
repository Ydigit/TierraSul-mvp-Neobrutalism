"use client";

import { useMemo, useState } from "react";
import { BrutalBadge } from "@/components/ui/brutal-badge";
import { BrutalInput } from "@/components/ui/brutal-input";
import { BrutalModal } from "@/components/ui/brutal-modal";
import { BrutalButton } from "@/components/ui/brutal-button";
import { BrutalTextarea } from "@/components/ui/brutal-textarea";
import { StatusBadge } from "@/components/ui/status-badge";
import { AdminTable, type AdminColumn } from "@/components/admin/admin-table";
import { ActionMenu } from "@/components/admin/action-menu";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import type { Tour } from "@/components/tour/tour-card";

type Tab = "all" | "active" | "cancelled" | "deleted";
const tabs: Tab[] = ["all", "active", "cancelled", "deleted"];

export default function AdminToursPage() {
  const { allTours, state, cancelTour, deleteTour, forceCloseTour, restoreTour } =
    useStore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [confirm, setConfirm] = useState<{
    type: "force-close" | "cancel" | "delete" | "restore";
    tour: Tour;
  } | null>(null);
  const [reason, setReason] = useState("");

  const rows = useMemo(() => {
    // Include deleted only when on Deleted tab
    const deleted = state.deletedTourIds;
    let pool: Tour[] =
      activeTab === "deleted"
        ? allTours.filter((t) => deleted.includes(t.id))
        : allTours.filter((t) => !deleted.includes(t.id));
    if (activeTab === "active") {
      pool = pool.filter((t) => t.status === "open" || t.status === "closed");
    } else if (activeTab === "cancelled") {
      pool = pool.filter((t) => t.status === "cancelled");
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      pool = pool.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.country.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q)
      );
    }
    return pool;
  }, [activeTab, search, allTours, state.deletedTourIds]);

  const performAction = () => {
    if (!confirm) return;
    if (confirm.type === "force-close") {
      forceCloseTour(confirm.tour.id);
      toast(`Force-closed "${confirm.tour.title}"`, "success");
    } else if (confirm.type === "cancel") {
      cancelTour(confirm.tour.id);
      toast(
        `Cancelled "${confirm.tour.title}"${reason ? ` — reason: ${reason}` : ""}`,
        "info"
      );
    } else if (confirm.type === "delete") {
      deleteTour(confirm.tour.id);
      toast(`Deleted "${confirm.tour.title}"`, "info");
    } else if (confirm.type === "restore") {
      restoreTour(confirm.tour.id);
      toast(`Restored "${confirm.tour.title}"`, "success");
    }
    setConfirm(null);
    setReason("");
  };

  const columns: AdminColumn<Tour>[] = [
    {
      key: "id",
      header: "ID",
      render: (t) => <span className="font-bold text-sm">#{t.id}</span>,
    },
    {
      key: "title",
      header: "TITLE",
      render: (t) => <span className="font-bold">{t.title}</span>,
    },
    {
      key: "country",
      header: "COUNTRY",
      render: (t) => (
        <span className="font-medium">
          {t.countryFlag} {t.country}
        </span>
      ),
    },
    {
      key: "status",
      header: "STATUS",
      render: (t) => <StatusBadge status={t.status} />,
    },
    {
      key: "members",
      header: "MEMBERS",
      render: (t) => (
        <span className="font-bold">
          {t.currentMembers}/{t.maxMembers}
        </span>
      ),
    },
    {
      key: "dates",
      header: "DATES",
      render: (t) => (
        <span className="font-medium text-sm">
          {t.dateStart} – {t.dateEnd}
        </span>
      ),
    },
    {
      key: "actions",
      header: "ACTIONS",
      className: "text-right",
      render: (t) => {
        const deleted = state.deletedTourIds.includes(t.id);
        return (
          <div className="flex justify-end">
            <ActionMenu
              ariaLabel={`Actions for ${t.title}`}
              items={
                deleted
                  ? [
                      {
                        label: "Restore",
                        onClick: () => setConfirm({ type: "restore", tour: t }),
                      },
                    ]
                  : [
                      {
                        label: "Force close",
                        onClick: () =>
                          setConfirm({ type: "force-close", tour: t }),
                      },
                      {
                        label: "Cancel",
                        onClick: () => setConfirm({ type: "cancel", tour: t }),
                        destructive: true,
                      },
                      {
                        label: "Delete",
                        onClick: () => setConfirm({ type: "delete", tour: t }),
                        destructive: true,
                      },
                    ]
              }
            />
          </div>
        );
      },
    },
  ];

  return (
    <>
      <h1 className="text-4xl md:text-6xl font-black uppercase mb-8">
        ALL TOURS
      </h1>

      {/* Tabs */}
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

      {/* Search */}
      <div className="mb-8 max-w-md">
        <BrutalInput
          type="search"
          placeholder="Search by title, country or ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="mb-2 text-sm font-bold uppercase">
        {rows.length} {rows.length === 1 ? "RESULT" : "RESULTS"}
      </div>

      <AdminTable<Tour>
        columns={columns}
        rows={rows}
        rowKey={(t) => t.id}
        emptyMessage="No tours match"
      />

      <BrutalModal
        open={!!confirm}
        onClose={() => {
          setConfirm(null);
          setReason("");
        }}
        title={
          confirm?.type === "force-close"
            ? "FORCE CLOSE TOUR?"
            : confirm?.type === "cancel"
              ? "CANCEL TOUR?"
              : confirm?.type === "delete"
                ? "DELETE TOUR?"
                : "RESTORE TOUR?"
        }
        size="md"
      >
        <p className="font-medium mb-6">
          {confirm?.type === "force-close" &&
            "Marks the tour as closed and unlocks it for operators immediately. Members are kept."}
          {confirm?.type === "cancel" &&
            "Cancels the tour for all members. Provide a reason for the audit log."}
          {confirm?.type === "delete" &&
            "Soft-deletes the tour. It will appear in the Deleted tab. Restore is only possible while start_date is future."}
          {confirm?.type === "restore" &&
            "Restores the tour back to the Active list."}
        </p>
        {confirm?.type === "cancel" && (
          <BrutalTextarea
            label="REASON (REQUIRED)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Operator availability, weather warning, traveller report…"
            className="mb-6"
          />
        )}
        <div className="flex flex-col sm:flex-row gap-3">
          <BrutalButton
            variant={confirm?.type === "restore" ? "primary" : "danger"}
            size="lg"
            className="flex-1"
            disabled={confirm?.type === "cancel" && !reason.trim()}
            onClick={performAction}
          >
            CONFIRM
          </BrutalButton>
          <BrutalButton
            variant="secondary"
            size="lg"
            onClick={() => {
              setConfirm(null);
              setReason("");
            }}
          >
            BACK
          </BrutalButton>
        </div>
      </BrutalModal>
    </>
  );
}
