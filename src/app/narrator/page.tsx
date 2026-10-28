'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageFrame } from '../../components/layout/PageFrame';
import { HudPanel } from '../../components/ui/HudPanel';
import { HudButton } from '../../components/ui/HudButton';
import { useIsCampaignGm } from '../../hooks/useIsCampaignGm';
import { getAccessToken } from '../../lib/authSession';
import { apiUrl, authHeaders } from '../../lib/api';
import { useCampaign } from '../../lib/campaign';
import type { HeatEffects } from '../../lib/heat';
import { buildHeatEncounterText } from '../../lib/narratorEncounter';

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

const NarratorPage = () => {
  const router = useRouter();
  const { isGm, loading: gmLoading } = useIsCampaignGm();
  const { campaignId, effects, heat, refresh } = useCampaign();
  const [out, setOut] = useState('');
  const [assist, setAssist] = useState<any>(null);
  const [assistErr, setAssistErr] = useState('');
  const [encounterBusy, setEncounterBusy] = useState(false);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace('/login?next=/narrator');
      return;
    }
    if (!gmLoading && !isGm) {
      router.replace('/campaigns');
    }
  }, [gmLoading, isGm, router]);

  const rumor = () => {
    const subjects = ['drone Arasaka', 'convoy Raffen', 'shard Blackwall', 'fixer desaparecido'];
    const places = ['Watson', 'Pacífica', 'Badlands', 'Japantown'];
    setOut(`Rumor: Um ${pick(subjects)} foi visto em ${pick(places)}.`);
  };

  const npc = () => {
    const names = ['Kai', 'Nova', 'Rex', 'Suki', 'Dario'];
    const roles = ['Fixer', 'Ripper', 'Netrunner', 'Solo', 'Nomad'];
    setOut(`NPC: ${pick(names)} — ${pick(roles)}. Quer ¤${1000 + Math.floor(Math.random() * 4000)} ou um favor.`);
  };

  const encounter = async () => {
    setEncounterBusy(true);
    let liveEffects: HeatEffects | null = effects;
    try {
      if (!liveEffects) {
        const res = await fetch(apiUrl(`/api/campaigns/${campaignId}/heat`), {
          headers: authHeaders(),
        });
        if (res.ok) {
          const data = await res.json();
          liveEffects = data?.effects ?? null;
        }
        await refresh();
      }
    } catch {
      /* fallback below */
    } finally {
      setEncounterBusy(false);
    }
    setOut(buildHeatEncounterText(liveEffects ?? effects, heat));
  };

  const askClaude = async (type: 'npc' | 'gig' | 'rumor' | 'scene') => {
    setAssistErr('');
    setAssist(null);
    const res = await fetch(apiUrl('/api/gm/assist'), {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ type, prompt: out || undefined, campaignId }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setAssistErr(data.message || 'Assistente indisponível');
      return;
    }
    setAssist(data.draft);
  };

  if (gmLoading || !isGm) {
    return (
      <PageFrame>
        <HudPanel title="Ferramentas do Narrador">
          <p>Verificando acesso de narrador…</p>
          <Link href="/campaigns">
            <HudButton variant="ghost">Campanhas</HudButton>
          </Link>
        </HudPanel>
      </PageFrame>
    );
  }

  return (
    <PageFrame>
      <HudPanel title="Ferramentas do Narrador">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <HudButton onClick={rumor}>Gerar rumor</HudButton>
          <HudButton onClick={npc}>Gerar NPC</HudButton>
          <HudButton onClick={() => void encounter()} disabled={encounterBusy}>
            {encounterBusy ? 'Consultando heat…' : 'Gerar encontro'}
          </HudButton>
          <HudButton variant="ghost" onClick={() => askClaude('gig')}>
            Assist IA (gig)
          </HudButton>
          <HudButton variant="ghost" onClick={() => askClaude('npc')}>
            Assist IA (NPC)
          </HudButton>
        </div>
        {out && (
          <pre style={{ marginTop: '1rem', whiteSpace: 'pre-wrap' }}>{out}</pre>
        )}
        {assistErr && <p style={{ color: 'var(--cp-alert)' }}>{assistErr}</p>}
        {assist && (
          <div style={{ marginTop: '1rem', border: '1px solid var(--cp-magenta)', padding: '0.75rem' }}>
            <strong>Rascunho IA (editável)</strong>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(assist, null, 2)}</pre>
            <HudButton variant="ghost" onClick={() => setAssist(null)}>
              Descartar
            </HudButton>
          </div>
        )}
      </HudPanel>
    </PageFrame>
  );
};

export default NarratorPage;
