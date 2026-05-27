import { InputHTMLAttributes, forwardRef } from "react";

interface BrutalInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helper?: string;
}

export const BrutalInput = forwardRef<HTMLInputElement, BrutalInputProps>(
  ({ label, helper, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block mb-2 font-bold uppercase text-sm">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full bg-white border-4 border-black px-4 py-3 font-bold text-base shadow-[4px_4px_0_#000] focus:outline-none focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0_#000] transition-all ${className}`}
          {...props}
        />
        {helper && <p className="mt-2 text-sm font-medium">{helper}</p>}
      </div>
    );
  }
);

BrutalInput.displayName = "BrutalInput";
