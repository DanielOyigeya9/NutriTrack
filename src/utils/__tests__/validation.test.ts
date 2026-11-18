import { describe, expect, it } from "vitest";
import { parseBackup, validateGoals, validateName } from "../validation";

describe("validation utilities", () => {
  it("validates names", () => {
    expect(validateName("")).toBe("Please use at least 2 characters.");
    expect(validateName("A")).toBe("Please use at least 2 characters.");
    expect(validateName("VeryLongUsernameExceedingTwentyChars")).toBe(
      "Please keep it under 20 characters.",
    );
    expect(validateName("Ada")).toBeUndefined();
  });

  it("validates user nutritional goals", () => {
    const valid = validateGoals({
      kcal: 2000,
      protein: 120,
      carbs: 200,
      fat: 65,
      waterMl: 2500,
    });
    expect(Object.keys(valid)).toHaveLength(0);

    const invalid = validateGoals({
      kcal: 500, // min 800
      protein: 10, // min 20
      carbs: 1000, // max 700
      fat: 5, // min 10
      waterMl: 100, // min 500
    });
    expect(invalid.kcal).toBeDefined();
    expect(invalid.protein).toBeDefined();
    expect(invalid.carbs).toBeDefined();
    expect(invalid.fat).toBeDefined();
    expect(invalid.waterMl).toBeDefined();
  });

  it("handles valid and invalid backup JSON parsing", () => {
    const badJson = parseBackup("{not valid json");
    expect(badJson.ok).toBe(false);

    const wrongApp = parseBackup(
      JSON.stringify({
        app: "otherapp",
      }),
    );
    expect(wrongApp.ok).toBe(false);

    const validBackup = parseBackup(
      JSON.stringify({
        app: "nutritrack",
        version: 1,
        profile: { name: "Tester", avatarId: "fox", onboarded: true },
        goals: { kcal: 2100, protein: 140, carbs: 220, fat: 70, waterMl: 2500 },
        entries: [],
        water: {},
        gamification: {},
        settings: { theme: "light" },
      }),
    );
    expect(validBackup.ok).toBe(true);
    if (validBackup.ok) {
      expect(validBackup.data.profile.name).toBe("Tester");
      expect(validBackup.data.goals.kcal).toBe(2100);
    }
  });
});
