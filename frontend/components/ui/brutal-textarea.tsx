import { TextareaHTMLAttributes, forwardRef } from "react";

interface BrutalTextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helper?: string;
  showCount?: boolean;
  maxCount?: number;
}

export const BrutalTextarea = forwardRef<
  HTMLTextAreaElement,
  BrutalTextareaProps
>(
  (
    {
      label,
      helper,
      showCount,
      maxCount,
      maxLength,
      className = "",
      value,
      ...props
    },
    ref
  ) => {
    const currentCount = value ? String(value).length : 0;
    // If a counter cap is set without an explicit maxLength prop, enforce it
    // at the input level so the browser stops typing past the limit (matches
    // the visual counter — no more "12566/2000" mismatches).
    const effectiveMaxLength = maxLength ?? maxCount;

    return (
      <div className="w-full">
        {label && (
          <label className="block mb-2 font-bold uppercase text-sm">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          value={value}
          maxLength={effectiveMaxLength}
          className={`w-full bg-white border-4 border-black px-4 py-3 font-medium text-base shadow-[4px_4px_0_#000] min-h-[120px] focus:outline-none focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0_#000] transition-all ${className}`}
          {...props}
        />
        <div className="flex justify-between mt-2">
          {helper && <p className="text-sm font-medium">{helper}</p>}
          {showCount && (
            <p className="text-sm font-bold">
              {currentCount}
              {maxCount ? `/${maxCount}` : ""}
            </p>
          )}
        </div>
      </div>
    );
  }
);

BrutalTextarea.displayName = "BrutalTextarea";
