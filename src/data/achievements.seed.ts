import type { Achievement, AchievementContext } from "@/types";
import { distinctDayCount, isProteinGoalMet, isWaterGoalMet, levelFromXp } from "@/utils/gamification";
import { inCalorieBand } from "@/utils/nutrition";

const pct = (value: number, goal: number) => (goal <= 0 ? 0 : Math.min(1, value / goal));

function mealLogged(ctx: AchievementContext, meal: string): boolean {
  return ctx.entries.some((entry) => entry.date === ctx.today && entry.mealType === meal);
}

function allFourMeals(ctx: AchievementContext): boolean {
  const meals = new Set(ctx.entries.filter((e) => e.date === ctx.today).map((e) => e.mealType));
  return meals.size >= 4;
}

function earliestLogHour(ctx: AchievementContext): number | null {
  const entries = ctx.entries.filter((e) => e.date === ctx.today);
  if (!entries.length) return null;
  return Math.min(...entries.map((e) => new Date(e.createdAt).getHours()));
}

function latestLogHour(ctx: AchievementContext): number | null {
  const entries = ctx.entries.filter((e) => e.date === ctx.today);
  if (!entries.length) return null;
  return Math.max(...entries.map((e) => new Date(e.createdAt).getHours()));
}

function waterGoalDays(ctx: AchievementContext): number {
  return Object.entries(ctx.water).filter(([, ml]) => ml >= ctx.goals.waterMl).length;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-bite",
    title: "First Bite",
    description: "Log your very first food.",
    emoji: "🍽️",
    tier: "bronze",
    xp: 20,
    progress: (ctx) => pct(ctx.gamification.totalEntries, 1),
    earned: (ctx) => ctx.gamification.totalEntries >= 1,
  },
  {
    id: "breakfast-club",
    title: "Breakfast Club",
    description: "Log a breakfast.",
    emoji: "🍳",
    tier: "bronze",
    xp: 20,
    progress: (ctx) => (mealLogged(ctx, "Breakfast") ? 1 : 0),
    earned: (ctx) => mealLogged(ctx, "Breakfast"),
  },
  {
    id: "sip-sip",
    title: "Sip Sip",
    description: "Log water for the first time.",
    emoji: "💧",
    tier: "bronze",
    xp: 15,
    progress: (ctx) => pct(ctx.gamification.totalWaterMl, 1),
    earned: (ctx) => ctx.gamification.totalWaterMl >= 1,
  },
  {
    id: "hydrated-hero",
    title: "Hydrated Hero",
    description: "Reach your water goal for a day.",
    emoji: "🌊",
    tier: "silver",
    xp: 40,
    progress: (ctx) => pct(waterGoalDays(ctx), 1),
    earned: (ctx) => waterGoalDays(ctx) >= 1 || isWaterGoalMet(ctx),
  },
  {
    id: "protein-pro",
    title: "Protein Pro",
    description: "Hit your protein goal for a day.",
    emoji: "💪",
    tier: "silver",
    xp: 40,
    progress: (ctx) => pct(ctx.todayTotals.protein, ctx.goals.protein),
    earned: (ctx) => isProteinGoalMet(ctx),
  },
  {
    id: "on-target",
    title: "Right On Target",
    description: "Finish a day within 10% of your calorie goal.",
    emoji: "🎯",
    tier: "silver",
    xp: 45,
    progress: (ctx) => pct(ctx.todayTotals.kcal, ctx.goals.kcal),
    earned: (ctx) => inCalorieBand(ctx.todayTotals.kcal, ctx.goals.kcal),
  },
  {
    id: "full-house",
    title: "Full House",
    description: "Log breakfast, lunch, dinner and a snack in one day.",
    emoji: "🃏",
    tier: "silver",
    xp: 50,
    progress: (ctx) => pct(new Set(ctx.entries.filter((e) => e.date === ctx.today).map((e) => e.mealType)).size, 4),
    earned: allFourMeals,
  },
  {
    id: "note-keeper",
    title: "Note Keeper",
    description: "Add a note to one of your meals.",
    emoji: "📝",
    tier: "bronze",
    xp: 20,
    progress: (ctx) => (ctx.entries.some((e) => !!e.note) ? 1 : 0),
    earned: (ctx) => ctx.entries.some((e) => !!e.note),
  },
  {
    id: "streak-3",
    title: "Three in a Row",
    description: "Log something three days in a row.",
    emoji: "🔥",
    tier: "bronze",
    xp: 30,
    progress: (ctx) => pct(ctx.gamification.bestStreak, 3),
    earned: (ctx) => ctx.gamification.bestStreak >= 3,
  },
  {
    id: "streak-7",
    title: "Week Warrior",
    description: "Keep a 7-day logging streak.",
    emoji: "🔥",
    tier: "silver",
    xp: 80,
    progress: (ctx) => pct(ctx.gamification.bestStreak, 7),
    earned: (ctx) => ctx.gamification.bestStreak >= 7,
  },
  {
    id: "streak-30",
    title: "Month of Meals",
    description: "Keep a 30-day logging streak.",
    emoji: "🏆",
    tier: "gold",
    xp: 300,
    progress: (ctx) => pct(ctx.gamification.bestStreak, 30),
    earned: (ctx) => ctx.gamification.bestStreak >= 30,
  },
  {
    id: "variety-champ",
    title: "Variety Champ",
    description: "Log 25 different foods.",
    emoji: "🥗",
    tier: "silver",
    xp: 70,
    progress: (ctx) => pct(ctx.gamification.distinctFoods.length, 25),
    earned: (ctx) => ctx.gamification.distinctFoods.length >= 25,
  },
  {
    id: "objective-observer",
    title: "Objective Observer",
    description: "Reach level 5.",
    emoji: "🧭",
    tier: "silver",
    xp: 60,
    progress: (ctx) => pct(levelFromXp(ctx.gamification.xp), 5),
    earned: (ctx) => levelFromXp(ctx.gamification.xp) >= 5,
  },
  {
    id: "seasoned-tracker",
    title: "Seasoned Tracker",
    description: "Reach level 10.",
    emoji: "🌟",
    tier: "gold",
    xp: 150,
    progress: (ctx) => pct(levelFromXp(ctx.gamification.xp), 10),
    earned: (ctx) => levelFromXp(ctx.gamification.xp) >= 10,
  },
  {
    id: "century",
    title: "Century",
    description: "Log 100 food entries in total.",
    emoji: "💯",
    tier: "gold",
    xp: 200,
    progress: (ctx) => pct(ctx.gamification.totalEntries, 100),
    earned: (ctx) => ctx.gamification.totalEntries >= 100,
  },
  {
    id: "thirty-days-logged",
    title: "Thirty Days",
    description: "Log food on 30 different days.",
    emoji: "📅",
    tier: "gold",
    xp: 200,
    progress: (ctx) => pct(distinctDayCount(ctx.entries), 30),
    earned: (ctx) => distinctDayCount(ctx.entries) >= 30,
  },
  {
    id: "litre-club",
    title: "Fifty Litre Club",
    description: "Drink 50 litres of water in total.",
    emoji: "🥤",
    tier: "gold",
    xp: 180,
    progress: (ctx) => pct(ctx.gamification.totalWaterMl, 50000),
    earned: (ctx) => ctx.gamification.totalWaterMl >= 50000,
  },
  {
    id: "early-bird",
    title: "Early Bird",
    description: "Log a meal before 8am.",
    emoji: "🐦",
    tier: "bronze",
    xp: 25,
    progress: (ctx) => {
      const hour = earliestLogHour(ctx);
      return hour !== null && hour < 8 ? 1 : 0;
    },
    earned: (ctx) => {
      const hour = earliestLogHour(ctx);
      return hour !== null && hour < 8;
    },
  },
  {
    id: "night-owl",
    title: "Night Owl",
    description: "Log a meal after 10pm.",
    emoji: "🦉",
    tier: "bronze",
    xp: 25,
    progress: (ctx) => {
      const hour = latestLogHour(ctx);
      return hour !== null && hour >= 22 ? 1 : 0;
    },
    earned: (ctx) => {
      const hour = latestLogHour(ctx);
      return hour !== null && hour >= 22;
    },
  },
  {
    id: "week-of-water",
    title: "Week of Water",
    description: "Hit your water goal on 7 different days.",
    emoji: "🚰",
    tier: "gold",
    xp: 160,
    progress: (ctx) => pct(waterGoalDays(ctx), 7),
    earned: (ctx) => waterGoalDays(ctx) >= 7,
  },
];

export const ACHIEVEMENT_BY_ID: Record<string, Achievement> = ACHIEVEMENTS.reduce(
  (acc, item) => ({ ...acc, [item.id]: item }),
  {} as Record<string, Achievement>,
);

export const TIER_STYLES: Record<Achievement["tier"], { label: string; ring: string; face: string }> = {
  bronze: { label: "Bronze", ring: "border-amber-700", face: "bg-amber-100" },
  silver: { label: "Silver", ring: "border-ink/40", face: "bg-white/70" },
  gold: { label: "Gold", ring: "border-amber-400", face: "bg-amber-200" },
};
