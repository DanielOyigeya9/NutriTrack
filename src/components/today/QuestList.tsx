import { Check } from "lucide-react";
import { SegmentedBar } from "@/components/ui/SegmentedBar";
import { questsForDate } from "@/data/quests.seed";
import { useAppStore } from "@/store/useAppStore";
import { buildContext } from "@/utils/gamification";
import { cn } from "@/lib/utils";

export function QuestList() {
  const entries = useAppStore((state) => state.entries);
  const water = useAppStore((state) => state.water);
  const goals = useAppStore((state) => state.goals);
  const gamification = useAppStore((state) => state.gamification);
  const questState = useAppStore((state) => state.quests);

  const ctx = buildContext({ gamification, goals, entries, water });
  const quests = questsForDate(ctx.today);
  const completed = questState[ctx.today] ?? [];

  return (
    <ul className="space-y-2">
      {quests.map((quest) => {
        const done = completed.includes(quest.id) || quest.done(ctx);
        const progress = done ? 1 : quest.progress(ctx);
        return (
          <li
            key={quest.id}
            className={cn(
              "rounded-pixel border-[3px] border-edge px-2.5 py-2 shadow-pixel-sm transition-colors",
              done ? "bg-forest/15" : "bg-surface",
            )}
          >
            <div className="flex items-start gap-2.5">
              <span
                className={cn(
                  "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-[4px] border-[3px] border-edge",
                  done ? "bg-forest text-[#FFFBF1]" : "bg-surface-3",
                )}
              >
                {done ? <Check size={13} strokeWidth={4} /> : <span className="text-sm">·</span>}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className={cn("text-sm font-bold", done && "line-through opacity-70")}>
                    {quest.emoji} {quest.title}
                  </p>
                  <span className="shrink-0 rounded-[4px] border-[2px] border-edge bg-amber px-1.5 font-pixel text-[9px] font-bold text-ink">
                    {quest.xp} XP
                  </span>
                </div>
                <p className="text-xs text-muted">{quest.description}</p>
                {!done && (
                  <div className="mt-1.5">
                    <SegmentedBar progress={progress} segments={10} size="sm" tone="teal" ariaLabel={quest.title} />
                  </div>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
