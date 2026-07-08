import type { Horse, PhysicalTraits, TrialResults } from "@/types/bloodline";

const RUNS = 120;

export function scoreOverall(traits: PhysicalTraits): number {
  return (
    traits.strideLength * 0.11 +
    traits.lungCapacity * 0.11 +
    traits.heartIndex * 0.11 +
    traits.muscleFiber * 0.1 +
    traits.acceleration * 0.11 +
    traits.topSpeed * 0.13 +
    traits.stamina * 0.12 +
    traits.recovery * 0.08 +
    traits.consistency * 0.07 +
    traits.durability * 0.06
  );
}

export function scoreSprint(traits: PhysicalTraits): number {
  return (
    traits.acceleration * 0.28 +
    traits.topSpeed * 0.28 +
    traits.muscleFiber * 0.16 +
    traits.strideLength * 0.16 +
    traits.consistency * 0.07 +
    traits.durability * 0.05
  );
}

export function scoreDistance(traits: PhysicalTraits): number {
  return (
    traits.stamina * 0.28 +
    traits.lungCapacity * 0.22 +
    traits.heartIndex * 0.18 +
    traits.recovery * 0.14 +
    traits.strideLength * 0.08 +
    traits.consistency * 0.06 +
    traits.durability * 0.04
  );
}

export function runPerformanceTrial(newHorse: Horse, pool: Horse[]): TrialResults {
  const fullPool = upsertHorse(pool, newHorse);
  const rankedOverall = rankBySimulation(fullPool, scoreOverall);
  const rankedSprint = rankBySimulation(fullPool, scoreSprint);
  const rankedDistance = rankBySimulation(fullPool, scoreDistance);
  const rankedConsistency = [...fullPool].sort(
    (a, b) => b.traits.consistency - a.traits.consistency,
  );

  const overallRank = findRank(rankedOverall, newHorse.id);
  const sprintRank = findRank(rankedSprint, newHorse.id);
  const distanceRank = findRank(rankedDistance, newHorse.id);
  const consistencyRank = findRank(rankedConsistency, newHorse.id);
  const poolSize = fullPool.length;

  return {
    simulations: RUNS,
    overallRank,
    poolSize,
    overallPercentile: Math.round(((poolSize - overallRank + 1) / poolSize) * 100),
    sprintRank,
    distanceRank,
    consistencyRank,
    bestFit: getBestFit(newHorse.traits),
    notes: buildNotes(newHorse.traits, sprintRank, distanceRank, poolSize),
  };
}

function rankBySimulation(
  horses: Horse[],
  scorer: (traits: PhysicalTraits) => number,
): Horse[] {
  const scored = horses.map((horse) => {
    let total = 0;
    for (let i = 0; i < RUNS; i += 1) {
      const variance = deterministicNoise(`${horse.id}-${i}`) * varianceFor(horse.traits);
      total += scorer(horse.traits) + variance;
    }
    return { horse, average: total / RUNS };
  });

  return scored.sort((a, b) => b.average - a.average).map((entry) => entry.horse);
}

function varianceFor(traits: PhysicalTraits): number {
  return Math.max(1.5, 9 - traits.consistency * 0.065);
}

function deterministicNoise(seed: string): number {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) / 4294967295 - 0.5) * 2;
}

function findRank(horses: Horse[], horseId: string): number {
  return horses.findIndex((horse) => horse.id === horseId) + 1;
}

function upsertHorse(pool: Horse[], horse: Horse): Horse[] {
  const without = pool.filter((entry) => entry.id !== horse.id);
  return [...without, horse];
}

function getBestFit(traits: PhysicalTraits): TrialResults["bestFit"] {
  const sprint = scoreSprint(traits);
  const distance = scoreDistance(traits);

  if (Math.abs(sprint - distance) < 3) return "Balanced";
  if (sprint > distance + 8) return "Sprinter";
  if (distance > sprint + 8) return "Router";
  return "Miler";
}

function buildNotes(
  traits: PhysicalTraits,
  sprintRank: number,
  distanceRank: number,
  poolSize: number,
): string[] {
  const notes: string[] = [];

  if (sprintRank <= Math.ceil(poolSize * 0.25)) {
    notes.push("Sprint profile is a clear strength.");
  }
  if (distanceRank <= Math.ceil(poolSize * 0.25)) {
    notes.push("Distance profile should stretch well.");
  }
  if (traits.consistency >= 70) {
    notes.push("High consistency should reduce bad trial swings.");
  } else if (traits.consistency <= 45) {
    notes.push("Volatile runner with a wider performance range.");
  }
  if (traits.durability >= 70) {
    notes.push("Durability is a long-term asset.");
  } else if (traits.durability <= 45) {
    notes.push("Durability is a weakness to breed around.");
  }
  if (notes.length === 0) {
    notes.push("Balanced but not extreme; useful as a baseline breeder.");
  }

  return notes;
}
