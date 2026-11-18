import { Pencil, Trash2 } from "lucide-react";
import type { Entry } from "@/types";
import { formatGrams } from "@/utils/format";
import { formatMacro } from "@/utils/nutrition";

interface EntryRowProps {
  entry: Entry;
  units: "metric" | "imperial";
  onEdit: (entry: Entry) => void;
  onDelete: (entry: Entry) => void;
}

export function EntryRow({ entry, units, onEdit, onDelete }: EntryRowProps) {
  return (
    <li className="flex items-center gap-2.5 rounded-pixel border-[3px] border-edge bg-surface px-2.5 py-2 shadow-pixel-sm">
      <span className="checker flex h-9 w-9 shrink-0 items-center justify-center rounded-[5px] border-[2px] border-edge text-base leading-none">
        {entry.emoji ?? "🍽️"}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold">{entry.name}</p>
        <p className="truncate text-xs text-muted">
          {entry.quantity} × {entry.servingLabel} · {formatGrams(entry.grams, units)} · P
          {formatMacro(entry.protein)} C{formatMacro(entry.carbs)} F{formatMacro(entry.fat)}
        </p>
        {entry.note && <p className="truncate text-xs italic text-muted">“{entry.note}”</p>}
      </div>

      <span className="shrink-0 text-right">
        <span className="block font-pixel text-sm font-bold">{Math.round(entry.kcal)}</span>
        <span className="pixel-label text-[8px] text-muted">kcal</span>
      </span>

      <span className="flex shrink-0 gap-1">
        <button
          type="button"
          aria-label={`Edit ${entry.name}`}
          onClick={() => onEdit(entry)}
          className="flex h-8 w-8 items-center justify-center rounded-pixel border-[3px] border-edge bg-surface-2 active:translate-x-[2px] active:translate-y-[2px]"
        >
          <Pencil size={13} />
        </button>
        <button
          type="button"
          aria-label={`Delete ${entry.name}`}
          onClick={() => onDelete(entry)}
          className="flex h-8 w-8 items-center justify-center rounded-pixel border-[3px] border-edge bg-coral/20 active:translate-x-[2px] active:translate-y-[2px]"
        >
          <Trash2 size={13} />
        </button>
      </span>
    </li>
  );
}
