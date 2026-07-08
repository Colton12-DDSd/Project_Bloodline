import type { Horse, PhysicalTraits, TrialResults } from "@/types/bloodline";

const RUNS = 80;

export function scoreOverall(traits: PhysicalTraits): number {
  return (
    traits.speed * 0.32 +
    traits.stamina * 0.3 +
    traits.consistency * 0.2 +
    traits.durability * 0.18
  );
}

export function scoreSprint(traits: PhysicalTraits): number {
  return (
    traits.speed * 0.58 +
    traits.consistency * 0.22 +
    traits.durability * 0.12 +
    traits.stamina * 0.08
  );
}

export function scoreDistance(traits: PhysicalTraits): number {
  return (
    traits.stamina * 0.56 +
    traits.durability * 0.2 +
    traits.consistency * 0.16 +
    traits.speed * 0.08
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
  return Math.max(1.5, 8 - traits.consistency * 0.07);
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

  if (Math.abs(sprint - distance) < 4) return "Balanced";
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

  if (sprintRank <= Math.ceil(poolSize * 0.33)) {
    notes.push("Speed profile is a clear strength.");
  }
  if (distanceRank <= Math.ceil(poolSize * 0.33)) {
    notes.push("Stamina profile should stretch well.");
  }
  if (traits.consistency >= 65) {
    notes.push("Consistency should reduce bad trial swings.");
  } else if (traits.consistency <= 45) {
    notes.push("Volatile runner with a wider performance range.");
  }
  if (traits.durability >= 65) {
    notes.push("Durability is a breeding asset.");
  } else if (traits.durability <= 45) {
    notes.push("Durability is a weakness to breed around.");
  }
  if (notes.length === 0) {
    notes.push("Balanced baseline with no extreme signal yet.");
  }

  return notes;
}
