import { useMemo, useState } from "react";
import { PixelBarChart, type BarDatum } from "@/components/progress/PixelBarChart";
import { PixelDonut } from "@/components/progress/PixelDonut";
import { StatGrid, type StatItem } from "@/components/progress/StatGrid";
import { StreakHeatmap } from "@/components/progress/StreakHeatmap";
import { Chip } from "@/components/ui/Controls";
import { Panel, SectionTitle } from "@/components/ui/Panel";
import { useDaySeries } from "@/hooks/useDerivedDay";
import { useAppStore } from "@/store/useAppStore";
import { distinctDayCount, loggedDays } from "@/utils/gamification";
import { fromDayKey, lastNDays, todayKey, weekdayInitial } from "@/utils/dates";
import { formatMl } from "@/utils/format";

const RANGES = [7, 14, 30] as const;

const MACRO_COLORS = {
  protein: "#2F6B46",
  carbs: "#E8A33D",
  fat: "#E2604A",
};

export default function Progress() {
  const [range, setRange] = useState<(typeof RANGES)[number]>(7);

  const entries = useAppStore((state) => state.entries);
  const goals = useAppStore((state) => state.goals);
  const gamification = useAppStore((state) => state.gamification);

  const days = useMemo(() => lastNDays(range, todayKey()), [range]);
  const series = useDaySeries(days);

  const stats = useMemo(() => {
    const logged = series.filter((item) => item.totals.entries > 0);
    const divisor = logged.length || 1;
    const sum = logged.reduce(
      (acc, item) => ({
        kcal: acc.kcal + item.totals.kcal,
        protein: acc.protein + item.totals.protein,
        carbs: acc.carbs + item.totals.carbs,
        fat: acc.fat + item.totals.fat,
        water: acc.water + item.totals.waterMl,
      }),
      { kcal: 0, protein: 0, carbs: 0, fat: 0, water: 0 },
    );
    return {
      loggedDays: logged.length,
      avgKcal: Math.round(sum.kcal / divisor),
      avgProtein: Math.round(sum.protein / divisor),
      avgCarbs: Math.round(sum.carbs / divisor),
      avgFat: Math.round(sum.fat / divisor),
      avgWater: Math.round(sum.water / divisor),
    };
  }, [series]);

  const labelFor = (key: string) =>
    range === 7 ? weekdayInitial(key) : String(fromDayKey(key).getDate());

  const kcalBars: BarDatum[] = series.map((item) => ({
    key: item.date,
    label: labelFor(item.date),
    value: item.totals.kcal,
    highlight: item.date === todayKey(),
  }));

  const waterBars: BarDatum[] = series.map((item) => ({
    key: item.date,
    label: labelFor(item.date),
    value: item.totals.waterMl,
  }));

  const proteinKcal = stats.avgProtein * 4;
  const carbsKcal = stats.avgCarbs * 4;
  const fatKcal = stats.avgFat * 9;

  const statItems: StatItem[] = [
    { label: "Avg calories", value: stats.avgKcal.toLocaleString(), hint: "per logged day", emoji: "🔥", tone: "amber" },
    { label: "Avg protein", value: `${stats.avgProtein} g`, hint: `goal ${goals.protein} g`, emoji: "💪", tone: "green" },
    { label: "Avg water", value: formatMl(stats.avgWater), hint: `goal ${formatMl(goals.waterMl)}`, emoji: "💧", tone: "sky" },
    { label: "Days logged", value: `${stats.loggedDays}/${range}`, hint: "in this window", emoji: "📆", tone: "plum" },
    { label: "All-time days", value: distinctDayCount(entries), hint: "days with food", emoji: "🗓️", tone: "teal" },
    { label: "Best streak", value: `${gamification.bestStreak} d`, hint: `now ${gamification.logStreak} d`, emoji: "🔥", tone: "coral" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl leading-tight">Progress</h1>
          <p className="text-sm text-muted">
            {loggedDays(entries).length} days tracked. Patterns, not grades.
          </p>
        </div>
        <div className="flex gap-1.5">
          {RANGES.map((value) => (
            <Chip key={value} active={range === value} onClick={() => setRange(value)}>
              {value} days
            </Chip>
          ))}
        </div>
      </div>

      <Panel title="At a glance" icon="📊" subtitle={`Last ${range} days`}>
        <StatGrid items={statItems} columns={3} />
      </Panel>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <Panel title="Calories per day" icon="🔥" subtitle={`Dashed line = ${goals.kcal.toLocaleString()} kcal goal`}>
          <PixelBarChart bars={kcalBars} goal={goals.kcal} tone="forest" goalLabel="goal" />
        </Panel>

        <Panel title="Average macro split" icon="🍩" subtitle="Share of calories from each macro">
          {stats.loggedDays === 0 ? (
            <p className="py-6 text-center text-sm text-muted">
              Log a few meals and your macro balance will appear here.
            </p>
          ) : (
            <PixelDonut
              centerTop="avg"
              centerMain={`${stats.avgKcal}`}
              centerBottom="kcal / day"
              slices={[
                { key: "protein", label: "Protein", value: proteinKcal, color: MACRO_COLORS.protein },
                { key: "carbs", label: "Carbs", value: carbsKcal, color: MACRO_COLORS.carbs },
                { key: "fat", label: "Fat", value: fatKcal, color: MACRO_COLORS.fat },
              ]}
            />
          )}
        </Panel>
      </div>

      <Panel title="Water per day" icon="💧" subtitle={`Goal ${formatMl(goals.waterMl)}`}>
        <PixelBarChart bars={waterBars} goal={goals.waterMl} tone="sky" formatValue={(v) => `${Math.round(v / 100) / 10}L`} />
      </Panel>

      <section>
        <SectionTitle hint="Last 12 weeks">Consistency</SectionTitle>
        <div className="rounded-pixel border-[3px] border-edge bg-surface p-3 shadow-pixel">
          <StreakHeatmap entries={entries} weeks={12} />
        </div>
      </section>
    </div>
  );
}
