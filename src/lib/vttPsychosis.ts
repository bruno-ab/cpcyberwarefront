import { CYBERPSYCHOSIS_CRITICAL_RATIO } from '../components/sheet/CyberpsychosisMeter';

export type ChromeCapacitySummary = {
  baseCapacity?: number;
  used?: number;
  remaining?: number;
  inCyberpsychosis?: boolean;
  cyberpsychosisSeverity?: number;
};

export const psychosisCriticalFromSheet = (
  sheetSummary?: Record<string, unknown> | null,
): boolean => {
  const cap = sheetSummary?.chromeCapacity as ChromeCapacitySummary | undefined;
  if (!cap) return false;
  const inPsycho = Boolean(cap.inCyberpsychosis);
  const base = Number(cap.baseCapacity) || 10;
  const used = Number(cap.used) || 0;
  const ratio = base > 0 ? used / base : 0;
  return inPsycho || ratio >= CYBERPSYCHOSIS_CRITICAL_RATIO;
};
