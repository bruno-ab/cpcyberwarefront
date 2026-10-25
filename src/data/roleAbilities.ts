export type RoleAbility = {
  id: string;
  name: string;
  ranks: string;
  summary: string;
  mechanical: string;
};

export type RoleKit = {
  id: string;
  name: string;
  blurb: string;
  /** Lugar da Role no mundo Cyberpunk / Night City. */
  world: string;
  /** Foco de atributos/habilidades na mesa. */
  focus: string;
  abilities: RoleAbility[];
};

/** Kits de Role (RED / 2077 flavor) para ficha e book. */
export const ROLE_KITS: RoleKit[] = [
  {
    id: 'solo',
    name: 'Solo',
    blurb: 'Combatente de aluguel. Tiro, lâmina e sangue frio.',
    world:
      'Produto mais antigo de Night City: violência profissional. Gangues, corpos e Traumas compram o mesmo serviço — alguém que entra primeiro.',
    focus: 'Dex/Str/Sta · Firearms, Melee, Brawl, Athletics · chrome de combate',
    abilities: [
      {
        id: 'combat-awareness',
        name: 'Combat Awareness',
        ranks: '1 / 3 / 5',
        summary: 'Lê o campo de batalha antes do primeiro tiro.',
        mechanical:
          'Rank 1: +1 em iniciativa ou defesa 1×/cena. Rank 3: redistribui até 2 sucessos entre ataque/defesa na rodada. Rank 5: uma vez por sessão, age fora da ordem como se tivesse vencido iniciativa.',
      },
    ],
  },
  {
    id: 'netrunner',
    name: 'Netrunner',
    blurb: 'Jacka na rede, quebra ICE e some com os dados.',
    world:
      'Sistema nervoso paralelo da cidade. NetWatch caça; corpos contratam. Em 2077 a rede é hostil — quickhacks curtos, não maratonas no cyberspace.',
    focus: 'Int/Wits · Computer, Technology · deck e quickhacks',
    abilities: [
      {
        id: 'interface',
        name: 'Interface',
        ranks: '1 / 3 / 5',
        summary: 'Sua mente é o deck.',
        mechanical:
          'Rank 1: +1d em Computer/Technology vs ICE. Rank 3: 1 quickhack/cena sem custo extra de RAM narrativo. Rank 5: pode “segurar” um daemon de Breach como se fosse equipamento até o fim da sessão.',
      },
    ],
  },
  {
    id: 'tech',
    name: 'Tech',
    blurb: 'Ripper de oficina. Conserta chrome, drones e portas.',
    world:
      'Mantém Night City funcionando quando a garantia corp acaba. Oficinas ilegais, drones e gambiarras — orgulho de maker, ódio a DRM.',
    focus: 'Int/Dex · Crafts, Technology, Security · ferramentas e drones',
    abilities: [
      {
        id: 'maker',
        name: 'Maker / Jury Rig',
        ranks: '1 / 3 / 5',
        summary: 'Improviso que não deveria funcionar — e funciona.',
        mechanical:
          'Rank 1: conserta item quebrado 1×/sessão (dif. 6). Rank 3: cria gambiarra com bônus +2 por uma cena. Rank 5: improvisa chrome temporário (implantCost 1, some no fim da sessão).',
      },
    ],
  },
  {
    id: 'fixer',
    name: 'Fixer',
    blurb: 'Conecta jobs, gente e eddies. Sempre tem um favor.',
    world:
      'Mercado negro com sotaque educado. Favores são a moeda real; eddies só lubrificam. Sem Fixer, a crew fica refém do primeiro shard.',
    focus: 'Cha/Man/Wits · Streetwise, Persuasion · agenda de contatos',
    abilities: [
      {
        id: 'operator',
        name: 'Operator',
        ranks: '1 / 3 / 5',
        summary: 'A cidade atende quando você liga.',
        mechanical:
          'Rank 1: encontra contato útil 1×/sessão. Rank 3: reduz preço de um bem/serviço em 20% ou libera gig. Rank 5: chama backup/NPC aliado por uma cena (Narrador define custo).',
      },
    ],
  },
  {
    id: 'nomad',
    name: 'Nomad',
    blurb: 'Família, estrada e metal. A cidade é só mais um posto.',
    world:
      'Antídoto à cidade: clã, estrada e dívida coletiva. Nos Badlands, Night City é um tumor brilhante no horizonte. Veículo = parentesco.',
    focus: 'Dex/Sta/Wits · Drive, Survival, Athletics · veículo de família',
    abilities: [
      {
        id: 'moto',
        name: 'Moto / Family',
        ranks: '1 / 3 / 5',
        summary: 'Veículo e clã como extensão do corpo.',
        mechanical:
          'Rank 1: +1d Drive em perseguição. Rank 3: veículo clã chega em 1 cena (se plausível). Rank 5: convoys/backup familiar por uma sequência de perseguição.',
      },
    ],
  },
  {
    id: 'media',
    name: 'Media',
    blurb: 'Verdade, spin ou chantagem — a câmera é a arma.',
    world:
      'Fabrica a realidade que a cidade consome. N54 mente; undergrounds gritam. Street Cred sobe com escândalo — heat sobe junto.',
    focus: 'Cha/Per/Int · Expression, Investigation, Streetwise · câmeras',
    abilities: [
      {
        id: 'credibility',
        name: 'Credibility',
        ranks: '1 / 3 / 5',
        summary: 'Sua reputação abre portas e fecha gargantas.',
        mechanical:
          'Rank 1: +1d social ao invocar audiência/público. Rank 3: força um NPC a conceder entrevista/acesso. Rank 5: uma revelação pública muda Street Cred da crew (±) na sessão.',
      },
    ],
  },
  {
    id: 'exec',
    name: 'Exec',
    blurb: 'Corpo corporativo. Agenda cheia e faca no bolso.',
    world:
      'Soft power com cartão de acesso. Recursos da firma vêm com asterisco e rastreamento. Mesmo “livre”, ainda cheira a crachá.',
    focus: 'Man/Int/Cha · Bureaucracy, Persuasion, Finance · recursos corp',
    abilities: [
      {
        id: 'teamwork',
        name: 'Teamwork / Backup',
        ranks: '1 / 3 / 5',
        summary: 'Recursos da firma — com asterisco.',
        mechanical:
          'Rank 1: +1d quando lidera a crew em plano. Rank 3: requisita recurso corp (arma, carro, info) 1×/arco. Rank 5: equipe de apoio por uma cena (custa favor/dívida corp).',
      },
    ],
  },
  {
    id: 'lawman',
    name: 'Lawman',
    blurb: 'Distintivo ou milícia. Ordem à moda Night City.',
    world:
      'Face da ordem numa cidade que vendeu a ordem ao maior lance. Backup policial é poderoso e político — pode salvar a crew e destruir o gig.',
    focus: 'Wits/Sta/Cha · Intimidation, Investigation, Firearms · distintivo',
    abilities: [
      {
        id: 'backup',
        name: 'Backup',
        ranks: '1 / 3 / 5',
        summary: 'Quando a lei ainda atende o rádio.',
        mechanical:
          'Rank 1: intimida com autoridade (+1d). Rank 3: chama reforço local (atraso 1–2 rounds). Rank 5: lockdown de quarteirão por uma cena (consequências políticas).',
      },
    ],
  },
  {
    id: 'medtech',
    name: 'Medtech',
    blurb: 'Sangue, trauma e biomonitor. Mantém o crew vivo.',
    world:
      'Linha entre ferimento narrativo e novo personagem. Trauma Team cobra; clínicas de rua improvisam. Seu outro paciente é o chrome.',
    focus: 'Int/Dex/Wits · Medicine, Empathy, Technology · kits de trauma',
    abilities: [
      {
        id: 'medical-tech',
        name: 'Medical Tech',
        ranks: '1 / 3 / 5',
        summary: 'Estabiliza o impossível no chão da Combat Zone.',
        mechanical:
          'Rank 1: remove 1 nível de Vitalidade marcada em aliado (1×/cena, dif. 6). Rank 3: estabiliza personagem a 0 Vitalidade. Rank 5: cirurgia de campo que reduz severidade de psicose em 1 (1×/arco).',
      },
    ],
  },
  {
    id: 'rockerboy',
    name: 'Rockerboy',
    blurb: 'Palco, protesto e charisma. A multidão é o buffer.',
    world:
      'Transforma atenção em poder. Corporações compram artistas; quem não se vende vira problema de segurança. Fama = Street Cred com alvo na nuca.',
    focus: 'Cha/App/Man · Expression, Performance, Streetwise · público',
    abilities: [
      {
        id: 'charismatic-impact',
        name: 'Charismatic Impact',
        ranks: '1 / 3 / 5',
        summary: 'A voz vira arma de massa.',
        mechanical:
          'Rank 1: +1d Expression/Performance em multidão. Rank 3: inspira a crew (+1d em um teste coletivo). Rank 5: provoca tumulto ou calmaria em escala de praça (1×/sessão).',
      },
    ],
  },
];

export const findRoleKit = (roleName?: string | null): RoleKit | null => {
  if (!roleName) return null;
  const key = roleName.trim().toLowerCase();
  return (
    ROLE_KITS.find(
      (r) =>
        r.name.toLowerCase() === key ||
        r.id === key ||
        r.name.toLowerCase().startsWith(key),
    ) || null
  );
};
