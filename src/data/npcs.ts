export type NpcProfile = {
  id: string;
  name: string;
  role: string;
  affiliation: string;
  source: 'cp2077' | 'edgerunners';
  concept: string;
  threat: 'baixa' | 'média' | 'alta' | 'lendária';
  summary: string;
  notableCyberware: string[];
  storytellerHooks: string[];
  suggestedDice: {
    combat: string;
    social: string;
    tech: string;
  };
};

export const NPCS: NpcProfile[] = [
  {
    id: 'david-martinez',
    name: 'David Martinez',
    role: 'Edgerunner / Solo',
    affiliation: 'Independente (ex-crew de Maine)',
    source: 'edgerunners',
    concept: 'Garoto de Santo Domingo que atravessou o limite do chrome.',
    threat: 'lendária',
    summary:
      'Obsessão por poder e proteção. Sandevistan militar + chrome pesado. Excelente pressão física; frágil emocionalmente.',
    notableCyberware: [
      'Sandevistan (Militech Apogee)',
      'Gorilla Arms / reforços ósseos',
      'Subdermal Armor',
    ],
    storytellerHooks: [
      'Oferece proteção em troca de jobs cada vez mais suicidas.',
      'Cyberpsicose latente: sob pressão, dificulte Empathy/Self-Control.',
    ],
    suggestedDice: {
      combat: 'Força/Destreza 4–5 + Brawl/Firearms 4',
      social: 'Carisma 2, Intimidação 4',
      tech: 'Technology 2',
    },
  },
  {
    id: 'lucy',
    name: 'Lucyna Kushinada (Lucy)',
    role: 'Netrunner',
    affiliation: 'Independente',
    source: 'edgerunners',
    concept: 'Netrunner de elite com trauma Arasaka e foco em fuga da Terra.',
    threat: 'alta',
    summary:
      'Controla o campo digital. Fraca em confronto direto, letal em prep e remote.',
    notableCyberware: [
      'Cyberdeck Tetratronic Rippler',
      'Kiroshi Optics',
      'Neural Link / Interface Plugs',
    ],
    storytellerHooks: [
      'Pode abrir portas digitais da trama, mas sempre a um custo pessoal.',
      'Blackwall: falha crítica = dano mental / Humanidade.',
    ],
    suggestedDice: {
      combat: 'Destreza 3 + Firearms 2',
      social: 'Manipulação 4, Subterfúgio 4',
      tech: 'Computer/Technology 5',
    },
  },
  {
    id: 'rebecca',
    name: 'Rebecca',
    role: 'Solo / Gunner',
    affiliation: 'Crew de Maine',
    source: 'edgerunners',
    concept: 'Caos compacto: lealdade feroz e violência teatral.',
    threat: 'alta',
    summary: 'Excelente em emboscadas e pressão moral da party.',
    notableCyberware: ['Gorilla Arms leves', 'Olhos cibernéticos', 'Smart Link'],
    storytellerHooks: [
      'Provoca PCs a aceitar jobs arriscados.',
      'Morre “bem” se a mesa quiser drama — use como catalisador.',
    ],
    suggestedDice: {
      combat: 'Destreza 4 + Firearms 4',
      social: 'Carisma 3, Intimidação 3',
      tech: 'Technology 1',
    },
  },
  {
    id: 'maine',
    name: 'Maine',
    role: 'Solo / Fixer de crew',
    affiliation: 'Crew própria',
    source: 'edgerunners',
    concept: 'Líder chromado no limiar da psicose.',
    threat: 'alta',
    summary: 'Tanque social e físico; espelho do que chrome demais faz.',
    notableCyberware: ['Titanium Bones', 'Gorilla Arms', 'Subdermal Armor'],
    storytellerHooks: [
      'Mentor falho: ensina e depois desmorona.',
      'Severidade de cyberpsicose 2+ em cenas de stress.',
    ],
    suggestedDice: {
      combat: 'Força 5 + Brawl 4',
      social: 'Liderança 3, Intimidação 4',
      tech: 'Technology 2',
    },
  },
  {
    id: 'johnny-silverhand',
    name: 'Johnny Silverhand (engram)',
    role: 'Rockerboy / Relíquia',
    affiliation: 'Ex-Samurai / anti-corpo',
    source: 'cp2077',
    concept: 'Voz na cabeça, ideologia e sabotagem narrativa.',
    threat: 'média',
    summary:
      'Não luta como corpo pleno; manipula escolhas, memórias e conflitos internos.',
    notableCyberware: ['Relic (especial)', 'Interface neural'],
    storytellerHooks: [
      'Gaste Willpower do PC para “resistir” a Johnny.',
      'Oferece Edges narrativos em troca de caos corporativo.',
    ],
    suggestedDice: {
      combat: 'Narrativo / posse parcial',
      social: 'Carisma 5, Expressão 5, Subterfúgio 4',
      tech: 'Computer 3',
    },
  },
  {
    id: 'panam-palmer',
    name: 'Panam Palmer',
    role: 'Nomad',
    affiliation: 'Aldecaldos',
    source: 'cp2077',
    concept: 'Lealdade tribal, veículos e guerra de guerrilha no Badlands.',
    threat: 'média',
    summary: 'Aliada poderosa em chase scenes e política nomad.',
    notableCyberware: ['Kiroshi Optics', 'Fortified Ankles', 'Smart Link'],
    storytellerHooks: [
      'Missões de convoy e traição familiar.',
      'Pode emprestar Edges via favores Aldecaldo.',
    ],
    suggestedDice: {
      combat: 'Destreza 3 + Firearms 3',
      social: 'Carisma 3, Intimidação 3',
      tech: 'Drive/Technology 4',
    },
  },
  {
    id: 'judy-alvarez',
    name: 'Judy Alvarez',
    role: 'Tech / Braindance',
    affiliation: 'Mox (contato)',
    source: 'cp2077',
    concept: 'Editora de BD e especialista em trauma digital.',
    threat: 'baixa',
    summary: 'Suporte de investigação e humanização da mesa.',
    notableCyberware: ['Interface Plugs', 'Memory Boost', 'Kiroshi leves'],
    storytellerHooks: [
      'Pode extrair pistas de braindances.',
      'Conflito Mox vs. Tyger Claws como gancho de sessão.',
    ],
    suggestedDice: {
      combat: 'Destreza 2 + Firearms 1',
      social: 'Empathy 4, Expressão 3',
      tech: 'Computer/Technology 4',
    },
  },
  {
    id: 'takemura',
    name: 'Goro Takemura',
    role: 'Corpo / Bushido corporativo',
    affiliation: 'Arasaka (desonrado)',
    source: 'cp2077',
    concept: 'Honra quebrada, letal em stealth e interrogatório.',
    threat: 'alta',
    summary: 'Aliado inconveniente: poderoso, mas puxa a trama corporativa.',
    notableCyberware: ['Optical Camo', 'Reflex Tuner', 'Subdermal Armor'],
    storytellerHooks: [
      'Missões de infiltração Arasaka.',
      'Conflito de lealdade: Edges vs. Humanidade.',
    ],
    suggestedDice: {
      combat: 'Destreza 4 + Melee/Stealth 4',
      social: 'Etiquette 3, Intimidação 4',
      tech: 'Security 3',
    },
  },
  {
    id: 'rogue',
    name: 'Rogue Amendiares',
    role: 'Fixer',
    affiliation: 'Afterlife',
    source: 'cp2077',
    concept: 'A fixer. Preços altos, informação limpa, zero paciência.',
    threat: 'média',
    summary: 'Hub de missões e mercado de Edges/chrome.',
    notableCyberware: ['Kiroshi Optics', 'Biomonitor', 'Smart Link'],
    storytellerHooks: [
      'Vitrine de jobs: cada contrato = Edges + risco de psicose.',
      'Pode recusar PCs chromados demais (reputação Afterlife).',
    ],
    suggestedDice: {
      combat: 'Destreza 3 + Firearms 3',
      social: 'Manipulação 5, Streetwise 5',
      tech: 'Computer 2',
    },
  },
  {
    id: 'kiwi',
    name: 'Kiwi',
    role: 'Netrunner',
    affiliation: 'Crew de Maine',
    source: 'edgerunners',
    concept: 'Sobrevivencialista digital; lealdade negociável.',
    threat: 'média',
    summary: 'Espelho cínico de Lucy — útil e perigosa.',
    notableCyberware: ['Cyberdeck', 'Interface Plugs', 'Neofiber'],
    storytellerHooks: [
      'Traição possível se o preço subir.',
      'Pode ensinar quickhacks em troca de Edges.',
    ],
    suggestedDice: {
      combat: 'Destreza 2 + Firearms 2',
      social: 'Subterfúgio 4, Manipulação 3',
      tech: 'Computer 4',
    },
  },
];
