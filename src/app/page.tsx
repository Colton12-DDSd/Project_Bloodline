"use client";

import { AppShell } from "@/components/AppShell";
import { HorseSummaryCard } from "@/components/HorseSummaryCard";
import { useStable } from "@/lib/useStable";

export default function StablePage() {
  const { horses, sortedHorses, isReady, resetStable } = useStable();
  const foalCount = horses.filter((horse) => horse.generation > 0).length;
  const topHorse = sortedHorses[0];

  return (
    <AppShell>
      <section className="page-head">
        <div>
          <p className="eyebrow">Prototype Stable</p>
          <h1>Breed, trial, repeat.</h1>
          <p>
            A local sandbox for testing whether hidden marker interactions make
            horse breeding interesting.
          </p>
          <div className="overview-strip" aria-label="Stable overview">
            <span>
              <strong>{horses.length}</strong>
              Horses
            </span>
            <span>
              <strong>{foalCount}</strong>
              Foals bred
            </span>
            <span>
              <strong>{topHorse?.name ?? "None"}</strong>
              Top trial
            </span>
          </div>
        </div>
        <button className="button ghost" onClick={resetStable} type="button">
          Reset
        </button>
      </section>

      {!isReady ? (
        <p className="muted">Loading stable...</p>
      ) : (
        <section className="horse-list" aria-label="Stable horses">
          {sortedHorses.map((horse) => (
            <HorseSummaryCard key={horse.id} horse={horse} />
          ))}
        </section>
      )}
    </AppShell>
  );
}
