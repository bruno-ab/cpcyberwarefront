import { CyberWareSlot } from './cyberwareSlots';

/** Evita import circular com cyberware-catalog. */
type BoosterEntry = {
  name: string;
  description: string;
  effect: string;
  rarity: string;
  type: CyberWareSlot;
  slots: number;
  edgeCost: number;
  hackDifficulty: number;
  implantCost: number;
  vitality: number;
  humanityCost: number;
  price: number;
  image: string;
  source: 'cp2077' | 'edgerunners' | 'both';
  statBonuses: Record<string, number>;
};

type StatTarget = {
  key: string;
  label: string;
  group: 'physical' | 'social' | 'mental' | 'talents' | 'skills' | 'knowledges';
  type: CyberWareSlot;
  family: string;
};

/** Atributos e habilidades da ficha Storyteller — um booster por chave. */
export const STAT_BOOST_TARGETS: StatTarget[] = [
  // Physical
  { key: 'strength', label: 'Strength', group: 'physical', type: CyberWareSlot.skeleton, family: 'Fibra Muscular' },
  { key: 'dexterity', label: 'Dexterity', group: 'physical', type: CyberWareSlot.nervousSystem, family: 'Servo Articular' },
  { key: 'stamina', label: 'Stamina', group: 'physical', type: CyberWareSlot.circulatorySystem, family: 'Pulmão Sintético' },
  // Social
  { key: 'charisma', label: 'Charisma', group: 'social', type: CyberWareSlot.face, family: 'Implante de Presença' },
  { key: 'manipulation', label: 'Manipulation', group: 'social', type: CyberWareSlot.frontalCortex, family: 'Chip de Persuasão' },
  { key: 'appearance', label: 'Appearance', group: 'social', type: CyberWareSlot.integumentarySystem, family: 'Derme Cosmética' },
  // Mental
  { key: 'perception', label: 'Perception', group: 'mental', type: CyberWareSlot.face, family: 'Sensorial Boost' },
  { key: 'intelligence', label: 'Intelligence', group: 'mental', type: CyberWareSlot.frontalCortex, family: 'Núcleo Cognitivo' },
  { key: 'wits', label: 'Wits', group: 'mental', type: CyberWareSlot.nervousSystem, family: 'Reflexo Neural' },
  // Talents
  { key: 'alertness', label: 'Alertness', group: 'talents', type: CyberWareSlot.face, family: 'Radar Tático' },
  { key: 'athletics', label: 'Athletics', group: 'talents', type: CyberWareSlot.legs, family: 'Atuador Atlético' },
  { key: 'brawl', label: 'Brawl', group: 'talents', type: CyberWareSlot.arms, family: 'Knuckle Weave' },
  { key: 'empathy', label: 'Empathy', group: 'talents', type: CyberWareSlot.frontalCortex, family: 'Empatia Sintética' },
  { key: 'expression', label: 'Expression', group: 'talents', type: CyberWareSlot.face, family: 'Módulo de Expressão' },
  { key: 'intimidation', label: 'Intimidation', group: 'talents', type: CyberWareSlot.face, family: 'Máscara de Ameaça' },
  { key: 'leadership', label: 'Leadership', group: 'talents', type: CyberWareSlot.frontalCortex, family: 'Comando Neural' },
  { key: 'streetwise', label: 'Streetwise', group: 'talents', type: CyberWareSlot.frontalCortex, family: 'Street Chip' },
  { key: 'subterfuge', label: 'Subterfuge', group: 'talents', type: CyberWareSlot.frontalCortex, family: 'Máscara Social' },
  // Skills
  { key: 'animal_ken', label: 'Animal Ken', group: 'skills', type: CyberWareSlot.frontalCortex, family: 'Bio-Vínculo' },
  { key: 'crafts', label: 'Crafts', group: 'skills', type: CyberWareSlot.hands, family: 'Mão de Artífice' },
  { key: 'drive', label: 'Drive', group: 'skills', type: CyberWareSlot.nervousSystem, family: 'Link de Piloto' },
  { key: 'etiquette', label: 'Etiquette', group: 'skills', type: CyberWareSlot.frontalCortex, family: 'Protocolo Social' },
  { key: 'firearms', label: 'Firearms', group: 'skills', type: CyberWareSlot.hands, family: 'Chip de Mira' },
  { key: 'melee', label: 'Melee', group: 'skills', type: CyberWareSlot.arms, family: 'Lâmina Neural' },
  { key: 'performance', label: 'Performance', group: 'skills', type: CyberWareSlot.face, family: 'Palco Implante' },
  { key: 'security', label: 'Security', group: 'skills', type: CyberWareSlot.hands, family: 'Lockpick Wetware' },
  { key: 'stealth', label: 'Stealth', group: 'skills', type: CyberWareSlot.legs, family: 'Atuador Silencioso' },
  { key: 'survival', label: 'Survival', group: 'skills', type: CyberWareSlot.integumentarySystem, family: 'Kit Badlands' },
  // Knowledges
  { key: 'academics', label: 'Academics', group: 'knowledges', type: CyberWareSlot.frontalCortex, family: 'Arquivo Acadêmico' },
  { key: 'computer', label: 'Computer', group: 'knowledges', type: CyberWareSlot.frontalCortex, family: 'Coprocessador' },
  { key: 'finance', label: 'Finance', group: 'knowledges', type: CyberWareSlot.frontalCortex, family: 'Ledger Chip' },
  { key: 'investigation', label: 'Investigation', group: 'knowledges', type: CyberWareSlot.face, family: 'Scanner Dedutivo' },
  { key: 'law', label: 'Law', group: 'knowledges', type: CyberWareSlot.frontalCortex, family: 'Código Legal' },
  { key: 'medicine', label: 'Medicine', group: 'knowledges', type: CyberWareSlot.frontalCortex, family: 'MediChip' },
  { key: 'occult', label: 'Occult', group: 'knowledges', type: CyberWareSlot.frontalCortex, family: 'Shard Oculto' },
  { key: 'politics', label: 'Politics', group: 'knowledges', type: CyberWareSlot.frontalCortex, family: 'Lobby Wetware' },
  { key: 'science', label: 'Science', group: 'knowledges', type: CyberWareSlot.frontalCortex, family: 'Lab Cortex' },
  { key: 'technology', label: 'Technology', group: 'knowledges', type: CyberWareSlot.hands, family: 'Tech Weave' },
];

