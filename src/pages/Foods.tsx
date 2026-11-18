import { useMemo, useState } from "react";
import { Plus, Search, Trash2 } from "lucide-react";
import { FoodRow } from "@/components/food/FoodRow";
import { Chip } from "@/components/ui/Controls";
import { PixelButton } from "@/components/ui/PixelButton";
import { SectionTitle } from "@/components/ui/Panel";
import { FOODS } from "@/data/foods.seed";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/useUiStore";
import type { FoodCategory } from "@/types";
import { FOOD_CATEGORIES, allFoods, filterFoods } from "@/utils/foods";

type Scope = "all" | "favourites" | "mine";

const SCOPES: Array<{ key: Scope; label: string }> = [
  { key: "all", label: "All foods" },
  { key: "favourites", label: "★ Favourites" },
  { key: "mine", label: "Mine" },
];

export default function Foods() {
  const customFoods = useAppStore((state) => state.customFoods);
  const favorites = useAppStore((state) => state.favorites);
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);
  const removeCustomFood = useAppStore((state) => state.removeCustomFood);
  const pushToast = useAppStore((state) => state.pushToast);
  const openAddFood = useUiStore((state) => state.openAddFood);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<FoodCategory | "All">("All");
  const [scope, setScope] = useState<Scope>("all");

  const library = useMemo(() => allFoods(FOODS, customFoods), [customFoods]);

  const scoped = useMemo(() => {
    if (scope === "favourites") return library.filter((food) => favorites.includes(food.id));
    if (scope === "mine") return library.filter((food) => food.isCustom);
    return library;
  }, [library, favorites, scope]);

  const results = useMemo(
    () => filterFoods(scoped, query, category).slice(0, 120),
    [scoped, query, category],
  );

  const handleDelete = (id: string, name: string) => {
    removeCustomFood(id);
    pushToast({ kind: "info", title: `${name} removed`, emoji: "🗑️" });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl leading-tight">Food library</h1>
          <p className="text-sm text-muted">
            {library.length} foods — including {customFoods.length} of your own.
          </p>
        </div>
        <PixelButton variant="amber" onClick={() => openAddFood()}>
          <Plus size={15} strokeWidth={3} /> Log a food
        </PixelButton>
      </div>

      <div className="rounded-pixel border-[3px] border-edge bg-surface p-3 shadow-pixel-sm">
        <div className="space-y-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search jollof rice, banana, chicken, oats…"
              className="w-full rounded-pixel border-[3px] border-edge bg-surface py-2.5 pl-9 pr-3 text-sm font-semibold shadow-pixel-in outline-none placeholder:text-muted/70 focus:bg-surface-2"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {SCOPES.map((item) => (
              <Chip key={item.key} active={scope === item.key} onClick={() => setScope(item.key)}>
                {item.label}
              </Chip>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5">
            <Chip active={category === "All"} onClick={() => setCategory("All")}>
              All
            </Chip>
            {FOOD_CATEGORIES.map((item) => (
              <Chip key={item} active={category === item} onClick={() => setCategory(item)}>
                {item}
              </Chip>
            ))}
          </div>
        </div>
      </div>

      <section>
        <SectionTitle
          hint={`${results.length} shown`}
          action={
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCategory("All");
                setScope("all");
              }}
              className="pixel-label text-muted hover:text-body"
            >
              Reset filters
            </button>
          }
        >
          Results
        </SectionTitle>

        {results.length === 0 ? (
          <div className="rounded-pixel border-[3px] border-dashed border-edge bg-surface-2 px-4 py-10 text-center">
            <p className="text-3xl">🔍</p>
            <p className="mt-2 text-sm font-bold">No foods match that yet.</p>
            <p className="text-xs text-muted">
              Try another word, widen the filters, or add your own food from the Log sheet.
            </p>
          </div>
        ) : (
          <div className="grid gap-2 lg:grid-cols-2">
            {results.map((food) => (
              <FoodRow
                key={food.id}
                food={food}
                favorite={favorites.includes(food.id)}
                onToggleFavorite={toggleFavorite}
                onSelect={(item) => openAddFood({ foodId: item.id })}
                action={
                  food.isCustom ? (
                    <div className="flex items-center gap-1.5">
                      <PixelButton
                        size="icon"
                        variant="ghost"
                        aria-label={`Log ${food.name}`}
                        onClick={() => openAddFood({ foodId: food.id })}
                      >
                        <Plus size={16} strokeWidth={3} />
                      </PixelButton>
                      <PixelButton
                        size="icon"
                        variant="ghost"
                        aria-label={`Delete ${food.name}`}
                        onClick={() => handleDelete(food.id, food.name)}
                      >
                        <Trash2 size={15} className="text-coral-dark" />
                      </PixelButton>
                    </div>
                  ) : (
                    <PixelButton
                      size="icon"
                      variant="ghost"
                      aria-label={`Log ${food.name}`}
                      onClick={() => openAddFood({ foodId: food.id })}
                    >
                      <Plus size={16} strokeWidth={3} />
                    </PixelButton>
                  )
                }
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
