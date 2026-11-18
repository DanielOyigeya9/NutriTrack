import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { FoodRow } from "@/components/food/FoodRow";
import { ServingPicker } from "@/components/food/ServingPicker";
import { CustomFoodForm } from "@/components/food/CustomFoodForm";
import { Chip } from "@/components/ui/Controls";
import { Modal } from "@/components/ui/Modal";
import { FOODS } from "@/data/foods.seed";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/useUiStore";
import type { MealType } from "@/types";
import { formatRelativeLabel } from "@/utils/dates";
import { allFoods, filterFoods, type DisplayFood } from "@/utils/foods";
import { nutrientsForGrams, nutrientsForQuantity } from "@/utils/nutrition";

type Mode = "search" | "serving" | "custom";

export function AddFoodSheet() {
  const open = useUiStore((state) => state.addFoodOpen);
  const date = useUiStore((state) => state.addFoodDate);
  const meal = useUiStore((state) => state.addFoodMeal);
  const initialFoodId = useUiStore((state) => state.addFoodFoodId);
  const close = useUiStore((state) => state.closeAddFood);

  const customFoods = useAppStore((state) => state.customFoods);
  const favorites = useAppStore((state) => state.favorites);
  const entries = useAppStore((state) => state.entries);
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);
  const addEntry = useAppStore((state) => state.addEntry);
  const pushToast = useAppStore((state) => state.pushToast);

  const [mode, setMode] = useState<Mode>("search");
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<"all" | "favourites" | "recent">("all");
  const [selected, setSelected] = useState<DisplayFood | null>(null);

  const library = useMemo(() => allFoods(FOODS, customFoods), [customFoods]);

  // Jump straight to the serving step when opened from a food's "Log" shortcut.
  useEffect(() => {
    if (!open || !initialFoodId) return;
    const food = library.find((item) => item.id === initialFoodId);
    if (food) {
      setSelected(food);
      setMode("serving");
      setQuery("");
      setScope("all");
    }
  }, [open, initialFoodId, library]);

  const recentIds = useMemo(() => {
    const seen: string[] = [];
    for (let i = entries.length - 1; i >= 0 && seen.length < 12; i -= 1) {
      const id = entries[i].foodId;
      if (id && !seen.includes(id)) seen.push(id);
    }
    return seen;
  }, [entries]);

  const results = useMemo(() => {
    const base =
      scope === "favourites"
        ? library.filter((food) => favorites.includes(food.id))
        : scope === "recent"
          ? recentIds
              .map((id) => library.find((food) => food.id === id))
              .filter((food): food is DisplayFood => Boolean(food))
          : library;
    return filterFoods(base, query).slice(0, 60);
  }, [library, favorites, recentIds, query, scope]);

  const reset = () => {
    setMode("search");
    setSelected(null);
    setQuery("");
    setScope("all");
  };

  const handleClose = () => {
    close();
    reset();
  };

  const handleLog = (
    food: DisplayFood,
    values: { quantity: number; mealType: MealType; note: string },
  ) => {
    const perServing = nutrientsForGrams(food.per100g, food.servingGrams);
    const scaled = nutrientsForQuantity(perServing, values.quantity);
    addEntry({
      food,
      name: food.name,
      mealType: values.mealType,
      date,
      quantity: values.quantity,
      grams: food.servingGrams * values.quantity,
      kcal: scaled.kcal,
      protein: scaled.protein,
      carbs: scaled.carbs,
      fat: scaled.fat,
      emoji: food.emoji,
      note: values.note || undefined,
    });
    pushToast({
      kind: "success",
      title: `${food.name} logged`,
      message: `${Math.round(scaled.kcal)} kcal added to ${values.mealType}`,
      emoji: food.emoji,
      xp: 10,
    });
    handleClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Log a food"
      subtitle={`${formatRelativeLabel(date)} · ${meal}`}
      icon={<Search size={17} />}
      size="lg"
    >
      {mode === "serving" && selected ? (
        <ServingPicker
          food={selected}
          initialMeal={meal}
          onBack={() => {
            setSelected(null);
            setMode("search");
          }}
          onConfirm={(values) => handleLog(selected, values)}
        />
      ) : mode === "custom" ? (
        <CustomFoodForm
          onCancel={() => setMode("search")}
          onCreated={(food) => {
            setSelected(food);
            setMode("serving");
          }}
        />
      ) : (
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search 200+ foods — jollof rice, banana, chicken…"
                className="w-full rounded-pixel border-[3px] border-edge bg-surface py-2 pl-9 pr-3 text-sm font-semibold shadow-pixel-in outline-none placeholder:text-muted/70"
              />
            </div>
            <Chip onClick={() => setMode("custom")}>
              + Custom
            </Chip>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <Chip active={scope === "all"} onClick={() => setScope("all")}>
              All foods
            </Chip>
            <Chip active={scope === "favourites"} onClick={() => setScope("favourites")}>
              ★ Favourites
            </Chip>
            <Chip active={scope === "recent"} onClick={() => setScope("recent")}>
              ↺ Recent
            </Chip>
          </div>

          {results.length === 0 ? (
            <div className="rounded-pixel border-[3px] border-dashed border-edge bg-surface-2 px-4 py-8 text-center">
              <p className="text-3xl">🧐</p>
              <p className="mt-2 text-sm font-bold">Nothing matched “{query}”.</p>
              <p className="text-xs text-muted">
                Try a shorter word, or create a custom food with the + Custom button.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {results.map((food) => (
                <FoodRow
                  key={food.id}
                  food={food}
                  favorite={favorites.includes(food.id)}
                  onToggleFavorite={toggleFavorite}
                  onSelect={(item) => {
                    setSelected(item);
                    setMode("serving");
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
