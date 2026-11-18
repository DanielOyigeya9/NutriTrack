import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { LEVEL_TITLES, xpForLevel } from "@/utils/gamification";

/**
 * A vertical ladder of the eight title tiers. Each tier spans three levels,
 * so players can always see what's next.
 */
export function LevelLadder({ level }: { level: number }) {
  return (
    <ol className="space-y-1.5">
      {LEVEL_TITLES.map((tier, index) => {
        const startLevel = index * 3 + 1;
        const endLevel = startLevel + 2;
        const reached = level >= startLevel;
        const current = level >= startLevel && level <= endLevel;
        const xp = xpForLevel(startLevel);

        return (
          <li
            key={tier}
            className={cn(
              "flex items-center gap-3 rounded-pixel border-[3px] border-edge px-3 py-2 shadow-pixel-sm",
              current ? "bg-amber/20" : reached ? "bg-forest/10" : "bg-surface-2",
            )}
          >
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-pixel border-[3px] border-edge font-pixel text-2xs font-bold",
                reached ? "bg-forest text-[#FFFBF1]" : "bg-surface-3 text-muted",
              )}
            >
              {reached ? <Check size={13} strokeWidth={4} /> : <Lock size={11} />}
            </span>
            <div className="min-w-0 flex-1">
              <p className={cn("text-sm font-bold", !reached && "text-muted")}>
                {tier}
                {current && (
                  <span className="ml-2 rounded-[4px] border-[2px] border-edge bg-amber px-1.5 font-pixel text-[8px] font-bold text-ink">
                    YOU
                  </span>
                )}
              </p>
              <p className="text-2xs text-muted">
                Levels {startLevel}–{endLevel} · opens at {xp.toLocaleString()} XP
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
