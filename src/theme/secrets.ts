import type { SecretThemeId } from './secretThemes';
import {
  collectShard,
  readShardCollection,
  unlockLore,
  unlockTheme,
} from './unlocks';

export type RedeemResult =
  | { ok: true; kind: 'theme'; id: SecretThemeId; already?: boolean }
  | { ok: true; kind: 'lore'; id: string; already?: boolean }
  | { ok: true; kind: 'shard'; id: string; already?: boolean }
  | { ok: false; reason: 'unknown' | 'empty' };

export const normalizeSecretInput = (raw: string): string =>
  raw.trim().toUpperCase().replace(/\s+/g, '-');

/** GM/dev reference lives in docs/25-10-2026.md — not shown to players in UI. */
const CODE_TABLE: Record<
  string,
  { unlocks: Array<{ type: 'theme'; id: SecretThemeId } | { type: 'lore'; id: string }> }
> = {
  'BLACKWALL-7': { unlocks: [{ type: 'theme', id: 'blackwall' }] },
  'MILITECH-AU': { unlocks: [{ type: 'theme', id: 'militech' }] },
  'TRAUMA-TEAM': { unlocks: [{ type: 'theme', id: 'traumateam' }] },
  'NC-SHARD-SYNC': {
    unlocks: [
      { type: 'theme', id: 'traumateam' },
      { type: 'lore', id: 'arg-shard-sync' },
    ],
  },
};

export const SHARD_DEFS = [
  { id: 'shard-bw-a', glyph: '◈', assemblyOrder: 0 },
  { id: 'shard-tt-b', glyph: '◆', assemblyOrder: 1 },
  { id: 'shard-mi-c', glyph: '◇', assemblyOrder: 2 },
] as const;

export type ShardId = (typeof SHARD_DEFS)[number]['id'];

const ASSEMBLY_SHARD_IDS: ShardId[] = SHARD_DEFS.map((s) => s.id);

export const SHARD_ASSEMBLY_UNLOCKS: Array<
  { type: 'theme'; id: SecretThemeId } | { type: 'lore'; id: string }
> = [
  { type: 'theme', id: 'traumateam' },
  { type: 'lore', id: 'arg-shard-sync' },
];

const applyUnlock = (
  entry: { type: 'theme'; id: SecretThemeId } | { type: 'lore'; id: string },
): RedeemResult => {
  if (entry.type === 'theme') {
    unlockTheme(entry.id);
    return { ok: true, kind: 'theme', id: entry.id };
  }
  unlockLore(entry.id);
  return { ok: true, kind: 'lore', id: entry.id };
};

export const tryShardAssembly = (): RedeemResult[] | null => {
  const have = new Set(readShardCollection());
  const complete = ASSEMBLY_SHARD_IDS.every((id) => have.has(id));
  if (!complete) return null;
  return SHARD_ASSEMBLY_UNLOCKS.map((u) => applyUnlock(u));
};

export const redeemCode = (raw: string): RedeemResult => {
  const code = normalizeSecretInput(raw);
  if (!code) return { ok: false, reason: 'empty' };

  const shard = SHARD_DEFS.find((s) => s.id.toUpperCase() === code);
  if (shard) {
    const added = collectShard(shard.id);
    const assembly = tryShardAssembly();
    if (assembly?.length) {
      return assembly[assembly.length - 1]!;
    }
    return {
      ok: true,
      kind: 'shard',
      id: shard.id,
      already: !added,
    };
  }

  const entry = CODE_TABLE[code];
  if (!entry) return { ok: false, reason: 'unknown' };

  const last = entry.unlocks[entry.unlocks.length - 1]!;
  entry.unlocks.forEach((u) => applyUnlock(u));
  return applyUnlock(last);
};

export const SECRET_THEME_COUNT = 3;

export const LORE_FRAGMENTS: Record<
  string,
  { titlePt: string; titleEn: string; bodyPt: string; bodyEn: string }
> = {
  'arg-shard-sync': {
    titlePt: 'Fragmento: Sincronia NC',
    titleEn: 'Fragment: NC Sync',
    bodyPt:
      'Três cristais de dados espalhados na rede — rodapé do HUD, memorial e lore — alinharam o buffer de paleta Trauma Team. Quem montou o conjunto ou digitou o handshake viu o verde clínico acender no HUD.',
    bodyEn:
      'Three data crystals scattered across the net — HUD footer, memorial, and lore — aligned the Trauma Team palette buffer. Whoever assembled the set or typed the handshake saw clinical green light the HUD.',
  },
};
