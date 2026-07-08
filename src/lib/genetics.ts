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
];

export const ALLELES: Allele[] = ["A", "B", "C"];

type TraitKey = keyof PhysicalTraits;

const baseline: PhysicalTraits = {
  speed: 50,
  stamina: 50,
  consistency: 50,
  durability: 50,
};

const alleleEffects: Record<Allele, Partial<Record<TraitKey, number>>> = {
  A: { speed: 5, stamina: -1 },
  B: { stamina: 5, speed: -1 },
  C: { consistency: 3, durability: 3 },
};

const markerFocus: Record<GeneticMarkerId, Partial<Record<TraitKey, number>>> = {
  "GM-001": { speed: 1.35 },
  "GM-002": { stamina: 1.35 },
  "GM-003": { consistency: 1.35 },
  "GM-004": { durability: 1.35 },
  "GM-005": { speed: 1.15, stamina: 1.15 },
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

  traits.speed += (traits.consistency - 50) * 0.08;
  traits.stamina += (traits.durability - 50) * 0.08;
  traits.durability += (traits.consistency - 50) * 0.06;

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
    A: { speed: 4, consistency: -1 },
    B: { stamina: 4, speed: -1 },
    C: { consistency: 3, durability: 2 },
  };
  return bonuses[allele];
}

function pairInteraction(a: Allele, b: Allele): Partial<Record<TraitKey, number>> {
  const pair = [a, b].sort().join("");
  const interactions: Record<string, Partial<Record<TraitKey, number>>> = {
    AB: { speed: 2, stamina: 2 },
    AC: { speed: 2, consistency: 2 },
    BC: { stamina: 2, durability: 2 },
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
