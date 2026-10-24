export type CyberpunkRoleId =
  | 'solo'
  | 'netrunner'
  | 'nomad'
  | 'fixer'
  | 'tech'
  | 'medtech'
  | 'media'
  | 'exec'
  | 'lawman'
  | 'rockerboy';

export type LifepathId = 'streetkid' | 'nomad' | 'corpo';

export type RoleRule = {
  id: CyberpunkRoleId;
  name: string;
  aka: string;
  summary: string;
  primaryAttributes: string[];
  keyAbilities: string[];
  roleAbility: {
    name: string;
    effect: string;
  };
  edgesOnCreate: number;
  suggestedChrome: string[];
  sessionHooks: string[];
};

export type LifepathRule = {
  id: LifepathId;
  name: string;
  summary: string;
  bonus: string;
  contacts: string;
  complication: string;
};

/** Roles clássicas do universo Cyberpunk (RED/2077) adaptadas ao Storyteller */
export const ROLE_RULES: RoleRule[] = [
  {
    id: 'solo',
    name: 'Solo',
    aka: 'Mercenário / Combatente',
    summary:
      'Especialista em violência profissional. Resolve problemas com balas, lâminas e timing.',
    primaryAttributes: ['Dexterity', 'Stamina', 'Wits'],
    keyAbilities: ['Firearms', 'Brawl', 'Melee', 'Athletics', 'Alertness'],
    roleAbility: {
      name: 'Combat Awareness',
      effect:
        '1× por cena, gaste 1 Willpower para ganhar +2 dados em Iniciativa ou em um ataque. Em emboscada, esse bônus não gasta Willpower na 1ª rodada.',
    },
    edgesOnCreate: 3,
    suggestedChrome: ['Smart Link', 'Kiroshi Optics', 'Subdermal Armor', 'Sandevistan/Kerenzikov'],
    sessionHooks: [
      'Jobs de proteção, assassinato e extração.',
      'Risco alto de chrome e cyberpsicose se “otimizar” demais.',
    ],
  },
  {
    id: 'netrunner',
    name: 'Netrunner',
    aka: 'Runner / Deckhead',
    summary:
      'Invade redes, câmeras e chrome alheio. Frágil no físico, dominante no digital.',
    primaryAttributes: ['Intelligence', 'Wits', 'Perception'],
    keyAbilities: ['Computer', 'Technology', 'Investigation', 'Security', 'Subterfuge'],
    roleAbility: {
      name: 'Interface',
      effect:
        'Enquanto conectado a um acesso válido, ignore 1 nível de dificuldade em quickhacks (mín. dif. 4). Falha crítica: stun mental (1 Vitalidade) ou alerta no sistema.',
    },
    edgesOnCreate: 3,
    suggestedChrome: ['Cyberdeck', 'Neural Link', 'Interface Plugs', 'Neofiber'],
    sessionHooks: [
      'Prep define o combate: câmeras, portas, torretas.',
      'Blackwall / ICE letal = risco de Humanidade e Vida.',
    ],
  },
  {
    id: 'nomad',
    name: 'Nomad',
    aka: 'Clan / Pack',
    summary:
      'Família, estrada e veículos. Sobrevive fora das megacorps e move a crew pelo mapa.',
    primaryAttributes: ['Stamina', 'Dexterity', 'Charisma'],
    keyAbilities: ['Drive', 'Survival', 'Firearms', 'Crafts', 'Streetwise'],
    roleAbility: {
      name: 'Moto / Pack',
      effect:
        'Em cenas de perseguição ou Badlands, +2 dados em Drive/Survival. 1× por sessão, convoque apoio do clã (1 veículo ou 2 aliados de ameaça média) gastando 1 Edge.',
    },
    edgesOnCreate: 3,
    suggestedChrome: ['Fortified Ankles', 'Kiroshi Optics', 'Biomonitor'],
    sessionHooks: [
      'Política de clã vs. corpo.',
      'Convoy jobs e dívidas de sangue.',
    ],
  },
  {
    id: 'fixer',
    name: 'Fixer',
    aka: 'Corretor / Middleman',
    summary:
      'Conecta jobs, chrome, armas e favores. O poder está na agenda, não no gatilho.',
    primaryAttributes: ['Manipulation', 'Charisma', 'Wits'],
    keyAbilities: ['Streetwise', 'Etiquette', 'Subterfuge', 'Finance', 'Leadership'],
    roleAbility: {
      name: 'Operator',
      effect:
        '1× por sessão, declare um contato útil (mercado, ripper, gangue ou corpo menor). Teste Manipulação + Streetwise dif. 6 para conseguir item/info em 1 cena; custo em Edges ou dívida narrativa.',
    },
    edgesOnCreate: 4,
    suggestedChrome: ['Biomonitor', 'Kiroshi Optics', 'Memory Boost'],
    sessionHooks: [
      'Sempre há uma segunda agenda no contrato.',
      'Reputação Afterlife / Watson / Pacífica como moeda.',
    ],
  },
  {
    id: 'tech',
    name: 'Tech',
    aka: 'Techie / Ripper adjacente',
    summary:
      'Constrói, conserta e gambiarra o futuro. Armas, veículos, drones e implantes.',
    primaryAttributes: ['Intelligence', 'Dexterity', 'Wits'],
    keyAbilities: ['Technology', 'Crafts', 'Science', 'Computer', 'Security'],
    roleAbility: {
      name: 'Maker',
      effect:
        'Com 1 cena e ferramentas, melhore um item: +1 dado por sessão naquele equipamento OU remova 1 falha narrativa (arma emperrada, carro morto). Custo opcional: 1 Edge para upgrade permanente até o fim da crônica.',
    },
    edgesOnCreate: 3,
    suggestedChrome: ['Mechatronic Core', 'Microgenerator', 'Interface Plugs'],
    sessionHooks: [
      'Oficina como QG da mesa.',
      'Sabotagem corporativa e fabrico ilegal.',
    ],
  },
  {
    id: 'medtech',
    name: 'Medtech',
    aka: 'Ripperdoc / Field Medic',
    summary:
      'Mantém a crew viva e o chrome estável. Cirurgia de combate e terapia anti-psico.',
    primaryAttributes: ['Intelligence', 'Dexterity', 'Perception'],
    keyAbilities: ['Medicine', 'Science', 'Empathy', 'Technology', 'Alertness'],
    roleAbility: {
      name: 'Medical Tech',
      effect:
        'Em campo: teste Inteligência + Medicine dif. 6 para estabilizar (para sangramento/morte por 1 cena). Em clínica: gaste 1 Edge para reduzir 1 severidade de cyberpsicose OU restaurar 2 Vitalidade após descanso.',
    },
    edgesOnCreate: 3,
    suggestedChrome: ['Biomonitor', 'Blood Pump', 'Memory Boost'],
    sessionHooks: [
      'Ética: salvar chrome ou salvar pessoa?',
      'Clientes perigosos na cadeira do ripper.',
    ],
  },
  {
    id: 'media',
    name: 'Media',
    aka: 'Jornalista / Influencer da rua',
    summary:
      'Expõe verdades, fabrica narrativas e arma escândalos. A arma é a audiência.',
    primaryAttributes: ['Charisma', 'Perception', 'Manipulation'],
    keyAbilities: ['Expression', 'Investigation', 'Subterfuge', 'Etiquette', 'Streetwise'],
    roleAbility: {
      name: 'Credibility',
      effect:
        '1× por sessão, publique um scoop: teste Carisma/Manipulação + Expression dif. 7. Sucesso = pressão social (−2 dados em Etiquette/Streetwise do alvo por 1 sessão) ou +1 Edge para a crew via patrocínio/medo.',
    },
    edgesOnCreate: 3,
    suggestedChrome: ['Kiroshi Optics', 'Braindance Recorder', 'Shift Tacts'],
    sessionHooks: [
      'Corpos compram ou matam a história.',
      'BD vazada muda alianças da mesa.',
    ],
  },
  {
    id: 'exec',
    name: 'Exec',
    aka: 'Corpo / Suite',
    summary:
      'Poder institucional: orçamento, segurança corporativa e hierarquia. Joga sujo com gravata.',
    primaryAttributes: ['Manipulation', 'Intelligence', 'Appearance'],
    keyAbilities: ['Etiquette', 'Finance', 'Leadership', 'Politics', 'Subterfuge'],
    roleAbility: {
      name: 'Teamwork / Backup',
      effect:
        '1× por sessão, gaste 1 Edge para convocar apoio corporativo (2 agentes de segurança OU acesso a prédio/dados de nível médio). Cada uso adicional na mesma crônica aumenta a dívida com a megacorp.',
    },
    edgesOnCreate: 4,
    suggestedChrome: ['Biomonitor', 'Kiroshi Optics', 'EMP Threading (fashion)'],
    sessionHooks: [
      'Promoções, facadas nas costas e NDAs sangrentos.',
      'Conflito: ordem da corpo vs. lealdade à crew.',
    ],
  },
  {
    id: 'lawman',
    name: 'Lawman',
    aka: 'NCPD / MaxTac adjacente',
    summary:
      'Autoridade armada — oficial ou ex. Caça alvos, faz cerco e impõe “ordem”.',
    primaryAttributes: ['Stamina', 'Wits', 'Strength'],
    keyAbilities: ['Firearms', 'Investigation', 'Intimidation', 'Drive', 'Law'],
    roleAbility: {
      name: 'Backup',
      effect:
        'Em território “oficial”, 1× por sessão chame reforço: +2 NPCs policiais (ameaça média) em 1–2 turnos. Fora da jurisdição ou corrupto: teste Streetwise dif. 7 ou o backup vira problema.',
    },
    edgesOnCreate: 3,
    suggestedChrome: ['Ballistic Coprocessor', 'Subdermal Armor', 'Reflex Tuner'],
    sessionHooks: [
      'Casos frios, MaxTac e chrome ilegal.',
      'Linha entre justiça e execução.',
    ],
  },
  {
    id: 'rockerboy',
    name: 'Rockerboy',
    aka: 'Ícone / Agitador',
    summary:
      'Carisma explosivo. Move massas, provoca corpos e vira mito — vivo ou morto.',
    primaryAttributes: ['Charisma', 'Appearance', 'Manipulation'],
    keyAbilities: ['Expression', 'Performance', 'Leadership', 'Streetwise', 'Subterfuge'],
    roleAbility: {
      name: 'Charismatic Impact',
      effect:
        '1× por cena, teste Carisma + Expression/Performance dif. 6 para conceder +1 dado a todos os aliados em um tipo de ação (social OU combate moral) até o fim da cena. Falha crítica: a plateia/vizinhança vira hostil.',
    },
    edgesOnCreate: 3,
    suggestedChrome: ['Techhair / Light Tattoo', 'Audio implants', 'Interface Plugs'],
    sessionHooks: [
      'Shows como cobertura de ops.',
      'Lendas (Silverhand) vs. sobrevivência.',
    ],
  },
];

