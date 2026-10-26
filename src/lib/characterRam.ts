/** RAM de netrunning: 0 sem deck; com deck = 8 + Σ chrome (statBonuses.ram). */

export const RAM_DECK_BASE = 8;

export const NET_DECK_NAME_RE =
  /deck|cyberdeck|netrunning|ram\s*manager|interface/i;

export type RamBreakdown = {
  ram: number;
  ramMax: number;
  ramBase: number;
  ramBonus: number;
  hasNetDeck: boolean;
};

export const ramBonusFromBonuses = (
  bonuses: Record<string, number> | null | undefined,
): number => {
  const n = Number(bonuses?.ram);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

export const inventoryHasNetDeck = (
  sheet: Record<string, unknown> | null | undefined,
): boolean => {
  const inv = sheet?.inventory as { cyberware?: Array<{ name?: string; installed?: boolean }> } | undefined;
  const rows = inv?.cyberware;
  if (!Array.isArray(rows)) return false;
  for (const row of rows) {
    if (row?.installed === false) continue;
    if (NET_DECK_NAME_RE.test(String(row?.name || ''))) return true;
  }
  return false;
};

export const computeCharacterRam = (
  sheet: Record<string, unknown> | null | undefined,
  bonuses: Record<string, number> | null | undefined = {},
  opts?: { hasNetDeck?: boolean; installedNames?: string[] },
): RamBreakdown => {
  const names = opts?.installedNames ?? [];
  const hasNetDeck =
    opts?.hasNetDeck ??
    inventoryHasNetDeck(sheet) ||
      names.some((n) => NET_DECK_NAME_RE.test(String(n || '')));
  const ramBonus = ramBonusFromBonuses(bonuses);
  const ramBase = hasNetDeck ? RAM_DECK_BASE : 0;
  const ramMax = ramBase + ramBonus;
  const ot = sheet?.other_traits as Record<string, unknown> | undefined;
  const stored = Number(ot?.ram);
  let ram = Number.isFinite(stored) ? stored : ramMax;
  if (ramMax <= 0) ram = 0;
  else ram = Math.max(0, Math.min(ram, ramMax));
  return { ram, ramMax, ramBase, ramBonus, hasNetDeck };
};

export const ramFromSheetSummary = (
  sheetSummary: Record<string, unknown> | null | undefined,
): RamBreakdown => {
  const ram = Number(sheetSummary?.ram);
  const ramMax = Number(sheetSummary?.ramMax);
  const ramBase = Number(sheetSummary?.ramBase);
  const ramBonus = Number(sheetSummary?.ramBonus);
  if (Number.isFinite(ramMax)) {
    return {
      ram: Number.isFinite(ram) ? ram : ramMax,
      ramMax,
      ramBase: Number.isFinite(ramBase) ? ramBase : RAM_DECK_BASE,
      ramBonus: Number.isFinite(ramBonus) ? ramBonus : 0,
      hasNetDeck: Boolean(sheetSummary?.hasNetDeck) || ramMax > 0,
    };
  }
  return computeCharacterRam(sheetSummary, {});
};
