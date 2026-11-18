import { ChevronLeft, ChevronRight } from "lucide-react";
import { PixelButton } from "@/components/ui/PixelButton";
import { addDays, formatLong, isFuture, todayKey } from "@/utils/dates";

interface DateNavigatorProps {
  date: string;
  onChange: (next: string) => void;
}

export function DateNavigator({ date, onChange }: DateNavigatorProps) {
  const today = todayKey();
  const next = addDays(date, 1);
  const canGoForward = !isFuture(next);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        aria-label="Previous day"
        onClick={() => onChange(addDays(date, -1))}
        className="flex h-10 w-10 items-center justify-center rounded-pixel border-[3px] border-edge bg-surface shadow-pixel-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-pixel-none"
      >
        <ChevronLeft size={17} />
      </button>

      <div className="min-w-[190px] rounded-pixel border-[3px] border-edge bg-surface-2 px-3 py-1.5 text-center shadow-pixel-in">
        <p className="pixel-label text-muted">
          {date === today ? "Today" : date === addDays(today, -1) ? "Yesterday" : "Viewing"}
        </p>
        <p className="font-pixel text-xs font-bold">{formatLong(date)}</p>
      </div>

      <button
        type="button"
        aria-label="Next day"
        disabled={!canGoForward}
        onClick={() => canGoForward && onChange(next)}
        className="flex h-10 w-10 items-center justify-center rounded-pixel border-[3px] border-edge bg-surface shadow-pixel-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-pixel-none disabled:opacity-40"
      >
        <ChevronRight size={17} />
      </button>

      {date !== today && (
        <PixelButton size="sm" variant="ghost" onClick={() => onChange(today)}>
          Jump to today
        </PixelButton>
      )}
    </div>
  );
}
