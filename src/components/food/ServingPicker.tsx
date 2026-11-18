import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { PixelButton } from "@/components/ui/PixelButton";
import { Chip, Stepper, TextField } from "@/components/ui/Controls";
import type { MealType } from "@/types";
import { MEAL_TYPES, formatMacro, nutrientsForGrams, nutrientsForQuantity } from "@/utils/nutrition";
import type { DisplayFood } from "@/utils/foods";
import { formatGrams } from "@/utils/format";

interface ServingPickerProps {
  food: DisplayFood;
  initialMeal: MealType;
  onBack: () => void;
  onConfirm: (values: { quantity: number; mealType: MealType; note: string }) => void;
}

export function ServingPicker({ food, initialMeal, onBack, onConfirm }: ServingPickerProps) {
  const [quantity, setQuantity] = useState(1);
  const [mealType, setMealType] = useState<MealType>(initialMeal);
  const [note, setNote] = useState("");

  const perServing = nutrientsForGrams(food.per100g, food.servingGrams);
  const scaled = nutrientsForQuantity(perServing, quantity);

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-bold text-muted hover:text-body"
      >
        <ArrowLeft size={13} /> Back to search
      </button>

      <div className="flex items-center gap-3 rounded-pixel border-[3px] border-edge bg-surface-2 px-3 py-2.5">
        <span className="checker flex h-12 w-12 items-center justify-center rounded-[6px] border-[3px] border-edge text-2xl leading-none">
          {food.emoji}
        </span>
        <div className="min-w-0">
          <p className="truncate text-base font-extrabold">{food.name}</p>
          <p className="text-xs text-muted">
            {food.category} · 1 {food.servingLabel} = {formatGrams(food.servingGrams)}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="pixel-label mb-1.5 text-muted">Servings</p>
          <Stepper value={quantity} onChange={setQuantity} step={0.5} min={0.25} max={20} suffix="x" />
        </div>
        <div>
          <p className="pixel-label mb-1.5 text-muted">Meal</p>
          <div className="flex flex-wrap gap-1.5">
            {MEAL_TYPES.map((meal) => (
              <Chip key={meal} active={meal === mealType} onClick={() => setMealType(meal)}>
                {meal}
              </Chip>
            ))}
          </div>
        </div>
      </div>

      <TextField
        label="Note (optional)"
        placeholder="e.g. extra pepper, small portion"
        value={note}
        maxLength={80}
        onChange={(event) => setNote(event.target.value)}
      />

      <div className="rounded-pixel border-[3px] border-edge bg-forest/10 p-3">
        <p className="pixel-label mb-2 text-muted">This entry</p>
        <div className="flex items-end justify-between">
          <span className="font-pixel text-2xl font-bold">{Math.round(scaled.kcal)}</span>
          <span className="pixel-label pb-1 text-muted">kcal</span>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2 text-center">
          {[
            { label: "Protein", value: scaled.protein, tone: "text-coral-dark" },
            { label: "Carbs", value: scaled.carbs, tone: "text-amber-dark" },
            { label: "Fat", value: scaled.fat, tone: "text-plum-dark" },
          ].map((macro) => (
            <div key={macro.label} className="rounded-[5px] border-[2px] border-edge bg-surface py-1">
              <p className="pixel-label text-muted">{macro.label}</p>
              <p className={`font-pixel text-sm font-bold ${macro.tone}`}>
                {formatMacro(macro.value)}
                <span className="text-2xs"> g</span>
              </p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-2xs text-muted">
          ≈ {formatGrams(food.servingGrams * quantity)} total
        </p>
      </div>

      <PixelButton
        variant="primary"
        size="lg"
        className="w-full"
        onClick={() => onConfirm({ quantity, mealType, note: note.trim() })}
      >
        Log it
      </PixelButton>
    </div>
  );
}
