import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { PixelButton } from "@/components/ui/PixelButton";
import { Chip, Stepper, TextField } from "@/components/ui/Controls";
import { useAppStore } from "@/store/useAppStore";
import type { Entry, MealType } from "@/types";
import { MEAL_TYPES, formatMacro } from "@/utils/nutrition";

interface EntryEditModalProps {
  entry: Entry | null;
  onClose: () => void;
}

export function EntryEditModal({ entry, onClose }: EntryEditModalProps) {
  const updateEntry = useAppStore((state) => state.updateEntry);
  const pushToast = useAppStore((state) => state.pushToast);

  const [quantity, setQuantity] = useState(1);
  const [mealType, setMealType] = useState<MealType>("Breakfast");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!entry) return;
    setQuantity(entry.quantity);
    setMealType(entry.mealType);
    setNote(entry.note ?? "");
  }, [entry]);

  if (!entry) return null;

  const base = {
    grams: entry.grams / Math.max(0.01, entry.quantity),
    kcal: entry.kcal / Math.max(0.01, entry.quantity),
    protein: entry.protein / Math.max(0.01, entry.quantity),
    carbs: entry.carbs / Math.max(0.01, entry.quantity),
    fat: entry.fat / Math.max(0.01, entry.quantity),
  };

  const scaled = {
    grams: base.grams * quantity,
    kcal: base.kcal * quantity,
    protein: base.protein * quantity,
    carbs: base.carbs * quantity,
    fat: base.fat * quantity,
  };

  const handleSave = () => {
    updateEntry(entry.id, {
      quantity,
      mealType,
      grams: Math.round(scaled.grams),
      note: note.trim() || undefined,
      kcal: Math.round(scaled.kcal),
      protein: Math.round(scaled.protein * 10) / 10,
      carbs: Math.round(scaled.carbs * 10) / 10,
      fat: Math.round(scaled.fat * 10) / 10,
    });
    pushToast({ kind: "info", title: `${entry.name} updated`, emoji: "✏️" });
    onClose();
  };

  return (
    <Modal open onClose={onClose} title={`Edit ${entry.name}`} icon={<span>{entry.emoji ?? "🍽️"}</span>}>
      <div className="space-y-4">
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

        <TextField
          label="Note"
          value={note}
          maxLength={80}
          placeholder="Optional"
          onChange={(event) => setNote(event.target.value)}
        />

        <div className="rounded-pixel border-[3px] border-edge bg-forest/10 p-3">
          <p className="pixel-label mb-1 text-muted">Updated entry</p>
          <p className="font-pixel text-2xl font-bold">
            {Math.round(scaled.kcal)} <span className="text-xs">kcal</span>
          </p>
          <p className="mt-1 text-xs text-muted">
            P {formatMacro(scaled.protein)} g · C {formatMacro(scaled.carbs)} g · F{" "}
            {formatMacro(scaled.fat)} g
          </p>
        </div>

        <div className="flex gap-2">
          <PixelButton variant="ghost" onClick={onClose}>
            Cancel
          </PixelButton>
          <PixelButton variant="primary" className="flex-1" onClick={handleSave}>
            Save changes
          </PixelButton>
        </div>
      </div>
    </Modal>
  );
}
