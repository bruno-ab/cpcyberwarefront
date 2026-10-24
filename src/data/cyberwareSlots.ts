export const CyberWareSlot = {
  frontalCortex: 'frontal_cortex',
  operatingSystem: 'operating_system',
  face: 'face',
  skeleton: 'skeleton',
  nervousSystem: 'nervous_system',
  circulatorySystem: 'circulatory_system',
  integumentarySystem: 'integumentary_system',
  hands: 'hands',
  arms: 'arms',
  legs: 'legs',
} as const;

export type CyberWareSlot = (typeof CyberWareSlot)[keyof typeof CyberWareSlot];

export const SLOT_LABELS: Record<CyberWareSlot, string> = {
  frontal_cortex: 'Cabeça / Córtex Frontal',
  operating_system: 'Chip / Sistema Operacional',
  face: 'Rosto',
  skeleton: 'Esqueleto',
  nervous_system: 'Sistema Nervoso',
  circulatory_system: 'Sistema Circulatório',
  integumentary_system: 'Pele / Tegumento',
  hands: 'Mãos',
  arms: 'Braços',
  legs: 'Pernas',
};

export const CYBERWARE_MAX_SLOTS: Record<CyberWareSlot, number> = {
  frontal_cortex: 3,
  operating_system: 1,
  face: 1,
  skeleton: 3,
  nervous_system: 3,
  circulatory_system: 3,
  integumentary_system: 3,
  hands: 2,
  arms: 2,
  legs: 2,
};

export const BASE_IMPLANT_CAPACITY = 10;
