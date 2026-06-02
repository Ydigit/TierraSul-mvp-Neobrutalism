"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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

const MENU_WIDTH = 200;
const MENU_GAP = 6;
const ROW_HEIGHT = 36;

/**
 * Action menu (3-dot) whose dropdown is rendered through a portal so it
 * never gets clipped by table/card `overflow-hidden` parents. The menu
 * opens upward when there isn't enough room below the trigger.
 */
export function ActionMenu({
  items,
  ariaLabel = "Actions",
}: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const computePos = () => {
    const btn = btnRef.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const menuH = items.length * ROW_HEIGHT + 12;
    const spaceBelow = window.innerHeight - r.bottom;
    const openUp = spaceBelow < menuH + MENU_GAP && r.top > menuH + MENU_GAP;
    const top = openUp ? r.top - menuH - MENU_GAP : r.bottom + MENU_GAP;
    // Right-align to the button so the menu hugs the edge that contains it.
    const left = Math.max(
      8,
      Math.min(r.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - 8)
    );
    setPos({ top, left });
  };

  useLayoutEffect(() => {
    if (!open) return;
    computePos();
    const onScroll = () => computePos();
    const onResize = () => computePos();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
    // computePos depends only on refs/state captured each frame; safe to omit
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const click = (e: MouseEvent) => {
      const target = e.target as Node;
      if (btnRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
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
    <>
      <button
        ref={btnRef}
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

      {mounted && open && pos &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              width: MENU_WIDTH,
              zIndex: 1000,
            }}
            className="bg-white border-3 border-black shadow-[4px_4px_0_#000] py-1"
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
          </div>,
          document.body
        )}
    </>
  );
}
