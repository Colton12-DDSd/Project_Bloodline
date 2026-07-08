import type { Allele, GeneticMarkerId, Horse } from "@/types/bloodline";
import { formatMarker } from "@/lib/format";

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
                  </div>
                );
              })}
            </div>
            <p className={marker.unpassedAlleles.length > 0 ? "inheritance-gap" : "inheritance-good"}>
              {marker.unpassedAlleles.length > 0
                ? `Not yet seen in foals: ${marker.unpassedAlleles.join(", ")}`
                : "All visible alleles have appeared in offspring."}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function buildMarkerStats(horse: Horse, offspring: Horse[]): MarkerInheritance[] {
  return horse.genome.map((marker) => {
    const passed: Partial<Record<Allele, number>> = {};

    for (const foal of offspring) {
      const foalMarker = foal.genome.find((entry) => entry.id === marker.id);
      if (!foalMarker) continue;

      const passedAllele =
        foal.sireId === horse.id ? foalMarker.alleles[0] : foalMarker.alleles[1];
      passed[passedAllele] = (passed[passedAllele] ?? 0) + 1;
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
    };
  });
}

function uniqueAlleles(alleles: [Allele, Allele]): Allele[] {
  return Array.from(new Set(alleles));
}
