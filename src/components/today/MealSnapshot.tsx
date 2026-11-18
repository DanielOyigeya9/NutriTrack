import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { getAvatar } from "@/data/avatars";
import { useUiStore } from "@/store/useUiStore";
import type { Entry, MealType } from "@/types";
import { MEAL_EMOJI, MEAL_TYPES } from "@/utils/nutrition";

export function MealSnapshot({ entries, date }: { entries: Entry[]; date: string }) {
  const openAddFood = useUiStore((state) => state.openAddFood);
  const avatarEmoji = getAvatar("sprout").emoji;

  return (
    <div>
      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        {MEAL_TYPES.map((meal) => {
          const items = entries.filter((entry) => entry.mealType === meal);
          const kcal = items.reduce((sum, entry) => sum + entry.kcal, 0);
          return (
            <button
              key={meal}
              type="button"
              onClick={() => openAddFood({ date, meal })}
              className="group flex flex-col rounded-pixel border-[3px] border-edge bg-surface p-3 text-left shadow-pixel transition-transform hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-pixel-lg"
            >
              <div className="flex items-center justify-between">
                <span className="text-xl leading-none">{MEAL_EMOJI[meal as MealType]}</span>
                <span className="pixel-label text-muted">{items.length} item{items.length === 1 ? "" : "s"}</span>
              </div>
              <p className="mt-2 font-pixel text-xs font-bold">{meal}</p>
              <p className="font-pixel text-xl font-bold leading-tight">
                {Math.round(kcal)}
                <span className="ml-1 text-2xs font-normal text-muted">kcal</span>
              </p>
              <span className="mt-1 truncate text-2xs text-muted">
                {items.length
                  ? items
                      .slice(0, 2)
                      .map((entry) => entry.name)
                      .join(", ") + (items.length > 2 ? "…" : "")
                  : `Add your ${meal.toLowerCase()} ${avatarEmoji}`}
              </span>
            </button>
          );
        })}
      </div>

      <Link
        to="/diary"
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-forest hover:underline"
      >
        Open the full diary <ArrowRight size={13} />
      </Link>
    </div>
  );
}
