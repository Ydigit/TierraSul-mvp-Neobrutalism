"use client";

import { useMemo, useState } from "react";
import { BrutalButton } from "@/components/ui/brutal-button";
import { BrutalModal } from "@/components/ui/brutal-modal";
import { BrutalTextarea } from "@/components/ui/brutal-textarea";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import { Flag, CheckCircle2 } from "lucide-react";

type Tab = "open" | "resolved";

export default function AdminModerationReportsPage() {
  const { state, resolveReport, banUser } = useStore();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("open");
  const [banTarget, setBanTarget] = useState<{
    email: string;
    name: string;
  } | null>(null);
  const [banReason, setBanReason] = useState("");

  const rows = useMemo(() => {
    return tab === "open"
      ? state.reports.filter((r) => !r.resolvedAt)
      : state.reports.filter((r) => r.resolvedAt);
  }, [state.reports, tab]);

  const openCount = state.reports.filter((r) => !r.resolvedAt).length;
  const resolvedCount = state.reports.length - openCount;

  const confirmBan = () => {
    if (!banTarget || !banReason.trim()) return;
    banUser(banTarget.email, banReason.trim());
    toast(`Banned ${banTarget.name}`, "info");
    setBanTarget(null);
    setBanReason("");
  };

  return (
    <>
      <h1 className="text-5xl md:text-6xl font-black uppercase leading-none mb-3">
        REPORTS
      </h1>
      <p className="font-medium mb-8">
        Profile reports submitted by users. Investigate, then resolve or
        escalate to a ban.
      </p>

      <div className="flex gap-3 mb-8 flex-wrap">
        {([
          ["open", `OPEN (${openCount})`],
          ["resolved", `RESOLVED (${resolvedCount})`],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`border-3 border-black px-4 py-2 font-bold uppercase text-xs shadow-[3px_3px_0_#000] transition-colors ${
              tab === key ? "bg-[#FFEB3B]" : "bg-white hover:bg-[#FFF8E7]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="bg-white border-4 border-dashed border-black p-12 text-center">
          <Flag
            className="w-10 h-10 mx-auto mb-3 text-[#666]"
            strokeWidth={3}
          />
          <p className="font-bold uppercase">
            {tab === "open"
              ? "No open reports — community is healthy"
              : "Nothing resolved yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((r) => (
            <div
              key={r.id}
              className="bg-white border-4 border-black p-5 shadow-[6px_6px_0_#000]"
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3 mb-4">
                <div className="min-w-0">
                  <p className="font-black uppercase text-lg break-words">
                    Reported: {r.reportedName}
                  </p>
                  <p className="font-medium text-xs text-[#666] break-all">
                    {r.reportedEmail}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p className="font-bold uppercase text-xs">
                    BY {r.reporterEmail}
                  </p>
                  <p className="font-medium text-xs text-[#666]">
                    {new Date(r.createdAt).toLocaleString()}
                  </p>
                  {r.resolvedAt && (
                    <div className="bg-[#C6FF00] border-2 border-black px-2 py-1 font-black uppercase text-[10px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" strokeWidth={3} />
                      RESOLVED {new Date(r.resolvedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
              <p className="font-medium italic border-l-4 border-black pl-3 mb-4 whitespace-pre-wrap">
                &ldquo;{r.reason}&rdquo;
              </p>
              {!r.resolvedAt && (
                <div className="flex flex-wrap gap-3">
                  <BrutalButton
                    variant="primary"
                    size="md"
                    onClick={() => {
                      resolveReport(r.id);
                      toast("Marked resolved", "success");
                    }}
                  >
                    MARK RESOLVED
                  </BrutalButton>
                  <BrutalButton
                    variant="danger"
                    size="md"
                    onClick={() =>
                      setBanTarget({
                        email: r.reportedEmail,
                        name: r.reportedName,
                      })
                    }
                  >
                    BAN REPORTED USER
                  </BrutalButton>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Ban confirm */}
      <BrutalModal
        open={!!banTarget}
        onClose={() => {
          setBanTarget(null);
          setBanReason("");
        }}
        title="BAN USER?"
        size="md"
      >
        {banTarget && (
          <p className="font-medium mb-4">
            Ban <strong>{banTarget.name}</strong> ({banTarget.email}).
            They&apos;ll be locked out immediately.
          </p>
        )}
        <BrutalTextarea
          label="REASON (REQUIRED)"
          value={banReason}
          onChange={(e) => setBanReason(e.target.value)}
          placeholder="What policy was violated?"
        />
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <BrutalButton
            variant="danger"
            size="lg"
            className="flex-1"
            disabled={!banReason.trim()}
            onClick={confirmBan}
          >
            BAN USER
          </BrutalButton>
          <BrutalButton
            variant="secondary"
            size="lg"
            onClick={() => {
              setBanTarget(null);
              setBanReason("");
            }}
          >
            CANCEL
          </BrutalButton>
        </div>
      </BrutalModal>
    </>
  );
}
