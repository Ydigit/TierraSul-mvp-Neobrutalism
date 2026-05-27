import { ButtonHTMLAttributes } from "react";
import Link from "next/link";

type Variant = "primary" | "secondary" | "danger" | "black";
type Size = "sm" | "md" | "lg";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}

type BrutalButtonProps = CommonProps &
  (
    | ({ href: string } & Omit<
        React.AnchorHTMLAttributes<HTMLAnchorElement>,
        "href" | "className" | "children"
      >)
    | ({ href?: undefined } & Omit<
        ButtonHTMLAttributes<HTMLButtonElement>,
        "className" | "children"
      >)
  );

const baseClasses =
  "inline-block text-center border-4 border-black font-black uppercase tracking-tight transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 disabled:bg-[#E5E5E5] disabled:text-[#666] disabled:shadow-[4px_4px_0_#999] disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0_#999] aria-disabled:opacity-50 aria-disabled:cursor-not-allowed";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-[#FFEB3B] text-black shadow-[6px_6px_0_#000] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0_#000]",
  secondary:
    "bg-white text-black shadow-[6px_6px_0_#FF6B9D] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0_#FF6B9D]",
  danger:
    "bg-[#FF3B3B] text-white shadow-[4px_4px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#000]",
  black:
    "bg-black text-white shadow-[6px_6px_0_#FFEB3B] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0_#FFEB3B]",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-4 py-2 text-xs",
  md: "px-7 py-4 text-base",
  lg: "px-12 py-5 text-xl",
};

export function BrutalButton({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: BrutalButtonProps) {
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  if ("href" in rest && rest.href) {
    const { href, ...anchorProps } = rest;
    return (
      <Link href={href} className={classes} {...anchorProps}>
        {children}
      </Link>
    );
  }

  const buttonProps = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
