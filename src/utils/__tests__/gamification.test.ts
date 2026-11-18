import { describe, expect, it } from "vitest";
import { advanceStreak, levelFromXp, levelInfo } from "../gamification";

describe("gamification utilities", () => {
  it("determines player level from XP progression", () => {
    expect(levelFromXp(0)).toBe(1);
    expect(levelFromXp(59)).toBe(1);
    expect(levelFromXp(60)).toBe(2);
    expect(levelFromXp(240)).toBe(3);
    expect(levelFromXp(540)).toBe(4);
  });

  it("calculates level progression details", () => {
    // For level 3 (base 240 XP, next 540 XP, span 300 XP)
    const info = levelInfo(250);
    expect(info.level).toBe(3);
    expect(info.title).toBe("Sprout");
    expect(info.xpIntoLevel).toBe(10);
    expect(info.xpForLevel).toBe(300);
    expect(info.xpToNext).toBe(290);
    expect(info.progress).toBeCloseTo(10 / 300, 2);
  });

  it("advances logging streaks accurately", () => {
    // Same day log doesn't increment streak
    const sameDay = advanceStreak("2026-11-15", 3, "2026-11-15");
    expect(sameDay.streak).toBe(3);
    expect(sameDay.lastDate).toBe("2026-11-15");

    // Consecutive day increments streak
    const consecutive = advanceStreak("2026-11-14", 3, "2026-11-15");
    expect(consecutive.streak).toBe(4);
    expect(consecutive.lastDate).toBe("2026-11-15");

    // Broken streak resets to 1
    const broken = advanceStreak("2026-11-10", 3, "2026-11-15");
    expect(broken.streak).toBe(1);
    expect(broken.lastDate).toBe("2026-11-15");
  });
});
