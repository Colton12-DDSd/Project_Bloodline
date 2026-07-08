export type Allele = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";

export type Sex = "Sire" | "Dam";

export type GeneticMarkerId =
  | "GM-001"
  | "GM-002"
  | "GM-003"
  | "GM-004"
  | "GM-005"
  | "GM-006"
  | "GM-007"
  | "GM-008"
  | "GM-009"
  | "GM-010";

export type GeneticMarker = {
  id: GeneticMarkerId;
  alleles: [Allele, Allele];
};

export type Genome = GeneticMarker[];

export type PhysicalTraits = {
  strideLength: number;
  lungCapacity: number;
  heartIndex: number;
  muscleFiber: number;
  acceleration: number;
  topSpeed: number;
  stamina: number;
  recovery: number;
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
