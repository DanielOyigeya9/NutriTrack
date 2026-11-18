import { useMemo, useState } from "react";
import { Undo2 } from "lucide-react";
import { DateNavigator } from "@/components/diary/DateNavigator";
import { DaySummary } from "@/components/diary/DaySummary";
import { EntryEditModal } from "@/components/diary/EntryEditModal";
import { MealSection } from "@/components/diary/MealSection";
import { PixelButton } from "@/components/ui/PixelButton";
import { useDerivedDay } from "@/hooks/useDerivedDay";
import { useAppStore } from "@/store/useAppStore";
import { useUiStore } from "@/store/useUiStore";
import type { Entry, MealType } from "@/types";
import { addDays, formatShort, todayKey } from "@/utils/dates";
import { MEAL_TYPES, entriesForDate } from "@/utils/nutrition";

export default function Diary() {
  const [date, setDate] = useState(todayKey());
  const [editing, setEditing] = useState<Entry | null>(null);
  const [undoEntry, setUndoEntry] = useState<Entry | null>(null);

  const entries = useAppStore((state) => state.entries);
  const goals = useAppStore((state) => state.goals);
  const units = useAppStore((state) => state.settings.units);
  const removeEntry = useAppStore((state) => state.removeEntry);
  const addEntry = useAppStore((state) => state.addEntry);
  const pushToast = useAppStore((state) => state.pushToast);
  const openAddFood = useUiStore((state) => state.openAddFood);

  const { totals } = useDerivedDay(date);
  const yesterday = addDays(date, -1);
  const yesterdayCount = useMemo(
    () => entriesForDate(entries, yesterday).length,
    [entries, yesterday],
  );

  const handleDelete = (entry: Entry) => {
    removeEntry(entry.id);
    setUndoEntry(entry);
    pushToast({ kind: "info", title: `${entry.name} removed`, emoji: "🗑️" });
  };

  const handleUndo = () => {
    if (!undoEntry) return;
    addEntry({
      entryId: undoEntry.id,
      name: undoEntry.name,
      mealType: undoEntry.mealType,
      date: undoEntry.date,
      quantity: undoEntry.quantity,
      grams: undoEntry.grams,
      kcal: undoEntry.kcal,
      protein: undoEntry.protein,
      carbs: undoEntry.carbs,
      fat: undoEntry.fat,
      emoji: undoEntry.emoji,
      note: undoEntry.note,
    });
    setUndoEntry(null);
    pushToast({ kind: "success", title: `${undoEntry.name} restored`, emoji: "↩️" });
  };

  const handleCopyYesterday = () => {
    const source = entriesForDate(entries, yesterday);
    source.forEach((entry) => {
      addEntry({
        entryId: `${entry.id}_copy_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
        name: entry.name,
        mealType: entry.mealType,
        date,
        quantity: entry.quantity,
        grams: entry.grams,
        kcal: entry.kcal,
        protein: entry.protein,
        carbs: entry.carbs,
        fat: entry.fat,
        emoji: entry.emoji,
        note: entry.note,
      });
    });
    pushToast({
      kind: "success",
      title: `Copied ${source.length} ${source.length === 1 ? "entry" : "entries"}`,
      message: `From ${formatShort(yesterday)}`,
      emoji: "📋",
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl leading-tight">Diary</h1>
          <p className="text-sm text-muted">Every meal in one place, day by day.</p>
        </div>
        <DateNavigator date={date} onChange={setDate} />
      </div>

      {undoEntry && (
        <div className="flex items-center justify-between gap-3 rounded-pixel border-[3px] border-edge bg-coral/15 px-3 py-2 shadow-pixel-sm">
          <span className="text-xs font-bold">
            Removed “{undoEntry.name}”
          </span>
          <PixelButton size="sm" variant="ghost" onClick={handleUndo}>
            <Undo2 size={13} /> Undo
          </PixelButton>
        </div>
      )}

      <DaySummary
        date={date}
        totals={totals}
        goals={goals}
        hasYesterday={yesterdayCount > 0}
        onCopyYesterday={handleCopyYesterday}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {MEAL_TYPES.map((meal: MealType) => (
          <MealSection
            key={meal}
            meal={meal}
            entries={entriesForDate(entries, date).filter((entry) => entry.mealType === meal)}
            units={units}
            onAdd={() => openAddFood({ date, meal })}
            onEdit={setEditing}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <EntryEditModal entry={editing} onClose={() => setEditing(null)} />
    </div>
  );
}
