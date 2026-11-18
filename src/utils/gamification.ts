import type { AchievementContext, Entry, LevelInfo } from "@/types";
import { addDays, daysBetween, todayKey } from "@/utils/dates";
import { inCalorieBand, proteinHit } from "@/utils/nutrition";

/** XP required to reach a level: 60 * (level - 1)^2. */
export function xpForLevel(level: number): number {
  const n = Math.max(1, level) - 1;
  return 60 * n * n;
}

export function levelFromXp(xp: number): number {
  return Math.floor(Math.sqrt(Math.max(0, xp) / 60)) + 1;
}

export const LEVEL_TITLES = [
  "Sprout",
  "Sapling",
  "Seedling",
  "Bloom",
  "Grove",
  "Orchard",
  "Harvest",
  "Legend",
] as const;

export function titleForLevel(level: number): string {
  const index = Math.min(LEVEL_TITLES.length - 1, Math.floor((level - 1) / 3));
  return LEVEL_TITLES[index];
}

export function levelInfo(xp: number): LevelInfo {
  const level = levelFromXp(xp);
  const base = xpForLevel(level);
  const next = xpForLevel(level + 1);
  const xpIntoLevel = xp - base;
  const xpForLevelSpan = Math.max(1, next - base);
  return {
    level,
    title: titleForLevel(level),
    xp,
    xpIntoLevel,
    xpForLevel: xpForLevelSpan,
    xpToNext: Math.max(0, next - xp),
    progress: Math.min(1, xpIntoLevel / xpForLevelSpan),
  };
}

/** Fixed XP awards. */
export const XP = {
  perEntry: 10,
  waterGoal: 15,
  calorieGoal: 25,
  proteinGoal: 20,
  fiberGoal: 10,
  allMeals: 20,
} as const;

export function xpForDay(totals: { kcal: number; entries: number }): number {
  return totals.entries * XP.perEntry;
}

/** Distinct days that have at least one entry. */
export function loggedDays(entries: Entry[]): string[] {
  return Array.from(new Set(entries.map((entry) => entry.date))).sort();
}

export function distinctDayCount(entries: Entry[]): number {
  return loggedDays(entries).length;
}

/**
 * Recompute a logging streak given the previous streak state.
 * Called when a new entry is added for `date`.
 */
export function advanceStreak(
  lastDate: string | null,
  currentStreak: number,
  date: string,
): { streak: number; lastDate: string } {
  if (lastDate === date) {
    return { streak: currentStreak, lastDate: date };
  }
  if (lastDate && daysBetween(lastDate, date) === 1) {
    return { streak: currentStreak + 1, lastDate: date };
  }
  return { streak: 1, lastDate: date };
}

/**
 * Decay a streak when the app is opened after a gap.
 * A streak survives if the last activity was today or yesterday.
 */
export function decayStreak(
  lastDate: string | null,
  currentStreak: number,
  today: string = todayKey(),
): { streak: number; expired: boolean } {
  if (!lastDate || currentStreak === 0) return { streak: 0, expired: false };
  const gap = daysBetween(lastDate, today);
  if (gap <= 1) return { streak: currentStreak, expired: false };
  return { streak: 0, expired: true };
}

export function currentStreakLength(
  entries: Entry[],
  today: string = todayKey(),
): number {
  const days = new Set(loggedDays(entries));
  let cursor = days.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function buildContext(
  state: {
    gamification: AchievementContext["gamification"];
    goals: AchievementContext["goals"];
    entries: Entry[];
    water: Record<string, number>;
  },
  today: string = todayKey(),
): AchievementContext {
  const todaysEntries = state.entries.filter((entry) => entry.date === today);
  const totals = todaysEntries.reduce(
    (acc, entry) => ({
      kcal: acc.kcal + entry.kcal,
      protein: acc.protein + entry.protein,
      carbs: acc.carbs + entry.carbs,
      fat: acc.fat + entry.fat,
      fiber: acc.fiber,
      waterMl: state.water[today] ?? 0,
      entries: acc.entries + 1,
    }),
    {
      kcal: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      waterMl: state.water[today] ?? 0,
      entries: 0,
    },
  );

  return {
    gamification: state.gamification,
    goals: state.goals,
    entries: state.entries,
    water: state.water,
    today,
    todayTotals: totals,
    daysLogged: distinctDayCount(state.entries),
  };
}

export function isCalorieGoalMet(ctx: AchievementContext): boolean {
  return inCalorieBand(ctx.todayTotals.kcal, ctx.goals.kcal);
}

export function isProteinGoalMet(ctx: AchievementContext): boolean {
  return proteinHit(ctx.todayTotals.protein, ctx.goals.protein);
}

export function isWaterGoalMet(ctx: AchievementContext): boolean {
  return ctx.goals.waterMl > 0 && ctx.todayTotals.waterMl >= ctx.goals.waterMl;
}

export function countMealsLogged(ctx: AchievementContext): number {
  const meals = new Set(
    ctx.entries.filter((entry) => entry.date === ctx.today).map((entry) => entry.mealType),
  );
  return meals.size;
}
