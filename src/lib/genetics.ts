import type {
  Allele,
  GeneticMarkerId,
  Genome,
  PhysicalTraits,
} from "@/types/bloodline";

export const MARKER_IDS: GeneticMarkerId[] = [
  "GM-001",
  "GM-002",
  "GM-003",
  "GM-004",
  "GM-005",
  "GM-006",
  "GM-007",
  "GM-008",
  "GM-009",
  "GM-010",
];

export const ALLELES: Allele[] = ["A", "B", "C", "D", "E", "F", "G", "H"];

type TraitKey = keyof PhysicalTraits;

const baseline: PhysicalTraits = {
  strideLength: 50,
  lungCapacity: 50,
  heartIndex: 50,
  muscleFiber: 50,
  acceleration: 50,
  topSpeed: 50,
  stamina: 50,
  recovery: 50,
  consistency: 50,
  durability: 50,
};

const alleleEffects: Record<Allele, Partial<Record<TraitKey, number>>> = {
  A: { strideLength: 3, acceleration: 4, topSpeed: 2 },
  B: { lungCapacity: 3, stamina: 4, recovery: 1 },
  C: { heartIndex: 3, consistency: 4, durability: 2 },
  D: { muscleFiber: 4, acceleration: 2, topSpeed: 3 },
  E: { lungCapacity: 2, heartIndex: 2, recovery: 4 },
  F: { topSpeed: 4, muscleFiber: 2, durability: -1 },
  G: { stamina: 3, consistency: 2, durability: 4 },
  H: { strideLength: 2, recovery: 2, acceleration: -1, durability: 3 },
};

const markerFocus: Record<GeneticMarkerId, Partial<Record<TraitKey, number>>> = {
  "GM-001": { strideLength: 1.25, topSpeed: 1.15 },
  "GM-002": { lungCapacity: 1.25, stamina: 1.15 },
  "GM-003": { heartIndex: 1.2, recovery: 1.15 },
  "GM-004": { muscleFiber: 1.25, acceleration: 1.15 },
  "GM-005": { acceleration: 1.2, topSpeed: 1.1 },
  "GM-006": { topSpeed: 1.25, strideLength: 1.1 },
  "GM-007": { stamina: 1.25, lungCapacity: 1.1 },
  "GM-008": { recovery: 1.2, durability: 1.15 },
  "GM-009": { consistency: 1.25, heartIndex: 1.1 },
  "GM-010": { durability: 1.25, consistency: 1.1 },
};

export function createRandomGenome(random = Math.random): Genome {
  return MARKER_IDS.map((id) => ({
    id,
    alleles: [pickAllele(random), pickAllele(random)],
  }));
}

export function calculatePhysicalTraits(genome: Genome): PhysicalTraits {
  const traits = { ...baseline };

  for (const marker of genome) {
    const [first, second] = marker.alleles;
    const focus = markerFocus[marker.id];

    for (const allele of marker.alleles) {
      for (const [trait, effect] of Object.entries(alleleEffects[allele])) {
        const key = trait as TraitKey;
        traits[key] += (effect ?? 0) * (focus[key] ?? 1);
      }
    }

    if (first === second) {
      applyCombo(traits, homozygousBonus(first));
    } else {
      applyCombo(traits, pairInteraction(first, second));
    }
  }

  traits.topSpeed += (traits.strideLength - 50) * 0.18 + (traits.muscleFiber - 50) * 0.12;
  traits.stamina += (traits.lungCapacity - 50) * 0.16 + (traits.heartIndex - 50) * 0.14;
  traits.consistency += (traits.recovery - 50) * 0.08;
  traits.durability += (traits.consistency - 50) * 0.05;

  return clampTraits(traits);
}

function pickAllele(random: () => number): Allele {
  return ALLELES[Math.floor(random() * ALLELES.length)];
}

function applyCombo(
  traits: PhysicalTraits,
  combo: Partial<Record<TraitKey, number>>,
) {
  for (const [trait, value] of Object.entries(combo)) {
    traits[trait as TraitKey] += value ?? 0;
  }
}

function homozygousBonus(allele: Allele): Partial<Record<TraitKey, number>> {
  const bonuses: Record<Allele, Partial<Record<TraitKey, number>>> = {
    A: { acceleration: 3, consistency: -1 },
    B: { stamina: 3, topSpeed: -1 },
    C: { consistency: 3, durability: 1 },
    D: { muscleFiber: 3, recovery: -1 },
    E: { recovery: 3, heartIndex: 1 },
    F: { topSpeed: 4, durability: -2 },
    G: { durability: 3, stamina: 1 },
    H: { strideLength: 2, recovery: 1 },
  };
  return bonuses[allele];
}

function pairInteraction(a: Allele, b: Allele): Partial<Record<TraitKey, number>> {
  const pair = [a, b].sort().join("");
  const interactions: Record<string, Partial<Record<TraitKey, number>>> = {
    AD: { acceleration: 4, topSpeed: 2 },
    AF: { topSpeed: 4, stamina: -1 },
    BF: { stamina: -2, topSpeed: 3 },
    BG: { stamina: 4, durability: 2 },
    CE: { consistency: 3, recovery: 2 },
    CF: { consistency: -2, topSpeed: 2 },
    DG: { muscleFiber: 2, durability: 2 },
    EH: { recovery: 3, lungCapacity: 1 },
    GH: { durability: 3, stamina: 2 },
  };
  return interactions[pair] ?? {};
}

function clampTraits(traits: PhysicalTraits): PhysicalTraits {
  return Object.fromEntries(
    Object.entries(traits).map(([key, value]) => [
      key,
      Math.max(20, Math.min(99, Math.round(value))),
    ]),
  ) as PhysicalTraits;
}
