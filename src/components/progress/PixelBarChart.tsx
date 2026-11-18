import { cn } from "@/lib/utils";

export interface BarDatum {
  key: string;
  label: string;
  value: number;
  highlight?: boolean;
}

const FILL: Record<string, string> = {
  forest: "bg-forest",
  amber: "bg-amber",
  sky: "bg-sky",
  coral: "bg-coral",
  plum: "bg-plum",
  teal: "bg-teal",
};

export type BarTone = keyof typeof FILL;

interface PixelBarChartProps {
  bars: BarDatum[];
  goal?: number;
  tone?: BarTone;
  height?: number;
  formatValue?: (value: number) => string;
  goalLabel?: string;
}

/** A chunky stepped column chart — whole pixel blocks, no smooth curves. */
export function PixelBarChart({
  bars,
  goal = 0,
  tone = "forest",
  height = 150,
  formatValue,
  goalLabel = "goal",
}: PixelBarChartProps) {
  const peak = Math.max(goal, ...bars.map((bar) => bar.value), 1);
  const scaleMax = peak * 1.1;
  const goalPercent = goal > 0 ? Math.min(100, (goal / scaleMax) * 100) : 0;

  return (
    <div>
      <div className="relative" style={{ height }}>
        {goal > 0 && (
          <div
            className="pointer-events-none absolute inset-x-0 z-10 border-t-[2px] border-dashed border-forest/60"
            style={{ bottom: `${goalPercent}%` }}
          >
            <span className="absolute -top-[15px] right-0 rounded-[3px] border-[2px] border-edge bg-forest px-1 font-pixel text-[8px] font-bold text-[#FFFBF1]">
              {goalLabel}
            </span>
          </div>
        )}

        <div className="flex h-full items-end gap-1.5">
          {bars.map((bar) => {
            const percent = Math.min(100, (bar.value / scaleMax) * 100);
            const empty = bar.value <= 0;
            return (
              <div
                key={bar.key}
                className="relative flex h-full flex-1 items-end"
                title={`${bar.label}: ${formatValue ? formatValue(bar.value) : Math.round(bar.value)}`}
              >
                <div
                  className={cn(
                    "w-full rounded-t-[3px] border-[2px] border-edge transition-[height] duration-300",
                    empty ? "bg-surface-3" : FILL[tone],
                    bar.highlight && !empty && "ring-2 ring-amber",
                  )}
                  style={{ height: `${empty ? 2 : Math.max(4, percent)}%` }}
                />
                {!empty && (
                  <span
                    className="absolute inset-x-0 text-center font-pixel text-[9px] font-bold text-body"
                    style={{ bottom: `calc(${percent}% + 4px)` }}
                  >
                    {formatValue ? formatValue(bar.value) : Math.round(bar.value)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-1.5 flex gap-1.5">
        {bars.map((bar) => (
          <span
            key={bar.key}
            className={cn(
              "flex-1 truncate text-center font-pixel text-[8px]",
              bar.highlight ? "text-forest-dark" : "text-muted",
            )}
          >
            {bar.label}
          </span>
        ))}
      </div>
    </div>
  );
}
