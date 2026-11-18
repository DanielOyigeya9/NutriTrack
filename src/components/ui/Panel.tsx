import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "default" | "green" | "amber" | "sky" | "plum" | "coral" | "plain";

const TONES: Record<Tone, string> = {
  default: "bg-surface",
  plain: "bg-surface-2",
  green: "bg-forest/10",
  amber: "bg-amber/15",
  sky: "bg-sky/15",
  plum: "bg-plum/15",
  coral: "bg-coral/15",
};

interface PanelProps {
  children: ReactNode;
  className?: string;
  tone?: Tone;
  /** adds a header row */
  title?: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  /** disable the hard drop shadow (for nested panels) */
  flat?: boolean;
}

export function Panel({
  children,
  className,
  tone = "default",
  title,
  subtitle,
  icon,
  action,
  flat,
}: PanelProps) {
  return (
    <section
      className={cn(
        "relative rounded-pixel border-[3px] border-edge",
        flat ? "shadow-pixel-sm" : "shadow-pixel",
        TONES[tone],
        className,
      )}
    >
      {(title || action) && (
        <header className="flex items-start justify-between gap-3 border-b-[3px] border-edge px-4 py-3">
          <div className="flex items-center gap-2">
            {icon && <span className="text-lg leading-none">{icon}</span>}
            <div>
              <h2 className="text-[15px] leading-tight">{title}</h2>
              {subtitle && <p className="text-xs font-semibold text-muted">{subtitle}</p>}
            </div>
          </div>
          {action}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

export function SectionTitle({
  children,
  hint,
  action,
}: {
  children: ReactNode;
  hint?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
      <div className="flex items-end gap-3">
        <h2 className="text-xl leading-none">{children}</h2>
        {hint && <span className="pixel-label pb-0.5 text-muted">{hint}</span>}
      </div>
      {action}
    </div>
  );
}

export function StatChip({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  tone?: Tone;
}) {
  return (
    <div
      className={cn(
        "rounded-pixel border-[3px] border-edge px-2.5 py-1.5 shadow-pixel-sm",
        TONES[tone],
      )}
    >
      <div className="pixel-label text-muted">{label}</div>
      <div className="font-pixel text-sm font-bold">{value}</div>
    </div>
  );
}
