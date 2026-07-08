import type { TrialResults } from "@/types/bloodline";

export function TrialPanel({ results }: { results?: TrialResults }) {
  if (!results) {
    return <p className="muted">No trial results yet.</p>;
  }

  return (
    <div className="trial-panel">
      <div className="stat-row">
        <div>
          <span>Overall</span>
          <strong>
            #{results.overallRank} / {results.poolSize}
          </strong>
        </div>
        <div>
          <span>Percentile</span>
          <strong>{results.overallPercentile}</strong>
        </div>
        <div>
          <span>Best Fit</span>
          <strong>{results.bestFit}</strong>
        </div>
      </div>
      <div className="rank-grid">
        <span>Speed #{results.sprintRank}</span>
        <span>Stamina #{results.distanceRank}</span>
        <span>Consistency #{results.consistencyRank}</span>
        <span>{results.simulations} sims</span>
      </div>
      <ul className="notes">
        {results.notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </div>
  );
}
