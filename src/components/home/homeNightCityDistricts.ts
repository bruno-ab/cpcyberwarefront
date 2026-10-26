export type NightCityDistrictId =
  | 'watson'
  | 'westbrook'
  | 'heywood'
  | 'pacifica'
  | 'city-center'
  | 'badlands';

export type NightCityDistrict = {
  id: NightCityDistrictId;
  label: string;
  /** Posição relativa no SVG holo (centro do hotspot) */
  mapX: number;
  mapY: number;
  lore: string;
  loreLink?: { href: string; label: string };
};

export const NIGHT_CITY_DISTRICTS: NightCityDistrict[] = [
  {
    id: 'watson',
    label: 'Watson',
    mapX: 118,
    mapY: 72,
    lore:
      'Barracas de ripperdoc, vapor de ramen e tiroteio de gangue antes do café. Kabuki pisca anúncios mentirosos; Maelstrom recicla ferro-vivo no beco.',
    loreLink: { href: '/lore', label: 'Arquivo de lore' },
  },
  {
    id: 'westbrook',
    label: 'Westbrook',
    mapX: 200,
    mapY: 58,
    lore:
      'Japantown brilha como vitrine de corpos. Tyger Claws vendem elegância com lâmina escondida; contratos milionários sangram nos penthouse do Clouds.',
    loreLink: { href: '/wiki', label: 'Wiki Night City' },
  },
  {
    id: 'heywood',
    label: 'Heywood',
    mapX: 168,
    mapY: 118,
    lore:
      'Valentinos, família e vingança em spray neon. Wellsprings cheira a asfalto quente; cada esquina é promessa de gig ou caixão barato.',
    loreLink: { href: '/map', label: 'Mapas externos' },
  },
  {
    id: 'pacifica',
    label: 'Pacifica',
    mapX: 52,
    mapY: 130,
    lore:
      'Projeto morto, torres fantasma e mercado negro à luz de flare. Voodoo Boys sussurram com a Net; turistas não voltam — edgerunners sim.',
    loreLink: { href: '/gigs', label: 'Gigs & contratos' },
  },
  {
    id: 'city-center',
    label: 'City Center',
    mapX: 148,
    mapY: 48,
    lore:
      'Vidro Arasaka reflete o céu envenenado. Corpos em traje zero-gravidade negociam guerras que os pobres pagam com sangue lá embaixo.',
    loreLink: { href: '/lore', label: 'Arquivo de lore' },
  },
  {
    id: 'badlands',
    label: 'Badlands (borda)',
    mapX: 248,
    mapY: 148,
    lore:
      'Horizonte de poeira, Scavengers e acordos sujos no acampamento. Night City é mancha de luz no fim da estrada — ou armadilha.',
    loreLink: { href: '/map', label: 'Mapas externos' },
  },
];

export const districtById = (id: NightCityDistrictId): NightCityDistrict | undefined =>
  NIGHT_CITY_DISTRICTS.find((d) => d.id === id);
