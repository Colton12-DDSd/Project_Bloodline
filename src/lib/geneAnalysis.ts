import type {
  Allele,
  GeneticMarker,
  GeneticMarkerId,
  Horse,
  PhysicalTraits,
} from "@/types/bloodline";
import { ALLELES, MARKER_IDS, calculatePhysicalTraits } from "./genetics";
import { scoreDistance, scoreOverall, scoreSprint } from "./trial";

export type GeneSignal = {
  markerId: GeneticMarkerId;
  allele: Allele;
  carriers: Horse[];
  averageTraits: PhysicalTraits;
  deltas: PhysicalTraits;
  bestTrait: keyof PhysicalTraits;
};

export type GenotypeSignal = {
  markerId: GeneticMarkerId;
  genotype: string;
  horses: Horse[];
  averageTraits: PhysicalTraits;
  bestTrait: keyof PhysicalTraits;
};

export type PairingSignal = {
  sire: Horse;
  dam: Horse;
  goal: "Speed" | "Stamina" | "Balanced";
  expectedTraits: PhysicalTraits;
  score: number;
  notes: string[];
};

export function analyzeGeneSignals(horses: Horse[]): GeneSignal[] {
  const stableAverage = averageTraits(horses);

  return MARKER_IDS.flatMap((markerId) =>
    ALLELES.map((allele) => {
      const carriers = horses.filter((horse) =>
        horse.genome.some(
          (marker) => marker.id === markerId && marker.alleles.includes(allele),
        ),
      );
      const average = averageTraits(carriers);
      const deltas = subtractTraits(average, stableAverage);

      return {
        markerId,
        allele,
        carriers,
        averageTraits: average,
        deltas,
        bestTrait: strongestTrait(deltas),
      };
    }),
  ).sort((a, b) => b.carriers.length - a.carriers.length || b.deltas[b.bestTrait] - a.deltas[a.bestTrait]);
}

export function analyzeGenotypes(horses: Horse[]): GenotypeSignal[] {
  return MARKER_IDS.flatMap((markerId) => {
    const groups = new Map<string, Horse[]>();

    for (const horse of horses) {
      const marker = horse.genome.find((entry) => entry.id === markerId);
      if (!marker) continue;
      const genotype = normalizeGenotype(marker);
      groups.set(genotype, [...(groups.get(genotype) ?? []), horse]);
    }

    return Array.from(groups.entries()).map(([genotype, groupedHorses]) => {
      const average = averageTraits(groupedHorses);
      return {
        markerId,
        genotype,
        horses: groupedHorses,
        averageTraits: average,
        bestTrait: strongestTrait(average),
      };
    });
  }).sort((a, b) => b.horses.length - a.horses.length || b.averageTraits[b.bestTrait] - a.averageTraits[a.bestTrait]);
}

export function findPairingSignals(horses: Horse[]): PairingSignal[] {
  const sires = horses.filter((horse) => horse.sex === "Sire");
  const dams = horses.filter((horse) => horse.sex === "Dam");
  const signals: PairingSignal[] = [];

  for (const sire of sires) {
    for (const dam of dams) {
      const expectedTraits = expectedFoalTraits(sire, dam);
      const sprintScore = scoreSprint(expectedTraits);
      const distanceScore = scoreDistance(expectedTraits);
      const balancedScore =
        scoreOverall(expectedTraits) - Math.abs(sprintScore - distanceScore) * 0.35;

      signals.push({
        sire,
        dam,
        goal: "Speed",
        expectedTraits,
        score: sprintScore,
        notes: buildPairingNotes(expectedTraits, "Speed"),
      });
      signals.push({
        sire,
        dam,
        goal: "Stamina",
        expectedTraits,
        score: distanceScore,
        notes: buildPairingNotes(expectedTraits, "Stamina"),
      });
      signals.push({
        sire,
        dam,
        goal: "Balanced",
        expectedTraits,
        score: balancedScore,
        notes: buildPairingNotes(expectedTraits, "Balanced"),
      });
    }
  }

  return signals.sort((a, b) => b.score - a.score);
}

