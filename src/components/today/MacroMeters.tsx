import { SegmentedBar, type BarTone } from "@/components/ui/SegmentedBar";
import type { DayTotals, Goals } from "@/types";
import { formatMacro, percentOf, ratio } from "@/utils/nutrition";

const MACROS: Array<{ key: "protein" | "carbs" | "fat"; label: string; tone: BarTone }> = [
  { key: "protein", label: "Protein", tone: "coral" },
  { key: "carbs", label: "Carbs", tone: "amber" },
  { key: "fat", label: "Fat", tone: "plum" },
];

export function MacroMeters({ totals, goals }: { totals: DayTotals; goals: Goals }) {
  return (
    <div className="space-y-2.5">
      {MACROS.map((macro) => {
        const value = totals[macro.key];
        const goal = goals[macro.key];
        const percent = percentOf(value, goal);
        return (
          <div key={macro.key}>
            <div className="mb-1 flex items-end justify-between">
              <span className="pixel-label text-muted">{macro.label}</span>
              <span className="font-pixel text-xs font-bold">
                {formatMacro(value)}
                <span className="text-muted"> / {goal} g</span>
                <span className="ml-1.5 text-2xs text-muted">{percent}%</span>
              </span>
            </div>
            <SegmentedBar progress={ratio(value, goal)} segments={14} tone={macro.tone} ariaLabel={macro.label} />
          </div>
        );
      })}
    </div>
  );
}
