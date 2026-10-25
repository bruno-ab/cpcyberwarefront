'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { PageFrame } from '../../components/layout/PageFrame';
import { HudPanel } from '../../components/ui/HudPanel';
import { HudButton } from '../../components/ui/HudButton';
import { getAccessToken, getPlayerIdFromToken } from '../../lib/authSession';
import {
  createCampaign,
  fetchMineCampaigns,
  type CampaignRow,
  type MineCampaignsResponse,
} from '../../lib/campaignsApi';
import styles from './campaigns.module.css';

const CampaignCard = ({
  campaign,
  badge,
}: {
  campaign: CampaignRow;
  badge?: string;
}) => (
  <article className={styles.card}>
    <div>
      <h3>
        {campaign.name}
        {badge ? <span className={styles.badge}>{badge}</span> : null}
      </h3>
      <p className={styles.meta}>
        ID {campaign.id} · Street Cred {campaign.streetCred ?? 0} · ¤
        {campaign.eddies ?? 0}
      </p>
    </div>
    <div className={styles.actions}>
      <Link href={`/campaigns/${campaign.id}`}>
        <HudButton variant="ghost">Abrir</HudButton>
      </Link>
    </div>
  </article>
);

const CampaignsPage = () => {
  const [mine, setMine] = useState<MineCampaignsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [msg, setMsg] = useState('');
  const [ok, setOk] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  const playerId = useMemo(() => getPlayerIdFromToken(), [hasToken]);

  const reload = useCallback(async () => {
    setLoading(true);
    setMsg('');
    const token = getAccessToken();
    setHasToken(!!token);
    if (!token) {
      setMine(null);
      setLoading(false);
      return;
    }
    const data = await fetchMineCampaigns();
    setMine(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setMsg('');
    const created = await createCampaign(name);
    if (!created) {
      setOk(false);
      setMsg('Falha ao criar campanha. Você está logado como GM?');
      return;
    }
    setOk(true);
    setMsg(`Campanha "${created.name}" criada.`);
    setNewName('');
    await reload();
  };

  const gmOnly = mine?.asGm ?? [];
  const playerOnly = useMemo(() => {
    const gmIds = new Set(gmOnly.map((c) => c.id));
    return (mine?.asPlayer ?? []).filter((c) => !gmIds.has(c.id));
  }, [mine?.asPlayer, gmOnly]);

  return (
    <PageFrame>
      <div className={styles.page}>
        <header className={styles.hero}>
          <h1>Campanhas</h1>
          <p>
            Gerencie mesas como Narrador ou entre nas campanhas em que seu
            personagem está no roster.
          </p>
        </header>

        {!hasToken && (
          <HudPanel title="Sessão">
            <p className={styles.empty}>
              Faça login para ver campanhas vinculadas à sua conta.
            </p>
            <div className={styles.actions}>
              <Link href="/login">
                <HudButton>Jack in</HudButton>
              </Link>
            </div>
          </HudPanel>
        )}

        {hasToken && (
          <>
            <HudPanel title="Nova campanha (Narrador)">
              <p className={styles.meta}>
                Conta #{playerId || '—'} — campanhas criadas aqui ficam sob seu
                GM.
              </p>
              <form className={styles.formRow} onSubmit={onCreate}>
                <input
                  value={newName}
                  onChange={(ev) => setNewName(ev.target.value)}
                  placeholder="Nome da campanha"
                  maxLength={80}
                  required
                />
                <HudButton type="submit">Criar</HudButton>
              </form>
              {msg ? (
                <p className={styles.status} data-ok={ok}>
                  {msg}
                </p>
              ) : null}
            </HudPanel>

            <HudPanel title="Minhas campanhas (Narrador)">
              {loading ? (
                <p className={styles.status}>Carregando…</p>
              ) : gmOnly.length === 0 ? (
                <p className={styles.empty}>
                  Nenhuma campanha como GM. Crie uma acima ou rode o seed demo.
                </p>
              ) : (
                <div className={styles.grid}>
                  {gmOnly.map((c) => (
                    <CampaignCard key={c.id} campaign={c} badge="GM" />
                  ))}
                </div>
              )}
            </HudPanel>

            <HudPanel title="Campanhas do jogador">
              {loading ? (
                <p className={styles.status}>Carregando…</p>
              ) : playerOnly.length === 0 ? (
                <p className={styles.empty}>
                  Seu personagem ainda não está em nenhum roster de campanha.
                </p>
              ) : (
                <div className={styles.grid}>
                  {playerOnly.map((c) => (
                    <CampaignCard key={c.id} campaign={c} badge="Player" />
                  ))}
                </div>
              )}
            </HudPanel>
          </>
        )}
      </div>
    </PageFrame>
  );
};

export default CampaignsPage;