function expectedFoalTraits(sire: Horse, dam: Horse): PhysicalTraits {
  const possibleTraits: PhysicalTraits[] = [];
  const genomes = buildPossibleGenomes(sire.genome, dam.genome, 0, []);

  for (const genome of genomes) {
    possibleTraits.push(calculatePhysicalTraits(genome));
  }

  return averageTraits(possibleTraits.map((traits, index) => ({
    id: `${sire.id}-${dam.id}-${index}`,
    name: "",
    sex: "Sire",
    generation: 0,
    genome: [],
    traits,
    offspringIds: [],
  })));
}

function buildPossibleGenomes(
  sireGenome: GeneticMarker[],
  damGenome: GeneticMarker[],
  markerIndex: number,
  current: GeneticMarker[],
): GeneticMarker[][];
function buildPossibleGenomes(
  sireGenome: GeneticMarker[],
  damGenome: GeneticMarker[],
  markerIndex: number,
  current: GeneticMarker[],
): GeneticMarker[][] {
  if (markerIndex >= MARKER_IDS.length) {
    return [current];
  }

  const markerId = MARKER_IDS[markerIndex];
  const sireMarker = sireGenome.find((marker) => marker.id === markerId);
  const damMarker = damGenome.find((marker) => marker.id === markerId);
  if (!sireMarker || !damMarker) return [];

  const nextGenomes: GeneticMarker[][] = [];
  for (const sireAllele of sireMarker.alleles) {
    for (const damAllele of damMarker.alleles) {
      nextGenomes.push(
        ...buildPossibleGenomes(sireGenome, damGenome, markerIndex + 1, [
          ...current,
          { id: markerId, alleles: [sireAllele, damAllele] },
        ]),
      );
    }
  }

  return nextGenomes;
}

function averageTraits(horses: Array<Pick<Horse, "traits">>): PhysicalTraits {
  if (horses.length === 0) {
    return { speed: 0, stamina: 0, consistency: 0, durability: 0 };
  }

  return {
    speed: average(horses.map((horse) => horse.traits.speed)),
    stamina: average(horses.map((horse) => horse.traits.stamina)),
    consistency: average(horses.map((horse) => horse.traits.consistency)),
    durability: average(horses.map((horse) => horse.traits.durability)),
  };
}

function subtractTraits(left: PhysicalTraits, right: PhysicalTraits): PhysicalTraits {
  return {
    speed: left.speed - right.speed,
    stamina: left.stamina - right.stamina,
    consistency: left.consistency - right.consistency,
    durability: left.durability - right.durability,
  };
}

function strongestTrait(traits: PhysicalTraits): keyof PhysicalTraits {
  return (Object.entries(traits) as Array<[keyof PhysicalTraits, number]>).sort(
    (a, b) => b[1] - a[1],
  )[0][0];
}

function normalizeGenotype(marker: GeneticMarker): string {
  return [...marker.alleles].sort().join("/");
}

function average(values: number[]): number {
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function buildPairingNotes(
  traits: PhysicalTraits,
  goal: PairingSignal["goal"],
): string[] {
  const notes: string[] = [];

  if (goal === "Speed" && traits.speed >= traits.stamina + 6) {
    notes.push("Leans sprint: speed is clearly ahead of stamina.");
  }
  if (goal === "Stamina" && traits.stamina >= traits.speed + 6) {
    notes.push("Leans distance: stamina is clearly ahead of speed.");
  }
  if (goal === "Balanced" && Math.abs(traits.speed - traits.stamina) <= 4) {
    notes.push("Speed and stamina are close, useful for testing balanced crosses.");
  }
  if (traits.consistency >= 65) {
    notes.push("Consistency should make results easier to read.");
  }
  if (traits.durability >= 65) {
    notes.push("Durability gives the cross a sturdier floor.");
  }
  if (notes.length === 0) {
    notes.push("Interesting but not extreme. Use this as a comparison cross.");
  }

  return notes;
}
