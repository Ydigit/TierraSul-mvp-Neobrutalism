"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { BrutalModal } from "../ui/brutal-modal";
import { BrutalButton } from "../ui/brutal-button";
import { BrutalInput } from "../ui/brutal-input";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { useToast } from "../ui/toast";
import type { Tour } from "./tour-card";
import { useRouter } from "next/navigation";

interface JoinModalProps {
  open: boolean;
  onClose: () => void;
  tour: Tour;
  /**
   * Number of operators who have already paid for contacts on this group.
   * Drives the Charge-on-Exit messaging variant when the tour is closed.
   */
  operatorsContacted?: number;
}

/** Pick the Charge-on-Exit copy block based on current tour state. */
function chargeOnExitMessage(
  tour: Tour,
  operatorsContacted: number
): { tone: "info" | "warning"; body: React.ReactNode } {
  if (tour.status !== "closed") {
    return {
      tone: "info",
      body: (
        <>
          <strong>Joining is free.</strong> You can leave anytime while the
          group is forming.
        </>
      ),
    };
  }
  if (operatorsContacted === 0) {
    return {
      tone: "info",
      body: (
        <>
          <strong>Joining is free.</strong> The group already closed but no
          operators have contacted yet — you can still leave at no cost.
        </>
      ),
    };
  }
  return {
    tone: "warning",
    body: (
      <>
        <strong>
          ⚠ Operators have already paid to contact this group.
        </strong>{" "}
        Joining is still free, but if you leave later you&apos;ll need to
        choose: pay a <strong>€5 exit fee</strong> OR allow continued data
        sharing with operators.
      </>
    ),
  };
}

export function JoinModal({
  open,
  onClose,
  tour,
  operatorsContacted = 0,
}: JoinModalProps) {
  const { user } = useAuth();
  const { joinTour } = useStore();
  const { toast } = useToast();
  const router = useRouter();
  const [sharePhone, setSharePhone] = useState(false);
  const [phone, setPhone] = useState("");

  if (!user) {
    return (
      <BrutalModal
        open={open}
        onClose={onClose}
        title={
          <span>
            JOIN{" "}
            <span className="bg-[#FF6B9D] px-2 border-3 border-black inline-block">
              {tour.title}
            </span>
          </span>
        }
        size="md"
      >
        <p className="font-medium mb-6">
          You need an account to join this group. We&apos;ll bring you back
          here right after.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <BrutalButton
            href={`/sign-up?next=${encodeURIComponent(`/tours/${tour.id}`)}`}
            variant="primary"
            size="lg"
            className="flex-1"
          >
            CREATE ACCOUNT
          </BrutalButton>
          <BrutalButton
            href={`/sign-in?next=${encodeURIComponent(`/tours/${tour.id}`)}`}
            variant="secondary"
            size="lg"
          >
            SIGN IN
          </BrutalButton>
        </div>
      </BrutalModal>
    );
  }

  const handleConfirm = () => {
    joinTour(tour.id, user.email, sharePhone, sharePhone ? phone : undefined);
    toast(`Joined ${tour.title}! Operators may contact you soon.`, "success");
    onClose();
    router.refresh();
  };

  return (
    <BrutalModal
      open={open}
      onClose={onClose}
      title={
        <span>
          JOIN{" "}
          <span className="bg-[#FF6B9D] px-2 border-3 border-black inline-block">
            {tour.title}
          </span>
        </span>
      }
      size="md"
    >
      {/* Charge-on-Exit messaging — picks one of 3 variants by tour state. */}
      {(() => {
        const msg = chargeOnExitMessage(tour, operatorsContacted);
        return (
          <div
            className={`border-4 border-black p-4 mb-6 shadow-[4px_4px_0_#000] ${
              msg.tone === "warning" ? "bg-[#FF6B9D] text-black" : "bg-[#FFF8E7]"
            }`}
          >
            <p className="font-medium text-sm">{msg.body}</p>
          </div>
        );
      })()}

      <p className="font-medium mb-6">
        Operators who pay to access this group will see:
      </p>

      <div className="space-y-3 mb-8">
        <div className="flex items-center gap-3">
          <Check className="w-5 h-5 text-[#00C853]" strokeWidth={3} />
          <span className="font-bold">Your name, country, age</span>
        </div>
        <div className="flex items-center gap-3">
          <Check className="w-5 h-5 text-[#00C853]" strokeWidth={3} />
          <span className="font-bold">Your email (required)</span>
        </div>
      </div>

      <div className="bg-[#FFEB3B] border-4 border-black p-6 mb-6">
        <h3 className="font-black uppercase mb-4">
          ★ SHARE PHONE FOR THIS TOUR?
        </h3>
        <label className="flex items-center gap-3 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={sharePhone}
            onChange={(e) => setSharePhone(e.target.checked)}
            className="w-6 h-6 border-3 border-black accent-black"
          />
          <span className="font-bold text-sm">
            YES, SHARE MY PHONE FOR THIS TOUR ONLY
          </span>
        </label>
        {sharePhone && (
          <BrutalInput
            type="tel"
            placeholder="+34 600 123 456"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <BrutalButton
          variant="primary"
          size="lg"
          className="flex-1"
          onClick={handleConfirm}
          disabled={sharePhone && phone.trim().length < 6}
        >
          CONFIRM AND JOIN
        </BrutalButton>
        <BrutalButton variant="secondary" size="lg" onClick={onClose}>
          CANCEL
        </BrutalButton>
      </div>
    </BrutalModal>
  );
}
