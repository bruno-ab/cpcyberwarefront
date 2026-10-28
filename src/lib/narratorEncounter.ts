import type { CampaignHeat, HeatEffects } from './heat';
import { DEFAULT_HEAT } from './heat';

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const FALLBACK_HOOKS = [
  'emboscada de gangue em beco iluminado por neon',
  'checkpoint NCPD com scanner térmico',
  'corrido de BD pirata transmitido ao vivo',
  'ICE agressivo em terminal público',
  'drone de patrulha corporativa',
  'fixer pedindo favores com prazo impossível',
];

const HOOKS_BY_ENCOUNTER: Record<string, string[]> = {
  calm: [
    'patrulha de rotina que pode virar abordagem',
    'vendedor ambulante com mercadoria quente',
    'drone de entrega desviado do trajeto',
  ],
  watchful: [
    'scanner NCPD em cruzamento movimentado',
    'informante corporativo pedindo identificação',
    'câmera de reconhecimento facial piscando alerta',
  ],
  hot: [
    'unidade MaxTac em posição de contenção',
    'emboscada de gangue alinhada com heat recente',
    'checkpoint relâmpago — revista total',
  ],
  'corpo-hunt': [
    'equipe de recuperação de ativos Militech/Arasaka',
    'ICE de rastreio ligado a contrato corporativo',
    'drone hunter-killer em modo agressivo',
  ],
  'media-swarm': [
    'equipe N54 filmando sem permissão',
    'influencer ao vivo expondo a crew',
    'helicóptero de mídia bloqueando rotas de fuga',
  ],
};

export const buildHeatEncounterText = (
  effects: HeatEffects | null | undefined,
  heat: CampaignHeat | null | undefined,
): string => {
  const h = heat || DEFAULT_HEAT;
  const tableKey = (effects?.encounter || 'watchful').toLowerCase();
  const hooks =
    HOOKS_BY_ENCOUNTER[tableKey] ||
    HOOKS_BY_ENCOUNTER.watchful ||
    FALLBACK_HOOKS;
  const hook = pick(hooks.length ? hooks : FALLBACK_HOOKS);
  const blurb = effects?.encounterBlurb?.trim();
  const heatLine = `Heat — polícia ${h.police}/5 · corpo ${h.corpo} · mídia ${h.media}.`;
  if (blurb) {
    return `Encontro [${tableKey} · ${blurb}]: ${hook}.\n${heatLine}`;
  }
  return `Encontro: ${hook}.\n${heatLine}`;
};
