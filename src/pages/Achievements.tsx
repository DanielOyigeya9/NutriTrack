import { AchievementGrid } from "@/components/game/AchievementGrid";
import { LevelLadder } from "@/components/game/LevelLadder";
import { QuestList } from "@/components/today/QuestList";
import { SegmentedBar } from "@/components/ui/SegmentedBar";
import { Panel, SectionTitle } from "@/components/ui/Panel";
import { StatGrid, type StatItem } from "@/components/progress/StatGrid";
import { ACHIEVEMENTS } from "@/data/achievements.seed";
import { getAvatar } from "@/data/avatars";
import { useAppStore } from "@/store/useAppStore";
import { buildContext, levelInfo } from "@/utils/gamification";

export default function Achievements() {
  const entries = useAppStore((state) => state.entries);
  const water = useAppStore((state) => state.water);
  const goals = useAppStore((state) => state.goals);
  const gamification = useAppStore((state) => state.gamification);
  const avatarId = useAppStore((state) => state.profile.avatarId);

  const ctx = buildContext({ gamification, goals, entries, water });
  const info = levelInfo(gamification.xp);
  const avatar = getAvatar(avatarId);
  const unlockedCount = Object.keys(gamification.unlocked).length;

  const stats: StatItem[] = [
    { label: "Level", value: info.level, hint: info.title, emoji: "⭐", tone: "amber" },
    { label: "Total XP", value: gamification.xp.toLocaleString(), hint: `${info.xpToNext} to next`, emoji: "✨", tone: "plum" },
    { label: "Badges", value: `${unlockedCount}/${ACHIEVEMENTS.length}`, hint: "unlocked", emoji: "🏅", tone: "green" },
    { label: "Best streak", value: `${gamification.bestStreak} d`, hint: `now ${gamification.logStreak} d`, emoji: "🔥", tone: "coral" },
    { label: "Entries", value: gamification.totalEntries, hint: "logged all-time", emoji: "🍽️", tone: "teal" },
    { label: "Foods tried", value: gamification.distinctFoods.length, hint: "different foods", emoji: "🥗", tone: "sky" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl leading-tight">Awards &amp; level</h1>
        <p className="text-sm text-muted">
          Every log nudges you forward. Badges and levels are here to encourage, never to judge.
        </p>
      </div>

      <section className="relative overflow-hidden rounded-pixel border-[3px] border-edge bg-forest p-4 text-[#F3FBF5] shadow-pixel sm:p-5">
        <div className="dither pointer-events-none absolute inset-0 opacity-40" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="checker flex h-20 w-20 shrink-0 items-center justify-center rounded-pixel border-[3px] border-edge bg-surface text-4xl">
            <span className="sprite animate-bob">{avatar.emoji}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="pixel-label text-[#BFE3C9]">Current rank</p>
            <h2 className="text-2xl leading-tight text-white">
              Level {info.level} · {info.title}
            </h2>
            <div className="mt-2.5 max-w-md">
              <SegmentedBar progress={info.progress} segments={20} tone="amber" size="lg" ariaLabel="Level progress" />
            </div>
            <p className="mt-2 text-xs text-[#CFEBDA]">
              {info.xpIntoLevel.toLocaleString()} / {info.xpForLevel.toLocaleString()} XP this level ·{" "}
              {info.xpToNext.toLocaleString()} XP to level {info.level + 1}
            </p>
          </div>
        </div>
      </section>

      <StatGrid items={stats} columns={3} />

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <section>
          <SectionTitle hint={`${unlockedCount} of ${ACHIEVEMENTS.length} unlocked`}>Badges</SectionTitle>
          <AchievementGrid ctx={ctx} />
        </section>

        <div className="space-y-5">
          <Panel title="Level ladder" icon="🪜" subtitle="Eight tiers of growth">
            <LevelLadder level={info.level} />
          </Panel>

          <section>
            <SectionTitle hint="Resets each day">Today's quests</SectionTitle>
            <QuestList />
          </section>
        </div>
      </div>
    </div>
  );
}
