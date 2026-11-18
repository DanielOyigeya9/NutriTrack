import { Flame, Moon, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import { SegmentedBar } from "@/components/ui/SegmentedBar";
import { getAvatar } from "@/data/avatars";
import { useAppStore } from "@/store/useAppStore";
import { levelInfo } from "@/utils/gamification";
import { cn } from "@/lib/utils";

export function LevelBadge({ compact }: { compact?: boolean }) {
  const xp = useAppStore((state) => state.gamification.xp);
  const logStreak = useAppStore((state) => state.gamification.logStreak);
  const name = useAppStore((state) => state.profile.name);
  const avatarId = useAppStore((state) => state.profile.avatarId);
  const info = levelInfo(xp);
  const avatar = getAvatar(avatarId);

  return (
    <Link
      to="/achievements"
      className={cn(
        "flex items-center gap-2 rounded-pixel border-[3px] border-edge bg-surface px-2 py-1.5 shadow-pixel-sm transition-transform active:translate-x-[2px] active:translate-y-[2px]",
        compact ? "min-w-0" : "",
      )}
      title={`${info.title} · ${info.xpToNext} XP to level ${info.level + 1}`}
    >
      <span className="sprite text-lg leading-none">{avatar.emoji}</span>
      <span className="min-w-0">
        {!compact && (
          <span className="block truncate text-xs font-bold leading-tight">{name || "Traveller"}</span>
        )}
        <span className="flex items-center gap-1.5">
          <span className="font-pixel text-2xs font-bold text-forest">
            LV {info.level}
          </span>
          <span className="hidden font-pixel text-[9px] uppercase tracking-wider text-muted sm:inline">
            {info.title}
          </span>
        </span>
        <span className="mt-1 hidden w-24 sm:block">
          <SegmentedBar progress={info.progress} segments={10} size="sm" tone="amber" ariaLabel="Level progress" />
        </span>
      </span>
      <span className="ml-1 flex items-center gap-0.5 rounded-[4px] border-[2px] border-edge bg-amber/25 px-1.5 py-0.5">
        <Flame size={11} className="text-coral" />
        <span className="font-pixel text-2xs font-bold">{logStreak}</span>
      </span>
    </Link>
  );
}

export function ThemeToggle() {
  const theme = useAppStore((state) => state.settings.theme);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => updateSettings({ theme: isDark ? "light" : "dark" })}
      className="flex h-9 w-9 items-center justify-center rounded-pixel border-[3px] border-edge bg-surface shadow-pixel-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-pixel-none"
    >
      {isDark ? <Sun size={15} className="text-amber" /> : <Moon size={15} className="text-plum" />}
    </button>
  );
}
