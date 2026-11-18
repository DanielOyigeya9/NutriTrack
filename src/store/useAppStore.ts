import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { ACHIEVEMENTS } from "@/data/achievements.seed";
import { questsForDate } from "@/data/quests.seed";
import { FOOD_BY_ID } from "@/data/foods.seed";
import { indexedDbStorage } from "@/lib/indexedDbStorage";
import { reportPersistenceStatus } from "@/lib/persistenceStatus";
import type {
  AchievementContext,
  CustomFood,
  Entry,
  Food,
  Goals,
  MealType,
  PersistedState,
  Profile,
  Toast,
} from "@/types";
import { addDays, todayKey } from "@/utils/dates";
import { makeId } from "@/utils/nutrition";
import {
  XP,
  advanceStreak,
  buildContext,
  currentStreakLength,
  isCalorieGoalMet,
  isProteinGoalMet,
  isWaterGoalMet,
  levelFromXp,
} from "@/utils/gamification";

const DEFAULT_GOALS: Goals = {
  kcal: 2000,
  protein: 125,
  carbs: 225,
  fat: 67,
  waterMl: 2000,
};

export const initialState: PersistedState = {
  version: 1,
  profile: { name: "", avatarId: "sprout", onboarded: false, createdAt: new Date().toISOString() },
  goals: DEFAULT_GOALS,
  entries: [],
  water: {},
  customFoods: [],
  favorites: [],
  gamification: {
    xp: 0,
    logStreak: 0,
    waterStreak: 0,
    bestStreak: 0,
    lastLoggedDate: null,
    lastWaterDate: null,
    unlocked: {},
    seenLevel: 1,
    totalEntries: 0,
    totalWaterMl: 0,
    distinctFoods: [],
  },
  quests: {},
  settings: { theme: "light", units: "metric", autoMeal: true },
};

const BONUS = {
  water: "bonus-water-goal",
  kcal: "bonus-calorie-goal",
  protein: "bonus-protein-goal",
} as const;

interface AddEntryInput {
  food?: Food;
  name: string;
  mealType: MealType;
  date: string;
  quantity: number;
  grams: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  emoji?: string;
  note?: string;
  entryId?: string;
}

