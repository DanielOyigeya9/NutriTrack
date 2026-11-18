import { Check, Lock } from "lucide-react";
import { SegmentedBar } from "@/components/ui/SegmentedBar";
import { ACHIEVEMENTS, TIER_STYLES } from "@/data/achievements.seed";
import type { AchievementContext } from "@/types";
import { cn } from "@/lib/utils";

export function AchievementGrid({ ctx }: { ctx: AchievementContext }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {ACHIEVEMENTS.map((achievement) => {
        const earned = Boolean(ctx.gamification.unlocked[achievement.id]) || achievement.earned(ctx);
        const progress = earned ? 1 : achievement.progress(ctx);
        const tier = TIER_STYLES[achievement.tier];

        return (
          <article
            key={achievement.id}
            className={cn(
              "relative flex flex-col rounded-pixel border-[3px] px-3 py-3 shadow-pixel-sm",
              tier.ring,
              earned ? tier.face : "bg-surface-2",
            )}
          >
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "checker flex h-12 w-12 shrink-0 items-center justify-center rounded-pixel border-[3px] border-edge text-2xl leading-none",
                  !earned && "grayscale opacity-60",
                )}
              >
                {achievement.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="truncate text-sm leading-tight">{achievement.title}</h3>
                  {earned && <Check size={13} strokeWidth={4} className="shrink-0 text-forest-dark" />}
                </div>
                <p className="mt-0.5 text-xs text-muted">{achievement.description}</p>
              </div>
            </div>

            <div className="mt-2.5 flex items-center justify-between gap-2">
              <span className="rounded-[4px] border-[2px] border-edge bg-surface px-1.5 py-0.5 font-pixel text-[8px] font-bold uppercase tracking-wide">
                {tier.label}
              </span>
              <span className="flex items-center gap-1 font-pixel text-2xs font-bold text-amber-dark">
                {earned ? "Earned" : `+${achievement.xp} XP`}
                {!earned && <Lock size={10} />}
              </span>
            </div>

            {!earned && (
              <div className="mt-2">
                <SegmentedBar
                  progress={progress}
                  segments={12}
                  size="sm"
                  tone="amber"
                  ariaLabel={`${achievement.title} progress`}
                />
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
