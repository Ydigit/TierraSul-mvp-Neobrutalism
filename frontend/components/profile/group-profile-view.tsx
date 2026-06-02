"use client";

import { useState } from "react";
import { User } from "lucide-react";
import { BrutalModal } from "@/components/ui/brutal-modal";
import { BrutalButton } from "@/components/ui/brutal-button";
import { BrutalTextarea } from "@/components/ui/brutal-textarea";
import { useToast } from "@/components/ui/toast";
import type { AuthUser } from "@/lib/auth";
import {
  displayName,
  visibilityFor,
  type ProfileViewContext,
} from "@/lib/profile-view";

/** Extra fields the admin panel can surface — never shown to other contexts. */
export interface AdminProfileMeta {
  joined?: string;
  lastLogin?: string;
  ipCountry?: string;
  toursCount?: number;
  banReason?: string;
}

interface GroupProfileViewProps {
  open: boolean;
  onClose: () => void;
  user: AuthUser;
  context: ProfileViewContext;
  /** Required when context === "OPERATOR_PREVIEW". 1-based. */
  previewIndex?: number;
  /**
   * For OPERATOR_PURCHASED only: whether the traveler opted to share their
   * phone for this specific tour. Parent decides — modal just renders.
   */
  phoneSharedForTour?: boolean;
  /** Admin-only metadata. Rendered only when context === "ADMIN". */
  adminMeta?: AdminProfileMeta;
  /** Optional report handler. If absent, the report link won't render. */
  onReport?: (reason: string) => void;
}

