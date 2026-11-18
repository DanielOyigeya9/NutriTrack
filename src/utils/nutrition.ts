import type {
  CustomFood,
  DayTotals,
  Entry,
  Food,
  Goals,
  MealType,
  Nutrients,
} from "@/types";

export const MEAL_TYPES: MealType[] = ["Breakfast", "Lunch", "Dinner", "Snack"];

export const MEAL_EMOJI: Record<MealType, string> = {
  Breakfast: "🍳",
  Lunch: "🍲",
  Dinner: "🍽️",
  Snack: "🍌",
};

export const EMPTY_TOTALS: DayTotals = {
  kcal: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
  waterMl: 0,
  entries: 0,
};

/** kcal implied by macros (Atwater 4/4/9). */
export function kcalFromMacros(protein: number, carbs: number, fat: number): number {
  return Math.round(protein * 4 + carbs * 4 + fat * 9);
}

/** Scale per-100g nutrients to a gram amount. */
export function nutrientsForGrams(per100g: Nutrients, grams: number): Nutrients {
  const factor = grams / 100;
  return {
    kcal: per100g.kcal * factor,
    protein: per100g.protein * factor,
    carbs: per100g.carbs * factor,
    fat: per100g.fat * factor,
    fiber: (per100g.fiber ?? 0) * factor,
  };
}

/** Scale per-serving nutrients by a quantity multiplier. */
export function nutrientsForQuantity(perServing: Nutrients, quantity: number): Nutrients {
  return {
    kcal: perServing.kcal * quantity,
    protein: perServing.protein * quantity,
    carbs: perServing.carbs * quantity,
    fat: perServing.fat * quantity,
    fiber: (perServing.fiber ?? 0) * quantity,
  };
}

/** Convert a Food's per-100g values into a single-serving value. */
export function servingNutrients(per100g: Nutrients, servingGrams: number): Nutrients {
  return nutrientsForGrams(per100g, servingGrams);
}

interface BuildEntryInput {
  food?: Food | CustomFood;
  name: string;
  mealType: MealType;
  date: string;
  quantity: number;
  /** grams represented by one "serving unit" */
  servingGrams?: number;
  servingLabel?: string;
  emoji?: string;
  note?: string;
  /** override nutrients for this entry (already scaled) */
  nutrients?: Nutrients;
}

let idCounter = 0;
export function makeId(prefix = "id"): string {
  idCounter += 1;
  return `${prefix}_${Date.now().toString(36)}_${idCounter.toString(36)}`;
}

/** Build a fully-scaled entry from a library food or custom food. */
export function buildEntry(input: BuildEntryInput): Entry {
  const { food } = input;
  const isLibraryFood = Boolean(food && typeof food.per100g === "object");
  const grams =
    isLibraryFood
      ? (food as Food).servingGrams * input.quantity
      : (food?.servingGrams ?? input.servingGrams ?? 100) * input.quantity;

  let nutrientSource: Nutrients;
  if (isLibraryFood) {
    nutrientSource = nutrientsForGrams((food as Food).per100g, grams);
  } else if (food) {
    const custom = food as CustomFood;
    nutrientSource = custom.per100g
      ? nutrientsForGrams(custom.nutrients, grams)
      : nutrientsForQuantity(custom.nutrients, input.quantity);
  } else {
    nutrientSource = input.nutrients ?? { kcal: 0, protein: 0, carbs: 0, fat: 0 };
  }

  const kcal = Math.round(nutrientSource.kcal);

  return {
    id: makeId("entry"),
    date: input.date,
    mealType: input.mealType,
    foodId: food?.id,
    name: input.name || food?.name || "Food",
    quantity: input.quantity,
    servingLabel: input.servingLabel || food?.servingLabel || "serving",
    grams: Math.round(grams),
    kcal,
    protein: round1(nutrientSource.protein),
    carbs: round1(nutrientSource.carbs),
    fat: round1(nutrientSource.fat),
    emoji: input.emoji || food?.emoji || "🍽️",
    note: input.note,
    createdAt: new Date().toISOString(),
  };
}

