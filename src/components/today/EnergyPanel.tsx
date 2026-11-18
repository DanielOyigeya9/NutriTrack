import { Crown, Target } from "lucide-react";
import { EnergyRing } from "@/components/ui/EnergyRing";
import { MacroMeters } from "@/components/today/MacroMeters";
import { PixelButton } from "@/components/ui/PixelButton";
import { useUiStore } from "@/store/useUiStore";
import type { DayTotals, Goals } from "@/types";
import { inCalorieBand, ratio } from "@/utils/nutrition";

interface EnergyPanelProps {
  totals: DayTotals;
  goals: Goals;
  dateLabel: string;
}

export function EnergyPanel({ totals, goals, dateLabel }: EnergyPanelProps) {
  const openAddFood = useUiStore((state) => state.openAddFood);
  const remaining = Math.max(0, goals.kcal - totals.kcal);
  const over = totals.kcal - goals.kcal;
  const percent = goals.kcal ? Math.round((totals.kcal / goals.kcal) * 100) : 0;
  const onTarget = inCalorieBand(totals.kcal, goals.kcal);

  return (
    <section className="relative overflow-hidden rounded-pixel border-[3px] border-edge bg-forest text-[#F3FBF5] shadow-pixel">
      <div className="dither pointer-events-none absolute inset-0 opacity-40" />

      <div className="relative flex flex-col gap-5 p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-5">
        <div className="mx-auto flex flex-col items-center">
          <EnergyRing progress={ratio(totals.kcal, goals.kcal)} tone={onTarget ? "amber" : "green"}>
            <span className="font-pixel text-[9px] uppercase tracking-widest text-[#BFE3C9]">
              logged
            </span>
            <span className="font-pixel text-3xl font-bold leading-none text-white">
              {Math.round(totals.kcal).toLocaleString()}
            </span>
            <span className="font-pixel text-2xs text-[#BFE3C9]">kcal</span>
          </EnergyRing>
        </div>

        <div className="min-w-0 flex-1">
          <p className="pixel-label text-[#BFE3C9]">{dateLabel}</p>
          <h2 className="mt-1 text-2xl leading-tight text-white">
            {totals.entries === 0
              ? "Nothing logged yet"
              : onTarget
                ? "Right on target!"
                : totals.kcal > goals.kcal
                  ? "Fuelled up today"
                  : "Building it up"}
          </h2>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-pixel border-[3px] border-edge bg-[#1F4C34] px-2.5 py-1">
              <Crown size={13} className="text-amber" />
              <span className="font-pixel text-sm font-bold text-white">
                {Math.round(remaining).toLocaleString()}
              </span>
              <span className="pixel-label text-[#BFE3C9]">left</span>
            </span>
            <span className="flex items-center gap-1.5 rounded-pixel border-[3px] border-edge bg-[#1F4C34] px-2.5 py-1">
              <Target size={13} className="text-amber" />
              <span className="font-pixel text-sm font-bold text-white">{percent}%</span>
              <span className="pixel-label text-[#BFE3C9]">of goal</span>
            </span>
          </div>

          <p className="mt-3 max-w-md text-xs text-[#CFEBDA]">
            {totals.entries === 0
              ? "Log your first food of the day and your companion will perk right up."
              : over > 0
                ? `You're ${Math.round(over).toLocaleString()} kcal above your reference today. No judgement — food isn't good or bad.`
                : "Keep going at your own pace. These numbers are a guide, not a grade."}
          </p>
        </div>
      </div>

      <div className="relative border-t-[3px] border-edge bg-surface px-4 py-3.5">
        <MacroMeters totals={totals} goals={goals} />
        <PixelButton
          variant="amber"
          size="sm"
          className="mt-3 w-full"
          onClick={() => openAddFood()}
        >
          + Log something you ate
        </PixelButton>
      </div>
    </section>
  );
}
