import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface StatItem {
  label: string;
  value: ReactNode;
  hint?: string;
  emoji?: string;
  tone?: "default" | "green" | "amber" | "sky" | "plum" | "coral" | "teal";
}

const TONES: Record<NonNullable<StatItem["tone"]>, string> = {
  default: "bg-surface",
  green: "bg-forest/10",
  amber: "bg-amber/15",
  sky: "bg-sky/15",
  plum: "bg-plum/15",
  coral: "bg-coral/15",
  teal: "bg-teal/15",
};

export function StatGrid({ items, columns = 3 }: { items: StatItem[]; columns?: 2 | 3 | 4 }) {
  const gridClass = {
    2: "grid-cols-2",
    3: "grid-cols-2 sm:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-4",
  }[columns];

  return (
    <div className={cn("grid gap-2", gridClass)}>
      {items.map((item) => (
        <div
          key={item.label}
          className={cn(
            "rounded-pixel border-[3px] border-edge px-2.5 py-2 shadow-pixel-sm",
            TONES[item.tone ?? "default"],
          )}
        >
          <div className="flex items-center gap-1.5">
            {item.emoji && <span className="text-sm leading-none">{item.emoji}</span>}
            <span className="pixel-label text-muted">{item.label}</span>
          </div>
          <div className="mt-0.5 font-pixel text-lg font-bold leading-tight">{item.value}</div>
          {item.hint && <div className="text-2xs text-muted">{item.hint}</div>}
        </div>
      ))}
    </div>
  );
}
