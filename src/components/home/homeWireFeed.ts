export type WireRegion =
  | 'night-city'
  | 'sao-paulo'
  | 'tokyo'
  | 'london'
  | 'berlin'
  | 'moscow'
  | 'beijing'
  | 'new-york'
  | 'mexico-city'
  | 'lagos'
  | 'dubai'
  | 'seoul'
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
    id: 'tokyo-shinjuku',
    region: 'tokyo',
    regionLabel: 'TÓQUIO · SHINJUKU STACK',
    kicker: 'N54 ÁSIA',
    headline:
      'Corredor de neon colapsa após briga Arasaka-local: fixers vendem “rotas fantasma” para turistas de chrome antes da NCPD japonesa reagir.',
  },
  {
    id: 'ldn-square-mile',
    region: 'london',
    regionLabel: 'LONDRES · CITY NET',
    kicker: 'EUR$ WIRE',
    headline:
      'Eurodólar oscila na City: bancos corpo britânicos congelam saques AR após rumor de ICE Militech vazada do canal do Tamisa.',
  },
  {
    id: 'ldn-fog',
    region: 'london',
    regionLabel: 'LONDRES · THAMES GRID',
    headline:
      'Névoa ácida + jammer de drones: Trauma Team UK cobra “taxa de visibilidade” — ambulances AV voam no escuro com mapas piratas.',
  },
  {
    id: 'ber-kreuzberg',
    region: 'berlin',
    regionLabel: 'BERLIN · MESH ANARQUISTA',
    kicker: 'SUB-REDE EU',
    headline:
      'Coletivos hacker vendem slots no mesh sem megacorp — Petrochem acusa sabotagem; polícia corporativa diz que “não existe servidor”.',
  },
  {
    id: 'ber-wall',
    region: 'berlin',
    regionLabel: 'BERLIN · SPREE CORRIDOR',
    headline:
      'Grafite AR relíquia ressurge em muro fantasma: turistas pagam em Eurodólar para ver “muro que nunca caiu” — NetWatch investiga spoof histórico.',
  },
  {
    id: 'msk-red-square',
    region: 'moscow',
    regionLabel: 'MOSCOU · SOVIÉTICONET',
    kicker: 'TAPE VERMELHO',
    headline:
      'MLTCH ▲ em Moscou: contratos de armamento fantasma movem ações Militech enquanto oligarcas trocam ICE militar por slots no cluster NCX.',
  },
  {
    id: 'msk-siberia-feed',
    region: 'moscow',
    regionLabel: 'MOSCOU · GATE SIBÉRIA',
    headline:
      'Bot-farm espelha manchetes N54 em cirílico — leitores juram que Night City “já foi evacuada”; SoviéticoNet nega apagão.',
  },
  {
    id: 'bj-firewall',
    region: 'beijing',
    regionLabel: 'PEQUIM · GREAT FIREWALL 3.0',
    kicker: 'MERCADOS-NC',
    headline:
      'Kang Tao futures caem na bolsa local: exportação de smartguns trava após auditoria de daemon — corretoras exigem assinatura biométrica dupla.',
  },
  {
    id: 'bj-stack',
    region: 'beijing',
    regionLabel: 'PEQUIM · MEGACIDADE STACK',
    headline:
      'Arranha-céus compartilham uplink único: moradores hackeiam elevador para priorizar tráfego de net — três quedas de lift em 24h.',
  },
  {
    id: 'ny-wall-nc',
    region: 'new-york',
    regionLabel: 'NOVA YORK · PARALELO NC',
    kicker: 'NCX SYNC',
    headline:
      'Night City Index espelha Wall Street-NC: traders juram que Watson “negocia antes de abrir” — SEC fantasma abre inquérito contra fixers.',
  },
  {
    id: 'ny-hudson',
    region: 'new-york',
    regionLabel: 'NOVA YORK · HUDSON GRID',
    headline:
      'Militech lobby na costa leste: AVs corporativos cruzam corredor aéreo com Trauma Team — NCPD-NY diz que “não é jurisdição deles”.',
  },
  {
    id: 'cdmx-smog',
    region: 'mexico-city',
    regionLabel: 'CIDADE DO MÉXICO · SMOG STACK',
    kicker: 'PTCM ▼',
    headline:
      'Petrochem desaba no mercado local: refinarias stack em alerta amarelo — gangues vendem máscaras “com ads desligados” na Zócalo AR.',
  },
  {
    id: 'cdmx-cartel-chrome',
    region: 'mexico-city',
    regionLabel: 'CDMX · CORRIDOR CHROME',
    headline:
      'Cartéis de ripperdoc disputam container portuário: chips Kang Tao aparecem sem serial — Trauma Team recusa atender “sem plano corp”.',
  },
  {
    id: 'lagos-lagos-net',
    region: 'lagos',
    regionLabel: 'LAGOS · AFRO-CYBER HUB',
    kicker: 'N54 ÁFRICA',
    headline:
      'Startups de mesh vendem energia solar + uplink: Eurodólar pago em stablecoin de rua — bancos corpo chamam de “lavagem de photons”.',
  },
  {
    id: 'lagos-port',
    region: 'lagos',
    regionLabel: 'LAGOS · PORTO FANTASMA',
    headline:
      'Containers “sem manifesto” chegam com medtech surplus — órgãos impressos viram moeda de fixer antes da aduana acordar.',
  },
  {
    id: 'dxb-arcology',
    region: 'dubai',
    regionLabel: 'DUBAI · ARCOLOGY RISE',
    kicker: 'EUR$ / PTCM',
    headline:
      'Petrochem e fundos árabes corpo lançam índice deserto-net: turistas compram minutos de sombra real — mercado chama de “luxo térmico”.',
  },
  {
    id: 'dxb-drone-lane',
    region: 'dubai',
    regionLabel: 'DUBAI · SKY LANE',
    headline:
      'Faixa exclusiva de drones Militech para VIPs: colisão com AV médico gera briga de seguros — Trauma Team exige pagamento antes do pouso.',
  },
  {
    id: 'sel-gangnam',
    region: 'seoul',
    regionLabel: 'SEOUL · GANGNAM CHROME',
    kicker: 'TTMD ▲',
    headline:
      'Trauma Team Asia estreia plano “idol-safe”: ressuscitação em 60s com câmera embutida — fãs pagam live fee enquanto sangram no palco AR.',
  },
  {
    id: 'sel-han',
    region: 'seoul',
    regionLabel: 'SEOUL · HAN RIVER MESH',
    headline:
      'Megacorp local bloqueia jogos braindance piratas — adolescentes vendem “lag artificial” para streamers corpo antes da polícia net reagir.',
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
    id: 'mk-militech',
    region: 'markets',
    regionLabel: 'MILITECH · MLTCH',
    kicker: 'TAPE VERDE',
    headline:
      'MLTCH ▲ +2,3%: pedidos de proxy-war no Levante entram no book — analistas temem “temporada de dividendos de sangue”.',
  },
  {
    id: 'mk-kangtao',
    region: 'markets',
    regionLabel: 'KANG TAO · KT-FUT',
    kicker: 'TAPE VERMELHO',
    headline:
      'KT-FUT ▼ −1,9%: recall fantasma de smartgun afeta futures; fixers de Night City ainda vendem “lote pré-recall”.',
  },
  {
    id: 'mk-petrochem',
    region: 'markets',
    regionLabel: 'PETROCHEM · PTCM',
    kicker: 'TAPE VERMELHO',
    headline:
      'PTCM ▼ −3,6%: refinarias stack em modo economia — Eurodólar sobe enquanto smog credits despencam na bolsa do Golfo.',
  },
  {
    id: 'mk-ncx',
    region: 'markets',
    regionLabel: 'NIGHT CITY INDEX · NCX',
    kicker: 'MERCADOS-NC',
    headline:
      'NCX ▲ +0,9%: Watson e City Center puxam índice; Pacifica pesa negativo mas “não entra no cálculo oficial”.',
  },
  {
    id: 'mk-eurodollar',
    region: 'markets',
    regionLabel: 'EURODÓLAR · EUR$',
    kicker: 'FX WIRE',
    headline:
      'EUR$ ▼ −0,7%: saques corpo congelados em três megacidades — cambistas de rua vendem “Eurodólar com cheiro de ozônio”.',
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
  'N54 · LONDRES: jammer Thames · EUR$ volátil · corretoras em modo jack-only',
  'N54 · PEQUIM: KT-FUT halt · firewall 3.0 · ordens fila 6h',
  'N54 · LAGOS: porto fantasma · manifesto zerado · Medtech nega origem',
  'N54 · NCX: Watson +0,9% · Pacifica excluída do índice “oficial”',
] as const;
