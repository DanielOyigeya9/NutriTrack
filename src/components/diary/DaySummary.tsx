import { Copy } from "lucide-react";
import { MacroMeters } from "@/components/today/MacroMeters";
import { PixelButton } from "@/components/ui/PixelButton";
import { SegmentedBar } from "@/components/ui/SegmentedBar";
import type { DayTotals, Goals } from "@/types";
import { formatMl } from "@/utils/format";
import { inCalorieBand, percentOf, ratio } from "@/utils/nutrition";

interface DaySummaryProps {
  date: string;
  totals: DayTotals;
  goals: Goals;
  hasYesterday: boolean;
  onCopyYesterday: () => void;
}

export function DaySummary({ totals, goals, hasYesterday, onCopyYesterday }: DaySummaryProps) {
  const onTarget = inCalorieBand(totals.kcal, goals.kcal);

  return (
    <div className="rounded-pixel border-[3px] border-edge bg-surface p-4 shadow-pixel">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="pixel-label text-muted">Day total</p>
          <p className="font-pixel text-3xl font-bold leading-none">
            {Math.round(totals.kcal).toLocaleString()}
            <span className="ml-1.5 text-sm text-muted">/ {goals.kcal.toLocaleString()} kcal</span>
          </p>
          <p className="mt-1 text-xs text-muted">
            {percentOf(totals.kcal, goals.kcal)}% of goal ·{" "}
            {onTarget ? (
              <span className="font-bold text-forest">on target</span>
            ) : totals.kcal > goals.kcal ? (
              <span className="font-bold text-coral-dark">above reference</span>
            ) : (
              <span className="font-bold text-sky-dark">below reference</span>
            )}
          </p>
        </div>

        {hasYesterday && (
          <PixelButton size="sm" variant="ghost" onClick={onCopyYesterday}>
            <Copy size={13} /> Copy previous day
          </PixelButton>
        )}
      </div>

      <div className="mt-3">
        <SegmentedBar
          progress={ratio(totals.kcal, goals.kcal)}
          segments={20}
          size="lg"
          tone={onTarget ? "green" : totals.kcal > goals.kcal ? "coral" : "sky"}
          ariaLabel="Calorie goal progress"
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <MacroMeters totals={totals} goals={goals} />
        <div className="rounded-pixel border-[3px] border-edge bg-sky/10 p-3">
          <p className="pixel-label text-muted">Water</p>
          <p className="font-pixel text-xl font-bold">
            {formatMl(totals.waterMl)}
            <span className="ml-1 text-2xs font-normal text-muted">/ {formatMl(goals.waterMl)}</span>
          </p>
          <div className="mt-2">
            <SegmentedBar progress={ratio(totals.waterMl, goals.waterMl)} segments={12} tone="sky" ariaLabel="Water progress" />
          </div>
          <p className="mt-2 text-2xs text-muted">
            {totals.entries} {totals.entries === 1 ? "entry" : "entries"} logged
          </p>
        </div>
      </div>
    </div>
  );
}
