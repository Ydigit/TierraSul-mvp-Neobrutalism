"use client";

import { useEffect, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";

export interface ActionItem {
  label: string;
  onClick: () => void;
  destructive?: boolean;
}

interface ActionMenuProps {
  items: ActionItem[];
  ariaLabel?: string;
}

export function ActionMenu({
  items,
  ariaLabel = "Actions",
}: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const click = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", click);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", click);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        aria-label={ariaLabel}
        aria-haspopup="true"
        aria-expanded={open}
        className="bg-white border-3 border-black p-2 hover:bg-[#FFEB3B] transition-colors"
      >
        <MoreVertical className="w-4 h-4" strokeWidth={3} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 min-w-[180px] bg-white border-3 border-black shadow-[4px_4px_0_#000] py-1 z-30"
        >
          {items.map((item, i) => (
            <button
              key={i}
              role="menuitem"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                item.onClick();
              }}
              className={`block w-full text-left px-4 py-2 font-bold uppercase text-xs hover:bg-[#FFEB3B] transition-colors ${
                item.destructive ? "text-[#FF3B3B]" : ""
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
