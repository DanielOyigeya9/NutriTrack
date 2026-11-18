import { useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import type { DayTotals, Entry } from "@/types";
import { EMPTY_TOTALS, entriesForDate, sumEntries } from "@/utils/nutrition";
import { todayKey } from "@/utils/dates";

export interface DerivedDay {
  date: string;
  entries: Entry[];
  totals: DayTotals;
  waterMl: number;
}

/** Totals for one day, read from the store with narrow selectors. */
export function useDerivedDay(date: string = todayKey()): DerivedDay {
  const entries = useAppStore((state) => state.entries);
  const water = useAppStore((state) => state.water);

  return useMemo(() => {
    const dayEntries = entriesForDate(entries, date);
    const waterMl = water[date] ?? 0;
    const totals = dayEntries.length ? sumEntries(dayEntries, waterMl) : { ...EMPTY_TOTALS, waterMl };
    return { date, entries: dayEntries, totals, waterMl };
  }, [entries, water, date]);
}

/** Totals for several days at once (charts, averages). */
export function useDaySeries(days: string[]) {
  const entries = useAppStore((state) => state.entries);
  const water = useAppStore((state) => state.water);

  return useMemo(
    () =>
      days.map((date) => {
        const dayEntries = entriesForDate(entries, date);
        const waterMl = water[date] ?? 0;
        const totals = dayEntries.length
          ? sumEntries(dayEntries, waterMl)
          : { ...EMPTY_TOTALS, waterMl };
        return { date, totals };
      }),
    [days, entries, water],
  );
}
