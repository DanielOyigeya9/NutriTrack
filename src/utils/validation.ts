import type { BackupFile, Goals, ImportResult, PersistedState } from "@/types";

export const GOAL_LIMITS = {
  kcal: { min: 800, max: 6000 },
  protein: { min: 20, max: 400 },
  carbs: { min: 20, max: 700 },
  fat: { min: 10, max: 250 },
  waterMl: { min: 500, max: 6000 },
} as const;

export interface GoalErrors {
  kcal?: string;
  protein?: string;
  carbs?: string;
  fat?: string;
  waterMl?: string;
}

function check(
  value: number,
  key: keyof typeof GOAL_LIMITS,
  label: string,
): string | undefined {
  const { min, max } = GOAL_LIMITS[key];
  if (!Number.isFinite(value)) return `${label} must be a number.`;
  if (value < min) return `${label} must be at least ${min}.`;
  if (value > max) return `${label} must be at most ${max}.`;
  return undefined;
}

export function validateGoals(goals: Goals): GoalErrors {
  const errors: GoalErrors = {};
  const kcal = check(goals.kcal, "kcal", "Calories");
  if (kcal) errors.kcal = kcal;
  const protein = check(goals.protein, "protein", "Protein");
  if (protein) errors.protein = protein;
  const carbs = check(goals.carbs, "carbs", "Carbs");
  if (carbs) errors.carbs = carbs;
  const fat = check(goals.fat, "fat", "Fat");
  if (fat) errors.fat = fat;
  const water = check(goals.waterMl, "waterMl", "Water");
  if (water) errors.waterMl = water;
  return errors;
}

export function hasGoalErrors(errors: GoalErrors): boolean {
  return Object.values(errors).some(Boolean);
}

/** Percentage split across macros, derived from gram goals. */
export function splitPercentages(goals: { protein: number; carbs: number; fat: number }) {
  const p = goals.protein * 4;
  const c = goals.carbs * 4;
  const f = goals.fat * 9;
  const sum = p + c + f || 1;
  return {
    protein: Math.round((p / sum) * 100),
    carbs: Math.round((c / sum) * 100),
    fat: Math.round((f / sum) * 100),
  };
}

const REQUIRED_KEYS: Array<keyof PersistedState> = [
  "profile",
  "goals",
  "entries",
  "water",
  "gamification",
  "settings",
];

/** Validate and normalize an imported backup file. */
export function parseBackup(raw: string): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: "That file isn't valid JSON." };
  }

  if (!parsed || typeof parsed !== "object") {
    return { ok: false, error: "That file doesn't look like a NutriTrack backup." };
  }

  const candidate = parsed as Partial<BackupFile> & Partial<PersistedState>;
  const data = (candidate.data ?? candidate) as Partial<PersistedState>;

  if (candidate.app && candidate.app !== "nutritrack") {
    return { ok: false, error: "That backup belongs to a different app." };
  }

  for (const key of REQUIRED_KEYS) {
    if (data[key] === undefined || data[key] === null) {
      return { ok: false, error: `Backup is missing "${key}".` };
    }
  }

  if (!Array.isArray(data.entries)) {
    return { ok: false, error: 'Backup "entries" must be a list.' };
  }

  if (typeof data.goals?.kcal !== "number" || data.goals.kcal <= 0) {
    return { ok: false, error: "Backup goals are invalid." };
  }

  const normalized: PersistedState = {
    version: 1,
    profile: {
      name: data.profile?.name ?? "Friend",
      avatarId: data.profile?.avatarId ?? "sprout",
      onboarded: true,
      createdAt: data.profile?.createdAt ?? new Date().toISOString(),
    },
    goals: {
      kcal: data.goals.kcal,
      protein: data.goals.protein ?? 0,
      carbs: data.goals.carbs ?? 0,
      fat: data.goals.fat ?? 0,
      waterMl: data.goals.waterMl ?? 2000,
    },
    entries: data.entries,
    water: data.water ?? {},
    customFoods: data.customFoods ?? [],
    favorites: data.favorites ?? [],
    gamification: {
      xp: data.gamification?.xp ?? 0,
      logStreak: data.gamification?.logStreak ?? 0,
      waterStreak: data.gamification?.waterStreak ?? 0,
      bestStreak: data.gamification?.bestStreak ?? 0,
      lastLoggedDate: data.gamification?.lastLoggedDate ?? null,
      lastWaterDate: data.gamification?.lastWaterDate ?? null,
      unlocked: data.gamification?.unlocked ?? {},
      seenLevel: data.gamification?.seenLevel ?? 1,
      totalEntries: data.gamification?.totalEntries ?? data.entries.length,
      totalWaterMl: data.gamification?.totalWaterMl ?? 0,
      distinctFoods: data.gamification?.distinctFoods ?? [],
    },
    quests: data.quests ?? {},
    settings: {
      theme: data.settings?.theme === "dark" ? "dark" : "light",
      units: data.settings?.units === "imperial" ? "imperial" : "metric",
      autoMeal: data.settings?.autoMeal ?? true,
    },
  };

  return { ok: true, data: normalized };
}

export function validateName(name: string): string | undefined {
  const trimmed = name.trim();
  if (trimmed.length < 2) return "Please use at least 2 characters.";
  if (trimmed.length > 20) return "Please keep it under 20 characters.";
  return undefined;
}
