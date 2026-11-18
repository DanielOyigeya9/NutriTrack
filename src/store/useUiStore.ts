import { create } from "zustand";
import type { MealType } from "@/types";
import { mealForNow, todayKey } from "@/utils/dates";

interface UiState {
  addFoodOpen: boolean;
  addFoodDate: string;
  addFoodMeal: MealType;
  /** when set, the sheet opens straight on this food's serving step */
  addFoodFoodId: string | null;
  openAddFood: (options?: { date?: string; meal?: MealType; foodId?: string }) => void;
  closeAddFood: () => void;
  /** entry id currently being edited in the diary */
  editingEntryId: string | null;
  setEditingEntry: (id: string | null) => void;
}

export const useUiStore = create<UiState>((set) => ({
  addFoodOpen: false,
  addFoodDate: todayKey(),
  addFoodMeal: mealForNow(),
  addFoodFoodId: null,
  openAddFood: (options) =>
    set({
      addFoodOpen: true,
      addFoodDate: options?.date ?? todayKey(),
      addFoodMeal: options?.meal ?? mealForNow(),
      addFoodFoodId: options?.foodId ?? null,
    }),
  closeAddFood: () => set({ addFoodOpen: false, addFoodFoodId: null }),
  editingEntryId: null,
  setEditingEntry: (id) => set({ editingEntryId: id }),
}));
