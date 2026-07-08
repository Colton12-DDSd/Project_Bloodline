import type { Genome } from "@/types/bloodline";
import { formatMarker } from "@/lib/format";

export function GenomeTable({ genome }: { genome: Genome }) {
  return (
    <div className="grid-list genome-list">
      {genome.map((marker) => (
        <div key={marker.id} className="metric-row">
          <span>{marker.id}</span>
          <strong>{formatMarker(marker.alleles)}</strong>
        </div>
      ))}
    </div>
  );
}
