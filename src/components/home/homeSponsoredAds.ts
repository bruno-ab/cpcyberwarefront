export type HomeSponsoredAdIcon = 'optics' | 'chip' | 'ripper' | 'music' | 'bolt';

export type HomeSponsoredAd = {
  id: string;
  title: string;
  copy: string;
  href: string;
  cta: string;
  icon: HomeSponsoredAdIcon;
  ariaLabel: string;
};

/** Pool de propagandas da landing — sorteio só no cliente (pós-mount). */
export const HOME_SPONSORED_ADS: HomeSponsoredAd[] = [
  {
    id: 'kiroshi-mk4',
    title: 'KIROSHI OPTICS MK.IV',
    copy:
      'Enxergue o invisível. Realidade aumentada com scanner de pontos fracos corporal.',
    href: '/catalog',
    cta: 'COMPRAR NA RIPPERDOC »',
    icon: 'optics',
    ariaLabel: 'Propaganda Kiroshi Optics',
  },
  {
    id: 'sandevistan-tsunami',
    title: 'SANDEVISTAN TSUNAMI RX-2',
    copy:
      'Congele a bala. Reflexo de combate certificado — estoque limitado no catálogo chrome.',
    href: '/catalog',
    cta: 'VER NO CATÁLOGO »',
    icon: 'bolt',
    ariaLabel: 'Propaganda Sandevistan',
  },
  {
    id: 'dynalar-neural',
    title: 'DYNALAR NEURAL BOOST v3',
    copy:
      'RAM extra para netrunners impacientes. Instalação recomendada com biomonitor ativo.',
    href: '/catalog',
    cta: 'SCANEAR PEÇAS »',
    icon: 'chip',
    ariaLabel: 'Propaganda Dynalar',
  },
  {
    id: 'viktor-ripper',
    title: 'CLÍNICA VIKTOR — WATSON',
    copy:
      'Upgrade sem fila de espera. Pacotes ripperdoc + consumíveis na loja da campanha.',
    href: '/shop',
    cta: 'ABRIR LOJA »',
    icon: 'ripper',
    ariaLabel: 'Propaganda ripperdoc Viktor',
  },
  {
    id: 'militech-smartlink',
    title: 'MILITECH SMART LINK MK.5',
    copy:
      'Sincronize ferro e implante. Linha tática para solos que ainda confiam no gatilho.',
    href: '/catalog',
    cta: 'EQUIPAR AGORA »',
    icon: 'chip',
    ariaLabel: 'Propaganda Militech Smart Link',
  },
  {
    id: 'samurai-never-fade',
    title: 'SAMURAI — «NEVER FADE AWAY»',
    copy:
      'Vinil pulp remaster 2077. Johnny Silverhand no vocais — faixa bônus «Chippin\' In» incluída. Antes da Arasaka apagar o disco.',
    href: '/lore',
    cta: 'LER LORE / SAMURAI »',
    icon: 'music',
    ariaLabel: 'Propaganda disco Samurai',
  },
];

/** Primeiro item — texto estável para SSR / pré-hidratação (popup oculto). */
export const HOME_SPONSORED_AD_PLACEHOLDER: HomeSponsoredAd = HOME_SPONSORED_ADS[0];

export const pickHomeSponsoredAd = (): HomeSponsoredAd =>
  HOME_SPONSORED_ADS[Math.floor(Math.random() * HOME_SPONSORED_ADS.length)];
