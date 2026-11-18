import { useEffect, useMemo } from "react";
import { Sparkles } from "lucide-react";
import { PixelButton } from "@/components/ui/PixelButton";
import { getAvatar } from "@/data/avatars";
import { useAppStore } from "@/store/useAppStore";
import { levelInfo } from "@/utils/gamification";

const CONFETTI_COLORS = ["#2F6B46", "#E8A33D", "#5FA8D3", "#E2604A", "#8C6BB1", "#3EA79B"];

export function LevelUpOverlay() {
  const levelUpTo = useAppStore((state) => state.levelUpTo);
  const clearLevelUp = useAppStore((state) => state.clearLevelUp);
  const avatarId = useAppStore((state) => state.profile.avatarId);
  const xp = useAppStore((state) => state.gamification.xp);

  const confetti = useMemo(
    () =>
      Array.from({ length: 26 }).map((_, index) => ({
        left: (index * 37) % 100,
        delay: (index % 7) * 90,
        color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
        size: 6 + (index % 3) * 3,
      })),
    [],
  );

  useEffect(() => {
    if (!levelUpTo) return undefined;
    const onKey = () => clearLevelUp();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [levelUpTo, clearLevelUp]);

  if (!levelUpTo) return null;

  const info = levelInfo(xp);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/70 px-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {confetti.map((piece, index) => (
          <span
            key={index}
            className="animate-confetti absolute top-0 block rounded-[1px] border-[1px] border-edge"
            style={{
              left: `${piece.left}%`,
              width: piece.size,
              height: piece.size,
              background: piece.color,
              animationDuration: `${1.6 + (index % 4) * 0.35}s`,
              animationDelay: `${piece.delay}ms`,
            }}
          />
        ))}
      </div>

      <div className="animate-pop relative w-full max-w-sm rounded-pixel border-[3px] border-edge bg-surface p-6 text-center shadow-pixel-lg">
        <p className="pixel-label text-muted">Level up</p>
        <div className="my-3 flex justify-center">
          <span className="animate-bob sprite text-6xl">{getAvatar(avatarId).emoji}</span>
        </div>
        <h2 className="text-3xl">Level {levelUpTo}!</h2>
        <p className="mt-1 text-sm font-bold text-muted">
          You are now a <span className="text-forest">{info.title}</span>
        </p>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted">
          <Sparkles size={13} className="text-amber" />
          {info.xpToNext} XP to level {levelUpTo + 1}
        </p>
        <PixelButton variant="primary" size="lg" className="mt-5 w-full" onClick={clearLevelUp}>
          Keep going
        </PixelButton>
      </div>
    </div>
  );
}
