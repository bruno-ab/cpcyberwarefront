'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { PageFrame } from '../../components/layout/PageFrame';
import { HudPanel } from '../../components/ui/HudPanel';
import { HudButton } from '../../components/ui/HudButton';
import { getAccessToken, getPlayerIdFromToken } from '../../lib/authSession';
import {
  acceptCampaignInvite,
  createCampaign,
  declineCampaignInvite,
  fetchMineCampaigns,
  fetchMyCampaignInvites,
  type CampaignInvite,
  type CampaignRow,
  type MineCampaignsResponse,
} from '../../lib/campaignsApi';
import { authLoginHref } from '../../lib/authRoutes';
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
        <HudButton variant="ghost">Ver campanha</HudButton>
      </Link>
      {badge === 'Player' ? (
        <Link href={`/campaigns/${campaign.id}#roster-campanha`}>
          <HudButton type="button">Entrar com personagem</HudButton>
        </Link>
      ) : null}
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
  const [invites, setInvites] = useState<CampaignInvite[]>([]);
  const [invitesError, setInvitesError] = useState<string | null>(null);

  const playerId = useMemo(() => getPlayerIdFromToken(), [hasToken]);

  const reload = useCallback(async () => {
    setLoading(true);
    setMsg('');
    const token = getAccessToken();
    setHasToken(!!token);
    if (!token) {
      setMine(null);
      setInvites([]);
      setInvitesError(null);
      setLoading(false);
      return;
    }
    const [data, pending] = await Promise.all([
      fetchMineCampaigns(),
      fetchMyCampaignInvites(),
    ]);
    setMine(data);
    setInvites(pending.invites);
    setInvitesError(pending.error);
    setLoading(false);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    const onFocus = () => void reload();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [reload]);

  const onAcceptInvite = async (inviteId: number) => {
    const ok = await acceptCampaignInvite(inviteId);
    setMsg(ok ? 'Convite aceito.' : 'Falha ao aceitar convite.');
    setOk(ok);
    await reload();
  };

  const onDeclineInvite = async (inviteId: number) => {
    const ok = await declineCampaignInvite(inviteId);
    setMsg(ok ? 'Convite recusado.' : 'Falha ao recusar convite.');
    setOk(ok);
    await reload();
  };

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
              <Link href={authLoginHref('/campaigns')}>
                <HudButton>Entrar na conta</HudButton>
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

            <HudPanel title="Convites pendentes">
              {loading ? (
                <div className={styles.skeletonGrid} aria-busy="true">
                  <div className={styles.skeletonCard} />
                  <div className={styles.skeletonCard} />
                </div>
              ) : invitesError ? (
                <p className={styles.status} data-ok={false}>
                  {invitesError}
                </p>
              ) : invites.length === 0 ? (
                <p className={styles.empty}>
                  Nenhum convite pendente. O narrador envia convites pelo e-mail
                  ou ID do jogador na página da campanha.
                </p>
              ) : (
                <ul className={styles.list}>
                  {invites.map((inv) => (
                    <li key={inv.id} className={styles.listItem}>
                      <div>
                        <strong>{inv.campaignName || `Campanha ${inv.campaignId}`}</strong>
                        <p className={styles.meta}>
                          Narrador: {inv.gmName || '—'}
                          {inv.email ? ` · ${inv.email}` : ''}
                        </p>
                      </div>
                      <div className={styles.actions}>
                        <HudButton
                          type="button"
                          onClick={() => onAcceptInvite(inv.id)}
                        >
                          Aceitar
                        </HudButton>
                        <HudButton
                          variant="ghost"
                          type="button"
                          onClick={() => onDeclineInvite(inv.id)}
                        >
                          Recusar
                        </HudButton>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </HudPanel>

            <HudPanel title="Minhas campanhas (Narrador)">
              {loading ? (
                <div className={styles.skeletonGrid} aria-busy="true">
                  <div className={styles.skeletonCard} />
                  <div className={styles.skeletonCard} />
                </div>
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
                <div className={styles.skeletonGrid} aria-busy="true">
                  <div className={styles.skeletonCard} />
                </div>
              ) : playerOnly.length === 0 ? (
                <p className={styles.empty}>
                  Você ainda não participa de campanhas como jogador. Aceite um
                  convite acima ou peça ao narrador para te adicionar.
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
