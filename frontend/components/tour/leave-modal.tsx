"use client";

import { useEffect, useState } from "react";
import { BrutalModal } from "../ui/brutal-modal";
import { BrutalButton } from "../ui/brutal-button";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { useToast } from "../ui/toast";
import { useRouter } from "next/navigation";
import type { Tour } from "./tour-card";

interface LeaveModalProps {
  open: boolean;
  onClose: () => void;
  tour: Tour;
  /**
   * Number of operators who have already purchased contacts. When ≥ 1 and
   * the tour is closed, the leave flow forks into the €5 OR data-share
   * choice (Charge-on-Exit, v2.0 product spec).
   */
  operatorsContacted?: number;
}

/**
 * 3 visual variants by tour status × operator interest:
 *   A — Tour OPEN          → "Are you sure?" + leave/cancel
 *   B — CLOSED, 0 ops      → soft warning about possible reopen / deficit
 *   C — CLOSED, ≥ 1 ops    → radio choice: €5 exit fee OR free + data share
 *
 * The 5-day-to-start block is enforced at the call site (the Leave button is
 * disabled and the modal never opens).
 */
type LeaveChoice = "pay" | "share-data";

export function LeaveModal({
  open,
  onClose,
  tour,
  operatorsContacted = 0,
}: LeaveModalProps) {
  const { user } = useAuth();
  const { leaveTour } = useStore();
  const { toast } = useToast();
  const router = useRouter();
  const [choice, setChoice] = useState<LeaveChoice | null>(null);

  // Cancel = discard: clear the radio selection on any close path. Explicit
  // setChoice(null) was already wired on the Cancel button; this covers Esc
  // and backdrop dismissals too.
  useEffect(() => {
    if (!open) setChoice(null);
  }, [open]);

  if (!user) return null;

  const variant: "open" | "closed-no-ops" | "closed-with-ops" = (() => {
    if (tour.status !== "closed") return "open";
    return operatorsContacted > 0 ? "closed-with-ops" : "closed-no-ops";
  })();

  const handleLeave = (paid: boolean) => {
    leaveTour(tour.id, user.email);
    toast(
      paid
        ? "You left the group. €5 exit fee charged."
        : "You left the group.",
      "info"
    );
    setChoice(null);
    onClose();
    router.refresh();
  };

  // ── Variant A ─────────────────────────────────────────────────────────
  if (variant === "open") {
    return (
      <BrutalModal
        open={open}
        onClose={onClose}
        title={`LEAVE ${tour.title}?`}
        size="sm"
      >
        <p className="font-medium mb-8">
          Are you sure you want to leave this group?
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <BrutalButton variant="secondary" size="lg" onClick={onClose}>
            CANCEL
          </BrutalButton>
          <BrutalButton
            variant="danger"
            size="lg"
            className="flex-1"
            onClick={() => handleLeave(false)}
          >
            YES, LEAVE
          </BrutalButton>
        </div>
      </BrutalModal>
    );
  }

  // ── Variant B ─────────────────────────────────────────────────────────
  if (variant === "closed-no-ops") {
    return (
      <BrutalModal
        open={open}
        onClose={onClose}
        title={`LEAVE ${tour.title}?`}
        size="md"
      >
        <div className="bg-[#FFEB3B] border-4 border-black p-5 mb-6">
          <p className="font-medium text-sm">
            This group already closed but no operators have contacted yet.
            Depending on how much the group drops below minimum, it may stay
            closed or reopen.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <BrutalButton variant="secondary" size="lg" onClick={onClose}>
            CANCEL
          </BrutalButton>
          <BrutalButton
            variant="danger"
            size="lg"
            className="flex-1"
            onClick={() => handleLeave(false)}
          >
            YES, LEAVE
          </BrutalButton>
        </div>
      </BrutalModal>
    );
  }

  // ── Variant C ─────────────────────────────────────────────────────────
  return (
    <BrutalModal
      open={open}
      onClose={onClose}
      title={`LEAVE ${tour.title}?`}
      size="md"
    >
      <div className="bg-[#FF6B9D] border-4 border-black p-5 mb-6">
        <p className="font-black uppercase text-sm">
          ⚠ {operatorsContacted}{" "}
          {operatorsContacted === 1 ? "operator has" : "operators have"} already
          paid to contact this group.
        </p>
        <p className="font-medium text-sm mt-2">
          Choose how to leave:
        </p>
      </div>

      <fieldset className="space-y-3 mb-6">
        <legend className="sr-only">Exit option</legend>

        <label
          htmlFor="leave-choice-pay"
          className={`block border-4 border-black p-4 cursor-pointer transition-all ${
            choice === "pay"
              ? "bg-[#FFEB3B] shadow-[4px_4px_0_#000]"
              : "bg-white hover:bg-[#FFF8E7]"
          }`}
        >
          <div className="flex items-start gap-3">
            <input
              id="leave-choice-pay"
              type="radio"
              name="leave-choice"
              value="pay"
              checked={choice === "pay"}
              onChange={() => setChoice("pay")}
              className="w-5 h-5 mt-1 accent-black"
            />
            <div className="flex-1 min-w-0">
              <p className="font-black uppercase text-sm">PAY €5 EXIT FEE</p>
              <p className="font-medium text-xs mt-1">
                Removes your data from operators who haven&apos;t contacted you
                yet.
              </p>
            </div>
          </div>
        </label>

        <label
          htmlFor="leave-choice-share"
          className={`block border-4 border-black p-4 cursor-pointer transition-all ${
            choice === "share-data"
              ? "bg-[#FFEB3B] shadow-[4px_4px_0_#000]"
              : "bg-white hover:bg-[#FFF8E7]"
          }`}
        >
          <div className="flex items-start gap-3">
            <input
              id="leave-choice-share"
              type="radio"
              name="leave-choice"
              value="share-data"
              checked={choice === "share-data"}
              onChange={() => setChoice("share-data")}
              className="w-5 h-5 mt-1 accent-black"
            />
            <div className="flex-1 min-w-0">
              <p className="font-black uppercase text-sm">
                FREE EXIT WITH DATA SHARING
              </p>
              <p className="font-medium text-xs mt-1">
                All operators (current and future) keep your contact data for
                this tour.
              </p>
            </div>
          </div>
        </label>
      </fieldset>

      <div className="flex flex-col sm:flex-row gap-3">
        <BrutalButton
          variant="secondary"
          size="lg"
          onClick={() => {
            setChoice(null);
            onClose();
          }}
        >
          CANCEL
        </BrutalButton>
        <BrutalButton
          variant="danger"
          size="lg"
          className="flex-1"
          disabled={choice === null}
          onClick={() => handleLeave(choice === "pay")}
        >
          CONFIRM EXIT
        </BrutalButton>
      </div>
    </BrutalModal>
  );
}
