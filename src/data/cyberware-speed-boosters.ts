import { CyberWareSlot } from './cyberwareSlots';

type SpeedEntry = {
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

const legsImg = '/images/cyberware/legs.svg';
const nervousImg = '/images/cyberware/nervousSystem.svg';

/** Chrome que aumenta Velocidade (quadrados por turno no VTT), não Destreza. */
export const SPEED_BOOSTER_CATALOG: SpeedEntry[] = [
  {
    name: 'Pernas Quik-Step Mk.I',
    description: 'Atuadores de corrida urbanos — passos mais longos no asfalto de Night City.',
    effect: '+1 quadrado de Velocidade por turno no mapa tático.',
    rarity: 'Uncommon',
    type: CyberWareSlot.legs,
    slots: 1,
    edgeCost: 1,
    hackDifficulty: 5,
    implantCost: 1,
    vitality: 0,
    humanityCost: 1,
    price: 8500,
    image: legsImg,
    source: 'cp2077',
    statBonuses: { speed: 1 },
  },
  {
    name: 'Pernas Quik-Step Mk.II',
    description: 'Fibra de músculo sintético nas coxas — sprint de corpo a corpo sem aquecer.',
    effect: '+2 quadrados de Velocidade por turno.',
    rarity: 'Rare',
    type: CyberWareSlot.legs,
    slots: 1,
    edgeCost: 2,
    hackDifficulty: 6,
    implantCost: 2,
    vitality: 0,
    humanityCost: 2,
    price: 18000,
    image: legsImg,
    source: 'cp2077',
    statBonuses: { speed: 2 },
  },
  {
    name: 'Pernas Quik-Step Mk.III',
    description: 'Pernas de edgerunner de elite — linha reta entre cover e cover.',
    effect: '+3 quadrados de Velocidade por turno.',
    rarity: 'Epic',
    type: CyberWareSlot.legs,
    slots: 2,
    edgeCost: 3,
    hackDifficulty: 7,
    implantCost: 3,
    vitality: 0,
    humanityCost: 3,
    price: 32000,
    image: legsImg,
    source: 'edgerunners',
    statBonuses: { speed: 3 },
  },
  {
    name: 'Boostware Flexor',
    description: 'Speedware de reação — burst curto antes do inimigo fechar a distância.',
    effect: '+1 quadrado de Velocidade; não acumula com outro speedware de pernas.',
    rarity: 'Rare',
    type: CyberWareSlot.legs,
    slots: 1,
    edgeCost: 2,
    hackDifficulty: 6,
    implantCost: 2,
    vitality: 0,
    humanityCost: 2,
    price: 22000,
    image: legsImg,
    source: 'cp2077',
    statBonuses: { speed: 1 },
  },
  {
    name: 'Cabos Reflex Synapse',
    description: 'Cabos nervosos da cintura às pernas — passos antecipados pelo reflexo.',
    effect: '+2 quadrados de Velocidade por turno.',
    rarity: 'Rare',
    type: CyberWareSlot.nervousSystem,
    slots: 1,
    edgeCost: 2,
    hackDifficulty: 6,
    implantCost: 2,
    vitality: 0,
    humanityCost: 2,
    price: 19500,
    image: nervousImg,
    source: 'both',
    statBonuses: { speed: 2 },
  },
  {
    name: 'Revestimento Dash-Fiber',
    description: 'Trama de dash em tendões — aceleração lateral em combates de rua.',
    effect: '+1 quadrado de Velocidade por turno.',
    rarity: 'Uncommon',
    type: CyberWareSlot.skeleton,
    slots: 1,
    edgeCost: 1,
    hackDifficulty: 5,
    implantCost: 1,
    vitality: 0,
    humanityCost: 1,
    price: 11000,
    image: '/images/cyberware/skeleton.svg',
    source: 'cp2077',
    statBonuses: { speed: 1 },
  },
];
