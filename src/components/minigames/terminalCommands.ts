export type TerminalMission = {
  id: string;
  title: string;
  ascii: string;
  commands: string[];
  timeSec: number;
  blurb: string;
};

export const TERMINAL_MISSIONS: TerminalMission[] = [
  {
    id: 'jack-in',
    title: 'JACK-IN · Watson',
    blurb: 'Conecte o deck antes da patrulha NCPD varrer a rede.',
    timeSec: 75,
    ascii: `
    .--.
   |o_o |
   |:_/ |
  //   \\ \\
 (|     | )
/'\\_   _/\`\\
\\___)=(___/
`,
    commands: [
      'ssh netrunner@watson-node-07',
      'sudo mount /dev/ice0 /mnt/breach',
      'icebreak --soft --target cam-loop',
      'exfil --shard streetcred.dump',
      'jackout --clean',
    ],
  },
  {
    id: 'arasaka',
    title: 'PROBE · Arasaka Tower',
    blurb: 'Pingue o perímetro corporativo. Um typo e o NetWatch acorda.',
    timeSec: 60,
    ascii: `
   /\\_/\\
  ( ◕‿◕ )
  /  |  \\   ARASAKA
 /__/|__\\  TOWER NET
`,
    commands: [
      'traceroute arasaka.corp.nc',
      'spoof --badge level=contractor',
      'disable ice --layer perimeter',
      'datamine /vault/q104/ledger',
      'covertracks --hours 6',
      'logout --force',
    ],
  },
  {
    id: 'braindance',
    title: 'BD EDIT · Afterlife',
    blurb: 'Remonte o braindance do cliente do fixer antes do show.',
    timeSec: 90,
    ascii: `
  .----.
 / .--. \\
| |    | |  BRAINDANCE
| |.--.| |   WORKBENCH
 \\ '--' /
  '----'
`,
    commands: [
      'bdload client_raw.bd',
      'scrub trauma --threshold 0.4',
      'inject overlay afterlife_neon',
      'calibrate empathy_track',
      'export --format street',
      'upload fixer@afterlife',
    ],
  },
  {
    id: 'blackwall',
    title: 'BLACKWALL · Não deveria',
    blurb: 'Toque e recue. Digite certo ou a IA te puxa.',
    timeSec: 45,
    ascii: `
 ████████
██ ▓▓ ▓▓ ██
██  ▄▄  ██   BLACKWALL
██ ▀▀▀▀ ██
 ████████
`,
    commands: [
      'warn --severity blackwall',
      'open tunnel --depth 1',
      'ping rogue.ai --ttl 2',
      'pull --bytes 64 --abort-on-scream',
      'seal tunnel --burn',
      'jackout --panic',
    ],
  },
  {
    id: 'militech',
    title: 'VAN · Militech convoy',
    blurb: 'Hack da van blindada em movimento. Velocidade de digitação = vida.',
    timeSec: 55,
    ascii: `
 ______
| mil  |__
|______|  \\___
  o  o   o  o
`,
    commands: [
      'scan convoy --freq militech',
      'jam radio --band tactical',
      'unlock rear_hatch',
      'loot crate --id chrome-alpha',
      'plant decoy heat_sig',
      'escape --route alley-3',
    ],
  },
];
