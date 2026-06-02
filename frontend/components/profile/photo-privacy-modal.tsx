"use client";

import { useState } from "react";
import Link from "next/link";
import { BrutalModal } from "@/components/ui/brutal-modal";
import { BrutalButton } from "@/components/ui/brutal-button";

const STORAGE_KEY = "tierrasul:photo-consent";

/** Has this account already consented to photo uploads? Survives reloads. */
export function hasPhotoConsent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function setPhotoConsent() {
  try {
    window.localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* quota or private mode — silently ignore */
  }
}

interface PhotoPrivacyModalProps {
  open: boolean;
  onClose: () => void;
  /** Called after the user accepts. */
  onAccept: () => void;
}

export function PhotoPrivacyModal({
  open,
  onClose,
  onAccept,
}: PhotoPrivacyModalProps) {
  const [checked, setChecked] = useState(false);

  const accept = () => {
    if (!checked) return;
    setPhotoConsent();
    onAccept();
  };

  return (
    <BrutalModal open={open} onClose={onClose} title="BEFORE YOU UPLOAD" size="md">
      <div className="space-y-5">
        <p className="font-medium">
          Photos you add to your profile are visible to other people inside
          TierraSul. Here&apos;s exactly who sees what:
        </p>

        <div className="bg-[#FFF8E7] border-3 border-black p-4 space-y-3 text-sm">
          <Row label="OTHER TRAVELERS IN YOUR GROUP">
            Avatar, first name + last initial, gallery, languages, bio.
          </Row>
          <Row label="TOUR OPERATORS BEFORE PURCHASE">
            Avatar only. They see &ldquo;Traveler #N&rdquo; — no name, no
            gallery, no email.
          </Row>
          <Row label="TOUR OPERATORS AFTER PURCHASE (1 CREDIT)">
            Everything above plus full name, age, bio, gallery, email — and
            phone if you opted to share it for that tour.
          </Row>
          <Row label="ADMIN">
            Everything. Used only to enforce community rules.
          </Row>
        </div>

        <div className="bg-[#FFEB3B] border-3 border-black p-4 space-y-2">
          <p className="font-black uppercase text-sm">★ IMPORTANT RULES</p>
          <ul className="font-medium text-sm space-y-1 list-disc list-inside">
            <li>Avoid photos that directly link to your real identity
              (social handles in frame, etc).</li>
            <li>Don&apos;t include other people without their consent.</li>
            <li>No nudity, violence, or inappropriate content.</li>
            <li>Violations can lead to account suspension.</li>
            <li>You can delete any photo at any time.</li>
            <li>Deleting your account removes every photo.</li>
          </ul>
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="w-6 h-6 border-4 border-black mt-1 shrink-0 accent-black"
          />
          <span className="font-bold text-sm">
            I&apos;ve read and accept the{" "}
            <Link href="/terms" className="underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline">
              Privacy Policy
            </Link>{" "}
            about photo uploads.
          </span>
        </label>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <BrutalButton
            variant="primary"
            size="lg"
            className="flex-1"
            onClick={accept}
            disabled={!checked}
          >
            I AGREE — UPLOAD PHOTOS
          </BrutalButton>
          <BrutalButton variant="secondary" size="lg" onClick={onClose}>
            CANCEL
          </BrutalButton>
        </div>
      </div>
    </BrutalModal>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-black uppercase text-xs mb-1">{label}</p>
      <p className="font-medium text-sm">{children}</p>
    </div>
  );
}
