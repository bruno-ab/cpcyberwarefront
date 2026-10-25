import { DEFAULT_MAX_CYBERWARE_PIECES } from '../data/cyberware-stat-boosters';
import { CYBERWARE_MAX_SLOTS, type CyberWareSlot } from '../data/cyberwareSlots';
import { BASE_IMPLANT_CAPACITY } from '../data/cyberwareSlots';
import { computeCyberwareCapacity } from './cyberwareCapacity';

export type StatBonusMap = Record<string, number>;

export type InstalledChromeLike = {
  type?: string;
  slots?: number;
  implantCost?: number;
  implant_cost?: number;
  statBonuses?: StatBonusMap | null;
  stat_bonuses?: StatBonusMap | string | null;
};

export const parseStatBonuses = (
  raw: StatBonusMap | string | null | undefined,
): StatBonusMap => {
  if (!raw) return {};
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }
  return { ...raw };
};

export const aggregateStatBonuses = (
  items: InstalledChromeLike[],
): StatBonusMap => {
  const out: StatBonusMap = {};
  for (const item of items) {
    const bonuses = parseStatBonuses(
      item.statBonuses ?? item.stat_bonuses ?? null,
    );
    for (const [key, value] of Object.entries(bonuses)) {
      const n = Number(value) || 0;
      if (!n) continue;
      out[key] = (out[key] || 0) + n;
    }
  }
  return out;
};

export type SlotUsage = {
  used: number;
  max: number;
  remaining: number;
};

export type CyberwareInstallLimits = {
  maxPieces: number;
  installedCount: number;
  piecesRemaining: number;
  atPieceLimit: boolean;
  capacity: ReturnType<typeof computeCyberwareCapacity>;
  slotsByType: Record<string, SlotUsage>;
};

export const computeInstallLimits = (
  installed: InstalledChromeLike[],
  opts?: {
    implantCapacity?: number;
    maxPieces?: number;
  },
): CyberwareInstallLimits => {
  const maxPieces = Math.max(
    1,
    Number(opts?.maxPieces) > 0
      ? Number(opts?.maxPieces)
      : DEFAULT_MAX_CYBERWARE_PIECES,
  );
  const installedCount = installed.length;
  const baseCapacity =
    Number(opts?.implantCapacity) > 0
      ? Number(opts?.implantCapacity)
      : BASE_IMPLANT_CAPACITY;

  const capacity = computeCyberwareCapacity(
    installed.map((cw) => ({
      implantCost: Number(cw.implantCost ?? cw.implant_cost ?? 1) || 0,
    })),
    baseCapacity,
  );

  const slotsByType: Record<string, SlotUsage> = {};
  for (const [type, max] of Object.entries(CYBERWARE_MAX_SLOTS)) {
    slotsByType[type] = { used: 0, max, remaining: max };
  }
  for (const cw of installed) {
    const type = String(cw.type || '');
    if (!slotsByType[type]) {
      slotsByType[type] = {
        used: 0,
        max: CYBERWARE_MAX_SLOTS[type as CyberWareSlot] || 1,
        remaining: CYBERWARE_MAX_SLOTS[type as CyberWareSlot] || 1,
      };
    }
    slotsByType[type].used += Number(cw.slots || 1) || 1;
  }
  for (const row of Object.values(slotsByType)) {
    row.remaining = row.max - row.used;
  }

  return {
    maxPieces,
    installedCount,
    piecesRemaining: Math.max(0, maxPieces - installedCount),
    atPieceLimit: installedCount >= maxPieces,
    capacity,
    slotsByType,
  };
};