/** Lifepaths de CP2077 (origem do V) — bônus de criação Storyteller */
export const LIFEPATH_RULES: LifepathRule[] = [
  {
    id: 'streetkid',
    name: 'Street Kid',
    summary: 'Criado nas ruas de Night City: gangues, fixers e código de sobrevivência.',
    bonus: '+1 Streetwise e +1 contato de gangue/fixer na criação.',
    contacts: 'Watson, Heywood, Pacífica (dependendo do bairro).',
    complication: 'Dívidas antigas e “favor” de gangue podem aparecer 1× por crônica.',
  },
  {
    id: 'nomad',
    name: 'Nomad (origem)',
    summary: 'Veio do clã nos Badlands. Família primeiro; a cidade é território hostil.',
    bonus: '+1 Drive ou Survival e acesso inicial a 1 veículo do clã.',
    contacts: 'Aldecaldos / clãs parceiros.',
    complication: 'Recusar pedido do clã = −1 Edge ou perda temporária do veículo.',
  },
  {
    id: 'corpo',
    name: 'Corpo',
    summary: 'Ex (ou ainda) engrenagem de megacorp. Etiqueta, orçamento e paranoia.',
    bonus: '+1 Etiquette e +1 recurso narrativo corporativo (crachá, cofre ou info).',
    contacts: 'Ex-colegas, RH sombrio, segurança interna.',
    complication: 'A corpo antiga ainda tem um dossiê — e uma faca nas costas agendada.',
  },
];

export const ROLE_CREATION_NOTES = [
  'Escolha 1 Role principal. Opcional: lifepath (Street Kid / Nomad / Corpo) para flavor de Night City.',
  'Atributos: distribua pontos no padrão Storyteller da mesa; priorize os Primary Attributes da Role.',
  'Edges iniciais = valor da Role (geralmente 3–4). Fixer/Exec começam com mais networking.',
  'Role Ability: 1 uso especial por cena/sessão conforme texto — não acumula com cópias de chrome que imitem o mesmo efeito sem custo.',
  'Chrome sugerido é guia, não obrigatório; capacidade de implantação base continua 10.',
];
