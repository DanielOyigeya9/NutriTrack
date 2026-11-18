import { Flame, Sparkles } from "lucide-react";
import { SegmentedBar } from "@/components/ui/SegmentedBar";
import { getAvatar } from "@/data/avatars";
import { useAppStore } from "@/store/useAppStore";
import { levelInfo } from "@/utils/gamification";
import type { DayTotals, Goals } from "@/types";

function moodFor(totals: DayTotals, goals: Goals): { face: string; line: string; bubbly: boolean } {
  if (totals.entries === 0)
    return { face: "😴", line: "Waiting for your first meal…", bubbly: false };
  if (goals.kcal > 0 && totals.kcal > goals.kcal * 1.15)
    return { face: "😅", line: "That's a big day! Rest is fine too.", bubbly: false };
  if (goals.waterMl > 0 && totals.waterMl < goals.waterMl * 0.4)
    return { face: "🥵", line: "A little thirsty — fancy some water?", bubbly: false };
  if (goals.kcal > 0 && totals.kcal >= goals.kcal * 0.9)
    return { face: "🤩", line: "You're smashing it today!", bubbly: true };
  return { face: "🙂", line: "Steady progress. Keep it up!", bubbly: true };
}

export function CompanionCard({ totals, goals }: { totals: DayTotals; goals: Goals }) {
  const name = useAppStore((state) => state.profile.name);
  const avatarId = useAppStore((state) => state.profile.avatarId);
  const xp = useAppStore((state) => state.gamification.xp);
  const logStreak = useAppStore((state) => state.gamification.logStreak);
  const waterStreak = useAppStore((state) => state.gamification.waterStreak);
  const bestStreak = useAppStore((state) => state.gamification.bestStreak);
  const unlocked = useAppStore((state) => state.gamification.unlocked);

  const avatar = getAvatar(avatarId);
  const info = levelInfo(xp);
  const mood = moodFor(totals, goals);
  const badges = Object.keys(unlocked).length;

  return (
    <div className="rounded-pixel border-[3px] border-edge bg-surface p-4 shadow-pixel">
      <div className="flex items-start gap-3">
        <div className="checker relative flex h-20 w-20 shrink-0 items-center justify-center rounded-pixel border-[3px] border-edge">
          <span className={`sprite text-4xl ${mood.bubbly ? "animate-bob" : ""}`}>{avatar.emoji}</span>
          <span className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-pixel border-[3px] border-edge bg-surface text-base leading-none">
            {mood.face}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="pixel-label text-muted">Your companion</p>
          <h3 className="text-lg leading-tight">
            {avatar.name}
            <span className="ml-1.5 font-pixel text-xs text-muted">
              with {name || "you"}
            </span>
          </h3>
          <p className="mt-0.5 text-xs text-muted">{mood.line}</p>
        </div>
      </div>

      <div className="mt-3 rounded-pixel border-[3px] border-edge bg-surface-2 px-3 py-2.5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="rounded-[4px] border-[2px] border-edge bg-forest px-1.5 py-0.5 font-pixel text-2xs font-bold text-[#FFFBF1]">
              LV {info.level}
            </span>
            <span className="font-pixel text-xs font-bold">{info.title}</span>
          </span>
          <span className="flex items-center gap-1 text-2xs text-muted">
            <Sparkles size={11} className="text-amber" />
            {info.xpToNext} XP to go
          </span>
        </div>
        <div className="mt-2">
          <SegmentedBar progress={info.progress} segments={16} tone="amber" ariaLabel="XP progress" />
        </div>
        <p className="mt-1.5 text-2xs text-muted">
          {info.xpIntoLevel} / {info.xpForLevel} XP this level · {info.xp.toLocaleString()} total
        </p>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        {[
          { icon: <Flame size={13} className="text-coral" />, value: logStreak, label: "log streak" },
          { icon: <Flame size={13} className="text-sky" />, value: waterStreak, label: "water streak" },
          { icon: <Sparkles size={13} className="text-amber" />, value: badges, label: "badges" },
        ].map((item) => (
          <div key={item.label} className="rounded-pixel border-[3px] border-edge bg-surface px-1.5 py-1.5 shadow-pixel-sm">
            <span className="flex items-center justify-center gap-1">
              {item.icon}
              <span className="font-pixel text-sm font-bold">{item.value}</span>
            </span>
            <span className="pixel-label text-[8px] text-muted">{item.label}</span>
          </div>
        ))}
      </div>

      <p className="mt-2 text-2xs text-muted">Best streak: {bestStreak} days</p>
    </div>
  );
}