export function GroupProfileView({
  open,
  onClose,
  user,
  context,
  previewIndex,
  phoneSharedForTour = false,
  adminMeta,
  onReport,
}: GroupProfileViewProps) {
  const vis = visibilityFor(context);
  const name = displayName(user.name, context, { previewIndex });
  const [reportOpen, setReportOpen] = useState(false);

  return (
    <>
      <BrutalModal open={open} onClose={onClose} title={name} size="md">
        <div className="space-y-6">
          {/* Avatar + header */}
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24 bg-[#FFEB3B] border-4 border-black flex items-center justify-center shrink-0 overflow-hidden">
              {vis.showAvatar && user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt={`${name} avatar`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12" strokeWidth={3} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-2xl font-black uppercase break-words">
                {name}
              </h3>
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-sm">
                {vis.showCountry && user.country && (
                  <span className="font-bold uppercase">
                    {user.country}
                  </span>
                )}
                {vis.showAge && user.age && (
                  <span className="font-medium text-[#666]">{user.age}y</span>
                )}
              </div>
            </div>
          </div>

          {/* Languages */}
          {vis.showLanguages && user.languages && user.languages.length > 0 && (
            <div>
              <p className="font-bold uppercase text-xs mb-2">SPEAKS</p>
              <div className="flex flex-wrap gap-2">
                {user.languages.map((l) => (
                  <span
                    key={l}
                    className="border-3 border-black px-3 py-1 font-bold uppercase text-xs bg-[#00E5FF] shadow-[2px_2px_0_#000]"
                  >
                    {l}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Bio */}
          {vis.showBio && user.bio && (
            <div>
              <p className="font-bold uppercase text-xs mb-2">ABOUT</p>
              <p className="font-medium whitespace-pre-wrap">{user.bio}</p>
            </div>
          )}

          {/* Gallery */}
          {vis.showGallery && user.photos && user.photos.length > 0 && (
            <div>
              <p className="font-bold uppercase text-xs mb-2">GALLERY</p>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {user.photos.map((src, i) => (
                  <div
                    key={i}
                    className="relative aspect-square border-3 border-black shadow-[3px_3px_0_#000] overflow-hidden bg-[#FFF8E7]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`${name} photo ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* City line (admin / purchased operator can see) */}
          {(context === "ADMIN" || context === "OPERATOR_PURCHASED") &&
            user.city && (
              <p className="font-medium text-sm">
                <span className="font-bold uppercase text-xs text-[#666] mr-2">
                  CITY:
                </span>
                {user.city}
              </p>
            )}

          {/* Operator company block — visible to admins & post-purchase ops */}
          {user.role === "operator" &&
            (context === "ADMIN" || context === "OPERATOR_PURCHASED") && (
              <div className="bg-[#FFEB3B] border-3 border-black p-4 space-y-2">
                <p className="font-black uppercase text-xs">★ COMPANY</p>
                {user.companyName && (
                  <p className="font-bold text-sm">
                    <span className="font-medium uppercase text-xs text-[#666] mr-2">
                      NAME:
                    </span>
                    {user.companyName}
                  </p>
                )}
                {user.website && (
                  <p className="font-bold text-sm break-all">
                    <span className="font-medium uppercase text-xs text-[#666] mr-2">
                      WEBSITE:
                    </span>
                    <a
                      href={user.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      {user.website}
                    </a>
                  </p>
                )}
                {user.description && (
                  <p className="font-medium text-sm">
                    <span className="font-bold uppercase text-xs text-[#666] mr-2">
                      DESCRIPTION:
                    </span>
                    {user.description}
                  </p>
                )}
              </div>
            )}

          {/* Contact info — only visible to operators who paid & to admins */}
          {(vis.showEmail || vis.showPhone) && (
            <div className="bg-[#FFF8E7] border-3 border-black p-4">
              <p className="font-black uppercase text-xs mb-3">★ CONTACT</p>
              <div className="space-y-2">
                {vis.showEmail && (
                  <p className="font-bold text-sm break-all">
                    <span className="font-medium uppercase text-xs text-[#666] mr-2">
                      EMAIL:
                    </span>
                    {user.email}
                  </p>
                )}
                {vis.showPhone &&
                  (phoneSharedForTour || context === "ADMIN") &&
                  user.phone && (
                    <p className="font-bold text-sm">
                      <span className="font-medium uppercase text-xs text-[#666] mr-2">
                        PHONE:
                      </span>
                      {user.phone}
                    </p>
                  )}
                {vis.showPhone &&
                  context === "OPERATOR_PURCHASED" &&
                  !phoneSharedForTour && (
                    <p className="font-medium text-xs text-[#666] italic">
                      Phone not shared for this tour.
                    </p>
                  )}
              </div>
            </div>
          )}

          {/* Admin-only metadata — visible operationally for moderation work. */}
          {context === "ADMIN" && adminMeta && (
            <div className="bg-black text-white border-3 border-black p-4 space-y-2">
              <p className="font-black uppercase text-xs text-[#FFEB3B]">
                ★ ADMIN VIEW
              </p>
              {user.status === "banned" && adminMeta.banReason && (
                <p className="bg-[#FF3B3B] border-2 border-black px-2 py-1 font-bold uppercase text-xs">
                  ⚠ BANNED: {adminMeta.banReason}
                </p>
              )}
              <AdminRow label="ROLE" value={user.role.toUpperCase()} />
              {adminMeta.joined && (
                <AdminRow label="JOINED" value={adminMeta.joined} />
              )}
              {adminMeta.lastLogin && (
                <AdminRow label="LAST LOGIN" value={adminMeta.lastLogin} />
              )}
              {adminMeta.ipCountry && (
                <AdminRow label="LAST IP" value={adminMeta.ipCountry} />
              )}
              {adminMeta.toursCount !== undefined &&
                user.role === "traveler" && (
                  <AdminRow
                    label="TOURS JOINED"
                    value={String(adminMeta.toursCount)}
                  />
                )}
              <AdminRow
                label="EMAIL VERIFIED"
                value={user.emailVerified ? "YES" : "NO"}
              />
            </div>
          )}

          {/* Report — bottom of the modal */}
          {vis.canReport && onReport && (
            <div className="pt-4 border-t-3 border-black text-center">
              <button
                type="button"
                onClick={() => setReportOpen(true)}
                className="font-bold uppercase text-xs text-[#FF3B3B] hover:underline"
              >
                ⚠ REPORT THIS PROFILE
              </button>
            </div>
          )}
        </div>
      </BrutalModal>

      {onReport && (
        <ReportModal
          open={reportOpen}
          onClose={() => setReportOpen(false)}
          onSubmit={(reason) => {
            onReport(reason);
            setReportOpen(false);
          }}
        />
      )}
    </>
  );
}

/* ---------------------------------------------------------------- */

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

function ReportModal({ open, onClose, onSubmit }: ReportModalProps) {
  const { toast } = useToast();
  const [reason, setReason] = useState("");

  const submit = () => {
    const r = reason.trim();
    if (r.length < 5) {
      toast("Tell us a bit more (min 5 characters)", "error");
      return;
    }
    onSubmit(r);
    setReason("");
    toast("Report sent. Admin will review.", "success");
  };

  return (
    <BrutalModal open={open} onClose={onClose} title="REPORT PROFILE" size="sm">
      <p className="font-medium text-sm mb-4">
        Tell us what&apos;s wrong with this profile. Admin will review and take
        action if needed.
      </p>
      <BrutalTextarea
        label="REASON"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="What's going on?"
        rows={5}
      />
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <BrutalButton
          variant="danger"
          size="lg"
          className="flex-1"
          onClick={submit}
        >
          SEND REPORT
        </BrutalButton>
        <BrutalButton variant="secondary" size="lg" onClick={onClose}>
          CANCEL
        </BrutalButton>
      </div>
    </BrutalModal>
  );
}

function AdminRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="font-mono text-sm break-all">
      <span className="font-bold uppercase text-xs text-[#FFEB3B] mr-2">
        {label}:
      </span>
      {value}
    </p>
  );
}
