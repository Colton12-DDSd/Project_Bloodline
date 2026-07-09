import Link from "next/link";
import type { Allele, GeneticMarkerId, Horse } from "@/types/bloodline";
import { formatMarker, traitEntries } from "@/lib/format";

type InheritancePanelProps = {
  horse: Horse;
  offspring: Horse[];
};

type MarkerInheritance = {
  markerId: GeneticMarkerId;
  parentAlleles: [Allele, Allele];
  passed: Record<Allele, number>;
  unpassedAlleles: Allele[];
  passEvents: number;
  averageTraitsByAllele: Partial<Record<Allele, Horse["traits"]>>;
  foalFlow: Array<{
    foalId: string;
    foalName: string;
    allele: Allele;
  }>;
};

export function InheritancePanel({ horse, offspring }: InheritancePanelProps) {
  if (offspring.length === 0) {
    return null;
  }

  const markerStats = buildMarkerStats(horse, offspring);
  const mostPassed = [...markerStats]
    .flatMap((marker) =>
      uniqueAlleles(marker.parentAlleles).map((allele) => ({
        markerId: marker.markerId,
        allele,
        count: marker.passed[allele] ?? 0,
      })),
    )
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
  const markersWithGaps = markerStats.filter((marker) => marker.unpassedAlleles.length > 0);

  return (
    <div className="inheritance-panel">
      <div className="inheritance-summary">
        <span>
          <strong>{offspring.length}</strong>
          Foals analyzed
        </span>
        <span>
          <strong>{markersWithGaps.length}</strong>
          Markers with gaps
        </span>
        <span>
          <strong>{mostPassed[0]?.allele ?? "-"}</strong>
          Most passed allele
        </span>
      </div>

      <div className="inheritance-callouts">
        <div>
          <h3>Most passed</h3>
          {mostPassed.map((entry) => (
            <p key={`${entry.markerId}-${entry.allele}`}>
              {entry.markerId} {entry.allele}: {entry.count}/{offspring.length}
            </p>
          ))}
        </div>
        <div>
          <h3>Not yet passed</h3>
          {markersWithGaps.length > 0 ? (
            markersWithGaps.slice(0, 6).map((marker) => (
              <p key={marker.markerId}>
                {marker.markerId}: {marker.unpassedAlleles.join(", ")}
              </p>
            ))
          ) : (
            <p>Every marker has passed at least one visible allele.</p>
          )}
        </div>
      </div>

      <div className="inheritance-list">
        {markerStats.map((marker) => (
          <div className="inheritance-marker" key={marker.markerId}>
            <div className="inheritance-marker-head">
              <span>{marker.markerId}</span>
              <strong>{formatMarker(marker.parentAlleles)}</strong>
            </div>
            <div className="allele-bars">
              {uniqueAlleles(marker.parentAlleles).map((allele) => {
                const count = marker.passed[allele] ?? 0;
                const percent = Math.round((count / offspring.length) * 100);

                return (
                  <div className="allele-bar" key={allele}>
                    <div>
                      <span>Allele {allele}</span>
                      <strong>
                        {count}/{offspring.length} - {percent}%
                      </strong>
                    </div>
                    <div className="bar">
                      <span style={{ width: `${percent}%` }} />
                    </div>
                    {marker.averageTraitsByAllele[allele] ? (
                      <div className="allele-average-stats">
                        {traitEntries(marker.averageTraitsByAllele[allele]).map(([label, value]) => (
                          <span key={label}>
                            {label} <strong>{value}</strong>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="muted mini-note">No foals inherited this allele yet.</p>
                    )}
                  </div>
                );
              })}
            </div>
            <p className={marker.unpassedAlleles.length > 0 ? "inheritance-gap" : "inheritance-good"}>
              {marker.unpassedAlleles.length > 0
                ? `Not yet seen in foals: ${marker.unpassedAlleles.join(", ")}`
                : "All visible alleles have appeared in offspring."}
            </p>
            <div className="gene-flow-map" aria-label={`${marker.markerId} foal allele flow`}>
              {marker.foalFlow.map((flow) => (
                <Link
                  className="gene-flow-chip"
                  href={`/horses/${flow.foalId}`}
                  key={`${marker.markerId}-${flow.foalId}`}
                >
                  <span className={`allele-token allele-${flow.allele.toLowerCase()}`}>
                    {flow.allele}
                  </span>
                  <span>{flow.foalName}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function buildMarkerStats(horse: Horse, offspring: Horse[]): MarkerInheritance[] {
  return horse.genome.map((marker) => {
    const passed: Partial<Record<Allele, number>> = {};
    const inheritedFoals: Partial<Record<Allele, Horse[]>> = {};
    const foalFlow: MarkerInheritance["foalFlow"] = [];

    for (const foal of offspring) {
      const foalMarker = foal.genome.find((entry) => entry.id === marker.id);
      if (!foalMarker) continue;

      const passedAllele =
        foal.sireId === horse.id ? foalMarker.alleles[0] : foalMarker.alleles[1];
      passed[passedAllele] = (passed[passedAllele] ?? 0) + 1;
      inheritedFoals[passedAllele] = [...(inheritedFoals[passedAllele] ?? []), foal];
      foalFlow.push({
        foalId: foal.id,
        foalName: foal.name,
        allele: passedAllele,
      });
    }

    const unpassedAlleles = uniqueAlleles(marker.alleles).filter(
      (allele) => (passed[allele] ?? 0) === 0,
    );

    return {
      markerId: marker.id,
      parentAlleles: marker.alleles,
      passed: passed as Record<Allele, number>,
      unpassedAlleles,
      passEvents: offspring.length,
      averageTraitsByAllele: buildAverageTraitsByAllele(marker.alleles, inheritedFoals),
      foalFlow,
    };
  });
}

function uniqueAlleles(alleles: [Allele, Allele]): Allele[] {
  return Array.from(new Set(alleles));
}

function buildAverageTraitsByAllele(
  parentAlleles: [Allele, Allele],
  inheritedFoals: Partial<Record<Allele, Horse[]>>,
): Partial<Record<Allele, Horse["traits"]>> {
  return Object.fromEntries(
    uniqueAlleles(parentAlleles)
      .map((allele) => {
        const foals = inheritedFoals[allele] ?? [];
        if (foals.length === 0) {
          return [allele, undefined];
        }

        return [
          allele,
          {
            speed: average(foals.map((foal) => foal.traits.speed)),
            stamina: average(foals.map((foal) => foal.traits.stamina)),
            consistency: average(foals.map((foal) => foal.traits.consistency)),
            durability: average(foals.map((foal) => foal.traits.durability)),
          },
        ];
      })
      .filter((entry): entry is [Allele, Horse["traits"]] => entry[1] !== undefined),
  );
}

function average(values: number[]): number {
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}
