import { findRoleKit } from '../../data/roleAbilities';
import { resolveSheetRoleId, type SheetRoleId } from '../../theme/sheetRoleThemes';

export type CharacterFileSource = {
  id: string;
  name: string;
  role?: string;
  idCard?: string | null;
  campaignId?: number | null;
  campaign_id?: number | null;
};

export type CharacterFileRow = {
  key: string;
  label: string;
  value: string;
  encryptedValue: string;
  /** Soften ID-card until reveal (Netrunner). */
  sensitive?: boolean;
};

export type CharacterFileDossierModel = {
  roleId: SheetRoleId;
  isNetrunner: boolean;
  fileName: string;
  encryptedFileName: string;
  classification: string;
  encryptedClassification: string;
  tagline: string;
  encryptedTagline: string;
  rows: CharacterFileRow[];
  footerHint: string;
};

const HEX = '0123456789ABCDEF';
const NET_GLYPHS = '█▓▒░╬╪╫║╔╗╚╝░▒▓█◊¤ø∆¥#@$%&*<>/\\|';
const NOISE = '░▒▓█▌▐▀▄■□▪▫●○◆◇*#@%&+=?!';

const scramble = (seed: string, len: number, alphabet: string): string => {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  let out = '';
  for (let i = 0; i < len; i += 1) {
    h = (h * 1664525 + 1013904223) >>> 0;
    out += alphabet[h % alphabet.length];
  }
  return out;
};

export const encryptFragment = (plain: string, salt: string): string => {
  const base = plain.trim() || 'void';
  const len = Math.min(28, Math.max(8, base.length + 4));
  const mode = (salt.length + base.length) % 3;
  if (mode === 0) {
    return `0x${scramble(salt + base, Math.min(len, 16), HEX)}`;
  }
  if (mode === 1) {
    return scramble(salt + base, len, NET_GLYPHS);
  }
  return scramble(salt + base, len, NOISE);
};

const slugFile = (name: string, roleId: string): string => {
  const slug = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 18);
  return `${slug || 'runner'}_${roleId}.chr`;
};

type RoleFlavor = {
  classification: string;
  fileKind: string;
  statusIdle: string;
  statusLinked: (campaignId: number) => string;
  tagline: string;
  sigLabel: string;
  footer: string;
  gagLines: (name: string, idCard: string) => string[];
};

