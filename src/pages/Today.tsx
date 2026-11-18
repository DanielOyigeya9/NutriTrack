import { CompanionCard } from "@/components/today/CompanionCard";
import { EnergyPanel } from "@/components/today/EnergyPanel";
import { InsightCard } from "@/components/today/InsightCard";
import { MealSnapshot } from "@/components/today/MealSnapshot";
import { QuestList } from "@/components/today/QuestList";
import { WaterTracker } from "@/components/today/WaterTracker";
import { Panel, SectionTitle } from "@/components/ui/Panel";
import { useDerivedDay } from "@/hooks/useDerivedDay";
import { useAppStore } from "@/store/useAppStore";
import { formatLong, greeting, todayKey } from "@/utils/dates";

export default function Today() {
  const date = todayKey();
  const { totals, entries } = useDerivedDay(date);
  const goals = useAppStore((state) => state.goals);
  const name = useAppStore((state) => state.profile.name);

  return (
    <div className="space-y-5">
      <div>
        <p className="pixel-label text-muted">{formatLong(date)}</p>
        <h1 className="text-2xl leading-tight sm:text-3xl">
          {greeting()}, {name || "friend"} 👋
        </h1>
        <p className="text-sm text-muted">
          Here's how today is shaping up. Log what you like — no judgement here.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.55fr_1fr]">
        <div className="space-y-5">
          <EnergyPanel totals={totals} goals={goals} dateLabel={formatLong(date)} />

          <section>
            <SectionTitle hint={`${totals.entries} logged today`}>Today's meals</SectionTitle>
            <MealSnapshot entries={entries} date={date} />
          </section>

          <section>
            <SectionTitle hint="Auto-tracked from your logs">Daily quests</SectionTitle>
            <QuestList />
          </section>
        </div>

        <div className="space-y-5">
          <CompanionCard totals={totals} goals={goals} />

          <Panel title="Water tracker" icon="💧" subtitle={`Goal ${goals.waterMl.toLocaleString()} ml`}>
            <WaterTracker date={date} waterMl={totals.waterMl} goalMl={goals.waterMl} />
          </Panel>

          <InsightCard />
        </div>
      </div>
    </div>
  );
}
