import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "primary" | "amber" | "sky" | "ghost" | "danger" | "plum";
type Size = "sm" | "md" | "lg" | "icon";

const VARIANTS: Record<Variant, string> = {
  default: "bg-surface text-body",
  primary: "bg-forest text-[#FFFBF1]",
  amber: "bg-amber text-ink",
  sky: "bg-sky text-[#0E2733]",
  plum: "bg-plum text-[#FFFBF1]",
  danger: "bg-coral text-[#FFFBF1]",
  ghost: "bg-transparent shadow-pixel-none hover:shadow-pixel-sm",
};

const SIZES: Record<Size, string> = {
  sm: "px-2.5 py-1 text-xs",
  md: "px-3.5 py-2 text-sm",
  lg: "px-4 py-2.5 text-base",
  icon: "h-9 w-9 p-0 text-base",
};

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children?: ReactNode;
}

export function PixelButton({
  variant = "default",
  size = "md",
  className,
  children,
  ...rest
}: PixelButtonProps) {
  return (
    <button className={cn("pixel-btn", VARIANTS[variant], SIZES[size], className)} {...rest}>
      {children}
    </button>
  );
}
