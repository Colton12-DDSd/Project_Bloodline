import type { Genome, Horse, Sex } from "@/types/bloodline";
import { calculatePhysicalTraits, MARKER_IDS } from "./genetics";
import { runPerformanceTrial } from "./trial";

const foalPrefixes = ["Nova", "Crimson", "Atlas", "Cipher", "Golden", "Static"];
const foalSuffixes = ["Blood", "Promise", "Vector", "Drift", "Echo", "Current"];

export function breedHorses(sire: Horse, dam: Horse, pool: Horse[]): Horse {
  const bornAt = Date.now();
  const genome: Genome = MARKER_IDS.map((id) => {
    const sireMarker = sire.genome.find((marker) => marker.id === id);
    const damMarker = dam.genome.find((marker) => marker.id === id);

    if (!sireMarker || !damMarker) {
      throw new Error(`Missing marker ${id}`);
    }

    return {
      id,
      alleles: [
        sireMarker.alleles[Math.floor(Math.random() * 2)],
        damMarker.alleles[Math.floor(Math.random() * 2)],
      ],
    };
  });

  const traits = calculatePhysicalTraits(genome);
  const sex: Sex = Math.random() > 0.5 ? "Sire" : "Dam";
  const foal: Horse = {
    id: `foal-${bornAt}-${Math.random().toString(36).slice(2, 7)}`,
    name: generateFoalName(pool.length),
    sex,
    generation: Math.max(sire.generation, dam.generation) + 1,
    sireId: sire.id,
    damId: dam.id,
    genome,
    traits,
    offspringIds: [],
  };

  return {
    ...foal,
    trialResults: runPerformanceTrial(foal, [...pool, foal]),
  };
}

function generateFoalName(poolSize: number): string {
  const prefix = foalPrefixes[poolSize % foalPrefixes.length];
  const suffix = foalSuffixes[Math.floor(poolSize / foalPrefixes.length) % foalSuffixes.length];
  return `${prefix} ${suffix}`;
}
