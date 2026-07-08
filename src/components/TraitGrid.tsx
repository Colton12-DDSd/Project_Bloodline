import type { PhysicalTraits } from "@/types/bloodline";
import { traitEntries } from "@/lib/format";

export function TraitGrid({ traits }: { traits: PhysicalTraits }) {
  return (
    <div className="grid-list">
      {traitEntries(traits).map(([label, value]) => (
        <div key={label} className="trait">
          <div className="metric-row">
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
          <div className="bar">
            <span style={{ width: `${value}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
