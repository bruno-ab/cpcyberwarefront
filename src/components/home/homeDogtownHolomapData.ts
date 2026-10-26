export type DogtownNewsItem = {
  id: string;
  kicker: string;
  headline: string;
  body: string;
  dateline: string;
};

export type DogtownAdItem = {
  id: string;
  sponsor: string;
  title: string;
  copy: string;
  cta: string;
  href: string;
  ariaLabel: string;
};

/** Manchetes pulp N54 / feed pirata de Dogtown — PT cyberpunk. */
export const HOME_DOGTOWN_NEWS: DogtownNewsItem[] = [
  {
    id: 'dt-curfew',
    kicker: 'BARGHEST WIRE · INTERCEPTADO',
    headline: 'Toque de recolher estendido até o amanhecer químico',
    body:
      'Patrulhas Barghest fecharam o corredor da Black Sapphire. Quem não tiver pulseira FIA ou credencial Hansen paga pedágio em eurodólares — ou sangue.',
    dateline: 'DOGTOWN · 03:14 NCST',
  },
  {
    id: 'dt-hansen',
    kicker: 'N54 DO ALTO · SEM AUTORIZAÇÃO',
    headline: 'Kurt Hansen nega negociação com NUSA: «Dogtown não é vitrine»',
    body:
      'O ex-coronel manda recado pela rede local: nenhum consultor Militech entra sem escolta. Fixers de Watson reportam fila de contratos abortados na zona cinza.',
    dateline: 'LANGLEY · FEED ESPELHADO',
  },
  {
    id: 'dt-sapphire',
    kicker: 'RUMOR · CASINO',
    headline: 'Black Sapphire reabre piso VIP após «incidente de netrun»',
    body:
      'Três dealers flatline, um ICE desconhecido e zero corpos na morgue oficial. Hansen promete «justiça rápida» — leia-se: mais câmeras Barghest no corredor de saída.',
    dateline: 'PACIFICA BORDER · ANÔNIMO',
  },
  {
    id: 'dt-smugglers',
    kicker: 'ECONOMIA PARALELA',
    headline: 'Contrabando de chrome militar dispara com embargo NUSA',
    body:
      'Peças Trauma Team desviadas e Sandevistans sem serial aparecem no mercado de Dogtown. NetWatch alerta: metade é bait com malware de rastreio.',
    dateline: 'DOGTOWN · MERCADO NEGRO',
  },
];

export const HOME_DOGTOWN_ADS: DogtownAdItem[] = [
  {
    id: 'barghest-insurance',
    sponsor: 'BARGHEST SECURE',
    title: 'SEGURO DE TRÂNSITO DOGTOWN™',
    copy:
      'Cobertura contra tiroteio, sequestro e «desaparecimento administrativo». Válido só com pulseira Hansen ativa. Multa automática na fronteira.',
    cta: 'COMPRAR PULSEIRA »',
    href: '/lore',
    ariaLabel: 'Propaganda Barghest Secure',
  },
  {
    id: 'black-sapphire',
    sponsor: 'BLACK SAPPHIRE · PATROCINADO',
    title: 'JACKPOT DE CHROME — ESTA NOITE',
    copy:
      'Aposte eurodólares limpos. Ganhe implantes sem rastreio NUSA. Bar open 24h — Barghest no portão, Hansen no cofre.',
    cta: 'VER REGRAS DA CASA »',
    href: '/lore',
    ariaLabel: 'Propaganda Black Sapphire',
  },
  {
    id: 'hansen-broadcast',
    sponsor: 'CANAL OFICIAL HANSEN',
    title: 'ORDEM É PROSPERIDADE',
    copy:
      'Dogtown não pede permissão — cobra respeito. Denuncie fixers suspeitos. Recompensa em munição ou crédito na doca.',
    cta: 'ARQUIVO DO CORONEL »',
    href: '/wiki',
    ariaLabel: 'Propaganda canal Kurt Hansen',
  },
];

export const HOLO_PANEL_ROTATE_MS = 30_000;
export const HOLO_PANEL_ROTATE_MS_MOTION_OFF = 60_000;

export type HoloPanelView = 'map' | 'dogtown-news' | 'dogtown-ad';

export const HOLO_PANEL_SEQUENCE: HoloPanelView[] = [
  'map',
  'dogtown-news',
  'dogtown-ad',
];

export const nextHoloPanelView = (current: HoloPanelView): HoloPanelView => {
  const i = HOLO_PANEL_SEQUENCE.indexOf(current);
  return HOLO_PANEL_SEQUENCE[(i + 1) % HOLO_PANEL_SEQUENCE.length];
};
