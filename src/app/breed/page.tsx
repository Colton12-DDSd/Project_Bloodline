"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { GenomeTable } from "@/components/GenomeTable";
import { TraitGrid } from "@/components/TraitGrid";
import { TrialPanel } from "@/components/TrialPanel";
import { useStable } from "@/lib/useStable";
import type { Horse } from "@/types/bloodline";

export default function BreedPage() {
  const { horses, createFoal, isReady } = useStable();
  const sires = useMemo(() => horses.filter((horse) => horse.sex === "Sire"), [horses]);
  const dams = useMemo(() => horses.filter((horse) => horse.sex === "Dam"), [horses]);
  const [sireId, setSireId] = useState("");
  const [damId, setDamId] = useState("");
  const [foal, setFoal] = useState<Horse | undefined>();
  const [error, setError] = useState("");

  function handleBreed() {
    try {
      setError("");
      setFoal(createFoal(sireId, damId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to breed horses.");
    }
  }

  return (
    <AppShell>
      <section className="page-head compact">
        <div>
          <p className="eyebrow">Breeding Lab</p>
          <h1>Create a foal</h1>
          <p>
            Pick one sire and one dam. The foal gets one allele from each parent
            at every marker.
          </p>
        </div>
      </section>

      {!isReady ? (
        <p className="muted">Loading breeding pool...</p>
      ) : (
        <>
          <section className="breed-panel">
            <label>
              Sire
              <select value={sireId} onChange={(event) => setSireId(event.target.value)}>
                <option value="">Choose sire</option>
                {sires.map((horse) => (
                  <option key={horse.id} value={horse.id}>
                    {horse.name} - Gen {horse.generation}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Dam
              <select value={damId} onChange={(event) => setDamId(event.target.value)}>
                <option value="">Choose dam</option>
                {dams.map((horse) => (
                  <option key={horse.id} value={horse.id}>
                    {horse.name} - Gen {horse.generation}
                  </option>
                ))}
              </select>
            </label>

            <button className="button primary" onClick={handleBreed} type="button">
              Breed
            </button>
            {error ? <p className="error">{error}</p> : null}
          </section>

          {foal ? (
            <section className="section foal-result">
              <div className="result-head">
                <div>
                  <p className="eyebrow">Foal Result</p>
                  <h2>{foal.name}</h2>
                  <p>{foal.sex} - Gen {foal.generation}</p>
                </div>
                <Link className="button secondary" href={`/horses/${foal.id}`}>
                  View detail
                </Link>
              </div>

              <TrialPanel results={foal.trialResults} />
              <h3>Genome</h3>
              <GenomeTable genome={foal.genome} />
              <h3>Physical Measurements</h3>
              <TraitGrid traits={foal.traits} />
            </section>
          ) : null}
        </>
      )}
    </AppShell>
  );
}
