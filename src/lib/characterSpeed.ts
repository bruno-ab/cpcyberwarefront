/** Velocidade de movimento no grid VTT: 5 + Destreza + bônus de chrome (`speed`). */

export type SpeedBreakdown = {
  speed: number;
  speedBase: number;
  speedBonus: number;
  dexterity: number;
};

export const SPEED_GRID_BASE = 5;

export const dexterityFromSheet = (sheet: Record<string, unknown> | null | undefined): number => {
  const physical = sheet?.physical as Record<string, unknown> | undefined;
  const d = Number(physical?.dexterity);
  return Number.isFinite(d) && d > 0 ? d : 0;
};

export const speedBonusFromBonuses = (
  bonuses: Record<string, number> | null | undefined,
): number => {
  const n = Number(bonuses?.speed);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

export const computeCharacterSpeed = (
  sheet: Record<string, unknown> | null | undefined,
  bonuses: Record<string, number> | null | undefined = {},
): SpeedBreakdown => {
  const dexterity = dexterityFromSheet(sheet);
  const speedBonus = speedBonusFromBonuses(bonuses);
  const speedBase = SPEED_GRID_BASE + dexterity;
  const speed = speedBase + speedBonus;
  return { speed, speedBase, speedBonus, dexterity };
};

export const speedFromSheetSummary = (
  sheetSummary: Record<string, unknown> | null | undefined,
): SpeedBreakdown => {
  const speed = Number(sheetSummary?.speed);
  const speedBase = Number(sheetSummary?.speedBase);
  const speedBonus = Number(sheetSummary?.speedBonus);
  if (Number.isFinite(speed) && speed > 0) {
    return {
      speed,
      speedBase: Number.isFinite(speedBase) ? speedBase : speed,
      speedBonus: Number.isFinite(speedBonus) ? speedBonus : 0,
      dexterity: dexterityFromSheet(sheetSummary),
    };
  }
  return computeCharacterSpeed(sheetSummary, {});
};
