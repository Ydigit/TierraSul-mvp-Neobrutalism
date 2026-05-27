"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface BrutalModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  /** Disable closing via overlay click / escape (e.g. for irreversible flows) */
  dismissible?: boolean;
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-4xl",
};

export function BrutalModal({
  open,
  onClose,
  title,
  children,
  size = "md",
  dismissible = true,
}: BrutalModalProps) {
  useEffect(() => {
    if (!open || !dismissible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, dismissible, onClose]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[90] p-4 sm:p-6"
      onClick={dismissible ? onClose : undefined}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`bg-white border-4 border-black shadow-[12px_12px_0_#000] w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || dismissible) && (
          <div className="flex items-start justify-between gap-4 px-6 sm:px-8 pt-6 sm:pt-8">
            {title && (
              <div className="text-3xl sm:text-4xl font-black uppercase leading-none flex-1">
                {title}
              </div>
            )}
            {dismissible && (
              <button
                onClick={onClose}
                aria-label="Close"
                className="shrink-0 p-1 hover:bg-[#FFEB3B] border-2 border-black transition-colors"
              >
                <X className="w-6 h-6" strokeWidth={3} />
              </button>
            )}
          </div>
        )}
        <div className="px-6 sm:px-8 pt-6 pb-8">{children}</div>
      </div>
    </div>
  );
}