interface AppState extends PersistedState {
  toasts: Toast[];
  levelUpTo: number | null;
  completeOnboarding: (profile: Partial<Profile>, goals: Goals) => void;
  updateProfile: (profile: Partial<Profile>) => void;
  setGoals: (goals: Goals) => void;
  updateSettings: (settings: Partial<PersistedState["settings"]>) => void;
  addEntry: (input: AddEntryInput) => void;
  removeEntry: (id: string) => void;
  updateEntry: (id: string, patch: Partial<Entry>) => void;
  addWater: (date: string, ml: number) => void;
  setWater: (date: string, ml: number) => void;
  toggleFavorite: (foodId: string) => void;
  addCustomFood: (food: Omit<CustomFood, "id" | "createdAt">) => CustomFood;
  removeCustomFood: (id: string) => void;
  refreshStreaks: () => void;
  pushToast: (toast: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
  clearLevelUp: () => void;
  replaceState: (next: PersistedState) => void;
  reset: () => void;
}

function computeStreakFromLogs(entries: Entry[], today: string): number {
  return currentStreakLength(entries, today);
}

function computeWaterStreak(water: Record<string, number>, today: string): number {
  const has = (key: string) => (water[key] ?? 0) > 0;
  let cursor = has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

/** Evaluate quests, daily bonuses and achievements; returns the next state patch. */
function evaluateProgress(state: AppState): Partial<AppState> {
  const today = todayKey();
  const ctx: AchievementContext = buildContext(state, today);
  const completedToday = new Set(state.quests[today] ?? []);
  const toasts: Toast[] = [];
  let xp = state.gamification.xp;

  for (const quest of questsForDate(today)) {
    if (quest.done(ctx) && !completedToday.has(quest.id)) {
      completedToday.add(quest.id);
      xp += quest.xp;
      toasts.push({
        id: makeId("toast"),
        kind: "success",
        title: `Quest complete — ${quest.title}`,
        message: quest.description,
        emoji: quest.emoji,
        xp: quest.xp,
      });
    }
  }

  const bonuses: Array<{ key: string; met: boolean; title: string; emoji: string }> = [
    { key: BONUS.water, met: isWaterGoalMet(ctx), title: "Water goal reached", emoji: "💧" },
    { key: BONUS.kcal, met: isCalorieGoalMet(ctx), title: "Calorie goal on target", emoji: "🎯" },
    { key: BONUS.protein, met: isProteinGoalMet(ctx), title: "Protein goal reached", emoji: "💪" },
  ];
  const bonusXp: Record<string, number> = {
    [BONUS.water]: XP.waterGoal,
    [BONUS.kcal]: XP.calorieGoal,
    [BONUS.protein]: XP.proteinGoal,
  };
  for (const bonus of bonuses) {
    if (bonus.met && !completedToday.has(bonus.key)) {
      completedToday.add(bonus.key);
      const amount = bonusXp[bonus.key];
      xp += amount;
      toasts.push({
        id: makeId("toast"),
        kind: "success",
        title: bonus.title,
        emoji: bonus.emoji,
        xp: amount,
      });
    }
  }

  const unlocked = { ...state.gamification.unlocked };
  for (const achievement of ACHIEVEMENTS) {
    if (!unlocked[achievement.id] && achievement.earned(ctx)) {
      unlocked[achievement.id] = new Date().toISOString();
      xp += achievement.xp;
      toasts.push({
        id: makeId("toast"),
        kind: "achievement",
        title: achievement.title,
        message: achievement.description,
        emoji: achievement.emoji,
        xp: achievement.xp,
      });
    }
  }

  const level = levelFromXp(xp);
  const levelUpTo = level > state.gamification.seenLevel ? level : state.levelUpTo;

  return {
    gamification: { ...state.gamification, xp, unlocked, seenLevel: level },
    quests: { ...state.quests, [today]: Array.from(completedToday) },
    toasts: [...state.toasts, ...toasts].slice(-4),
    levelUpTo: levelUpTo ?? null,
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,
      toasts: [],
      levelUpTo: null,

      completeOnboarding: (profile, goals) => {
        set((state) => ({
          profile: { ...state.profile, ...profile, onboarded: true },
          goals,
        }));
        const next = evaluateProgress(get());
        set(next as AppState);
      },

      updateProfile: (profile) => set((state) => ({ profile: { ...state.profile, ...profile } })),

      setGoals: (goals) => set({ goals }),

      updateSettings: (settings) => set((state) => ({ settings: { ...state.settings, ...settings } })),

      addEntry: (input) => {
        const state = get();
        const entry: Entry = {
          id: input.entryId ?? makeId("entry"),
          date: input.date,
          mealType: input.mealType,
          foodId: input.food?.id,
          name: input.name,
          quantity: input.quantity,
          servingLabel: input.food?.servingLabel ?? "serving",
          grams: Math.round(input.grams),
          kcal: Math.round(input.kcal),
          protein: Math.round(input.protein * 10) / 10,
          carbs: Math.round(input.carbs * 10) / 10,
          fat: Math.round(input.fat * 10) / 10,
          emoji: input.emoji ?? input.food?.emoji ?? "🍽️",
          note: input.note,
          createdAt: new Date().toISOString(),
        };

        const entries = [...state.entries, entry];
        const streakResult = advanceStreak(
          state.gamification.lastLoggedDate,
          state.gamification.lastLoggedDate === input.date
            ? state.gamification.logStreak
            : computeStreakFromLogs(entries, todayKey()),
          input.date,
        );
        const distinctFoods = entry.foodId
          ? Array.from(new Set([...state.gamification.distinctFoods, entry.foodId]))
          : state.gamification.distinctFoods;

        set({
          entries,
          gamification: {
            ...state.gamification,
            xp: state.gamification.xp + XP.perEntry,
            logStreak: Math.max(state.gamification.logStreak, streakResult.streak),
            bestStreak: Math.max(state.gamification.bestStreak, streakResult.streak),
            lastLoggedDate: input.date,
            totalEntries: state.gamification.totalEntries + 1,
            distinctFoods,
          },
        });

        const patch = evaluateProgress(get());
        set(patch as AppState);
      },

      removeEntry: (id) => {
        set((state) => ({ entries: state.entries.filter((entry) => entry.id !== id) }));
      },

      updateEntry: (id, patch) => {
        set((state) => ({
          entries: state.entries.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)),
        }));
        const next = evaluateProgress(get());
        set(next as AppState);
      },

      addWater: (date, ml) => {
        const state = get();
        const current = state.water[date] ?? 0;
        const next = Math.max(0, Math.min(10000, current + ml));
        const gained = Math.max(0, next - current);
        set({
          water: { ...state.water, [date]: next },
          gamification: {
            ...state.gamification,
            totalWaterMl: state.gamification.totalWaterMl + gained,
            lastWaterDate: date,
          },
        });
        const patch = evaluateProgress(get());
        set(patch as AppState);
        set((s) => {
          const waterStreak = computeWaterStreak(s.water, todayKey());
          return { gamification: { ...s.gamification, waterStreak } };
        });
      },

      setWater: (date, ml) => {
        set((state) => {
          const current = state.water[date] ?? 0;
          const clamped = Math.max(0, Math.min(10000, ml));
          const delta = clamped - current;
          return {
            water: { ...state.water, [date]: clamped },
            gamification: {
              ...state.gamification,
              totalWaterMl: Math.max(0, state.gamification.totalWaterMl + delta),
            },
          };
        });
        const patch = evaluateProgress(get());
        set(patch as AppState);
        set((s) => ({ gamification: { ...s.gamification, waterStreak: computeWaterStreak(s.water, todayKey()) } }));
      },

      toggleFavorite: (foodId) =>
        set((state) => ({
          favorites: state.favorites.includes(foodId)
            ? state.favorites.filter((id) => id !== foodId)
            : [...state.favorites, foodId],
        })),

      addCustomFood: (food) => {
        const custom: CustomFood = { ...food, id: makeId("custom"), createdAt: new Date().toISOString() };
        set((state) => ({ customFoods: [custom, ...state.customFoods] }));
        return custom;
      },

      removeCustomFood: (id) =>
        set((state) => ({ customFoods: state.customFoods.filter((food) => food.id !== id) })),

      refreshStreaks: () => {
        set((state) => {
          const today = todayKey();
          const logStreak = computeStreakFromLogs(state.entries, today);
          const waterStreak = computeWaterStreak(state.water, today);
          return {
            gamification: {
              ...state.gamification,
              logStreak,
              waterStreak,
              bestStreak: Math.max(state.gamification.bestStreak, logStreak),
            },
          };
        });
      },

      pushToast: (toast) =>
        set((state) => ({ toasts: [...state.toasts, { ...toast, id: makeId("toast") }].slice(-4) })),

      dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),

      clearLevelUp: () => set({ levelUpTo: null }),

      replaceState: (next) =>
        set(() => ({
          ...next,
          toasts: [],
          levelUpTo: null,
        })),

      reset: () => set(() => ({ ...structuredClone(initialState), toasts: [], levelUpTo: null })),
    }),
    {
      name: "nutritrack:v1",
      version: 1,
      storage: createJSONStorage(() => indexedDbStorage),
      onRehydrateStorage: () => {
        reportPersistenceStatus({ state: "loading" });
        return (_state, error) => {
          if (error) {
            console.error("NutriTrack could not load saved data from IndexedDB.", error);
            reportPersistenceStatus({
              state: "error",
              message: "Saved data could not be loaded from this device.",
            });
            return;
          }
          reportPersistenceStatus({ state: "ready" });
        };
      },
      partialize: (state) => {
        const { toasts, levelUpTo, ...rest } = state;
        void toasts;
        void levelUpTo;
        return rest as PersistedState;
      },
    },
  ),
);

export { DEFAULT_GOALS };
export const getFoodById = (id: string): Food | undefined => FOOD_BY_ID[id];
