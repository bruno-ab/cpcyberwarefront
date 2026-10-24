import { ROLE_KITS, findRoleKit, type RoleKit } from './roleAbilities';

export type CharacterRole = {
  id: string;
  name: string;
  blurb: string;
};

/** Roles clássicas Cyberpunk RED / 2077 para o wizard. */
export const CHARACTER_ROLES: CharacterRole[] = ROLE_KITS.map((r) => ({
  id: r.id,
  name: r.name,
  blurb: r.blurb,
}));

export { ROLE_KITS, findRoleKit };
export type { RoleKit };

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
