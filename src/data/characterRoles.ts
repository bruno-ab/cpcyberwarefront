export type CharacterRole = {
  id: string;
  name: string;
  blurb: string;
};

/** Roles clássicas Cyberpunk RED / 2077 para o wizard. */
export const CHARACTER_ROLES: CharacterRole[] = [
  {
    id: 'solo',
    name: 'Solo',
    blurb: 'Combatente de aluguel. Tiro, lâmina e sangue frio.',
  },
  {
    id: 'netrunner',
    name: 'Netrunner',
    blurb: 'Jacka na rede, quebra ICE e some com os dados.',
  },
  {
    id: 'tech',
    name: 'Tech',
    blurb: 'Ripper de oficina. Conserta chrome, drones e portas.',
  },
  {
    id: 'fixer',
    name: 'Fixer',
    blurb: 'Conecta jobs, gente e eddies. Sempre tem um favor.',
  },
  {
    id: 'nomad',
    name: 'Nomad',
    blurb: 'Família, estrada e metal. A cidade é só mais um posto.',
  },
  {
    id: 'media',
    name: 'Media',
    blurb: 'Verdade, spin ou chantagem — a câmera é a arma.',
  },
  {
    id: 'exec',
    name: 'Exec',
    blurb: 'Corpo corporativo. Agenda cheia e faca no bolso.',
  },
  {
    id: 'lawman',
    name: 'Lawman',
    blurb: 'Distintivo ou milícia. Ordem à moda Night City.',
  },
  {
    id: 'medtech',
    name: 'Medtech',
    blurb: 'Sangue, trauma e biomonitor. Mantém o crew vivo.',
  },
  {
    id: 'rockerboy',
    name: 'Rockerboy',
    blurb: 'Palco, protesto e charisma. A multidão é o buffer.',
  },
];

export const ORIGINS = [
  'Street Kid',
  'Nomad',
  'Corpo',
  'Combat Zone',
  'Watson',
  'Pacifica',
  'Badlands',
];

export const BACKGROUNDS = [
  'Ex-milícia',
  'Ripperdoc aprendiz',
  'Fixer de bairro',
  'Gangue',
  'Deserto',
  'Netrunner de porão',
  'Jornalista underground',
  'Motorista de Valentino',
];
