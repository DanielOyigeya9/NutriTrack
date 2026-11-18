import type { CustomFood, Food, FoodCategory, Nutrients } from "@/types";

/** A food from either the seed library or the user's custom list, in one shape. */
export interface DisplayFood {
  id: string;
  name: string;
  category: FoodCategory;
  emoji: string;
  servingLabel: string;
  servingGrams: number;
  per100g: Nutrients;
  region?: string;
  isCustom: boolean;
}

export function toDisplayCustom(food: CustomFood): DisplayFood {
  const per100g: Nutrients = food.per100g
    ? food.nutrients
    : {
        kcal: (food.nutrients.kcal / Math.max(1, food.servingGrams)) * 100,
        protein: (food.nutrients.protein / Math.max(1, food.servingGrams)) * 100,
        carbs: (food.nutrients.carbs / Math.max(1, food.servingGrams)) * 100,
        fat: (food.nutrients.fat / Math.max(1, food.servingGrams)) * 100,
        fiber: ((food.nutrients.fiber ?? 0) / Math.max(1, food.servingGrams)) * 100,
      };

  return {
    id: food.id,
    name: food.name,
    category: food.category,
    emoji: food.emoji ?? "🍽️",
    servingLabel: food.servingLabel,
    servingGrams: food.servingGrams,
    per100g,
    isCustom: true,
  };
}

export function normalizeFood(food: Food): DisplayFood {
  return {
    id: food.id,
    name: food.name,
    category: food.category,
    emoji: food.emoji ?? "🍽️",
    servingLabel: food.servingLabel,
    servingGrams: food.servingGrams,
    per100g: food.per100g,
    region: food.region,
    isCustom: false,
  };
}

export function allFoods(foods: Food[], customFoods: CustomFood[]): DisplayFood[] {
  return [...customFoods.map(toDisplayCustom), ...foods.map(normalizeFood)];
}

export const FOOD_CATEGORIES: FoodCategory[] = [
  "Fruit",
  "Vegetable",
  "Grain",
  "Protein",
  "Dairy",
  "Legume",
  "Soup",
  "Staple",
  "Snack",
  "Drink",
  "Fast Food",
  "Other",
];

/** Simple fuzzy-ish search over a normalized list. */
export function filterFoods(
  list: DisplayFood[],
  query: string,
  category: FoodCategory | "All" = "All",
): DisplayFood[] {
  const q = query.trim().toLowerCase();
  return list.filter((food) => {
    if (category !== "All" && food.category !== category) return false;
    if (!q) return true;
    if (food.name.toLowerCase().includes(q)) return true;
    if (food.category.toLowerCase().includes(q)) return true;
    return q.split(/\s+/).some((term) => term.length > 2 && food.name.toLowerCase().includes(term));
  });
}
