/** Copy pools for rare home ambient gags (PT/EN cyberpunk). */

export const MATRIX_TERMS = [
  'netrun',
  'quickhack',
  'ice',
  'blackwall',
  'daemon',
  'breach',
  'deck',
  'chrome',
  'flatline',
  'sandevistan',
  'kiroshi',
  'arasaka',
  'militech',
  'netwatch',
  'trauma team',
  'eddies',
  'choomba',
  'preem',
  'gonk',
  'edgerunner',
  'chooh2',
  'synapse',
  'ICE.exe',
  'ping -t NC',
  'sudo breach',
  'rm -rf /corp',
  'ncpd trace',
  'jack in',
  'ghost ping',
  'packet flood',
  'neural sync',
  'ripperdoc',
  'braindance',
  'maxtac',
  'afterlife',
  'delta v',
  'zero-day',
  'backdoor',
  'hash crash',
  'signal bleed',
] as const;

export const SYNC_LABELS = [
  'SYNCING NEURALINK…',
  'BAIXANDO ICE…',
  'INJETANDO DAEMON…',
  'PATCH NETWATCH…',
  'CALIBRANDO KIROSHI…',
  'UPLOAD QUICKHACK…',
  'SCAN BLACKWALL…',
  'COMPILANDO CHROME…',
  'HANDSHAKE ARASAKA…',
  'DECRYPT MILITECH…',
  'WARMING SANDEVISTAN…',
  'ROTEANDO VIA AFTERLIFE…',
] as const;

export const INVASION_LINES = [
  'hey choom',
  'seu deck tá aberto',
  'ACEITA O PACOTE?',
  'ping anon@afterlife',
  'netwatch tá olhando',
  'abre a porta, gonk',
  'daemon na porta 443',
  'flatline em 3… 2…',
  'preem hack incoming',
  'você ouviu isso?',
  'ICE não te protege',
  'quickhack queued',
  'trauma team en route',
  'blackwall whisper',
  'eddies ou dados',
  'synapse leak detected',
  'choomba, wake up',
  'militech knock knock',
] as const;

export const ASCII_RABBIT = String.raw` (\_/)
 (='.'=)
 (")_(")`;

export const ASCII_RABBIT_ALT = String.raw`  /\|\-/\
 /  o o  \
(  =^=^=  )
 \   m   /
  \_____/`;

/** Arabic fragments (cyber / glitch flavor). */
export const ARABIC_GLYPHS = [
  'شبكة',
  'اختراق',
  'برنامج',
  'إشارة',
  'تزامن',
  'شبح',
  'بيانات',
  'جدار',
  'نبض',
  'تشفير',
  'وكيل',
  'فيروس',
  'مسح',
  'اتصال',
  'فشل',
  'ذاكرة',
  'نواة',
  'بوابة',
  'ظل',
  'رمز',
  'حافة',
  'سقوط',
  'صفر',
  'ليل',
] as const;

/** Japanese kana / kanji cyber fragments. */
export const JAPANESE_GLYPHS = [
  'ネット',
  '侵入',
  '電脳',
  '同期',
  '信号',
  '故障',
  '幽霊',
  '氷壁',
  'ハック',
  'daemon',
  '欠損',
  '漏洩',
  '遮断',
  '再起',
  '虚',
  '零',
  '影',
  '脈',
  '反響',
  '断片',
  'アイス',
  'ゴースト',
  'フラット',
  'チョーム',
  'サイバー',
  '脳',
  '接続',
  '遮断',
] as const;

export type GagKind = 'matrix' | 'invasion' | 'rabbit' | 'syncBar' | 'scriptGlitch';

export const pickGagKind = (): GagKind => {
  const r = Math.random();
  if (r < 0.3) return 'matrix';
  if (r < 0.55) return 'syncBar';
  if (r < 0.73) return 'scriptGlitch';
  if (r < 0.88) return 'rabbit';
  return 'invasion';
};

export const randBetween = (min: number, max: number) =>
  min + Math.random() * (max - min);

export const glitchify = (text: string): string => {
  const chars = '█▓▒░#@$%&*!?0123456789';
  return text
    .split('')
    .map((ch) => {
      if (ch === ' ' || Math.random() > 0.22) return ch;
      return chars[Math.floor(Math.random() * chars.length)];
    })
    .join('');
};
