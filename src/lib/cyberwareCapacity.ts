import { BASE_IMPLANT_CAPACITY } from '../data/cyberwareSlots';

export type ImplantLoadInput = { implantCost: number };

export const computeCyberwareCapacity = (
  installed: ImplantLoadInput[],
  baseCapacity = BASE_IMPLANT_CAPACITY,
) => {
  const used = installed.reduce((sum, item) => sum + (item.implantCost || 0), 0);
  const remaining = baseCapacity - used;
  return {
    baseCapacity,
    used,
    remaining,
    atLimit: remaining <= 0,
    inCyberpsychosis: remaining < 0,
    cyberpsychosisSeverity: remaining < 0 ? Math.abs(remaining) : 0,
  };
};
