export type SecretThemeId = 'blackwall' | 'militech' | 'traumateam';

export type SecretThemeDef = {
  id: SecretThemeId;
  swatches: [string, string, string];
};

export const SECRET_THEME_IDS: SecretThemeId[] = [
  'blackwall',
  'militech',
  'traumateam',
];

export const SECRET_THEMES: SecretThemeDef[] = [
  {
    id: 'blackwall',
    swatches: ['#8b5cf6', '#c4b5fd', '#ff2a6d'],
  },
  {
    id: 'militech',
    swatches: ['#d4af37', '#f5e6a8', '#c41e3a'],
  },
  {
    id: 'traumateam',
    swatches: ['#00e676', '#ffffff', '#ff1744'],
  },
];

export const isSecretThemeId = (value: string): value is SecretThemeId =>
  SECRET_THEME_IDS.includes(value as SecretThemeId);
