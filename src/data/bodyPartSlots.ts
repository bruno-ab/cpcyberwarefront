import { CyberWareSlot } from './cyberwareSlots';

/** Partes clicáveis da silhueta (data-position no SVG). */
export type BodyPart =
  | 'head'
  | 'shoulder'
  | 'arm'
  | 'cheast'
  | 'stomach'
  | 'legs'
  | 'hands';

export const BODY_PARTS: BodyPart[] = [
  'head',
  'shoulder',
  'arm',
  'cheast',
  'stomach',
  'legs',
  'hands',
];

export const BODY_PART_LABELS: Record<BodyPart, string> = {
  head: 'Cabeça',
  shoulder: 'Ombros',
  arm: 'Braços',
  cheast: 'Tórax',
  stomach: 'Tronco',
  legs: 'Pernas',
  hands: 'Mãos',
};

/**
 * Slots de chrome que cabem em cada região do corpo (mapa ripperdoc).
 * Uma peça aparece se o type dela estiver nesta lista.
 */
export const BODY_PART_SLOTS: Record<BodyPart, CyberWareSlot[]> = {
  head: [
    CyberWareSlot.frontalCortex,
    CyberWareSlot.face,
    CyberWareSlot.operatingSystem,
  ],
  shoulder: [CyberWareSlot.skeleton, CyberWareSlot.arms],
  arm: [CyberWareSlot.arms],
  cheast: [
    CyberWareSlot.circulatorySystem,
    CyberWareSlot.integumentarySystem,
    CyberWareSlot.nervousSystem,
  ],
  stomach: [
    CyberWareSlot.skeleton,
    CyberWareSlot.circulatorySystem,
    CyberWareSlot.nervousSystem,
  ],
  legs: [CyberWareSlot.legs],
  hands: [CyberWareSlot.hands],
};

export const isBodyPart = (value: string): value is BodyPart =>
  (BODY_PARTS as string[]).includes(value);
