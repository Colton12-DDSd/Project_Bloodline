import type { Genome, PhysicalTraits } from "@/types/bloodline";

export function formatMarker(alleles: [string, string]): string {
  return `${alleles[0]}/${alleles[1]}`;
}

export function traitEntries(traits: PhysicalTraits): [string, number][] {
  return [
    ["Stride Length", traits.strideLength],
    ["Lung Capacity", traits.lungCapacity],
    ["Heart Index", traits.heartIndex],
    ["Muscle Fiber", traits.muscleFiber],
    ["Acceleration", traits.acceleration],
    ["Top Speed", traits.topSpeed],
    ["Stamina", traits.stamina],
    ["Recovery", traits.recovery],
    ["Consistency", traits.consistency],
    ["Durability", traits.durability],
  ];
}

export function genomeText(genome: Genome): string {
  return genome.map((marker) => `${marker.id}: ${formatMarker(marker.alleles)}`).join("\n");
}