const ROLE_FLAVOR: Record<string, RoleFlavor> = {
  solo: {
    classification: 'COMBAT-PACKAGE // STREET MUSCLE',
    fileKind: 'PERSONA-RECORD // BALLISTIC CLEARANCE',
    statusIdle: 'STANDING BY // WAITING FOR GIG PING',
    statusLinked: (id) => `DEPLOYED // CAMPAIGN NODE #${id}`,
    tagline: 'Primeiro a entrar. Último a precisar de Trauma.',
    sigLabel: 'COMBAT AWARENESS',
    footer: 'Arquivo de contrato armado. Não carimbar com sangue.',
    gagLines: (name, id) => [
      `SOLO ${name} // pulse-check: ONLINE`,
      `Threat matrix: ${id || 'NO-CARD'} · finger on trigger`,
      `${name} recalibrando reflexos — 0.3s`,
    ],
  },
  netrunner: {
    classification: 'ICE-BREACH // BLACKWALL ADJACENT',
    fileKind: 'ENCRYPTED DATASHARD // NETWATCH FLAG',
    statusIdle: 'GHOSTED // PACKET HOLDING IN BUFFER',
    statusLinked: (id) => `JACKED // MESH LINK CAMPAIGN #${id}`,
    tagline: 'Dados só abrem com handshake. Mouse = chave.',
    sigLabel: 'INTERFACE',
    footer: 'Camada ICE ativa. Hover para decrypt do ID-card.',
    gagLines: (name, id) => [
      `NETRUNNER ${name} // ████ BREACH ATTEMPT`,
      `ICE ping: ${encryptFragment(id || name, 'net')} · spoofed`,
      `${name} vazou 3 pacotes corrompidos na LAN da mesa`,
    ],
  },
  tech: {
    classification: 'FAB-KIT // DRM BYPASS READY',
    fileKind: 'SERVICE LOG // RIPPER NOTES',
    statusIdle: 'BENCH IDLE // WAITING FOR BROKEN CHROME',
    statusLinked: (id) => `FIELD TECH // CAMPAIGN WORKORDER #${id}`,
    tagline: 'Se a garantia corp morreu, a gambiarra nasceu.',
    sigLabel: 'MAKER / JURY RIG',
    footer: 'Arquivo sujo de óleo e solda. Backup em shard físico.',
    gagLines: (name, id) => [
      `TECH ${name} // torque wrench online`,
      `Warranty voided: ${id || 'LOCAL'} · smile anyway`,
      `${name} improvisou um drone com três parafusos`,
    ],
  },
  fixer: {
    classification: 'OPERATOR LEDGER // FAVOR STACK',
    fileKind: 'CONTACT BOOK // BLACK MARKET INDEX',
    statusIdle: 'NETWORK WARM // FAVOR PENDING',
    statusLinked: (id) => `DEAL LIVE // TABLE CONTRACT #${id}`,
    tagline: 'Eddies lubrificam. Favores movem Night City.',
    sigLabel: 'OPERATOR',
    footer: 'Não imprimir. Contatos odeiam papel.',
    gagLines: (name, id) => [
      `FIXER ${name} // “tenho um cara…”`,
      `Favor ledger: ${id || 'IOU'} · +1 street heat`,
      `${name} renegociou o preço no meio do ping`,
    ],
  },
  nomad: {
    classification: 'CLAN ROSTER // VEHICLE KEY',
    fileKind: 'PACK FILE // BADLANDS ROUTE',
    statusIdle: 'PARKED OUTSIDE THE WALL // RADIO OPEN',
    statusLinked: (id) => `CONVOY LINKED // CAMP NODE #${id}`,
    tagline: 'A cidade é só um posto. A família é o motor.',
    sigLabel: 'MOTO / FAMILY',
    footer: 'Arquivo cheira a combustível e poeira de Badlands.',
    gagLines: (name, id) => [
      `NOMAD ${name} // engine idle warm`,
      `Clan ping: ${id || 'PACK'} · road clear`,
      `${name} marcou um atalho que não existe no GPS corp`,
    ],
  },
  media: {
    classification: 'BROADCAST PACKAGE // HEAT OPTIONAL',
    fileKind: 'STORY BEAT // LENS CALIBRATION',
    statusIdle: 'CAMERA OFF // RUMOR BUFFER FULL',
    statusLinked: (id) => `LIVE FEED // CAMPAIGN CHANNEL #${id}`,
    tagline: 'A verdade é editável. O escândalo, não.',
    sigLabel: 'CREDIBILITY',
    footer: 'Arquivo marcado para viralizar — ou sumir.',
    gagLines: (name, id) => [
      `MEDIA ${name} // rolling… and cutting`,
      `Scoop hash: ${id || 'NO-PRESS'} · N54 denied`,
      `${name} vazou um frame glitchado sem querer`,
    ],
  },
  exec: {
    classification: 'CORP CLEARANCE // ASTERISK HEAVY',
    fileKind: 'MEMO DOSSIER // BUDGET LINE',
    statusIdle: 'INBOX ZERO // AWAITING APPROVAL',
    statusLinked: (id) => `ASSIGNED // PROJECT CAMPAIGN #${id}`,
    tagline: 'Soft power com cartão. Asterisco em tudo.',
    sigLabel: 'TEAMWORK / BACKUP',
    footer: 'Arquivo classificado corp. Não encaminhar ao sindicato.',
    gagLines: (name, id) => [
      `EXEC ${name} // calendar conflict: war`,
      `Expense code: ${id || 'N/A'} · deny all`,
      `${name} aprovou o gig “provisoriamente”`,
    ],
  },
  lawman: {
    classification: 'BADGE RECORD // JURISDICTION FUZZY',
    fileKind: 'CASE FILE // RADIO CHANNEL',
    statusIdle: 'PATROL HOLD // WAITING FOR DISPATCH',
    statusLinked: (id) => `ON CALL // TABLE JURISDICTION #${id}`,
    tagline: 'Ordem à moda Night City: quem paga, manda.',
    sigLabel: 'BACKUP',
    footer: 'Arquivo carimbado. Backup pode demorar — ou sobrar.',
    gagLines: (name, id) => [
      `LAWMAN ${name} // 10-4, maybe`,
      `Badge echo: ${id || 'NO-BADGE'} · heat rising`,
      `${name} pediu reforço e ganhou um café`,
    ],
  },
  medtech: {
    classification: 'TRAUMA PACKET // BIOMONITOR LIVE',
    fileKind: 'PATIENT CHART // STREET CLINIC',
    statusIdle: 'BAY EMPTY // PLASMA ON STANDBY',
    statusLinked: (id) => `FIELD MEDIC // CREW NODE #${id}`,
    tagline: 'Mantém o crew vivo. Cobra depois — se sobrar.',
    sigLabel: 'MEDICAL TECH',
    footer: 'Arquivo manchado. Não misturar com o do chrome.',
    gagLines: (name, id) => [
      `MEDTECH ${name} // vitals green-ish`,
      `Chart id: ${id || 'JOHN-DOE'} · hold pressure`,
      `${name} estabilizou alguém com fita isolante`,
    ],
  },
  rockerboy: {
    classification: 'STAGE PACKAGE // CROWD BUFFER',
    fileKind: 'SETLIST // PROTEST AMP',
    statusIdle: 'MIC MUTED // FANS IN QUEUE',
    statusLinked: (id) => `ON TOUR // CAMPAIGN VENUE #${id}`,
    tagline: 'A multidão é o buffer. A fama é o alvo.',
    sigLabel: 'CHARISMATIC IMPACT',
    footer: 'Arquivo alto demais. Vizinhos corporativos reclamam.',
    gagLines: (name, id) => [
      `ROCKERBOY ${name} // drop the beat`,
      `Tour pass: ${id || 'GA'} · encore optional`,
      `${name} virou o volume e o ICE tremeu`,
    ],
  },
  nightcity: {
    classification: 'UNTYPED RUNNER // STREET FILE',
    fileKind: 'PERSONA-RECORD // NC DEFAULT',
    statusIdle: 'UNASSIGNED // HOLD FOR NARRATOR INVITE',
    statusLinked: (id) => `LINKED // CAMPAIGN #${id}`,
    tagline: 'Mais um arquivo na pilha de Night City.',
    sigLabel: 'STREET SURVIVAL',
    footer: 'Arquivo genérico. Role define o resto.',
    gagLines: (name, id) => [
      `RUNNER ${name} // still breathing`,
      `Street file: ${id || 'NO-ID'} · keep moving`,
      `${name} apareceu no feed do NCPD por 0.2s`,
    ],
  },
};

