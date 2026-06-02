"use client";

import { useMemo, useState } from "react";
import { BrutalButton } from "@/components/ui/brutal-button";
import { BrutalModal } from "@/components/ui/brutal-modal";
import { BrutalTextarea } from "@/components/ui/brutal-textarea";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import { CheckCircle2 } from "lucide-react";

type Tab = "pending" | "reviewed";

export default function AdminModerationPhotosPage() {
  const {
    state,
    markPhotoReviewed,
    deletePhotoUploadEntry,
    banUser,
  } = useStore();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("pending");
  const [banTarget, setBanTarget] = useState<{
    email: string;
    name: string;
  } | null>(null);
  const [banReason, setBanReason] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleteReason, setDeleteReason] = useState("");

  const rows = useMemo(() => {
    const filtered =
      tab === "pending"
        ? state.photoUploadLog.filter((p) => !p.reviewedAt)
        : state.photoUploadLog.filter((p) => p.reviewedAt);
    return filtered;
  }, [state.photoUploadLog, tab]);

  const pendingCount = state.photoUploadLog.filter((p) => !p.reviewedAt).length;
  const reviewedCount = state.photoUploadLog.length - pendingCount;

  const confirmDelete = () => {
    if (!deleteTarget || !deleteReason.trim()) return;
    deletePhotoUploadEntry(deleteTarget);
    toast(`Photo deleted (logged: ${deleteReason.trim()})`, "info");
    setDeleteTarget(null);
    setDeleteReason("");
  };

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
        PHOTO REVIEW
      </h1>
      <p className="font-medium mb-8">
        Recent uploads. Marking as reviewed is for tracking only — it does not
        block or approve. Delete or ban for violations.
      </p>

      <div className="flex gap-3 mb-8 flex-wrap">
        {([
          ["pending", `PENDING (${pendingCount})`],
          ["reviewed", `REVIEWED (${reviewedCount})`],
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
          <p className="font-bold uppercase">
            {tab === "pending" ? "No pending uploads" : "No reviewed uploads yet"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {rows.map((p) => (
            <div
              key={p.id}
              className="bg-white border-4 border-black shadow-[6px_6px_0_#000] overflow-hidden flex flex-col"
            >
              <div className="aspect-square bg-[#FFF8E7] relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.photoUrl}
                  alt={`Upload by ${p.userName}`}
                  className="w-full h-full object-cover"
                />
                {p.reviewedAt && (
                  <div className="absolute top-2 right-2 bg-[#C6FF00] border-2 border-black px-2 py-1 font-black uppercase text-[10px] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" strokeWidth={3} />
                    REVIEWED
                  </div>
                )}
              </div>
              <div className="p-3 flex-1 flex flex-col gap-3">
                <div>
                  <p className="font-black uppercase text-sm truncate">
                    {p.userName}
                  </p>
                  <p className="font-medium text-xs text-[#666] truncate">
                    {p.userEmail}
                  </p>
                  <p className="font-medium text-xs text-[#666] mt-1">
                    {new Date(p.uploadedAt).toLocaleString()}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-auto">
                  {!p.reviewedAt && (
                    <button
                      type="button"
                      onClick={() => {
                        markPhotoReviewed(p.id);
                        toast("Marked as reviewed", "success");
                      }}
                      className="bg-[#C6FF00] border-2 border-black px-2 py-1.5 font-bold uppercase text-[10px] shadow-[2px_2px_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_#000] transition-all"
                    >
                      ✓ REVIEW
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(p.id)}
                    className={`bg-[#FF3B3B] text-white border-2 border-black px-2 py-1.5 font-bold uppercase text-[10px] shadow-[2px_2px_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_#000] transition-all ${
                      p.reviewedAt ? "col-start-2" : ""
                    }`}
                  >
                    DELETE
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setBanTarget({ email: p.userEmail, name: p.userName })
                    }
                    className="bg-black text-white border-2 border-black px-2 py-1.5 font-bold uppercase text-[10px] shadow-[2px_2px_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_#000] transition-all"
                  >
                    BAN
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirm */}
      <BrutalModal
        open={!!deleteTarget}
        onClose={() => {
          setDeleteTarget(null);
          setDeleteReason("");
        }}
        title="DELETE PHOTO?"
        size="md"
      >
        <p className="font-medium mb-4">
          This removes the upload from the queue and logs the reason. The
          underlying user gallery is owned by the user — they keep control too.
        </p>
        <BrutalTextarea
          label="REASON (REQUIRED)"
          value={deleteReason}
          onChange={(e) => setDeleteReason(e.target.value)}
          placeholder="Why is this being removed?"
        />
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <BrutalButton
            variant="danger"
            size="lg"
            className="flex-1"
            disabled={!deleteReason.trim()}
            onClick={confirmDelete}
          >
            DELETE
          </BrutalButton>
          <BrutalButton
            variant="secondary"
            size="lg"
            onClick={() => {
              setDeleteTarget(null);
              setDeleteReason("");
            }}
          >
            CANCEL
          </BrutalButton>
        </div>
      </BrutalModal>

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