const TIER_META = [
  { mark: 'Mk.I', bonus: 1, rarity: 'Uncommon', priceMul: 1, edge: 1, implant: 1 },
  { mark: 'Mk.II', bonus: 2, rarity: 'Rare', priceMul: 2.5, edge: 2, implant: 2 },
  { mark: 'Mk.III', bonus: 3, rarity: 'Epic', priceMul: 5, edge: 3, implant: 3 },
] as const;

const BASE_PRICE = 3500;

const slotImage = (type: CyberWareSlot) =>
  `/images/cyberware/${String(type)}.svg`;

/** Gera catálogo de chrome que adiciona bolinhas (dados) em attrs/skills. */
export const buildStatBoosterCatalog = (): BoosterEntry[] => {
  const out: BoosterEntry[] = [];
  for (const target of STAT_BOOST_TARGETS) {
    for (const tier of TIER_META) {
      const price = Math.round(BASE_PRICE * tier.priceMul * (1 + (tier.bonus - 1) * 0.15));
      out.push({
        name: `${target.family} ${tier.mark}`,
        description: `Wetware de reforço para ${target.label}. Versão ${tier.mark} adiciona ${tier.bonus} dado(s) permanentes na ficha.`,
        effect: `+${tier.bonus} dado(s) permanentes em ${target.label} (bolinhas vermelhas na ficha).`,
        rarity: tier.rarity,
        type: target.type,
        slots: 1,
        edgeCost: tier.edge,
        hackDifficulty: 5 + tier.bonus,
        implantCost: tier.implant,
        vitality: 0,
        humanityCost: tier.implant,
        price,
        image: slotImage(target.type),
        source: 'cp2077',
        statBonuses: { [target.key]: tier.bonus },
      });
    }
  }
  return out;
};

export const STAT_BOOSTER_CATALOG = buildStatBoosterCatalog();

/** Limite padrão de peças instaladas (além de capacidade/slots). */
export const DEFAULT_MAX_CYBERWARE_PIECES = 8;
