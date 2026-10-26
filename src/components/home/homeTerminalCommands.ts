export type TerminalTone = 'default' | 'white' | 'yellow' | 'red' | 'ok';

export type TerminalLine = {
  text: string;
  tone?: TerminalTone;
};

export const TERMINAL_BOOT: TerminalLine[] = [
  { text: 'Conectando à sub-rede da Night City Net...' },
  { text: 'Ping da NetWatch: Tráfego monitorado em Watson.' },
  { text: 'Criptografia de canal: 4096-bit AES / Quantum Resistance.', tone: 'yellow' },
];

export const HOME_NEWS = [
  '[ARASAKA]: Novas atualizações no implante relíquia prometem imortalidade digital.',
  '[COMBAT ZONE]: Conflitos entre Maelstrom e Valentinos bloqueiam Heywood.',
  '[TRAUMA TEAM]: Assinaturas da Categoria Platina aumentam 15% este mês.',
] as const;

export const resolveTerminalCommand = (
  raw: string,
): { lines: TerminalLine[]; sideEffects?: ('breach' | 'ncpd' | 'clear') } => {
  const val = raw.trim().toLowerCase();
  if (val === 'help') {
    return {
      lines: [
        {
          text: 'Comandos disponíveis: scan, breach, ncpd, clear, status, neuralink',
          tone: 'yellow',
        },
      ],
    };
  }
  if (val === 'scan') {
    return {
      lines: [
        {
          text: 'Varrendo dispositivos locais... 3 Decks Encontrados. ICE Vulnerável.',
          tone: 'ok',
        },
      ],
    };
  }
  if (val === 'breach') {
    return { lines: [], sideEffects: 'breach' };
  }
  if (val === 'ncpd') {
    return { lines: [], sideEffects: 'ncpd' };
  }
  if (val === 'clear') {
    return { lines: [], sideEffects: 'clear' };
  }
  if (val === 'status') {
    return {
      lines: [
        {
          text: 'VTT Status: Normal. Latência: 12ms. Criptografia ativada.',
        },
      ],
    };
  }
  if (val === 'neuralink') {
    return {
      lines: [
        {
          text: 'Neuralink: jack estável. Carga cyberware 78% · risco psicose 24%.',
          tone: 'yellow',
        },
      ],
    };
  }
  return {
    lines: [
      {
        text: `Comando desconhecido: "${raw.trim()}". Digite 'help' para comandos.`,
        tone: 'red',
      },
    ],
  };
};
