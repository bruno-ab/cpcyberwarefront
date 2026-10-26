export type WireRegion =
  | 'night-city'
  | 'sao-paulo'
  | 'eurasia'
  | 'israel'
  | 'japan'
  | 'markets'
  | 'medtech'
  | 'trauma';

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
    region: 'trauma',
    regionLabel: 'TRAUMA TEAM · NIGHT CITY',
    headline:
      '[TRAUMA TEAM]: Assinaturas Platina +15% — “mortes evitáveis” viram métrica de luxo em Watson.',
  },
  {
    id: 'mt-heal-chrome',
    region: 'medtech',
    regionLabel: 'MEDTECH · PACIFICA R&D',
    kicker: 'EVOLUÇÃO CLÍNICA',
    headline:
      'Implantes de segunda geração “autocicatrizam” microfissuras — fixers já cobram upgrade antes da bula sair do lab.',
  },
  {
    id: 'mt-nanite-saline',
    region: 'medtech',
    regionLabel: 'MEDTECH · BIOTECH WIRE',
    headline:
      'Nanites de reparo entram em soro salino de rua: Trauma Team nega patente; ripperdocs vendem “versão beta” em containers.',
  },
  {
    id: 'mt-clone-farm',
    region: 'medtech',
    regionLabel: 'MEDTECH · BADLANDS',
    kicker: 'N54 INVESTIGA',
    headline:
      'Fazendas de clone ilegais exportam órgãos “sem histórico” — corpos descartados aparecem com tags de pesquisa Arasaka-Militech.',
  },
  {
    id: 'tr-blood-pump',
    region: 'trauma',
    regionLabel: 'TRAUMA TEAM · TRIAL WIRE',
    headline:
      'Fase III do blood-pump sintético: sobreviventes relatam batida “fora de sync” — Medtech promete patch neural em 72h.',
  },
  {
    id: 'mt-synthskin',
    region: 'medtech',
    regionLabel: 'MEDTECH · NIGHT CITY',
    headline:
      'Pele sintética com nervos embutidos passa teste de choque térmico; gangues de chrome disputam fila na clínica de Japantown.',
  },
  {
    id: 'tr-av-response',
    region: 'trauma',
    regionLabel: 'TRAUMA TEAM · WATSON',
    kicker: 'RESPOSTA RÁPIDA',
    headline:
      'Novos AVs médicos decolam em 90s com IA triagem — NCPD acusa “priorizar assinantes” em tiroteios do Combat Zone.',
  },
  {
    id: 'mt-neurograft',
    region: 'medtech',
    regionLabel: 'MEDTECH · CHOLOMBIA',
    headline:
      'Neuroenxertos de memória curta reduzem trauma de combate — NetWatch vê spike de “soldados que esquecem a missão”.',
  },
  {
    id: 'tr-platinum-black',
    region: 'trauma',
    regionLabel: 'TRAUMA TEAM · CORP WIRE',
    headline:
      'Plano Platina Black inclui ressuscitação on-site e nanite de coagulação — fila de espera vira mercado negro de slots.',
  },
  {
    id: 'mt-organ-printer',
    region: 'medtech',
    regionLabel: 'MEDTECH · SÃO PAULO STACK',
    headline:
      'Bioimpressora de córnea comercial falha lote: pacientes enxergam anúncios AR fantasma — megacorp culpa “driver pirata”.',
  },
];

/** Alertas compactos no módulo NCPD / NetWatch (ficção, ticker). */
export const HOME_NETWATCH_ALERTS: readonly string[] = [
  'ALERTA · TEL AVIV NETNODE — ICE LV.7 · TRÁFEGO ANÔMALO',
  'NETWATCH: spike daemon · corredor Levante · spoof N54 detectado',
  'NCPD WIRE: proxy-war corp · sem identificação de alvos civis no feed',
  'MEDTECH WIRE: lote nanite salino · recall não confirmado · Trauma Team em silêncio',
  'TRAUMA TEAM: blood-pump trial · sync cardíaco anômalo · 12 AVs redirecionados',
] as const;
