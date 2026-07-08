import Link from "next/link";
import type { Horse } from "@/types/bloodline";

type LineagePanelProps = {
  horse: Horse;
  horses: Horse[];
};

export function LineagePanel({ horse, horses }: LineagePanelProps) {
  const sire = horse.sireId ? findHorse(horses, horse.sireId) : undefined;
  const dam = horse.damId ? findHorse(horses, horse.damId) : undefined;
  const offspring = horses.filter((entry) => horse.offspringIds.includes(entry.id));

  return (
    <div className="lineage-panel">
      <div className="lineage-generation">
        <h3>Parents</h3>
        <div className="lineage-grid">
          <LineageCard label="Sire" horse={sire} emptyText="Starter founder" />
          <LineageCard label="Dam" horse={dam} emptyText="Starter founder" />
        </div>
      </div>

      <div className="lineage-current">
        <span className={`sex-badge ${horse.sex.toLowerCase()}`}>{horse.sex}</span>
        <strong>{horse.name}</strong>
        <span>Generation {horse.generation}</span>
      </div>

      <div className="lineage-generation">
        <h3>Produced</h3>
        {offspring.length > 0 ? (
          <div className="offspring-list">
            {offspring.map((foal) => {
              const otherParentId = foal.sireId === horse.id ? foal.damId : foal.sireId;
              const otherParent = otherParentId ? findHorse(horses, otherParentId) : undefined;

              return (
                <Link className="offspring-card" key={foal.id} href={`/horses/${foal.id}`}>
                  <span className="offspring-pairing">
                    {horse.name} + {otherParent?.name ?? "Unknown parent"}
                  </span>
                  <strong>{foal.name}</strong>
                  <span>
                    {foal.sex} - Gen {foal.generation}
                    {foal.trialResults ? ` - ${foal.trialResults.bestFit}` : ""}
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="muted">No foals produced yet.</p>
        )}
      </div>
    </div>
  );
}

function LineageCard({
  label,
  horse,
  emptyText,
}: {
  label: string;
  horse?: Horse;
  emptyText: string;
}) {
  if (!horse) {
    return (
      <div className="lineage-card empty">
        <span>{label}</span>
        <strong>{emptyText}</strong>
      </div>
    );
  }

  return (
    <Link className="lineage-card" href={`/horses/${horse.id}`}>
      <span>{label}</span>
      <strong>{horse.name}</strong>
      <small>
        {horse.sex} - Gen {horse.generation}
      </small>
    </Link>
  );
}

function findHorse(horses: Horse[], horseId: string): Horse | undefined {
  return horses.find((entry) => entry.id === horseId);
}
