import { Sprout } from "lucide-react";
import { TIPS } from "@/data/tips.seed";
import { todayKey } from "@/utils/dates";

function tipForToday(): string {
  const key = todayKey();
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) hash = (hash * 31 + key.charCodeAt(i)) % 100000;
  return TIPS[hash % TIPS.length];
}

export function InsightCard() {
  return (
    <div className="rounded-pixel border-[3px] border-edge bg-amber/15 p-4 shadow-pixel">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-pixel border-[3px] border-edge bg-amber">
          <Sprout size={14} className="text-ink" />
        </span>
        <span className="pixel-label text-muted">Gentle reminder</span>
      </div>
      <p className="mt-2.5 text-sm font-semibold leading-relaxed">{tipForToday()}</p>
    </div>
  );
}
