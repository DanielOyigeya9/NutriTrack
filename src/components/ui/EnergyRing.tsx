import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const TONE_CLASSES = {
  green: "fill-forest",
  amber: "fill-amber",
  sky: "fill-sky",
  coral: "fill-coral",
  plum: "fill-plum",
  teal: "fill-teal",
  ink: "fill-ink",
} as const;

export type RingTone = keyof typeof TONE_CLASSES;

interface EnergyRingProps {
  /** 0..1 (values above 1 render as a full ring plus an overflow accent) */
  progress: number;
  segments?: number;
  tone?: RingTone;
  children?: ReactNode;
  className?: string;
  /** extra segments highlighted in coral when progress > 1 */
  overflow?: boolean;
}

/**
 * A chunky 8-bit ring built from separate tick rects rather than a smooth arc,
 * so it reads as pixel art instead of a modern donut chart.
 */
export function EnergyRing({
  progress,
  segments = 28,
  tone = "green",
  children,
  className,
  overflow = false,
}: EnergyRingProps) {
  const safe = Number.isFinite(progress) ? progress : 0;
  const filled = Math.round(Math.min(1, Math.max(0, safe)) * segments);
  const isOver = safe > 1;

  return (
    <div className={cn("relative aspect-square w-full max-w-[190px]", className)}>
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden="true">
        <g transform="translate(50 50)">
          {Array.from({ length: segments }).map((_, index) => {
            const angle = (index / segments) * 360;
            const active = index < filled;
            return (
              <rect
                key={index}
                x={-1.6}
                y={-45}
                width={3.2}
                height={11}
                rx={1}
                transform={`rotate(${angle})`}
                className={cn(
                  "transition-[opacity] duration-200",
                  active ? TONE_CLASSES[tone] : "fill-ink/15",
                  overflow && isOver ? "stroke-none" : "",
                )}
              />
            );
          })}
        </g>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
        {children}
      </div>
    </div>
  );
}
