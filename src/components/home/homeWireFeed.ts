export type WireRegion =
  | 'night-city'
  | 'sao-paulo'
  | 'eurasia'
  | 'israel'
  | 'japan'
  | 'markets';

export type HomeWireItem = {
  id: string;
  region: WireRegion;
  regionLabel: string;
  headline: string;
  kicker?: string;
};

/** Ficção pulp N54 / NetWatch — manchetes PT para rotação na landing. */
export const HOME_WIRE_FEED: HomeWireItem[] = [
  {
    id: 'nc-arasaka',
    region: 'night-city',
    regionLabel: 'NIGHT CITY',
    kicker: 'N54 EXCLUSIVO',
    headline:
      'Arasaka fecha acordo fantasma com fixers de Watson — chips relíquia vazam na darknet antes do anúncio oficial.',
  },
  {
    id: 'nc-combat',
    region: 'night-city',
    regionLabel: 'NIGHT CITY',
    headline:
      '[COMBAT ZONE]: Maelstrom e Valentinos fecham Heywood; Trauma Team cobra taxa de “zona quente”.',
  },
  {
    id: 'sp-megacorp',
    region: 'sao-paulo',
    regionLabel: 'SÃO PAULO · MEGACIDADE',
    kicker: 'CHROME PAULISTA',
    headline:
      'Consórcio Favela-Stack negocia backbone com megacorp local: gangues de chrome disputam faixa de uplink na Marginal.',
  },
  {
    id: 'sp-gang',
    region: 'sao-paulo',
    regionLabel: 'SÃO PAULO',
    headline:
      'NCPD-SP (filial): drones de patrulha hackeados exibem graffiti AR “SEU EDIE NÃO PAGA ALUGUEL”.',
  },
  {
    id: 'ru-wire',
    region: 'eurasia',
    regionLabel: 'EURÁSIA · NIGHT CITY WIRE',
    headline:
      'SoviéticoNet 2.0: oligarcas corpo-estado vendem ICE militar surplus — compradores anônimos em Pacifica.',
  },
  {
    id: 'ru-siberia',
    region: 'eurasia',
    regionLabel: 'RÚSSIA · SUB-REDE',
    headline:
      'NetWatch alerta para bot-farms siberianas espelhando feeds N54 — “notícias que nunca aconteceram”.',
  },
  {
    id: 'il-alert',
    region: 'israel',
    regionLabel: 'ALERTA · TEL AVIV NETNODE',
    kicker: 'NETWATCH GEO',
    headline:
      'Spike de ICE corporativo no netnode mediterrâneo: três megacorps trocam accuses de sabotagem de daemon — cidade em lockdown de dados.',
  },
  {
    id: 'il-ncpd',
    region: 'israel',
    regionLabel: 'NETWATCH · LEVANTE',
    headline:
      'NCPD-style wire (ficção): contratos Militech-Arasaka colidem em proxy-war de hackers — civis offline “por segurança”.',
  },
  {
    id: 'jp-crisis',
    region: 'japan',
    regionLabel: 'TÓQUIO · BOLA DO JAPÃO',
    kicker: 'MERCADOS-NC',
    headline:
      'Bola do Japão em crise: iene-net desaba após crash do cluster Nikkei-NC; corretoras exigem jack físico para ordens.',
  },
  {
    id: 'mk-arasaka',
    region: 'markets',
    regionLabel: 'ARASAKA CORP · NYSE-NC',
    kicker: 'TAPE VERDE',
    headline:
      'ARSK ▲ +6,8%: rumores de contrato relíquia empurram ação; analistas N54 chamam de “euforia de chrome”.',
  },
  {
    id: 'mk-trauma',
    region: 'night-city',
    regionLabel: 'NIGHT CITY',
    headline:
      '[TRAUMA TEAM]: Assinaturas Platina +15% — “mortes evitáveis” viram métrica de luxo em Watson.',
  },
];

/** Alertas compactos no módulo NCPD / NetWatch (ficção, ticker). */
export const HOME_NETWATCH_ALERTS: readonly string[] = [
  'ALERTA · TEL AVIV NETNODE — ICE LV.7 · TRÁFEGO ANÔMALO',
  'NETWATCH: spike daemon · corredor Levante · spoof N54 detectado',
  'NCPD WIRE: proxy-war corp · sem identificação de alvos civis no feed',
] as const;
