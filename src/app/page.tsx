"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { HorseSummaryCard } from "@/components/HorseSummaryCard";
import { useStable } from "@/lib/useStable";
import type { Horse } from "@/types/bloodline";

type StableSort = "rank" | "speed" | "generation" | "name";
type GenerationFilter = "all" | number;

export default function StablePage() {
  const { horses, sortedHorses, isReady, resetStable } = useStable();
  const [sortBy, setSortBy] = useState<StableSort>("rank");
  const [generationFilter, setGenerationFilter] = useState<GenerationFilter>("all");
  const foalCount = horses.filter((horse) => horse.generation > 0).length;
  const topHorse = sortedHorses[0];
  const generations = useMemo(
    () => Array.from(new Set(horses.map((horse) => horse.generation))).sort((a, b) => a - b),
    [horses],
  );
  const visibleHorses = useMemo(
    () => sortHorses(horses, sortedHorses, sortBy, generationFilter),
    [horses, sortedHorses, sortBy, generationFilter],
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
              <p className="eyebrow">Filter Stable</p>
              <p>Pick a generation, then sort by speed to find the fastest horses in that group.</p>
            </div>
            <div className="stable-controls">
              <label className="compact-field">
                Generation
                <select
                  value={generationFilter}
                  onChange={(event) => {
                    const value = event.target.value;
                    setGenerationFilter(value === "all" ? "all" : Number(value));
                  }}
                >
                  <option value="all">All generations</option>
                  {generations.map((generation) => (
                    <option key={generation} value={generation}>
                      Gen {generation}
                    </option>
                  ))}
                </select>
              </label>
              <div className="segmented-control">
                <button
                  className={sortBy === "rank" ? "active" : ""}
                  onClick={() => setSortBy("rank")}
                  type="button"
                >
                  Rank
                </button>
                <button
                  className={sortBy === "speed" ? "active" : ""}
                  onClick={() => setSortBy("speed")}
                  type="button"
                >
                  Speed
                </button>
                <button
                  className={sortBy === "generation" ? "active" : ""}
                  onClick={() => setSortBy("generation")}
                  type="button"
                >
                  Gen
                </button>
                <button
                  className={sortBy === "name" ? "active" : ""}
                  onClick={() => setSortBy("name")}
                  type="button"
                >
                  Name
                </button>
              </div>
            </div>
          </section>

          {visibleHorses.length > 0 ? (
            <section className="horse-list" aria-label="Stable horses">
              {visibleHorses.map((horse) => (
                <HorseSummaryCard key={horse.id} horse={horse} />
              ))}
            </section>
          ) : (
            <section className="empty-state">
              <h2>No horses in this generation yet.</h2>
              <p>Breed a few more foals, then come back to compare this generation.</p>
            </section>
          )}
        </>
      )}
    </AppShell>
  );
}

function sortHorses(
  horses: Horse[],
  rankedHorses: Horse[],
  sortBy: StableSort,
  generationFilter: GenerationFilter,
): Horse[] {
  const filteredHorses =
    generationFilter === "all"
      ? horses
      : horses.filter((horse) => horse.generation === generationFilter);

  if (sortBy === "rank") {
    return rankedHorses.filter((horse) =>
      generationFilter === "all" ? true : horse.generation === generationFilter,
    );
  }

  return [...filteredHorses].sort((a, b) => {
    if (sortBy === "generation") {
      return (
        b.generation - a.generation ||
        (b.trialResults?.overallPercentile ?? 0) -
          (a.trialResults?.overallPercentile ?? 0) ||
        a.name.localeCompare(b.name)
      );
    }

    if (sortBy === "speed") {
      return (
        b.traits.speed - a.traits.speed ||
        (b.trialResults?.overallPercentile ?? 0) -
          (a.trialResults?.overallPercentile ?? 0) ||
        a.name.localeCompare(b.name)
      );
    }

    return a.name.localeCompare(b.name);
  });
}
