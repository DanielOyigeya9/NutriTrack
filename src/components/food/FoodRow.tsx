import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DisplayFood } from "@/utils/foods";
import { nutrientsForGrams } from "@/utils/nutrition";

interface FoodRowProps {
  food: DisplayFood;
  favorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  onSelect?: (food: DisplayFood) => void;
  action?: React.ReactNode;
}

export function FoodRow({ food, favorite, onToggleFavorite, onSelect, action }: FoodRowProps) {
  const perServing = nutrientsForGrams(food.per100g, food.servingGrams);

  return (
    <div className="flex items-center gap-3 rounded-pixel border-[3px] border-edge bg-surface px-2.5 py-2 shadow-pixel-sm">
      <button
        type="button"
        onClick={() => onSelect?.(food)}
        className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
      >
        <span className="checker flex h-9 w-9 shrink-0 items-center justify-center rounded-[5px] border-[2px] border-edge text-lg leading-none">
          {food.emoji}
        </span>
        <span className="min-w-0">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-sm font-bold">{food.name}</span>
            {food.region === "NG" && (
              <span className="shrink-0 rounded-[3px] border-[2px] border-edge bg-amber/30 px-1 font-pixel text-[8px]">
                NG
              </span>
            )}
            {food.isCustom && (
              <span className="shrink-0 rounded-[3px] border-[2px] border-edge bg-plum/25 px-1 font-pixel text-[8px]">
                MINE
              </span>
            )}
          </span>
          <span className="block truncate text-xs text-muted">
            {food.servingLabel} · {Math.round(perServing.kcal)} kcal · P
            {Math.round(perServing.protein)} C{Math.round(perServing.carbs)} F
            {Math.round(perServing.fat)}
          </span>
        </span>
      </button>

      {onToggleFavorite && (
        <button
          type="button"
          aria-label={favorite ? "Remove from favourites" : "Add to favourites"}
          onClick={() => onToggleFavorite(food.id)}
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-pixel border-[3px] border-edge",
            favorite ? "bg-amber" : "bg-surface-2",
          )}
        >
          <Star size={14} className={favorite ? "text-ink" : "text-muted"} fill={favorite ? "#221A14" : "none"} />
        </button>
      )}

      {action}
    </div>
  );
}
