import { BASE_IMPLANT_CAPACITY } from './cyberwareSlots';

export const CYBERWARE_RULES = {
  title: 'Cyberware — Storyteller (WoD)',
  intro:
    'Estas regras adaptam o chrome de Cyberpunk 2077 / Edgerunners ao sistema Storyteller (World of Darkness). Atributos, Habilidades e Virtudes continuam iguais; o chrome altera paradas de dados, Vitalidade e Humanidade.',
  capacity: {
    title: 'Capacidade de implantação',
    base: BASE_IMPLANT_CAPACITY,
    bullets: [
      `Todo personagem começa com ${BASE_IMPLANT_CAPACITY} pontos livres de cyberware.`,
      'Cada peça tem um Custo de Implantação. Ao equipar, subtraia esse valor da capacidade livre.',
      'Ex.: capacidade 10 + peça custo 2 → 8 livres restantes.',
      'Capacidade 0: você está no limite seguro (sem chrome adicional) ou no limiar da cyberpsicose.',
      'Capacidade negativa: cyberpsicose ativa. A severidade é o valor absoluto do saldo.',
    ],
  },
  edges: {
    title: 'Edges (E)',
    bullets: [
      'E é a moeda narrativa de chrome e favores de ripperdoc.',
      'Na criação, o Narrador concede Edges iniciais (sugerido: 3).',
      'Comprar/implantar uma peça custa o edgeCost listado no catálogo (além do implantCost).',
      'Edges também podem ser gastos para estabilizar um ataque de cyberpsicose (1 E = −1 severidade por cena).',
    ],
  },
  hacking: {
    title: 'Hackear cyberware',
    bullets: [
      'Teste: Inteligência/Wits + Computer ou Technology.',
      'Dificuldade = hackDifficulty da peça-alvo.',
      'Sucesso: desligar, overload ou forçar falha do implante por 1 cena.',
      'Falhas críticas podem alertar o alvo ou fritar o deck do netrunner.',
    ],
  },
  cyberpsychosis: {
    title: 'Cyberpsicose',
    stages: [
      {
        severity: '1',
        effect: '−1 dado em Empathy e Self-Control; flashbacks e ruído chrome.',
      },
      {
        severity: '2',
        effect:
          'Sob estresse: teste Courage dif. 7 ou entre em frenesi tático (Narrador sugere ações).',
      },
      {
        severity: '3+',
        effect:
          'O Narrador pode assumir ações violentas. Sem terapia/rippperdoc, Humanidade pode cair 1 por sessão.',
      },
    ],
  },
  slots: {
    title: 'Slots (layout CP2077)',
    bullets: [
      'Cabeça / Córtex Frontal, Chip / Sistema Operacional, Rosto, Esqueleto, Sistema Nervoso, Circulatório, Pele, Mãos, Braços, Pernas.',
      'Cada slot tem limite de peças (igual à UI de Cyberpunk 2077).',
      'Só um Sistema Operacional (Sandevistan, Kerenzikov, Cyberdeck, etc.) por personagem.',
    ],
  },
  sessionTips: {
    title: 'Sessão de regras (para a mesa)',
    bullets: [
      'Declare Edges e capacidade livre no início da sessão.',
      'Ripperdoc: cena de implantação = teste Medicine dif. 6 + tempo narrativo; falha = +1 implantCost temporário.',
      'EMP / blackwall: teste Stamina ou Technology dif. 7 ou perca bônus de chrome por 1 cena.',
      'Terapia anti-psico: gaste Edges + cena de roleplay para recuperar 1–2 de capacidade efetiva.',
    ],
  },
} as const;
