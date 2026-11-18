import type { AchievementContext, Quest } from "@/types";
import { isCalorieGoalMet, isProteinGoalMet, isWaterGoalMet } from "@/utils/gamification";

const pct = (value: number, goal: number) => (goal <= 0 ? 0 : Math.min(1, value / goal));

function todayEntries(ctx: AchievementContext) {
  return ctx.entries.filter((entry) => entry.date === ctx.today);
}

function mealTypeCount(ctx: AchievementContext): number {
  return new Set(todayEntries(ctx).map((entry) => entry.mealType)).size;
}

function earliestHourToday(ctx: AchievementContext): number | null {
  const entries = todayEntries(ctx);
  if (!entries.length) return null;
  return Math.min(...entries.map((entry) => new Date(entry.createdAt).getHours()));
}

export const QUESTS: Quest[] = [
  {
    id: "q-log-3",
    title: "Three squares",
    description: "Log 3 foods today.",
    emoji: "🍱",
    xp: 25,
    progress: (ctx) => pct(todayEntries(ctx).length, 3),
    done: (ctx) => todayEntries(ctx).length >= 3,
  },
  {
    id: "q-log-5",
    title: "Well documented",
    description: "Log 5 foods today.",
    emoji: "📚",
    xp: 35,
    progress: (ctx) => pct(todayEntries(ctx).length, 5),
    done: (ctx) => todayEntries(ctx).length >= 5,
  },
  {
    id: "q-water",
    title: "Top up",
    description: "Reach your water goal today.",
    emoji: "💧",
    xp: 30,
    progress: (ctx) => pct(ctx.todayTotals.waterMl, ctx.goals.waterMl),
    done: isWaterGoalMet,
  },
  {
    id: "q-protein",
    title: "Protein check",
    description: "Hit your protein goal today.",
    emoji: "🥚",
    xp: 30,
    progress: (ctx) => pct(ctx.todayTotals.protein, ctx.goals.protein),
    done: isProteinGoalMet,
  },
  {
    id: "q-calorie-band",
    title: "Steady day",
    description: "Finish the day within 10% of your calorie goal.",
    emoji: "🎯",
    xp: 40,
    progress: (ctx) => pct(ctx.todayTotals.kcal, ctx.goals.kcal),
    done: isCalorieGoalMet,
  },
  {
    id: "q-three-meals",
    title: "Three sittings",
    description: "Log 3 different meal types.",
    emoji: "🕰️",
    xp: 30,
    progress: (ctx) => pct(mealTypeCount(ctx), 3),
    done: (ctx) => mealTypeCount(ctx) >= 3,
  },
  {
    id: "q-all-meals",
    title: "Full day",
    description: "Log all four meal types today.",
    emoji: "🍽️",
    xp: 45,
    progress: (ctx) => pct(mealTypeCount(ctx), 4),
    done: (ctx) => mealTypeCount(ctx) >= 4,
  },
  {
    id: "q-note",
    title: "Jot it down",
    description: "Add a note to one entry today.",
    emoji: "📝",
    xp: 20,
    progress: (ctx) => (todayEntries(ctx).some((entry) => !!entry.note) ? 1 : 0),
    done: (ctx) => todayEntries(ctx).some((entry) => !!entry.note),
  },
  {
    id: "q-early",
    title: "Early start",
    description: "Log your first meal before 9am.",
    emoji: "🌅",
    xp: 25,
    progress: (ctx) => {
      const hour = earliestHourToday(ctx);
      return hour !== null && hour < 9 ? 1 : 0;
    },
    done: (ctx) => {
      const hour = earliestHourToday(ctx);
      return hour !== null && hour < 9;
    },
  },
  {
    id: "q-fibre",
    title: "Plants first",
    description: "Log 2 foods that contain fibre today.",
    emoji: "🥦",
    xp: 25,
    progress: (ctx) => pct(todayEntries(ctx).length, 2),
    done: (ctx) => todayEntries(ctx).length >= 2,
  },
  {
    id: "q-favourite",
    title: "Old reliable",
    description: "Log one of your saved favourites.",
    emoji: "⭐",
    xp: 20,
    progress: (ctx) => (todayEntries(ctx).some((entry) => !!entry.foodId) ? 1 : 0),
    done: (ctx) => todayEntries(ctx).some((entry) => !!entry.foodId),
  },
  {
    id: "q-balance",
    title: "Balanced macros",
    description: "Get every macro above 40% of its goal.",
    emoji: "⚖️",
    xp: 35,
    progress: (ctx) => {
      const values = [
        pct(ctx.todayTotals.protein, ctx.goals.protein),
        pct(ctx.todayTotals.carbs, ctx.goals.carbs),
        pct(ctx.todayTotals.fat, ctx.goals.fat),
      ];
      return pct(values.filter((value) => value >= 0.4).length, 3);
    },
    done: (ctx) =>
      ctx.todayTotals.entries > 0 &&
      ctx.todayTotals.protein >= ctx.goals.protein * 0.4 &&
      ctx.todayTotals.carbs >= ctx.goals.carbs * 0.4 &&
      ctx.todayTotals.fat >= ctx.goals.fat * 0.4,
  },
];

export const QUEST_BY_ID: Record<string, Quest> = QUESTS.reduce(
  (acc, quest) => ({ ...acc, [quest.id]: quest }),
  {} as Record<string, Quest>,
);

export const QUESTS_PER_DAY = 3;

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

/** Deterministic trio of quests for a given day key. */
export function questsForDate(date: string): Quest[] {
  const seed = hashString(date);
  const start = seed % QUESTS.length;
  const step = 1 + (seed % (QUESTS.length - 1));
  const picked: Quest[] = [];
  const seen = new Set<string>();
  let cursor = start;
  let guard = 0;
  while (picked.length < QUESTS_PER_DAY && guard < QUESTS.length * 3) {
    const candidate = QUESTS[cursor % QUESTS.length];
    if (!seen.has(candidate.id)) {
      seen.add(candidate.id);
      picked.push(candidate);
    }
    cursor += step;
    guard += 1;
  }
  return picked;
}
