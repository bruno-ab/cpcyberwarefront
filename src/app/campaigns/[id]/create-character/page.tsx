'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { PageFrame } from '../../../../components/layout/PageFrame';
import { HudButton } from '../../../../components/ui/HudButton';
import { CharacterWizard } from '../../../characters/CharacterWizard';
import charStyles from '../../../characters/characters.module.css';
import { apiUrl, authHeaders } from '../../../../lib/api';
import { getAccessToken, getPlayerIdFromToken } from '../../../../lib/authSession';
import type { CampaignRow } from '../../../../lib/campaignsApi';
import styles from '../../campaigns.module.css';

const CreateCharacterInCampaignPage = () => {
  const params = useParams();
  const router = useRouter();
  const campaignId = Number(params?.id);
  const playerId = getPlayerIdFromToken();

  const [campaign, setCampaign] = useState<CampaignRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState('');

  const isMember = useMemo(() => {
    if (!campaign || !playerId) return false;
    if Number(campaign.gmPlayerId) === playerId) return true;
    return (campaign.memberPlayerIds || []).some(
      (id) => Number(id) === playerId,
    );
  }, [campaign, playerId]);

  const load = useCallback(async () => {
    if (!Number.isFinite(campaignId) || campaignId <= 0) return;
    const res = await fetch(apiUrl(`/api/campaigns/${campaignId}`), {
      headers: authHeaders(),
    });
    if (res.status === 401) {
      router.replace(`/login?next=/campaigns/${campaignId}/create-character`);
      return;
    }
    if (res.status === 403 || !res.ok) {
      setDenied(
        'Sem acesso a esta campanha. Peça um convite ao narrador em Campanhas.',
      );
      setCampaign(null);
      return;
    }
    setCampaign((await res.json()) as CampaignRow);
  }, [campaignId, router]);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace(`/login?next=/campaigns/${campaignId}/create-character`);
      return;
    }
    void (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, [campaignId, load, router]);

  if (loading) {
    return (
      <PageFrame>
        <p className={charStyles.status}>Carregando campanha…</p>
      </PageFrame>
    );
  }

  if (denied || !campaign) {
    return (
      <PageFrame>
        <div className={styles.page}>
          <p className={styles.empty}>{denied || 'Campanha não encontrada.'}</p>
          <Link href="/campaigns">
            <HudButton variant="ghost">Voltar às campanhas</HudButton>
          </Link>
        </div>
      </PageFrame>
    );
  }

  if (!isMember) {
    return (
      <PageFrame>
        <div className={styles.page}>
          <p className={styles.empty}>
            Você precisa aceitar o convite desta campanha antes de criar um
            personagem. Peça ao narrador um invite pelo e-mail da sua conta.
          </p>
          <Link href={`/campaigns/${campaignId}`}>
            <HudButton variant="ghost">Voltar à campanha</HudButton>
          </Link>
        </div>
      </PageFrame>
    );
  }

  return (
    <PageFrame>
      <div className={charStyles.page}>
        <header className={charStyles.hero}>
          <div>
            <h1>Criar personagem</h1>
            <p>
              Campanha <strong>{campaign.name}</strong>. A ficha entra no roster
              desta mesa — um personagem por campanha.
            </p>
          </div>
          <Link href={`/campaigns/${campaignId}`}>
            <HudButton variant="ghost">Cancelar</HudButton>
          </Link>
        </header>
        <CharacterWizard campaignId={campaignId} />
      </div>
    </PageFrame>
  );
};

export default CreateCharacterInCampaignPage;
