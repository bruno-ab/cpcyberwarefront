export type ChromeBootSheetSummary = {
  chrome?: string[];
  role?: string;
  hasOptics?: boolean;
  opticsChrome?: string[];
  other_traits?: {
    humanity?: number;
    implant_capacity?: number;
    edges?: number;
  };
};

export type ChromeBootImplantRow = {
  name: string;
  firmware: string;
};

export type ChromeBootWarning = {
  id: string;
  text: string;
  severity: 'info' | 'warn' | 'critical';
};

const hashSeed = (input: string): number => {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

export const deriveFirmwareVersion = (
  characterId: string,
  implantCount: number,
): string => {
  const h = hashSeed(`${characterId}:${implantCount}`);
  const patch = (h % 999).toString().padStart(3, '0');
  const minor = 70 + (h % 18);
  return `v2.${minor}.${patch}`;
};

export const deriveImplantFirmware = (
  characterId: string,
  implantName: string,
): string => {
  const h = hashSeed(`${characterId}:${implantName}`);
  const a = (h % 9) + 1;
  const b = (h % 99).toString().padStart(2, '0');
  return `${a}.${b}`;
};

const norm = (s: string) => s.toLowerCase();

export const buildChromeBootPayload = (
  character: { id: string; name: string; role?: string; sheetSummary?: ChromeBootSheetSummary },
  t: (key: string) => string,
): {
  firmware: string;
  implants: ChromeBootImplantRow[];
  warnings: ChromeBootWarning[];
} => {
  const sheet = character.sheetSummary || {};
  const names = Array.isArray(sheet.chrome)
    ? sheet.chrome.filter((n): n is string => Boolean(String(n || '').trim()))
    : [];
  const firmware = deriveFirmwareVersion(character.id, names.length);
  const implants = names.map((name) => ({
    name,
    firmware: deriveImplantFirmware(character.id, name),
  }));

  const warnings: ChromeBootWarning[] = [];
  const push = (id: string, key: string, severity: ChromeBootWarning['severity']) => {
    warnings.push({ id, text: t(key), severity });
  };

  const humanity = Number(sheet.other_traits?.humanity);
  const capacity = Number(sheet.other_traits?.implant_capacity) || 10;
  const hasOptics = Boolean(sheet.hasOptics);
  const opticsInLoad = names.some((n) =>
    /kiroshi|optic|ocular|cyber.?eye|olho|sensorial/i.test(n),
  );

  if (names.length >= Math.max(8, capacity)) {
    push('load-high', 'warnings.loadHigh', 'warn');
  }
  if (Number.isFinite(humanity) && humanity <= 2) {
    push('psycho-critical', 'warnings.psychoCritical', 'critical');
  } else if (Number.isFinite(humanity) && humanity <= 5) {
    push('psycho-elevated', 'warnings.psychoElevated', 'warn');
  }

  if (opticsInLoad && !hasOptics) {
    push('optics-offline', 'warnings.opticsOffline', 'warn');
  }

  for (const name of names) {
    const n = norm(name);
    if (/sandevistan|sandy/.test(n)) {
      push(`sandevistan-${name}`, 'warnings.sandevistanCalib', 'warn');
    } else if (/kerenzikov/.test(n)) {
      push(`kerenzikov-${name}`, 'warnings.kerenzikovSync', 'info');
    } else if (/cyberdeck|netrunner|rippler|deck/.test(n)) {
      push(`deck-${name}`, 'warnings.deckIce', 'info');
    } else if (/biomonitor/.test(n)) {
      push(`bio-${name}`, 'warnings.biomonitorLag', 'info');
    } else if (/gorilla|mantis|monowire|arm/.test(n)) {
      push(`melee-${name}`, 'warnings.actuatorTest', 'info');
    } else if (/relic|military os|full body|apogee/.test(n)) {
      push(`mil-${name}`, 'warnings.restrictedFw', 'warn');
    }
  }

  const seen = new Set<string>();
  const deduped = warnings.filter((w) => {
    if (seen.has(w.id)) return false;
    seen.add(w.id);
    return true;
  });

  return {
    firmware,
    implants,
    warnings: deduped.slice(0, 6),
  };
};

export const randomBootDurationMs = (): number =>
  3000 + Math.floor(Math.random() * 2001);
