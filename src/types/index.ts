export type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snack";

export type MacroKey = "kcal" | "protein" | "carbs" | "fat";

export type FoodCategory =
  | "Fruit"
  | "Vegetable"
  | "Grain"
  | "Protein"
  | "Dairy"
  | "Legume"
  | "Soup"
  | "Staple"
  | "Snack"
  | "Drink"
  | "Fast Food"
  | "Other";

/** Nutrients for a given reference amount. */
export interface Nutrients {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

/** A food definition from the seeded library. Values are per 100 g. */
export interface Food {
  id: string;
  name: string;
  category: FoodCategory;
  /** e.g. "1 cup", "1 medium", "1 wrap" */
  servingLabel: string;
  /** grams in one serving */
  servingGrams: number;
  per100g: Nutrients;
  /** optional emoji tile used for the pixel food art */
  emoji?: string;
  /** regional tag, e.g. "NG" for Nigerian staples */
  region?: string;
}

/** A user-created food. Values are stored per 100 g when per100g is true. */
export interface CustomFood {
  id: string;
  name: string;
  category: FoodCategory;
  servingLabel: string;
  servingGrams: number;
  per100g: boolean;
  nutrients: Nutrients;
  emoji?: string;
  createdAt: string;
}

/** A single logged food entry. */
export interface Entry {
  id: string;
  date: string;
  mealType: MealType;
  foodId?: string;
  name: string;
  quantity: number;
  servingLabel: string;
  grams: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  emoji?: string;
  note?: string;
  createdAt: string;
}

export interface Goals {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  waterMl: number;
}

export interface Profile {
  name: string;
  avatarId: string;
  onboarded: boolean;
  createdAt: string;
}

export interface Gamification {
  xp: number;
  logStreak: number;
  waterStreak: number;
  bestStreak: number;
  lastLoggedDate: string | null;
  lastWaterDate: string | null;
  unlocked: Record<string, string>;
  seenLevel: number;
  totalEntries: number;
  totalWaterMl: number;
  distinctFoods: string[];
}

export interface AppSettings {
  theme: "light" | "dark";
  units: "metric" | "imperial";
  autoMeal: boolean;
}

export interface DayTotals {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  waterMl: number;
  entries: number;
}

export interface PersistedState {
  version: number;
  profile: Profile;
  goals: Goals;
  entries: Entry[];
  water: Record<string, number>;
  customFoods: CustomFood[];
  favorites: string[];
  gamification: Gamification;
  quests: Record<string, string[]>;
  settings: AppSettings;
}

/** Everything an achievement predicate can look at. */
export interface AchievementContext {
  gamification: Gamification;
  goals: Goals;
  entries: Entry[];
  water: Record<string, number>;
  today: string;
  todayTotals: DayTotals;
  daysLogged: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  tier: "bronze" | "silver" | "gold";
  xp: number;
  /** 0..1 completion for the locked progress bar */
  progress: (ctx: AchievementContext) => number;
  /** true when earned */
  earned: (ctx: AchievementContext) => boolean;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  emoji: string;
  xp: number;
  /** 0..1 progress for today */
  progress: (ctx: AchievementContext) => number;
  done: (ctx: AchievementContext) => boolean;
}

export interface Avatar {
  id: string;
  name: string;
  emoji: string;
  blurb: string;
  /** tailwind-ish accent colour token name */
  accent: "green" | "amber" | "sky" | "coral" | "plum" | "teal";
}

export interface BackupFile {
  app: "nutritrack";
  version: number;
  exportedAt: string;
  data: PersistedState;
}

export type ImportResult =
  | { ok: true; data: PersistedState }
  | { ok: false; error: string };

export interface LevelInfo {
  level: number;
  title: string;
  xp: number;
  xpIntoLevel: number;
  xpForLevel: number;
  xpToNext: number;
  progress: number;
}

export interface Toast {
  id: string;
  kind: "info" | "success" | "achievement" | "error";
  title: string;
  message?: string;
  emoji?: string;
  xp?: number;
}
