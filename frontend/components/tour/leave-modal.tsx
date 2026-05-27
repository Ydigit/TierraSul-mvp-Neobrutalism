"use client";

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
   * Whether at least one operator has already purchased contacts for this group.
   * Used to surface the €10 leave fee for closed groups in the spec.
   */
  operatorsContacted?: number;
}

/**
 * 3 visual variants depending on tour status & operator interest:
 *  - Tour OPEN: simple "Are you sure?" confirmation
 *  - Tour CLOSED, 0 operators: warning that group may reopen
 *  - Tour CLOSED, ≥1 operators: explicit pay-or-share-data choice
 */
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

  if (!user) return null;

  const variant: "open" | "closed-no-ops" | "closed-with-ops" = (() => {
    if (tour.status !== "closed") return "open";
    return operatorsContacted > 0 ? "closed-with-ops" : "closed-no-ops";
  })();

  const handleLeave = (paid: boolean) => {
    leaveTour(tour.id, user.email);
    toast(
      paid
        ? "You left the group. €10 fee applied."
        : "You left the group.",
      "info"
    );
    onClose();
    router.refresh();
  };

  if (variant === "open") {
    return (
      <BrutalModal
        open={open}
        onClose={onClose}
        title={`LEAVE ${tour.title}?`}
        size="sm"
      >
        <p className="font-medium mb-8">
          You can rejoin while the group has open spots. Your data will be
          removed from this tour.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <BrutalButton
            variant="danger"
            size="lg"
            className="flex-1"
            onClick={() => handleLeave(false)}
          >
            YES, LEAVE
          </BrutalButton>
          <BrutalButton variant="secondary" size="lg" onClick={onClose}>
            CANCEL
          </BrutalButton>
        </div>
      </BrutalModal>
    );
  }

  if (variant === "closed-no-ops") {
    return (
      <BrutalModal
        open={open}
        onClose={onClose}
        title={`LEAVE ${tour.title}?`}
        size="md"
      >
        <div className="bg-[#FFEB3B] border-4 border-black p-5 mb-6">
          <p className="font-bold uppercase text-sm">
            ⚠️ This group is CLOSED.
          </p>
          <p className="font-medium text-sm mt-2">
            If your departure drops members below the minimum, the group may
            re-open and lose its priority.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <BrutalButton
            variant="danger"
            size="lg"
            className="flex-1"
            onClick={() => handleLeave(false)}
          >
            LEAVE ANYWAY
          </BrutalButton>
          <BrutalButton variant="secondary" size="lg" onClick={onClose}>
            STAY IN GROUP
          </BrutalButton>
        </div>
      </BrutalModal>
    );
  }

  // closed-with-ops: pay or share data
  return (
    <BrutalModal
      open={open}
      onClose={onClose}
      title={`LEAVE ${tour.title}?`}
      size="md"
    >
      <div className="bg-[#FF6B9D] border-4 border-black p-5 mb-6">
        <p className="font-black uppercase text-sm">
          ⚠️ {operatorsContacted}{" "}
          {operatorsContacted === 1 ? "operator has" : "operators have"} already
          paid to contact this group.
        </p>
        <p className="font-medium text-sm mt-2">
          To leave, choose one option below:
        </p>
      </div>

      <div className="space-y-4 mb-6">
        <div className="border-4 border-black p-5">
          <h3 className="font-black uppercase text-base mb-2">
            OPTION A — PAY €10
          </h3>
          <p className="font-medium text-sm mb-4">
            Compensates operators for the unfulfilled contact. Your data is
            removed immediately.
          </p>
          <BrutalButton
            variant="primary"
            size="md"
            className="w-full"
            onClick={() => handleLeave(true)}
          >
            PAY €10 AND LEAVE
          </BrutalButton>
        </div>

        <div className="border-4 border-black p-5">
          <h3 className="font-black uppercase text-base mb-2">
            OPTION B — FREE (DATA STAYS)
          </h3>
          <p className="font-medium text-sm mb-4">
            Operators who already paid keep your contact for this tour. You
            won&apos;t be a member anymore.
          </p>
          <BrutalButton
            variant="secondary"
            size="md"
            className="w-full"
            onClick={() => handleLeave(false)}
          >
            LEAVE FREE (KEEP DATA SHARED)
          </BrutalButton>
        </div>
      </div>

      <BrutalButton
        variant="secondary"
        size="md"
        className="w-full"
        onClick={onClose}
      >
        CANCEL
      </BrutalButton>
    </BrutalModal>
  );
}