const flavorFor = (roleId: SheetRoleId): RoleFlavor =>
  ROLE_FLAVOR[roleId] ?? ROLE_FLAVOR.nightcity;

export const buildCharacterFileDossier = (
  character: CharacterFileSource,
): CharacterFileDossierModel => {
  const roleId = resolveSheetRoleId(character.role);
  const kit = findRoleKit(character.role);
  const flavor = flavorFor(roleId);
  const name = (character.name || 'Runner').trim();
  const idCard = String(character.idCard ?? '').trim();
  const campId = character.campaignId ?? character.campaign_id;
  const hasCamp = campId != null && Number(campId) > 0;
  const salt = `${character.id}:${roleId}`;
  const ability = kit?.abilities[0];
  const fileName = slugFile(name, roleId);
  const status = hasCamp
    ? flavor.statusLinked(Number(campId))
    : flavor.statusIdle;

  const rows: CharacterFileRow[] = [
    {
      key: 'type',
      label: 'TYPE',
      value: flavor.fileKind,
      encryptedValue: encryptFragment(flavor.fileKind, salt + 'type'),
    },
    {
      key: 'handle',
      label: 'HANDLE',
      value: name.toUpperCase(),
      encryptedValue: encryptFragment(name, salt + 'handle'),
    },
    {
      key: 'role',
      label: 'ROLE',
      value: (character.role || kit?.name || 'Runner').toUpperCase(),
      encryptedValue: encryptFragment(character.role || 'role', salt + 'role'),
    },
    {
      key: 'sig',
      label: 'SIG',
      value: ability
        ? `${flavor.sigLabel} — ${ability.summary}`
        : `${flavor.sigLabel} — ${flavor.tagline}`,
      encryptedValue: encryptFragment(flavor.sigLabel, salt + 'sig'),
    },
    {
      key: 'status',
      label: 'STATUS',
      value: status,
      encryptedValue: encryptFragment(status, salt + 'status'),
    },
    {
      key: 'id',
      label: 'ID-CARD',
      value: idCard || '— PENDING ISSUE —',
      encryptedValue: idCard
        ? `▓▓ ${encryptFragment(idCard, salt + 'id')} ▓▓`
        : scramble(salt, 18, NET_GLYPHS),
      sensitive: true,
    },
  ];

  return {
    roleId,
    isNetrunner: roleId === 'netrunner',
    fileName,
    encryptedFileName: `${scramble(salt, 10, HEX)}.enc`,
    classification: flavor.classification,
    encryptedClassification: encryptFragment(flavor.classification, salt + 'cls'),
    tagline: kit?.blurb || flavor.tagline,
    encryptedTagline: encryptFragment(flavor.tagline, salt + 'tag'),
    rows,
    footerHint: flavor.footer,
  };
};

export const buildCharacterGagLines = (
  characters: CharacterFileSource[],
): string[] => {
  const lines: string[] = [];
  for (const c of characters) {
    const roleId = resolveSheetRoleId(c.role);
    const flavor = flavorFor(roleId);
    const name = (c.name || 'Runner').trim();
    const idCard = String(c.idCard ?? '').trim();
    lines.push(...flavor.gagLines(name, idCard));
  }
  if (lines.length === 0) {
    lines.push(
      'ARCHIVE EMPTY // crie um personagem para popular o feed',
      'Night City DB: 0 persona records mounted',
    );
  }
  lines.push(
    'SCANLINES SYNC // biometria parcial',
    'NC-VTT archive watcher: glitch nominal',
    'Hover netrunner shards to decrypt ID-card',
  );
  return lines;
};
