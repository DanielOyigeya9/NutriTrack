import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { Chip, Stepper, TextField } from "@/components/ui/Controls";
import { PixelButton } from "@/components/ui/PixelButton";
import { AVATARS } from "@/data/avatars";
import { DEFAULT_GOALS, useAppStore } from "@/store/useAppStore";
import type { Goals } from "@/types";
import { cn } from "@/lib/utils";
import { MACRO_PRESETS, scaleMacroGoals } from "@/utils/nutrition";
import { validateName } from "@/utils/validation";

const STEPS = ["Welcome", "Your goals", "Ready"];

export default function Onboarding() {
  const onboarded = useAppStore((state) => state.profile.onboarded);
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | undefined>();
  const [avatarId, setAvatarId] = useState(AVATARS[0].id);
  const [goals, setGoals] = useState<Goals>({ ...DEFAULT_GOALS });

  if (onboarded) return <Navigate to="/" replace />;

  const applyPreset = (key: keyof typeof MACRO_PRESETS) => {
    setGoals({ ...scaleMacroGoals(goals.kcal, MACRO_PRESETS[key]), waterMl: goals.waterMl });
  };

  const next = () => {
    if (step === 0) {
      const error = validateName(name);
      setNameError(error);
      if (error) return;
    }
    setStep((value) => Math.min(STEPS.length - 1, value + 1));
  };

  const finish = () => {
    completeOnboarding({ name: name.trim(), avatarId }, goals);
    navigate("/", { replace: true });
  };

  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-4 flex items-center justify-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-pixel border-[3px] border-edge bg-forest text-xl text-[#FFFBF1] shadow-pixel-sm">
            ✳
          </span>
          <span className="font-pixel text-lg font-bold tracking-tight">NutriTrack</span>
        </div>

        <div className="rounded-pixel border-[3px] border-edge bg-surface p-5 shadow-pixel-lg sm:p-6">
          <div className="mb-5 flex items-center gap-2">
            {STEPS.map((label, index) => (
              <div key={label} className="flex flex-1 items-center gap-2">
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-pixel border-[3px] border-edge font-pixel text-2xs font-bold",
                    index <= step ? "bg-forest text-[#FFFBF1]" : "bg-surface-3 text-muted",
                  )}
                >
                  {index + 1}
                </span>
                <span
                  className={cn(
                    "hidden font-pixel text-[9px] font-bold uppercase tracking-wide sm:block",
                    index <= step ? "text-body" : "text-muted",
                  )}
                >
                  {label}
                </span>
                {index < STEPS.length - 1 && <span className="h-[3px] flex-1 bg-edge/40" />}
              </div>
            ))}
          </div>

          {step === 0 && (
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl leading-tight">Welcome, traveller 👋</h1>
                <p className="mt-1 text-sm text-muted">
                  A cosy little food tracker. Log meals, sip water, keep a streak — no judgement,
                  just gentle nudges. First, what should we call you?
                </p>
              </div>

              <TextField
                label="Your name"
                placeholder="e.g. Ada"
                value={name}
                maxLength={20}
                error={nameError}
                onChange={(event) => {
                  setName(event.target.value);
                  setNameError(undefined);
                }}
                hint="2–20 characters."
              />

              <div>
                <p className="pixel-label mb-1.5 text-muted">Pick a companion</p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {AVATARS.map((avatar) => (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => setAvatarId(avatar.id)}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-pixel border-[3px] border-edge px-2 py-2.5 shadow-pixel-sm transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
                        avatarId === avatar.id ? "bg-amber/30" : "bg-surface hover:bg-surface-2",
                      )}
                    >
                      <span className="sprite text-2xl leading-none">{avatar.emoji}</span>
                      <span className="font-pixel text-[9px] font-bold">{avatar.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl leading-tight">Set your daily goals</h1>
                <p className="mt-1 text-sm text-muted">
                  Start with a preset and tweak it, or set your own. You can change these any time.
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(MACRO_PRESETS) as Array<keyof typeof MACRO_PRESETS>).map((key) => (
                  <Chip key={key} onClick={() => applyPreset(key)}>
                    {key === "highProtein" ? "High protein" : key === "lowCarb" ? "Lower carb" : "Balanced"}
                  </Chip>
                ))}
              </div>

              <div className="flex items-center justify-between gap-3 rounded-pixel border-[3px] border-edge bg-surface-2 px-3 py-2.5">
                <div>
                  <p className="text-sm font-bold">Calorie target</p>
                  <p className="text-xs text-muted">A rough daily reference.</p>
                </div>
                <Stepper
                  value={goals.kcal}
                  step={50}
                  min={800}
                  max={6000}
                  suffix="kcal"
                  onChange={(value) => applyPreset2(value, setGoals, goals)}
                />
              </div>

              <div className="flex items-center justify-between gap-3 rounded-pixel border-[3px] border-edge bg-surface-2 px-3 py-2.5">
                <div>
                  <p className="text-sm font-bold">Water target</p>
                  <p className="text-xs text-muted">Glasses add up during the day.</p>
                </div>
                <Stepper
                  value={goals.waterMl}
                  step={100}
                  min={500}
                  max={6000}
                  suffix="ml"
                  onChange={(value) => setGoals({ ...goals, waterMl: value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { label: "Protein", value: goals.protein, tone: "bg-forest/10" },
                  { label: "Carbs", value: goals.carbs, tone: "bg-amber/15" },
                  { label: "Fat", value: goals.fat, tone: "bg-coral/15" },
                ].map((macro) => (
                  <div
                    key={macro.label}
                    className={cn("rounded-pixel border-[3px] border-edge px-2 py-2 shadow-pixel-sm", macro.tone)}
                  >
                    <div className="pixel-label text-muted">{macro.label}</div>
                    <div className="font-pixel text-base font-bold">{macro.value} g</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <span className="checker flex h-24 w-24 items-center justify-center rounded-pixel border-[3px] border-edge text-5xl">
                  <span className="sprite animate-bob">
                    {AVATARS.find((avatar) => avatar.id === avatarId)?.emoji ?? "🌱"}
                  </span>
                </span>
              </div>
              <h1 className="text-2xl leading-tight">All set, {name.trim() || "friend"}!</h1>
              <p className="mx-auto max-w-sm text-sm text-muted">
                Your companion is ready. Log your first meal to earn XP, start a streak and unlock
                your first badge.
              </p>
              <div className="mx-auto grid max-w-xs grid-cols-2 gap-2 text-left">
                <div className="rounded-pixel border-[3px] border-edge bg-surface-2 px-3 py-2">
                  <div className="pixel-label text-muted">Calories</div>
                  <div className="font-pixel text-sm font-bold">{goals.kcal.toLocaleString()}</div>
                </div>
                <div className="rounded-pixel border-[3px] border-edge bg-surface-2 px-3 py-2">
                  <div className="pixel-label text-muted">Water</div>
                  <div className="font-pixel text-sm font-bold">{goals.waterMl.toLocaleString()} ml</div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between gap-2">
            {step > 0 ? (
              <PixelButton variant="ghost" onClick={() => setStep((value) => value - 1)}>
                <ArrowLeft size={15} /> Back
              </PixelButton>
            ) : (
              <span />
            )}

            {step < STEPS.length - 1 ? (
              <PixelButton variant="primary" onClick={next}>
                Continue <ArrowRight size={15} />
              </PixelButton>
            ) : (
              <PixelButton variant="amber" onClick={finish}>
                <Sparkles size={15} /> Start tracking
              </PixelButton>
            )}
          </div>
        </div>

        <p className="mt-3 text-center text-2xs text-muted">
          Everything is stored privately in this browser. No account required.
        </p>
      </div>
    </div>
  );
}

/** Recompute macros from the calorie target while keeping the current split ratio. */
function applyPreset2(value: number, setGoals: (goals: Goals) => void, current: Goals) {
  const split = { protein: current.protein * 4, carbs: current.carbs * 4, fat: current.fat * 9 };
  setGoals({ ...scaleMacroGoals(value, split), waterMl: current.waterMl });
}
