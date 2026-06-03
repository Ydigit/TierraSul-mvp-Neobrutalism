"use client";

import { useEffect, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import { enGB } from "date-fns/locale";
import { format, isValid, parseISO } from "date-fns";
import { Calendar } from "lucide-react";

interface BrutalDatePickerProps {
  label?: string;
  helper?: string;
  /** ISO yyyy-MM-dd string, or "" for empty. */
  value: string;
  /** Receives ISO yyyy-MM-dd (or "" when cleared). */
  onChange: (iso: string) => void;
  /** ISO yyyy-MM-dd — selecting earlier dates is blocked. */
  min?: string;
  /** ISO yyyy-MM-dd — selecting later dates is blocked. */
  max?: string;
  placeholder?: string;
  required?: boolean;
}

/**
 * Brutalist date picker that always displays in dd/MM/yyyy regardless of OS
 * locale (audience is EU/LatAm). Built on react-day-picker with the en-GB
 * locale so week-start is Monday and labels match the format.
 */
export function BrutalDatePicker({
  label,
  helper,
  value,
  onChange,
  min,
  max,
  placeholder = "dd/mm/yyyy",
  required,
}: BrutalDatePickerProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Parse the ISO value into a Date for the calendar.
  const selectedDate = (() => {
    if (!value) return undefined;
    const d = parseISO(value);
    return isValid(d) ? d : undefined;
  })();

  const minDate = min ? parseISO(min) : undefined;
  const maxDate = max ? parseISO(max) : undefined;

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const display = selectedDate ? format(selectedDate, "dd/MM/yyyy") : "";

  return (
    <div ref={wrapRef} className="w-full relative">
      {label && (
        <label className="block mb-2 font-bold uppercase text-sm">
          {label}
          {required && " *"}
        </label>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full bg-white border-4 border-black px-4 py-3 font-bold uppercase text-sm shadow-[4px_4px_0_#000] focus:outline-none focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0_#000] transition-all flex items-center justify-between gap-3 text-left"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className={display ? "" : "text-[#999]"}>
          {display || placeholder}
        </span>
        <Calendar className="w-5 h-5 shrink-0" strokeWidth={3} />
      </button>

      {helper && (
        <p className="mt-2 font-medium text-xs text-[#666]">{helper}</p>
      )}

      {open && (
        <div
          role="dialog"
          className="absolute z-50 mt-2 left-0 bg-white border-4 border-black shadow-[6px_6px_0_#000] p-3"
        >
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={(d) => {
              if (!d) {
                onChange("");
              } else {
                onChange(format(d, "yyyy-MM-dd"));
              }
              setOpen(false);
            }}
            locale={enGB}
            weekStartsOn={1}
            disabled={[
              ...(minDate ? [{ before: minDate }] : []),
              ...(maxDate ? [{ after: maxDate }] : []),
            ]}
            classNames={{
              caption_label: "font-black uppercase text-sm",
              nav_button:
                "border-2 border-black bg-white hover:bg-[#FFEB3B] w-7 h-7 inline-flex items-center justify-center",
              head_cell: "font-black uppercase text-xs text-[#666] w-9 h-8",
              cell: "w-9 h-9",
              day: "w-9 h-9 font-bold text-sm hover:bg-[#FFEB3B] border-2 border-transparent transition-colors",
              day_selected:
                "bg-[#FFEB3B] border-2 border-black shadow-[2px_2px_0_#000]",
              day_disabled: "text-[#bbb] cursor-not-allowed hover:bg-white",
              day_today: "underline decoration-2 underline-offset-4",
            }}
          />
        </div>
      )}
    </div>
  );
}
