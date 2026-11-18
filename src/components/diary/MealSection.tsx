import { Plus } from "lucide-react";
import { EntryRow } from "@/components/diary/EntryRow";
import { PixelButton } from "@/components/ui/PixelButton";
import type { Entry, MealType } from "@/types";
import { MEAL_EMOJI } from "@/utils/nutrition";

interface MealSectionProps {
  meal: MealType;
  entries: Entry[];
  units: "metric" | "imperial";
  onAdd: () => void;
  onEdit: (entry: Entry) => void;
  onDelete: (entry: Entry) => void;
}

export function MealSection({ meal, entries, units, onAdd, onEdit, onDelete }: MealSectionProps) {
  const kcal = entries.reduce((sum, entry) => sum + entry.kcal, 0);

  return (
    <section className="rounded-pixel border-[3px] border-edge bg-surface-2 p-3 shadow-pixel-sm">
      <header className="mb-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-lg leading-none">{MEAL_EMOJI[meal]}</span>
          <h3 className="text-base leading-none">{meal}</h3>
          <span className="rounded-[4px] border-[2px] border-edge bg-surface px-1.5 font-pixel text-2xs font-bold">
            {Math.round(kcal)} kcal
          </span>
        </div>
        <PixelButton size="sm" variant="ghost" onClick={onAdd} aria-label={`Add to ${meal}`}>
          <Plus size={13} /> Add
        </PixelButton>
      </header>

      {entries.length ? (
        <ul className="space-y-2">
          {entries.map((entry) => (
            <EntryRow
              key={entry.id}
              entry={entry}
              units={units}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </ul>
      ) : (
        <button
          type="button"
          onClick={onAdd}
          className="w-full rounded-pixel border-[3px] border-dashed border-edge bg-surface px-3 py-4 text-center text-xs text-muted hover:bg-surface-3"
        >
          Nothing logged for {meal.toLowerCase()} yet — tap to add.
        </button>
      )}
    </section>
  );
}
