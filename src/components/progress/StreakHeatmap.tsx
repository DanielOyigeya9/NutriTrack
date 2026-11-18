import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { Entry } from "@/types";
import { addDays, startOfWeek, todayKey } from "@/utils/dates";

interface StreakHeatmapProps {
  entries: Entry[];
  weeks?: number;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** A GitHub-style contribution grid, but rendered in chunky pixels. */
export function StreakHeatmap({ entries, weeks = 12 }: StreakHeatmapProps) {
  const today = todayKey();

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const entry of entries) {
      map[entry.date] = (map[entry.date] ?? 0) + 1;
    }
    return map;
  }, [entries]);

  const columns = useMemo(() => {
    const start = startOfWeek(addDays(today, -(weeks - 1) * 7));
    const result: { key: string; count: number; future: boolean }[][] = [];
    for (let w = 0; w < weeks; w += 1) {
      const column: { key: string; count: number; future: boolean }[] = [];
      for (let d = 0; d < 7; d += 1) {
        const key = addDays(start, w * 7 + d);
        column.push({ key, count: counts[key] ?? 0, future: key > today });
      }
      result.push(column);
    }
    return result;
  }, [counts, today, weeks]);

  const totalLogged = Object.keys(counts).length;

  const shade = (count: number, future: boolean) => {
    if (future) return "bg-surface-2/50 border-dashed";
    if (count === 0) return "bg-surface-3";
    if (count === 1) return "bg-forest/40";
    if (count <= 3) return "bg-forest/70";
    return "bg-forest";
  };

  return (
    <div>
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <div className="flex flex-col gap-[3px] pt-0">
          {WEEKDAYS.map((day, index) => (
            <span
              key={day}
              className={cn(
                "h-4 font-pixel text-[8px] leading-4 text-muted",
                index % 2 === 1 ? "opacity-100" : "opacity-0",
              )}
            >
              {day.slice(0, 1)}
            </span>
          ))}
        </div>
        {columns.map((column, wIndex) => (
          <div key={wIndex} className="flex flex-col gap-[3px]">
            {column.map((cell) => (
              <span
                key={cell.key}
                title={`${cell.key}: ${cell.count} ${cell.count === 1 ? "entry" : "entries"}`}
                className={cn(
                  "h-4 w-4 rounded-[2px] border-[2px] border-edge",
                  shade(cell.count, cell.future),
                )}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="mt-2.5 flex items-center justify-between">
        <span className="text-2xs text-muted">{totalLogged} days logged in this window</span>
        <span className="flex items-center gap-1.5 text-2xs text-muted">
          Less
          <span className="h-3 w-3 rounded-[2px] border-[2px] border-edge bg-surface-3" />
          <span className="h-3 w-3 rounded-[2px] border-[2px] border-edge bg-forest/40" />
          <span className="h-3 w-3 rounded-[2px] border-[2px] border-edge bg-forest/70" />
          <span className="h-3 w-3 rounded-[2px] border-[2px] border-edge bg-forest" />
          More
        </span>
      </div>
    </div>
  );
}
