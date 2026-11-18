import { describe, expect, it } from "vitest";
import {
  buildEntry,
  inCalorieBand,
  macroCalorieSplit,
  nutrientsForGrams,
  nutrientsForQuantity,
  scaleMacroGoals,
} from "../nutrition";
import type { Food, DayTotals } from "@/types";

describe("nutrition utilities", () => {
  it("calculates nutrients scaled to gram weights", () => {
    const per100g = { kcal: 200, protein: 10, carbs: 20, fat: 5, fiber: 2 };
    const scaled = nutrientsForGrams(per100g, 150);
    expect(scaled.kcal).toBe(300);
    expect(scaled.protein).toBe(15);
    expect(scaled.carbs).toBe(30);
    expect(scaled.fat).toBe(7.5);
    expect(scaled.fiber).toBe(3);
  });

  it("scales nutrients for quantity of servings", () => {
    const perServing = { kcal: 100, protein: 5, carbs: 12, fat: 2 };
    const scaled = nutrientsForQuantity(perServing, 2.5);
    expect(scaled.kcal).toBe(250);
    expect(scaled.protein).toBe(12.5);
    expect(scaled.carbs).toBe(30);
    expect(scaled.fat).toBe(5);
  });

  it("checks whether calories are within the healthy band", () => {
    expect(inCalorieBand(2000, 2000)).toBe(true);
    expect(inCalorieBand(1850, 2000)).toBe(true); // -7.5%
    expect(inCalorieBand(2150, 2000)).toBe(true); // +7.5%
    expect(inCalorieBand(1700, 2000)).toBe(false); // -15%
    expect(inCalorieBand(2300, 2000)).toBe(false); // +15%
  });

  it("calculates macro calorie split percentage", () => {
    // 50g protein * 4 = 200kcal, 50g carbs * 4 = 200kcal, 22.22g fat * 9 = 200kcal => equal split
    const totals: DayTotals = {
      kcal: 600,
      protein: 50,
      carbs: 50,
      fat: 22.22,
      fiber: 0,
      waterMl: 0,
      entries: 1,
    };
    const split = macroCalorieSplit(totals);
    expect(split.protein).toBe(33);
    expect(split.carbs).toBe(33);
    expect(split.fat).toBe(33);
  });

  it("scales macro gram goals given total calories and desired percentages", () => {
    const goals = scaleMacroGoals(2000, { protein: 30, carbs: 40, fat: 30 });
    expect(goals.kcal).toBe(2000);
    expect(goals.protein).toBe(150); // 600 / 4
    expect(goals.carbs).toBe(200); // 800 / 4
    expect(goals.fat).toBe(67); // 600 / 9 rounded
  });

  it("correctly builds entry from a library food", () => {
    const mockFood: Food = {
      id: "apple",
      name: "Apple",
      category: "Fruit",
      servingLabel: "1 medium",
      servingGrams: 150,
      per100g: { kcal: 52, protein: 0.3, carbs: 14, fat: 0.2 },
      emoji: "🍎",
    };

    const entry = buildEntry({
      food: mockFood,
      name: "Apple",
      mealType: "Snack",
      date: "2026-11-15",
      quantity: 1,
    });

    expect(entry.name).toBe("Apple");
    expect(entry.grams).toBe(150);
    expect(entry.kcal).toBe(78);
    expect(entry.mealType).toBe("Snack");
  });
});
