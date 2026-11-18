import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function Chip({
  children,
  active,
  onClick,
  className,
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-pixel border-[3px] border-edge px-2.5 py-1 text-xs font-bold transition-transform",
        "shadow-pixel-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-pixel-none",
        active ? "bg-forest text-[#FFFBF1]" : "bg-surface text-body hover:bg-surface-2",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-pixel border-[3px] border-edge bg-surface px-3 py-2 text-left shadow-pixel-sm"
    >
      <span>
        <span className="block text-sm font-bold">{label}</span>
        {hint && <span className="block text-xs text-muted">{hint}</span>}
      </span>
      <span
        className={cn(
          "relative h-6 w-12 shrink-0 rounded-pixel border-[3px] border-edge",
          checked ? "bg-forest" : "bg-surface-3",
        )}
      >
        <span
          className={cn(
            "absolute top-[1px] h-4 w-4 rounded-[2px] border-[2px] border-edge bg-surface transition-all duration-150",
            checked ? "left-[26px]" : "left-[2px]",
          )}
        />
      </span>
    </button>
  );
}

export function Stepper({
  value,
  onChange,
  step = 1,
  min = 0,
  max = 99,
  suffix,
}: {
  value: number;
  onChange: (next: number) => void;
  step?: number;
  min?: number;
  max?: number;
  suffix?: string;
}) {
  const clamp = (n: number) => Math.min(max, Math.max(min, Number.isFinite(n) ? n : min));
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label="Decrease"
        onClick={() => onChange(clamp(Number((value - step).toFixed(2))))}
        className="flex h-9 w-9 items-center justify-center rounded-pixel border-[3px] border-edge bg-surface shadow-pixel-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-pixel-none"
      >
        <Minus size={16} />
      </button>
      <div className="min-w-[68px] rounded-pixel border-[3px] border-edge bg-surface-2 px-2 py-1.5 text-center font-pixel text-sm font-bold">
        {value}
        {suffix ? <span className="ml-1 text-2xs text-muted">{suffix}</span> : null}
      </div>
      <button
        type="button"
        aria-label="Increase"
        onClick={() => onChange(clamp(Number((value + step).toFixed(2))))}
        className="flex h-9 w-9 items-center justify-center rounded-pixel border-[3px] border-edge bg-surface shadow-pixel-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-pixel-none"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}

interface FieldShellProps {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

export function FieldShell({ label, hint, error, children, className }: FieldShellProps) {
  return (
    <label className={cn("block", className)}>
      <span className="pixel-label mb-1 block text-muted">{label}</span>
      {children}
      {error ? (
        <span className="mt-1 block text-xs font-bold text-coral-dark">{error}</span>
      ) : (
        hint && <span className="mt-1 block text-xs text-muted">{hint}</span>
      )}
    </label>
  );
}

const inputClass =
  "w-full rounded-pixel border-[3px] border-edge bg-surface px-3 py-2 text-sm font-semibold text-body shadow-pixel-in outline-none placeholder:text-muted/70 focus:bg-surface-2";

export function TextField({
  label,
  hint,
  error,
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; error?: string }) {
  return (
    <FieldShell label={label} hint={hint} error={error} className={className}>
      <input className={inputClass} {...rest} />
    </FieldShell>
  );
}

export function NumberField({
  label,
  hint,
  error,
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; error?: string }) {
  return (
    <FieldShell label={label} hint={hint} error={error} className={className}>
      <input type="number" className={cn(inputClass, "font-pixel")} {...rest} />
    </FieldShell>
  );
}

export function SelectField({
  label,
  hint,
  error,
  className,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <FieldShell label={label} hint={hint} error={error} className={className}>
      <select className={cn(inputClass, "appearance-none")} {...rest}>
        {children}
      </select>
    </FieldShell>
  );
}
