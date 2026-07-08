export type Allele = "A" | "B" | "C";

export type Sex = "Sire" | "Dam";

export type GeneticMarkerId =
  | "GM-001"
  | "GM-002"
  | "GM-003"
  | "GM-004"
  | "GM-005";

export type GeneticMarker = {
  id: GeneticMarkerId;
  alleles: [Allele, Allele];
};

export type Genome = GeneticMarker[];

export type PhysicalTraits = {
  speed: number;
  stamina: number;
  consistency: number;
  durability: number;
};

export type TrialResults = {
  simulations: number;
  overallRank: number;
  poolSize: number;
  overallPercentile: number;
  sprintRank: number;
  distanceRank: number;
  consistencyRank: number;
  bestFit: "Sprinter" | "Miler" | "Router" | "Balanced";
  notes: string[];
};

export type Horse = {
  id: string;
  name: string;
  sex: Sex;
  generation: number;
  genome: Genome;
  traits: PhysicalTraits;
  trialResults?: TrialResults;
  sireId?: string;
  damId?: string;
  offspringIds: string[];
};

export type StableState = {
  horses: Horse[];
  lastFoalId?: string;
};
