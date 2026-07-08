import Link from "next/link";
import type { Horse } from "@/types/bloodline";

export function HorseSummaryCard({ horse }: { horse: Horse }) {
  return (
    <article className="horse-card">
      <div>
        <h2>{horse.name}</h2>
        <p>
          {horse.sex} · Gen {horse.generation}
        </p>
      </div>
      <div className="rank-line">
        {horse.trialResults ? (
          <>
            <strong>#{horse.trialResults.overallRank}</strong>
            <span>{horse.trialResults.overallPercentile}th pct</span>
          </>
        ) : (
          <span>Untrialed</span>
        )}
      </div>
      <Link className="button secondary" href={`/horses/${horse.id}`}>
        View
      </Link>
    </article>
  );
}