export function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

/** Display rounding: whole numbers, but 1 decimal under 10 g. */
export function formatMacro(value: number): string {
  if (value === 0) return "0";
  return value < 10 ? (Math.round(value * 10) / 10).toFixed(1) : String(Math.round(value));
}

export function formatKcal(value: number): string {
  return Math.round(value).toLocaleString();
}

/** Total up a set of entries plus water. */
export function sumEntries(entries: Entry[], waterMl = 0): DayTotals {
  return entries.reduce<DayTotals>(
    (acc, entry) => ({
      kcal: acc.kcal + entry.kcal,
      protein: round1(acc.protein + entry.protein),
      carbs: round1(acc.carbs + entry.carbs),
      fat: round1(acc.fat + entry.fat),
      fiber: acc.fiber,
      waterMl: acc.waterMl,
      entries: acc.entries + 1,
    }),
    { ...EMPTY_TOTALS, waterMl },
  );
}

export function entriesForDate(entries: Entry[], date: string): Entry[] {
  return entries.filter((entry) => entry.date === date);
}

export function entriesForMeal(entries: Entry[], date: string, meal: MealType): Entry[] {
  return entries.filter((entry) => entry.date === date && entry.mealType === meal);
}

/** 0..1 completion against a goal, clamped. */
export function ratio(value: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.min(1, Math.max(0, value / goal));
}

export function percentOf(value: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.round((value / goal) * 100);
}

/** On-target = within ±10% of the calorie goal. */
export function inCalorieBand(total: number, goal: number): boolean {
  if (goal <= 0) return false;
  return Math.abs(total - goal) <= goal * 0.1;
}

export function proteinHit(total: number, goal: number): boolean {
  return goal > 0 && total >= goal * 0.9;
}

/** Copy a day's entries onto another date (new ids). */
export function cloneEntriesToDate(entries: Entry[], date: string): Entry[] {
  return entries.map((entry) => ({
    ...entry,
    id: makeId("entry"),
    date,
    createdAt: new Date().toISOString(),
  }));
}

export function scaleMacroGoals(
  kcal: number,
  split: { protein: number; carbs: number; fat: number },
): Goals {
  const safeSplit = { ...split };
  const total = safeSplit.protein + safeSplit.carbs + safeSplit.fat || 1;
  const normalized = {
    protein: safeSplit.protein / total,
    carbs: safeSplit.carbs / total,
    fat: safeSplit.fat / total,
  };
  return {
    kcal,
    protein: Math.round((kcal * normalized.protein) / 4),
    carbs: Math.round((kcal * normalized.carbs) / 4),
    fat: Math.round((kcal * normalized.fat) / 9),
    waterMl: 2000,
  };
}

/** Macro split presets, expressed as % of calories. */
export const MACRO_PRESETS = {
  balanced: { protein: 25, carbs: 45, fat: 30 },
  highProtein: { protein: 35, carbs: 40, fat: 25 },
  lowCarb: { protein: 30, carbs: 25, fat: 45 },
} as const;

export function macroCalorieSplit(totals: DayTotals) {
  const proteinKcal = totals.protein * 4;
  const carbsKcal = totals.carbs * 4;
  const fatKcal = totals.fat * 9;
  const sum = proteinKcal + carbsKcal + fatKcal || 1;
  return {
    protein: Math.round((proteinKcal / sum) * 100),
    carbs: Math.round((carbsKcal / sum) * 100),
    fat: Math.round((fatKcal / sum) * 100),
  };
}

export function searchFoods(query: string, foods: Food[], limit = 40): Food[] {
  const q = query.trim().toLowerCase();
  if (!q) return foods.slice(0, limit);
  const terms = q.split(/\s+/);
  const scored = foods
    .map((food) => {
      const name = food.name.toLowerCase();
      let score = 0;
      for (const term of terms) {
        if (name.startsWith(term)) score += 4;
        else if (name.includes(term)) score += 2;
        else if (food.category.toLowerCase().includes(term)) score += 1;
        else score -= 3;
      }
      return { food, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  return scored.map((item) => item.food);
}
