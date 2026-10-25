import { resolveSheetRoleId, type SheetRoleId } from '../../theme/sheetRoleThemes';

export type DiceVerdict =
  | 'botch'
  | 'exceptional'
  | 'failure'
  | 'success';

export type RollKind =
  | 'default'
  | 'initiative'
  | 'firearms'
  | 'hack'
  | 'social';

export const DICE_FAST_MODE_KEY = 'cp-dice-fast';
export const DICE_DECODE_BEATS = 5;
export const BEAT_MS = 380;
export const FAST_BEAT_MS = 55;
export const CANCEL_MS = 520;
export const HOLD_MS = 4200;
export const FAST_HOLD_MS = 2400;
export const REDUCED_HOLD_MS = 2800;
export const FADE_MS = 900;

export type DiceReveal = {
  id: string;
  pool: number;
  difficulty: number;
  dice: number[];
  successes: number;
  ones: number;
  botch: boolean;
  label?: string;
  rollerName?: string;
  characterId?: number;
  characterRole?: string;
  rollKind?: RollKind;
};

export const readDiceFastMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(DICE_FAST_MODE_KEY) === '1';
  } catch {
    return false;
  }
};

export const writeDiceFastMode = (on: boolean): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DICE_FAST_MODE_KEY, on ? '1' : '0');
  } catch {
    /* ignore */
  }
};

export const rawSuccessCount = (
  dice: number[],
  difficulty: number,
): number => dice.filter((d) => d >= difficulty).length;

export const computeVerdict = (reveal: Pick<
  DiceReveal,
  'successes' | 'botch'
>): DiceVerdict => {
  if (reveal.botch) return 'botch';
  if (reveal.successes >= 5) return 'exceptional';
  if (reveal.successes <= 0) return 'failure';
  return 'success';
};

/** Stagger lock waves across `beats` (Storyteller decode tempo). */
export const buildLockWaves = (
  diceCount: number,
  beats = DICE_DECODE_BEATS,
): number[][] => {
  const waves: number[][] = Array.from({ length: beats }, () => []);
  for (let i = 0; i < diceCount; i += 1) {
    waves[i % beats].push(i);
  }
  return waves;
};

const ROLL_KIND_RULES: Array<{ kind: RollKind; re: RegExp }> = [
  { kind: 'initiative', re: /initiat|iniciativa|dex\+alert|turno/i },
  { kind: 'firearms', re: /firearm|disparo|tiro|acerto|dano|aim|attack|arma/i },
  { kind: 'hack', re: /net|hack|netrun|ice|deck|ram/i },
  { kind: 'social', re: /social|charisma|empath|persu|media|fixer|cred/i },
];

export const parseRollKind = (label?: string): RollKind => {
  const text = label?.trim() || '';
  if (!text) return 'default';
  for (const { kind, re } of ROLL_KIND_RULES) {
    if (re.test(text)) return kind;
  }
  return 'default';
};

export const resolveRoleAccent = (roleName?: string | null): SheetRoleId =>
  resolveSheetRoleId(roleName);

export const scrambleFace = (): number =>
  1 + Math.floor(Math.random() * 10);

export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return true;
  if (document.documentElement.getAttribute('data-motion') === 'off') {
    return true;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};
