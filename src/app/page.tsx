"use client";

import { AppShell } from "@/components/AppShell";
import { HorseSummaryCard } from "@/components/HorseSummaryCard";
import { useStable } from "@/lib/useStable";

export default function StablePage() {
  const { sortedHorses, isReady, resetStable } = useStable();

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
