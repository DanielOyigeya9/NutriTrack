import { useState } from "react";
import { PixelButton } from "@/components/ui/PixelButton";
import { Chip, NumberField, TextField, Toggle } from "@/components/ui/Controls";
import { useAppStore } from "@/store/useAppStore";
import type { FoodCategory } from "@/types";
import { FOOD_CATEGORIES, toDisplayCustom, type DisplayFood } from "@/utils/foods";

interface CustomFoodFormProps {
  onCreated: (food: DisplayFood) => void;
  onCancel: () => void;
}

const emptyNumber = (value: string) => (value === "" ? 0 : Number(value));

export function CustomFoodForm({ onCreated, onCancel }: CustomFoodFormProps) {
  const addCustomFood = useAppStore((state) => state.addCustomFood);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<FoodCategory>("Other");
  const [servingLabel, setServingLabel] = useState("1 serving");
  const [servingGrams, setServingGrams] = useState(100);
  const [emoji, setEmoji] = useState("🍽️");
  const [per100g, setPer100g] = useState(false);
  const [kcal, setKcal] = useState(0);
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fat, setFat] = useState(0);
  const [fiber, setFiber] = useState(0);
  const [error, setError] = useState<string>();

  const handleSave = () => {
    if (name.trim().length < 2) {
      setError("Give your food a name (2+ characters).");
      return;
    }
    if (kcal <= 0 && protein + carbs + fat <= 0) {
      setError("Add at least some calories or macros.");
      return;
    }
    const created = addCustomFood({
      name: name.trim(),
      category,
      servingLabel: servingLabel.trim() || "1 serving",
      servingGrams: Math.max(1, servingGrams),
      per100g,
      emoji: emoji.trim() || "🍽️",
      nutrients: { kcal, protein, carbs, fat, fiber },
    });
    onCreated(toDisplayCustom(created));
  };

  return (
    <div className="space-y-4">
      <p className="rounded-pixel border-[3px] border-edge bg-sky/10 px-3 py-2 text-xs text-muted">
        Type the values from a packet, a recipe you cooked, or a trusted nutrition source. Your
        custom foods are saved to this browser and appear in search.
      </p>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <TextField
          label="Food name"
          placeholder="e.g. Grandma's pepper soup"
          value={name}
          maxLength={48}
          onChange={(event) => {
            setName(event.target.value);
            setError(undefined);
          }}
          error={error}
        />
        <TextField
          label="Tile"
          className="sm:w-24"
          value={emoji}
          maxLength={2}
          onChange={(event) => setEmoji(event.target.value)}
          hint="one emoji"
        />
      </div>

      <div>
        <p className="pixel-label mb-1.5 text-muted">Category</p>
        <div className="flex flex-wrap gap-1.5">
          {FOOD_CATEGORIES.map((item) => (
            <Chip key={item} active={item === category} onClick={() => setCategory(item)}>
              {item}
            </Chip>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <TextField
          label="Serving name"
          value={servingLabel}
          maxLength={24}
          onChange={(event) => setServingLabel(event.target.value)}
          hint='e.g. "1 bowl"'
        />
        <NumberField
          label="Serving size (g)"
          value={servingGrams}
          min={1}
          max={2000}
          onChange={(event) => setServingGrams(emptyNumber(event.target.value))}
        />
      </div>

      <Toggle
        checked={per100g}
        onChange={setPer100g}
        label="Values are per 100 g"
        hint={per100g ? "Leave off if you're entering totals for one serving." : "Values below describe one serving."}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <NumberField
          label="Calories"
          value={kcal}
          min={0}
          max={3000}
          onChange={(event) => setKcal(emptyNumber(event.target.value))}
        />
        <NumberField
          label="Protein (g)"
          value={protein}
          min={0}
          max={200}
          step={0.1}
          onChange={(event) => setProtein(emptyNumber(event.target.value))}
        />
        <NumberField
          label="Carbs (g)"
          value={carbs}
          min={0}
          max={300}
          step={0.1}
          onChange={(event) => setCarbs(emptyNumber(event.target.value))}
        />
        <NumberField
          label="Fat (g)"
          value={fat}
          min={0}
          max={200}
          step={0.1}
          onChange={(event) => setFat(emptyNumber(event.target.value))}
        />
        <NumberField
          label="Fibre (g)"
          value={fiber}
          min={0}
          max={100}
          step={0.1}
          onChange={(event) => setFiber(emptyNumber(event.target.value))}
        />
      </div>

      <div className="flex gap-2">
        <PixelButton variant="ghost" onClick={onCancel}>
          Cancel
        </PixelButton>
        <PixelButton variant="primary" className="flex-1" onClick={handleSave}>
          Save &amp; log this food
        </PixelButton>
      </div>
    </div>
  );
}
