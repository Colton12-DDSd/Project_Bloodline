import type { Genome, PhysicalTraits } from "@/types/bloodline";

export function formatMarker(alleles: [string, string]): string {
  return `${alleles[0]}/${alleles[1]}`;
}

export function traitEntries(traits: PhysicalTraits): [string, number][] {
  return [
    ["Speed", traits.speed],
    ["Stamina", traits.stamina],
    ["Consistency", traits.consistency],
    ["Durability", traits.durability],
  ];
}

export function genomeText(genome: Genome): string {
  return genome.map((marker) => `${marker.id}: ${formatMarker(marker.alleles)}`).join("\n");
}
