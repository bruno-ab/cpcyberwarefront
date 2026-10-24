export type StorytellerDots = Record<string, number>;

export type StorytellerSheet = {
  header: {
    name: string;
    role: string;
    affiliation: string;
    age?: string;
    city: string;
    background: string;
    concept: string;
    lifepath?: string;
  };
  physical: StorytellerDots;
  social: StorytellerDots;
  mental: StorytellerDots;
  talents: StorytellerDots;
  skills: StorytellerDots;
  knowledges: StorytellerDots;
  backgrounds: StorytellerDots;
  virtues: StorytellerDots;
  other_traits: {
    humanity: number;
    willpower: number;
    edges: number;
    implant_capacity: number;
    path?: number;
  };
  vitality: number;
  vitality_marked: number;
  merits: Record<string, string>;
  flaws: Record<string, string>;
  cyberwareLoad: Array<{
    name: string;
    slot: string;
    edgeCost: number;
    implantCost: number;
    hackDifficulty: number;
  }>;
  notes?: string;
};

export const emptyDots = (keys: string[], value = 0): StorytellerDots =>
  Object.fromEntries(keys.map((key) => [key, value]));
