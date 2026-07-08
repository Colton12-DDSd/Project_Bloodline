"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { GenomeTable } from "@/components/GenomeTable";
import { LineagePanel } from "@/components/LineagePanel";
import { TraitGrid } from "@/components/TraitGrid";
import { TrialPanel } from "@/components/TrialPanel";
import { useStable } from "@/lib/useStable";

export default function HorseDetailPage() {
  const params = useParams<{ id: string }>();
  const { getHorse, horses, isReady } = useStable();
  const horse = getHorse(params.id);

  if (!isReady) {
    return (
      <AppShell>
        <p className="muted">Loading horse...</p>
      </AppShell>
    );
  }

  if (!horse) {
    return (
      <AppShell>
        <p className="muted">Horse not found.</p>
        <Link className="button secondary" href="/">
          Back to stable
        </Link>
      </AppShell>
    );
  }

  const sire = horse.sireId ? getHorse(horse.sireId) : undefined;
  const dam = horse.damId ? getHorse(horse.damId) : undefined;

  return (
    <AppShell>
      <section className="page-head compact">
        <div>
          <p className="eyebrow">{horse.sex} - Gen {horse.generation}</p>
          <h1>{horse.name}</h1>
          <p>
            {sire ? `Sire: ${sire.name}` : "Starter horse"}{" "}
            {dam ? `- Dam: ${dam.name}` : ""}
          </p>
        </div>
        <Link className="button primary" href="/breed">
          Breed
        </Link>
      </section>

      <section className="section">
        <h2>Performance Trial</h2>
        <TrialPanel results={horse.trialResults} />
      </section>

      <section className="section">
        <h2>Lineage</h2>
        <LineagePanel horse={horse} horses={horses} />
      </section>

      <section className="section">
        <h2>Physical Measurements</h2>
        <TraitGrid traits={horse.traits} />
      </section>

      <section className="section">
        <h2>Genome</h2>
        <GenomeTable genome={horse.genome} />
      </section>
    </AppShell>
  );
}
