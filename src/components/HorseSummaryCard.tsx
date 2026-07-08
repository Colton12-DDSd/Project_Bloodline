import Link from "next/link";
import { traitEntries } from "@/lib/format";
import type { Horse } from "@/types/bloodline";

export function HorseSummaryCard({ horse }: { horse: Horse }) {
  const topTraits = traitEntries(horse.traits)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <article className="horse-card">
      <div>
        <span className={`sex-badge ${horse.sex.toLowerCase()}`}>{horse.sex}</span>
        <h2>{horse.name}</h2>
        <p>Generation {horse.generation}</p>
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

      {horse.trialResults ? (
        <div className="horse-card-details">
          <span>
            <strong>{horse.trialResults.bestFit}</strong>
            Best fit
          </span>
          <span>
            <strong>#{horse.trialResults.sprintRank}</strong>
            Sprint
          </span>
          <span>
            <strong>#{horse.trialResults.distanceRank}</strong>
            Distance
          </span>
        </div>
      ) : null}

      <div className="trait-chips" aria-label={`${horse.name} top traits`}>
        {topTraits.map(([label, value]) => (
          <span key={label}>
            {label} <strong>{value}</strong>
          </span>
        ))}
      </div>

      <Link className="button secondary" href={`/horses/${horse.id}`}>
        View Horse
      </Link>
    </article>
  );
}
