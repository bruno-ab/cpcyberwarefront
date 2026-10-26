export type MarketDirection = 'up' | 'down';

export type HomeMarketTicker = {
  id: string;
  symbol: string;
  change: string;
  direction: MarketDirection;
  /** SVG polyline points in viewBox 0 0 100 56 */
  points: string;
};

/** Cotações fictícias — sparklines neon para o módulo N54. */
export const HOME_MARKET_TICKERS: HomeMarketTicker[] = [
  {
    id: 'arasaka',
    symbol: 'ARASAKA · ARSK',
    change: '▲ +6,8%',
    direction: 'up',
    points: '4,52 18,48 32,44 46,38 58,32 72,26 86,18 96,12',
  },
  {
    id: 'nikkei',
    symbol: 'BOLA JAPÃO · NIKKEI-NC',
    change: '▼ −4,1%',
    direction: 'down',
    points: '4,14 20,18 34,22 48,28 62,36 76,44 88,50 96,54',
  },
  {
    id: 'militech',
    symbol: 'MILITECH · MLTCH',
    change: '▲ +2,3%',
    direction: 'up',
    points: '4,48 16,46 28,42 40,38 52,34 68,28 82,22 96,16',
  },
  {
    id: 'trauma',
    symbol: 'TRAUMA TEAM · TTMD',
    change: '▲ +5,1%',
    direction: 'up',
    points: '4,50 14,48 26,44 38,40 50,36 64,30 78,24 96,18',
  },
  {
    id: 'kangtao',
    symbol: 'KANG TAO · KT-FUT',
    change: '▼ −1,9%',
    direction: 'down',
    points: '4,20 18,22 32,26 44,30 58,34 72,40 86,46 96,50',
  },
  {
    id: 'petrochem',
    symbol: 'PETROCHEM · PTCM',
    change: '▼ −3,6%',
    direction: 'down',
    points: '4,16 22,20 36,24 50,30 62,36 76,42 88,48 96,52',
  },
  {
    id: 'nc-index',
    symbol: 'NIGHT CITY INDEX · NCX',
    change: '▲ +0,9%',
    direction: 'up',
    points: '4,40 20,38 34,36 48,34 58,32 72,30 84,28 96,26',
  },
  {
    id: 'eurodollar',
    symbol: 'EURODÓLAR · EUR$',
    change: '▼ −0,7%',
    direction: 'down',
    points: '4,24 18,26 32,28 46,30 58,32 72,36 86,40 96,44',
  },
  {
    id: 'biotechnica',
    symbol: 'BIOTECHNICA · BTNC',
    change: '▲ +4,2%',
    direction: 'up',
    points: '4,46 18,42 30,38 44,34 56,30 70,26 84,20 96,14',
  },
  {
    id: 'night-corp',
    symbol: 'NIGHT CORP · NCORP',
    change: '▼ −2,8%',
    direction: 'down',
    points: '4,18 16,20 28,24 42,28 54,32 68,38 82,44 96,48',
  },
  {
    id: 'zetatech',
    symbol: 'ZETATECH · ZTECH',
    change: '▲ +3,1%',
    direction: 'up',
    points: '4,44 16,42 28,38 42,34 54,30 68,26 82,20 96,16',
  },
  {
    id: 'budget-arms',
    symbol: 'BUDGET ARMS · BDGT',
    change: '▼ −5,4%',
    direction: 'down',
    points: '4,12 20,16 34,22 48,28 60,34 74,40 88,46 96,52',
  },
  {
    id: 'kendachi',
    symbol: 'KENDACHI · KNDCH',
    change: '▲ +1,6%',
    direction: 'up',
    points: '4,42 18,40 32,38 46,36 58,32 72,28 86,24 96,20',
  },
  {
    id: 'tsunami',
    symbol: 'TSUNAMI DEFENSE · TSUN',
    change: '▼ −0,9%',
    direction: 'down',
    points: '4,26 18,28 32,30 46,32 58,34 72,38 86,42 96,46',
  },
  {
    id: 'dynalar',
    symbol: 'DYNALAR · DYNL',
    change: '▲ +7,2%',
    direction: 'up',
    points: '4,50 14,44 26,38 40,32 52,26 66,20 80,14 96,8',
  },
  {
    id: 'netwatch',
    symbol: 'NETWATCH · NWCH',
    change: '▼ −1,2%',
    direction: 'down',
    points: '4,22 20,24 34,26 48,30 62,34 76,38 88,42 96,46',
  },
  {
    id: 'raven',
    symbol: 'RAVEN MICROCYBER · RAVN',
    change: '▲ +2,9%',
    direction: 'up',
    points: '4,48 16,44 28,40 42,36 54,32 68,26 82,22 96,18',
  },
];
