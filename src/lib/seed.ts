import type { Horse, Sex } from "@/types/bloodline";
import { calculatePhysicalTraits, createRandomGenome } from "./genetics";
import { runPerformanceTrial } from "./trial";

const starterNames = [
  "Iron Meridian",
  "Cinder Lace",
  "Blue Static",
  "Hollow Crown",
  "Sunday Voltage",
  "Copper Anthem",
];

export function createSeedHorses(): Horse[] {
  const random = seededRandom(8421);
  const horses = starterNames.map((name, index) => {
    const sex: Sex = index < 3 ? "Sire" : "Dam";
    const genome = createRandomGenome(random);
    return {
      id: `starter-${index + 1}`,
      name,
      sex,
      generation: 0,
      genome,
      traits: calculatePhysicalTraits(genome),
      offspringIds: [],
    };
  });

  return horses.map((horse) => ({
    ...horse,
    trialResults: runPerformanceTrial(horse, horses),
  }));
}

function seededRandom(seed: number): () => number {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}
