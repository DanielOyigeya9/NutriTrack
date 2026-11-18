import { cn } from "@/lib/utils";

const TONE_CLASSES = {
  green: "bg-forest",
  amber: "bg-amber",
  sky: "bg-sky",
  coral: "bg-coral",
  plum: "bg-plum",
  teal: "bg-teal",
  ink: "bg-ink",
} as const;

export type BarTone = keyof typeof TONE_CLASSES;

interface SegmentedBarProps {
  /** 0..1 */
  progress: number;
  segments?: number;
  tone?: BarTone;
  className?: string;
  size?: "sm" | "md" | "lg";
  ariaLabel?: string;
}

/** Chunky stepped progress bar — fills whole blocks, never a smooth gradient. */
export function SegmentedBar({
  progress,
  segments = 10,
  tone = "green",
  className,
  size = "md",
  ariaLabel,
}: SegmentedBarProps) {
  const safe = Number.isFinite(progress) ? progress : 0;
  const filled = Math.round(Math.min(1, Math.max(0, safe)) * segments);
  const heights = { sm: "h-2.5", md: "h-3.5", lg: "h-5" };

  return (
    <div
      className={cn("flex gap-[3px]", heights[size], className)}
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuenow={Math.round(safe * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {Array.from({ length: segments }).map((_, index) => (
        <span
          key={index}
          className={cn(
            "flex-1 rounded-[2px] border-[2px] border-edge",
            index < filled ? TONE_CLASSES[tone] : "bg-surface-3",
          )}
        />
      ))}
    </div>
  );
}
