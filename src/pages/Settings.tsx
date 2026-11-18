import { useRef, useState, type ChangeEvent } from "react";
import { Download, RotateCcw, Save, Upload } from "lucide-react";
import { Chip, NumberField, SelectField, TextField, Toggle } from "@/components/ui/Controls";
import { PixelButton } from "@/components/ui/PixelButton";
import { Panel, SectionTitle } from "@/components/ui/Panel";
import { AVATARS } from "@/data/avatars";
import { useAppStore } from "@/store/useAppStore";
import type { Goals, PersistedState } from "@/types";
import { cn } from "@/lib/utils";
import { MACRO_PRESETS, scaleMacroGoals } from "@/utils/nutrition";
import { downloadBackup, readFileAsText } from "@/utils/format";
import {
  hasGoalErrors,
  parseBackup,
  splitPercentages,
  validateGoals,
  validateName,
  type GoalErrors,
} from "@/utils/validation";

export default function Settings() {
  const profile = useAppStore((state) => state.profile);
  const goals = useAppStore((state) => state.goals);
  const settings = useAppStore((state) => state.settings);
  const updateProfile = useAppStore((state) => state.updateProfile);
  const setGoals = useAppStore((state) => state.setGoals);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const replaceState = useAppStore((state) => state.replaceState);
  const reset = useAppStore((state) => state.reset);
  const pushToast = useAppStore((state) => state.pushToast);

  const [name, setName] = useState(profile.name);
  const [nameError, setNameError] = useState<string | undefined>();
  const [draftGoals, setDraftGoals] = useState<Goals>(goals);
  const [goalErrors, setGoalErrors] = useState<GoalErrors>({});
  const fileRef = useRef<HTMLInputElement | null>(null);

  const split = splitPercentages(draftGoals);

  const handleSaveName = () => {
    const error = validateName(name);
    setNameError(error);
    if (error) return;
    updateProfile({ name: name.trim() });
    pushToast({ kind: "success", title: "Name updated", emoji: "✏️" });
  };

  const applyPreset = (key: keyof typeof MACRO_PRESETS) => {
    const next = scaleMacroGoals(draftGoals.kcal, MACRO_PRESETS[key]);
    setDraftGoals({ ...next, waterMl: draftGoals.waterMl });
    setGoalErrors({});
  };

  const handleSaveGoals = () => {
    const errors = validateGoals(draftGoals);
    setGoalErrors(errors);
    if (hasGoalErrors(errors)) return;
    setGoals(draftGoals);
    pushToast({ kind: "success", title: "Goals saved", emoji: "🎯" });
  };

  const exportData = () => {
    const snapshot: PersistedState = {
      version: 1,
      profile,
      goals,
      entries: useAppStore.getState().entries,
      water: useAppStore.getState().water,
      customFoods: useAppStore.getState().customFoods,
      favorites: useAppStore.getState().favorites,
      gamification: useAppStore.getState().gamification,
      quests: useAppStore.getState().quests,
      settings,
    };
    downloadBackup(snapshot);
    pushToast({ kind: "success", title: "Backup downloaded", emoji: "💾" });
  };

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const text = await readFileAsText(file);
    const result = parseBackup(text);
    if (!result.ok) {
      const errorMessage = "error" in result ? result.error : "Failed to import backup.";
      pushToast({ kind: "error", title: "Import failed", message: errorMessage, emoji: "⚠️" });
      return;
    }
    replaceState(result.data);
    setDraftGoals(result.data.goals);
    setName(result.data.profile.name);
    pushToast({ kind: "success", title: "Backup restored", emoji: "📥" });
  };

  const handleReset = () => {
    if (!window.confirm("Erase everything on this device and start fresh? This cannot be undone.")) {
      return;
    }
    reset();
    pushToast({ kind: "info", title: "All data cleared", emoji: "🧹" });
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl leading-tight">Settings</h1>
        <p className="text-sm text-muted">Your profile, goals and data — all stored in this browser.</p>
      </div>

      <Panel title="Your profile" icon="🧑" subtitle="Name and companion">
        <div className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <TextField
              label="Display name"
              value={name}
              maxLength={20}
              error={nameError}
              onChange={(event) => {
                setName(event.target.value);
                setNameError(undefined);
              }}
              className="flex-1 min-w-[200px]"
            />
            <PixelButton variant="primary" onClick={handleSaveName}>
              <Save size={15} /> Save name
            </PixelButton>
          </div>

          <div>
            <p className="pixel-label mb-1.5 text-muted">Companion</p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {AVATARS.map((avatar) => (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => updateProfile({ avatarId: avatar.id })}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-pixel border-[3px] border-edge px-2 py-2.5 shadow-pixel-sm transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-pixel-none",
                    profile.avatarId === avatar.id ? "bg-amber/30" : "bg-surface hover:bg-surface-2",
                  )}
                >
                  <span className="sprite text-2xl leading-none">{avatar.emoji}</span>
                  <span className="font-pixel text-[9px] font-bold">{avatar.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Panel>

      <Panel title="Daily goals" icon="🎯" subtitle="A reference, not a rule">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(MACRO_PRESETS) as Array<keyof typeof MACRO_PRESETS>).map((key) => (
              <Chip key={key} onClick={() => applyPreset(key)}>
                {key === "highProtein" ? "High protein" : key === "lowCarb" ? "Lower carb" : "Balanced"}
              </Chip>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <NumberField
              label="Calories"
              value={draftGoals.kcal}
              min={800}
              max={6000}
              error={goalErrors.kcal}
              onChange={(event) => setDraftGoals({ ...draftGoals, kcal: Number(event.target.value) })}
            />
            <NumberField
              label="Protein (g)"
              value={draftGoals.protein}
              min={20}
              max={400}
              error={goalErrors.protein}
              onChange={(event) => setDraftGoals({ ...draftGoals, protein: Number(event.target.value) })}
            />
            <NumberField
              label="Carbs (g)"
              value={draftGoals.carbs}
              min={20}
              max={700}
              error={goalErrors.carbs}
              onChange={(event) => setDraftGoals({ ...draftGoals, carbs: Number(event.target.value) })}
            />
            <NumberField
              label="Fat (g)"
              value={draftGoals.fat}
              min={10}
              max={250}
              error={goalErrors.fat}
              onChange={(event) => setDraftGoals({ ...draftGoals, fat: Number(event.target.value) })}
            />
            <NumberField
              label="Water (ml)"
              value={draftGoals.waterMl}
              min={500}
              max={6000}
              step={100}
              error={goalErrors.waterMl}
              onChange={(event) => setDraftGoals({ ...draftGoals, waterMl: Number(event.target.value) })}
            />
          </div>

          <p className="rounded-pixel border-[3px] border-edge bg-surface-2 px-3 py-2 text-xs text-muted">
            Macro balance: <strong>{split.protein}%</strong> protein ·{" "}
            <strong>{split.carbs}%</strong> carbs · <strong>{split.fat}%</strong> fat (of calories).
          </p>

          <PixelButton variant="primary" onClick={handleSaveGoals}>
            <Save size={15} /> Save goals
          </PixelButton>
        </div>
      </Panel>

      <Panel title="Preferences" icon="⚙️">
        <div className="space-y-3">
          <Toggle
            checked={settings.theme === "dark"}
            onChange={(next) => updateSettings({ theme: next ? "dark" : "light" })}
            label="Dark mode"
            hint="Switch between the light and night pixel themes."
          />
          <Toggle
            checked={settings.autoMeal}
            onChange={(next) => updateSettings({ autoMeal: next })}
            label="Guess the meal automatically"
            hint="Pre-selects breakfast, lunch or dinner based on the time."
          />
          <SelectField
            label="Units"
            value={settings.units}
            onChange={(event) =>
              updateSettings({ units: event.target.value === "imperial" ? "imperial" : "metric" })
            }
            hint="Used for showing food weights."
          >
            <option value="metric">Metric (g)</option>
            <option value="imperial">Imperial (oz)</option>
          </SelectField>
        </div>
      </Panel>

      <Panel title="Your data" icon="💾" subtitle="Everything lives in this browser">
        <div className="flex flex-wrap gap-2">
          <PixelButton onClick={exportData}>
            <Download size={15} /> Export backup
          </PixelButton>
          <PixelButton onClick={() => fileRef.current?.click()}>
            <Upload size={15} /> Import backup
          </PixelButton>
          <PixelButton variant="danger" onClick={handleReset}>
            <RotateCcw size={15} /> Reset app
          </PixelButton>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={handleImport}
          />
        </div>
        <p className="mt-3 text-xs text-muted">
          Export saves a JSON file you can keep or move to another device. Importing replaces
          everything currently stored here.
        </p>
      </Panel>

      <section>
        <SectionTitle hint="Made with pixel love">About</SectionTitle>
        <div className="rounded-pixel border-[3px] border-edge bg-surface p-4 text-sm text-muted shadow-pixel">
          <p className="font-bold text-body">NutriTrack — food &amp; habit quest</p>
          <p className="mt-1">
            A friendly, offline-first tracker. Numbers are estimates to guide you, not medical
            advice. Speak to a professional for personal nutrition needs.
          </p>
        </div>
      </section>
    </div>
  );
}
