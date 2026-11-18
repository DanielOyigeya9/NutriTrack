import { useState } from "react";
import { Droplets, RotateCcw } from "lucide-react";
import { PixelButton } from "@/components/ui/PixelButton";
import { useAppStore } from "@/store/useAppStore";
import { formatMl } from "@/utils/format";

const GLASS_STEPS = 5;

export function WaterTracker({ date, waterMl, goalMl }: { date: string; waterMl: number; goalMl: number }) {
  const addWater = useAppStore((state) => state.addWater);
  const setWater = useAppStore((state) => state.setWater);
  const [custom, setCustom] = useState("");

  const progress = goalMl ? Math.min(1, waterMl / goalMl) : 0;
  const filledSteps = Math.round(progress * GLASS_STEPS);
  const done = goalMl > 0 && waterMl >= goalMl;

  return (
    <div className="flex gap-4">
      {/* Pixel glass */}
      <div className="relative shrink-0">
        <div className="flex h-[124px] w-[74px] flex-col-reverse justify-stretch gap-[3px] rounded-b-pixel rounded-t-[4px] border-[3px] border-edge bg-surface-2 p-[4px] shadow-pixel-in">
          {Array.from({ length: GLASS_STEPS }).map((_, index) => (
            <div
              key={index}
              className={
                index < filledSteps
                  ? "flex-1 rounded-[2px] border-[2px] border-edge bg-sky"
                  : "flex-1 rounded-[2px] border-[2px] border-edge/40 bg-transparent"
              }
            />
          ))}
        </div>
        <div className="mx-auto -mt-[3px] h-[7px] w-[54px] rounded-[2px] border-[3px] border-edge bg-surface-3" />
        {done && (
          <span className="absolute -right-2 -top-2 rotate-[-8deg] rounded-[3px] border-[2px] border-edge bg-amber px-1 font-pixel text-[8px] font-bold text-ink">
            FULL
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-1.5">
          <span className="font-pixel text-2xl font-bold">{waterMl.toLocaleString()}</span>
          <span className="pixel-label text-muted">/ {formatMl(goalMl)}</span>
        </div>
        <p className="mt-0.5 text-xs text-muted">
          {done ? "Hydration goal reached — nice one." : `${formatMl(Math.max(0, goalMl - waterMl))} to go`}
        </p>

        <div className="mt-2.5 flex flex-wrap gap-1.5">
          <PixelButton size="sm" variant="sky" onClick={() => addWater(date, 250)}>
            <Droplets size={13} /> +250
          </PixelButton>
          <PixelButton size="sm" variant="sky" onClick={() => addWater(date, 500)}>
            <Droplets size={13} /> +500
          </PixelButton>
          <PixelButton
            size="sm"
            variant="ghost"
            onClick={() => setWater(date, 0)}
            aria-label="Reset water"
          >
            <RotateCcw size={13} /> Reset
          </PixelButton>
        </div>

        <div className="mt-2.5 flex items-center gap-1.5">
          <input
            value={custom}
            inputMode="numeric"
            onChange={(event) => setCustom(event.target.value.replace(/[^0-9]/g, ""))}
            placeholder="custom ml"
            className="w-24 rounded-pixel border-[3px] border-edge bg-surface px-2 py-1 text-xs font-semibold shadow-pixel-in outline-none placeholder:text-muted/70"
          />
          <PixelButton
            size="sm"
            disabled={!custom || Number(custom) <= 0}
            onClick={() => {
              addWater(date, Number(custom));
              setCustom("");
            }}
          >
            Set
          </PixelButton>
        </div>
      </div>
    </div>
  );
}
