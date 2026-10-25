export type TokenEmoteId =
  | 'ok'
  | 'alerta'
  | 'cobertura'
  | 'espera'
  | 'ferido'
  | 'pronto';

export const TOKEN_EMOTE_IDS: TokenEmoteId[] = [
  'ok',
  'alerta',
  'cobertura',
  'espera',
  'ferido',
  'pronto',
];

export const TOKEN_EMOTE_GLYPH: Record<TokenEmoteId, string> = {
  ok: '🙂',
  alerta: '⚠',
  cobertura: '🛡',
  espera: '✋',
  ferido: '💢',
  pronto: '▶',
};

export const TOKEN_EMOTE_COOLDOWN_MS = 1500;
