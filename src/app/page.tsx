"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { HorseSummaryCard } from "@/components/HorseSummaryCard";
import { useStable } from "@/lib/useStable";
import type { Horse } from "@/types/bloodline";

type StableSort = "rank" | "generation" | "name";

export default function StablePage() {
  const { horses, sortedHorses, isReady, resetStable } = useStable();
  const [sortBy, setSortBy] = useState<StableSort>("rank");
  const foalCount = horses.filter((horse) => horse.generation > 0).length;
  const topHorse = sortedHorses[0];
  const visibleHorses = useMemo(
    () => sortHorses(horses, sortedHorses, sortBy),
    [horses, sortedHorses, sortBy],
  );

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
        <>
          <section className="stable-toolbar" aria-label="Stable sorting">
            <div>
              <p className="eyebrow">Sort Stable</p>
              <p>Generation sort puts newer foals first so lineage progress is easier to scan.</p>
            </div>
            <div className="segmented-control">
              <button
                className={sortBy === "rank" ? "active" : ""}
                onClick={() => setSortBy("rank")}
                type="button"
              >
                Rank
              </button>
              <button
                className={sortBy === "generation" ? "active" : ""}
                onClick={() => setSortBy("generation")}
                type="button"
              >
                Generation
              </button>
              <button
                className={sortBy === "name" ? "active" : ""}
                onClick={() => setSortBy("name")}
                type="button"
              >
                Name
              </button>
            </div>
          </section>

          <section className="horse-list" aria-label="Stable horses">
            {visibleHorses.map((horse) => (
              <HorseSummaryCard key={horse.id} horse={horse} />
            ))}
          </section>
        </>
      )}
    </AppShell>
  );
}

function sortHorses(
  horses: Horse[],
  rankedHorses: Horse[],
  sortBy: StableSort,
): Horse[] {
  if (sortBy === "rank") {
    return rankedHorses;
  }

  return [...horses].sort((a, b) => {
    if (sortBy === "generation") {
      return (
        b.generation - a.generation ||
        (b.trialResults?.overallPercentile ?? 0) -
          (a.trialResults?.overallPercentile ?? 0) ||
        a.name.localeCompare(b.name)
      );
    }

    return a.name.localeCompare(b.name);
  });
}
