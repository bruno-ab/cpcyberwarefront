export type NightCityWeatherMode = 'clear' | 'acid-rain' | 'smog' | 'corpo-zero';

export type WeatherModeDef = {
  id: NightCityWeatherMode;
  hudLabel: string;
  shortLabel: string;
  ambient: string;
};

export const NIGHT_CITY_WEATHER_MODES: WeatherModeDef[] = [
  {
    id: 'clear',
    hudLabel: 'CLIMA: CÉU LÍMPIDO (FICÇÃO)',
    shortLabel: 'CÉU LÍMPIDO',
    ambient: 'Visibilidade estável. Scanlines padrão.',
  },
  {
    id: 'acid-rain',
    hudLabel: 'CLIMA: CHUVA ÁCIDA',
    shortLabel: 'CHUVA ÁCIDA',
    ambient: 'Gotas corrosivas; filtros oculares recomendados.',
  },
  {
    id: 'smog',
    hudLabel: 'CLIMA: SMOG INDUSTRIAL',
    shortLabel: 'SMOG',
    ambient: 'Partículas Militech/Arasaka; respiradores em alta.',
  },
  {
    id: 'corpo-zero',
    hudLabel: 'CLIMA: CORPO ZERO',
    shortLabel: 'CORPO ZERO',
    ambient: 'Zona corporativa esterilizada; tint frio e surveillance.',
  },
];

export const WEATHER_ROTATE_MS = 4 * 60 * 1000;

export const nextWeatherMode = (current: NightCityWeatherMode): NightCityWeatherMode => {
  const idx = NIGHT_CITY_WEATHER_MODES.findIndex((m) => m.id === current);
  const next = (idx + 1) % NIGHT_CITY_WEATHER_MODES.length;
  return NIGHT_CITY_WEATHER_MODES[next].id;
};

export const weatherDef = (id: NightCityWeatherMode): WeatherModeDef =>
  NIGHT_CITY_WEATHER_MODES.find((m) => m.id === id) ?? NIGHT_CITY_WEATHER_MODES[0];
