"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { analyzeGeneSignals, analyzeGenotypes, findPairingSignals } from "@/lib/geneAnalysis";
import { traitEntries } from "@/lib/format";
import { useStable } from "@/lib/useStable";
import type { GeneSignal, GenotypeSignal, PairingSignal } from "@/lib/geneAnalysis";
import type { Horse, PhysicalTraits } from "@/types/bloodline";

const goalOrder: PairingSignal["goal"][] = ["Speed", "Stamina", "Balanced"];

export default function GenesPage() {
  const { horses, isReady } = useStable();

  if (!isReady) {
    return (
      <AppShell>
        <p className="muted">Loading gene board...</p>
      </AppShell>
    );
  }

  const geneSignals = analyzeGeneSignals(horses);
  const genotypeSignals = analyzeGenotypes(horses);
  const pairings = findPairingSignals(horses);
  const foalCount = horses.filter((horse) => horse.generation > 0).length;

  return (
    <AppShell>
      <section className="page-head compact">
        <div>
          <p className="eyebrow">Gene Board</p>
          <h1>Find the patterns worth breeding.</h1>
          <p>
            Compare marker signals across the current stable, then use the pairing board
            to pick smarter crosses for your next foal.
          </p>
          <div className="overview-strip" aria-label="Gene board overview">
            <span>
              <strong>{horses.length}</strong>
              Horses analyzed
            </span>
            <span>
              <strong>{foalCount}</strong>
              Foals bred
            </span>
            <span>
              <strong>{geneSignals.length}</strong>
              Gene signals
            </span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Allele Signals</p>
            <h2>What each gene seems to help</h2>
          </div>
          <p>Signals get better as you breed more foals into the data pool.</p>
        </div>
        <div className="gene-signal-grid">
          {geneSignals.map((signal) => (
            <GeneSignalCard key={`${signal.markerId}-${signal.allele}`} signal={signal} />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Genotype Patterns</p>
            <h2>Marker pairs by observed horses</h2>
          </div>
          <p>Use this to spot whether A/A, A/B, B/C, and other pairs are showing a theme.</p>
        </div>
        <div className="genotype-grid">
          {genotypeSignals.slice(0, 18).map((signal) => (
            <GenotypeCard key={`${signal.markerId}-${signal.genotype}`} signal={signal} />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Breeding Hints</p>
            <h2>Suggested crosses by goal</h2>
          </div>
          <p>These are expected averages from all possible foal genomes, not guaranteed outcomes.</p>
        </div>
        <div className="pairing-columns">
          {goalOrder.map((goal) => (
            <div className="pairing-column" key={goal}>
              <h3>{goal}</h3>
              {pairings
                .filter((pairing) => pairing.goal === goal)
                .slice(0, 4)
                .map((pairing) => (
                  <PairingCard
                    key={`${pairing.goal}-${pairing.sire.id}-${pairing.dam.id}`}
                    pairing={pairing}
                  />
                ))}
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

function GeneSignalCard({ signal }: { signal: GeneSignal }) {
  const topCarriers = [...signal.carriers]
    .sort((a, b) => b.traits[signal.bestTrait] - a.traits[signal.bestTrait])
    .slice(0, 3);

  return (
    <article className="gene-card">
      <div className="gene-card-head">
        <div>
          <span className={`allele-token allele-${signal.allele.toLowerCase()}`}>
            {signal.allele}
          </span>
          <strong>{signal.markerId}</strong>
        </div>
        <span>{signal.carriers.length} carriers</span>
      </div>
      <p>
        Strongest current read: <strong>{traitLabel(signal.bestTrait)}</strong>{" "}
        {formatDelta(signal.deltas[signal.bestTrait])} vs stable average.
      </p>
      <TraitMiniGrid traits={signal.averageTraits} />
      <HorseLinks horses={topCarriers} />
    </article>
  );
}

function GenotypeCard({ signal }: { signal: GenotypeSignal }) {
  return (
    <article className="genotype-card">
      <div>
        <span>{signal.markerId}</span>
        <strong>{signal.genotype}</strong>
      </div>
      <p>
        {signal.horses.length} horse{signal.horses.length === 1 ? "" : "s"} observed.
        Best average: {traitLabel(signal.bestTrait)}.
      </p>
      <TraitMiniGrid traits={signal.averageTraits} />
    </article>
  );
}

function PairingCard({ pairing }: { pairing: PairingSignal }) {
  return (
    <article className="pairing-card">
      <div className="pairing-names">
        <Link href={`/horses/${pairing.sire.id}`}>{pairing.sire.name}</Link>
        <span>x</span>
        <Link href={`/horses/${pairing.dam.id}`}>{pairing.dam.name}</Link>
      </div>
      <TraitMiniGrid traits={pairing.expectedTraits} />
      <ul className="notes compact-notes">
        {pairing.notes.slice(0, 2).map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </article>
  );
}

function TraitMiniGrid({ traits }: { traits: PhysicalTraits }) {
  return (
    <div className="allele-average-stats">
      {traitEntries(traits).map(([label, value]) => (
        <span key={label}>
          {label} <strong>{value}</strong>
        </span>
      ))}
    </div>
  );
}

function HorseLinks({ horses }: { horses: Horse[] }) {
  if (horses.length === 0) {
    return <p className="muted mini-note">No carriers seen yet.</p>;
  }

  return (
    <div className="gene-flow-map">
      {horses.map((horse) => (
        <Link className="gene-flow-chip" href={`/horses/${horse.id}`} key={horse.id}>
          <span>{horse.sex}</span>
          <span>{horse.name}</span>
        </Link>
      ))}
    </div>
  );
}

function traitLabel(trait: keyof PhysicalTraits): string {
  const labels: Record<keyof PhysicalTraits, string> = {
    speed: "Speed",
    stamina: "Stamina",
    consistency: "Consistency",
    durability: "Durability",
  };
  return labels[trait];
}

function formatDelta(value: number): string {
  if (value > 0) return `+${value}`;
  return String(value);
}
