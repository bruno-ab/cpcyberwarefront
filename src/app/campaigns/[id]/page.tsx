'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { PageFrame } from '../../../components/layout/PageFrame';
import { HudPanel } from '../../../components/ui/HudPanel';
import { HudButton } from '../../../components/ui/HudButton';
import { useCampaign } from '../../../lib/campaign';
import { getAccessToken, getPlayerIdFromToken } from '../../../lib/authSession';
import {
  activateScene,
  createScene,
  fetchCampaignMembers,
  fetchCampaignNpcs,
  fetchCampaignScenes,
  fetchRoster,
  inviteToCampaign,
  linkCampaignByIdCard,
  addCharacterToRoster,
  removeCampaignMember,
  updateCampaign,
  type CampaignLinkConflict,
  type CampaignMember,
  type CampaignInvite,
  type CampaignNpc,
  type CampaignRow,
  type ScenesListResponse,
  type VttSceneSummary,
} from '../../../lib/campaignsApi';
import { apiUrl, authHeaders } from '../../../lib/api';
import { CampaignMigrationModal } from '../../../components/characters/CampaignMigrationModal';
import styles from '../campaigns.module.css';

const CampaignDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const campaignId = Number(params?.id);
  const { setCampaignId } = useCampaign();

  const [campaign, setCampaign] = useState<CampaignRow | null>(null);
  const [scenes, setScenes] = useState<VttSceneSummary[]>([]);
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null);
  const [rosterChars, setRosterChars] = useState<
    Array<{ id: string; name: string; role?: string }>
  >([]);
  const [npcs, setNpcs] = useState<CampaignNpc[]>([]);
  const [editName, setEditName] = useState('');
  const [sceneName, setSceneName] = useState('');
  const [sceneDesc, setSceneDesc] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [members, setMembers] = useState<CampaignMember[]>([]);
  const [pendingInvites, setPendingInvites] = useState<CampaignInvite[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePlayerId, setInvitePlayerId] = useState('');
  const [inviteIdCard, setInviteIdCard] = useState('');
  const [myCharacters, setMyCharacters] = useState<
    Array<{ id: string; name: string; idCard?: string | null; campaignId?: number | null }>
  >([]);
  const [joinCharacterId, setJoinCharacterId] = useState('');
  const [migration, setMigration] = useState<{
    open: boolean;
    conflict: CampaignLinkConflict | null;
    mode: 'card' | 'roster';
  }>({ open: false, conflict: null, mode: 'roster' });
  const [pageLoading, setPageLoading] = useState(true);

  const playerId = getPlayerIdFromToken();
  const isGm = campaign != null && Number(campaign.gmPlayerId) === playerId;
  const isMember =
    campaign != null &&
    playerId != null &&
    (isGm ||
      (campaign.memberPlayerIds || []).some((id) => Number(id) === playerId));

  const loadCampaign = useCallback(async () => {
    if (!Number.isFinite(campaignId) || campaignId <= 0) return;
    const res = await fetch(apiUrl(`/api/campaigns/${campaignId}`), {
      headers: authHeaders(),
    });
    if (res.status === 401) {
      router.replace('/login?next=/campaigns/' + campaignId);
      return;
    }
    if (res.status === 403) {
      setMsg('Sem acesso a esta campanha');
      setCampaign(null);
      return;
    }
    if (!res.ok) {
      setMsg('Não foi possível carregar esta campanha. Tente de novo em instantes.');
      setCampaign(null);
      return;
    }
    const row = (await res.json()) as CampaignRow;
    setCampaign(row);
    setEditName(row.name);
  }, [campaignId, router]);

  const loadScenes = useCallback(async () => {
    const data: ScenesListResponse | null = await fetchCampaignScenes(campaignId);
    if (!data) return;
    setScenes(data.scenes || []);
    setActiveSceneId(data.activeSceneId);
  }, [campaignId]);

  const loadRoster = useCallback(async () => {
    const data = await fetchRoster(campaignId);
    if (data?.characters) setRosterChars(data.characters);
  }, [campaignId]);

  const loadNpcs = useCallback(async () => {
    setNpcs(await fetchCampaignNpcs(campaignId));
  }, [campaignId]);

  const loadMembers = useCallback(async () => {
    const data = await fetchCampaignMembers(campaignId);
    if (!data) return;
    setMembers(data.members || []);
    setPendingInvites(data.pendingInvites || []);
  }, [campaignId]);

  const loadMyCharacters = useCallback(async () => {
    if (!getAccessToken() || !playerId) {
      setMyCharacters([]);
      return;
    }
    try {
      const res = await fetch(apiUrl('/api/characters'), {
        headers: authHeaders(),
      });
      if (!res.ok) return;
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setMyCharacters(
        list
          .filter((c: { player_id?: number }) => Number(c.player_id) === playerId)
          .map((c: { id: string; name: string; id_card?: string; idCard?: string; campaign_id?: number | null; campaignId?: number | null }) => ({
            id: String(c.id),
            name: c.name,
            idCard: c.idCard ?? c.id_card ?? null,
            campaignId: c.campaignId ?? c.campaign_id ?? null,
          })),
      );
    } catch {
      setMyCharacters([]);
    }
  }, [playerId]);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace('/login?next=/campaigns/' + campaignId);
      return;
    }
    setPageLoading(true);
    void (async () => {
      await Promise.all([
        loadCampaign(),
        loadScenes(),
        loadRoster(),
        loadNpcs(),
        loadMembers(),
        loadMyCharacters(),
      ]);
      setPageLoading(false);
    })();
  }, [
    campaignId,
    router,
    loadCampaign,
    loadScenes,
    loadRoster,
    loadNpcs,
    loadMembers,
    loadMyCharacters,
  ]);

  const openTable = (scene?: VttSceneSummary) => {
    setCampaignId(campaignId);
    if (scene?.id) {
      try {
        localStorage.setItem(`cp-vtt-scene-${campaignId}`, scene.id);
      } catch {
        /* ignore */
      }
    }
    router.push('/table');
  };

  const onSaveName = async (e: FormEvent) => {
    e.preventDefault();
    if (!isGm || !editName.trim()) return;
    setBusy(true);
    const updated = await updateCampaign(campaignId, { name: editName.trim() });
    setBusy(false);
    if (updated) {
      setCampaign(updated);
      setMsg('Campanha atualizada.');
    }
  };

  const onCreateScene = async (e: FormEvent) => {
    e.preventDefault();
    if (!isGm || !sceneName.trim()) return;
    setBusy(true);
    await createScene(campaignId, {
      name: sceneName.trim(),
      description: sceneDesc.trim(),
    });
    setSceneName('');
    setSceneDesc('');
    await loadScenes();
    setBusy(false);
    setMsg('Cena criada.');
  };

  const onActivate = async (sceneId: string) => {
    if (!isGm) return;
    setBusy(true);
    await activateScene(campaignId, sceneId);
    await loadScenes();
    setBusy(false);
  };

  const onInvite = async (e: FormEvent) => {
    e.preventDefault();
    if (!isGm) return;
    const email = inviteEmail.trim();
    const pid = invitePlayerId.trim()
      ? Number(invitePlayerId.trim())
      : undefined;
    if (!email && !pid) return;
    setBusy(true);
    const row = await inviteToCampaign(campaignId, {
      email: email || undefined,
      playerId: pid,
    });
    setBusy(false);
    if (!row) {
      setMsg('Falha ao convidar (jogador já membro ou convite duplicado?).');
      return;
    }
    setInviteEmail('');
    setInvitePlayerId('');
    setMsg('Convite enviado.');
    await loadMembers();
  };

  const runIdCardLink = async (confirmMigration: boolean) => {
    const card = inviteIdCard.trim();
    if (!card) return;
    setBusy(true);
    const result = await linkCampaignByIdCard(campaignId, card, confirmMigration);
    setBusy(false);
    if (result.ok) {
      setInviteIdCard('');
      setMigration({ open: false, conflict: null, mode: 'card' });
      setMsg('Personagem vinculado ao roster.');
      await loadRoster();
      await loadMembers();
      return;
    }
    if ('needsConfirm' in result && result.needsConfirm) {
      setMigration({ open: true, conflict: result.needsConfirm, mode: 'card' });
      return;
    }
    setMsg('error' in result ? result.error : 'Falha ao vincular ID-card.');
  };

  const onLinkByIdCard = async (e: FormEvent) => {
    e.preventDefault();
    if (!isGm) return;
    await runIdCardLink(false);
  };

  const runRosterJoin = async (confirmMigration: boolean) => {
    const cid = joinCharacterId.trim();
    if (!cid) return;
    setBusy(true);
    const result = await addCharacterToRoster(campaignId, cid, confirmMigration);
    setBusy(false);
    if (result.ok) {
      setJoinCharacterId('');
      setMigration({ open: false, conflict: null, mode: 'roster' });
      setMsg('Personagem entrou no roster.');
      await loadRoster();
      await loadMyCharacters();
      return;
    }
    if ('needsConfirm' in result && result.needsConfirm) {
      setMigration({ open: true, conflict: result.needsConfirm, mode: 'roster' });
      return;
    }
    setMsg('error' in result ? result.error : 'Falha ao vincular personagem.');
  };

  const onJoinWithCharacter = async (e: FormEvent) => {
    e.preventDefault();
    if (!isMember || isGm) return;
    await runRosterJoin(false);
  };

  const onConfirmMigration = async () => {
    if (migration.mode === 'card') await runIdCardLink(true);
    else await runRosterJoin(true);
  };

  const onRemoveMember = async (memberPlayerId: number) => {
    if (!isGm) return;
    setBusy(true);
    const ok = await removeCampaignMember(campaignId, memberPlayerId);
    setBusy(false);
    setMsg(ok ? 'Jogador removido.' : 'Falha ao remover jogador.');
    if (ok) {
      await loadMembers();
      await loadRoster();
    }
  };

  const activeScene = useMemo(
    () => scenes.find((s) => s.id === activeSceneId) || scenes.find((s) => s.active),
    [scenes, activeSceneId],
  );

  if (!Number.isFinite(campaignId)) {
    return (
      <PageFrame>
        <p className={styles.empty}>Campanha inválida.</p>
      </PageFrame>
    );
  }

  return (
    <PageFrame>
      <div className={styles.page}>
        <Link href="/campaigns" className={styles.back}>
          ← Campanhas
        </Link>

        <header className={styles.hero}>
          <h1>{campaign?.name || `Campanha ${campaignId}`}</h1>
          <p>
            {pageLoading
              ? 'Carregando dados da campanha…'
              : `${isGm ? 'Modo Narrador' : 'Modo Jogador'} · ID ${campaignId}${
                  activeScene ? ` · Cena ativa: ${activeScene.name}` : ''
                }`}
          </p>
          {campaign && !pageLoading ? (
            <div
              className={
                isGm
                  ? `${styles.heroActions} ${styles.heroActionsSticky}`
                  : styles.heroActions
              }
            >
              <HudButton type="button" onClick={() => openTable(activeScene || undefined)}>
                Abrir mesa
              </HudButton>
              <Link href={`/campaigns/${campaignId}/wanted`}>
                <HudButton variant="ghost">Procurados</HudButton>
              </Link>
              {isGm ? (
                <Link href="#convites-campanha">
                  <HudButton variant="ghost">Convidar jogadores</HudButton>
                </Link>
              ) : null}
            </div>
          ) : null}
        </header>

        {pageLoading ? (
          <div className={styles.skeletonGrid} aria-busy="true">
            <div className={styles.skeletonCard} />
            <div className={styles.skeletonCard} />
          </div>
        ) : null}

        {msg ? <p className={styles.status}>{msg}</p> : null}

        {!pageLoading && !campaign && msg ? (
          <HudPanel title="Acesso">
            <p className={styles.empty}>{msg}</p>
            <div className={styles.ctaRow}>
              <Link href="/campaigns">
                <HudButton variant="ghost">Voltar às campanhas</HudButton>
              </Link>
            </div>
          </HudPanel>
        ) : null}

        {!pageLoading && campaign && isGm && (
          <HudPanel title="Informações da campanha">
            <form className={styles.formRow} onSubmit={onSaveName}>
              <input
                value={editName}
                onChange={(ev) => setEditName(ev.target.value)}
                aria-label="Nome da campanha"
              />
              <HudButton type="submit" disabled={busy}>
                Salvar
              </HudButton>
            </form>
          </HudPanel>
        )}

        {!pageLoading && campaign ? (
          <div id="convites-campanha">
            <HudPanel title={isGm ? 'Convites / Jogadores' : 'Jogadores'}>
              {isGm ? (
                <>
                  <p className={styles.inviteHint}>
                    Envie convites por e-mail ou pelo ID numérico da conta (em
                    Conta). Jogadores aceitam em Campanhas → Convites pendentes.
                  </p>
                  <form className={styles.formRow} onSubmit={onInvite}>
                    <input
                      value={inviteEmail}
                      onChange={(ev) => setInviteEmail(ev.target.value)}
                      placeholder="E-mail do jogador"
                      type="email"
                      aria-label="E-mail do jogador"
                    />
                    <input
                      value={invitePlayerId}
                      onChange={(ev) => setInvitePlayerId(ev.target.value)}
                      placeholder="ID do jogador (opcional)"
                      inputMode="numeric"
                      aria-label="ID do jogador"
                    />
                    <HudButton type="submit" disabled={busy}>
                      Enviar convite
                    </HudButton>
                  </form>
                  <p className={styles.inviteHint}>
                    Ou vincule um personagem pelo ID-card (NC-XXXXXXXX) — o dono
                    entra como membro se ainda não estiver na campanha.
                  </p>
                  <form className={styles.formRow} onSubmit={onLinkByIdCard}>
                    <input
                      value={inviteIdCard}
                      onChange={(ev) => setInviteIdCard(ev.target.value.toUpperCase())}
                      placeholder="ID-card do personagem (NC-…)"
                      aria-label="ID-card do personagem"
                      autoComplete="off"
                    />
                    <HudButton type="submit" disabled={busy}>
                      Vincular ID-card
                    </HudButton>
                  </form>
                </>
              ) : null}

              <h3 className={styles.sectionTitle}>Membros</h3>
              {members.length === 0 ? (
                <p className={styles.empty}>Nenhum jogador na campanha ainda.</p>
              ) : (
                <ul className={styles.list}>
                  {members.map((m) => (
                    <li key={m.playerId} className={styles.listItem}>
                      <div>
                        <strong>{m.name}</strong>
                        <span className={styles.badge}>
                          {m.role === 'gm' ? 'Narrador' : 'Jogador'}
                        </span>
                        {m.email ? (
                          <p className={styles.meta}>{m.email}</p>
                        ) : null}
                      </div>
                      {isGm && m.role !== 'gm' ? (
                        <HudButton
                          variant="ghost"
                          type="button"
                          disabled={busy}
                          onClick={() => onRemoveMember(m.playerId)}
                        >
                          Remover
                        </HudButton>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}

              {isGm ? (
                <>
                  <h3 className={styles.sectionTitle}>Convites pendentes</h3>
                  {pendingInvites.length === 0 ? (
                    <p className={styles.empty}>Nenhum convite pendente.</p>
                  ) : (
                    <ul className={styles.list}>
                      {pendingInvites.map((inv) => (
                        <li key={inv.id} className={styles.listItem}>
                          <span>
                            {inv.email ||
                              `Jogador #${inv.invitedPlayerId || '?'}`}
                          </span>
                          <span className={styles.meta}>pendente</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : null}
            </HudPanel>
          </div>
        ) : null}

        {!pageLoading && campaign ? (
        <HudPanel title="Cenas VTT">
          {isGm && (
            <form className={styles.formRow} onSubmit={onCreateScene}>
              <input
                value={sceneName}
                onChange={(ev) => setSceneName(ev.target.value)}
                placeholder="Nome da cena"
                required
              />
              <input
                value={sceneDesc}
                onChange={(ev) => setSceneDesc(ev.target.value)}
                placeholder="Descrição (opcional)"
              />
              <HudButton type="submit" disabled={busy}>
                Nova cena
              </HudButton>
            </form>
          )}
          {scenes.length === 0 ? (
            <>
              <p className={styles.empty}>
                {isGm
                  ? 'Crie a primeira cena para abrir a mesa virtual.'
                  : 'O narrador ainda não criou cenas para esta campanha.'}
              </p>
              {isGm ? (
                <p className={styles.inviteHint}>
                  Use o formulário acima ou peça ao grupo para entrar enquanto
                  você prepara o mapa.
                </p>
              ) : null}
            </>
          ) : (
            <ul className={styles.list}>
              {scenes.map((scene) => (
                <li key={scene.id} className={styles.listItem}>
                  <div>
                    <strong>{scene.name}</strong>
                    {scene.active || scene.id === activeSceneId ? (
                      <span className={styles.badge}>ativa</span>
                    ) : null}
                    {scene.description ? (
                      <p className={styles.meta}>{scene.description}</p>
                    ) : null}
                  </div>
                  <div className={styles.actions}>
                    {isGm && !scene.active && scene.id !== activeSceneId ? (
                      <HudButton
                        variant="ghost"
                        type="button"
                        disabled={busy}
                        onClick={() => onActivate(scene.id)}
                      >
                        Ativar
                      </HudButton>
                    ) : null}
                    <HudButton type="button" onClick={() => openTable(scene)}>
                      Abrir mesa
                    </HudButton>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </HudPanel>
        ) : null}

        {!pageLoading && campaign ? (
        <div id="roster-campanha">
        <HudPanel title="Roster (personagens)">
          {isMember && !isGm && myCharacters.length > 0 ? (
            <form className={styles.formRow} onSubmit={onJoinWithCharacter}>
              <select
                value={joinCharacterId}
                onChange={(ev) => setJoinCharacterId(ev.target.value)}
                aria-label="Personagem para entrar no roster"
                required
              >
                <option value="">Entrar com personagem…</option>
                {myCharacters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {c.campaignId && Number(c.campaignId) !== campaignId
                      ? ' (outra campanha)'
                      : ''}
                    {c.idCard ? ` · ${c.idCard}` : ''}
                  </option>
                ))}
              </select>
              <HudButton type="submit" disabled={busy}>
                Vincular
              </HudButton>
            </form>
          ) : null}
          {rosterChars.length === 0 ? (
            <>
              <p className={styles.empty}>
                Nenhum personagem no roster desta campanha.
                {isMember
                  ? ' Crie uma ficha, use Personagens → ID-card ou entre com um personagem acima.'
                  : ' Aceite o convite do narrador antes de vincular personagem.'}
              </p>
              {isMember ? (
                <div className={styles.ctaRow}>
                  <Link href={`/campaigns/${campaignId}/create-character`}>
                    <HudButton>Criar personagem</HudButton>
                  </Link>
                  <Link href="/characters/create">
                    <HudButton variant="ghost">Nova ficha (sem campanha)</HudButton>
                  </Link>
                </div>
              ) : null}
            </>
          ) : (
            <ul className={styles.list}>
              {rosterChars.map((c) => (
                <li key={c.id} className={styles.listItem}>
                  <span>
                    <strong>{c.name}</strong>
                    {c.role ? ` · ${c.role}` : ''}
                  </span>
                  <Link href={`/sheet?id=${encodeURIComponent(String(c.id))}`}>
                    Abrir ficha
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </HudPanel>
        </div>
        ) : null}

        {!pageLoading && campaign ? (
        <HudPanel title="NPCs da campanha">
          {npcs.length === 0 ? (
            <p className={styles.empty}>
              Nenhum NPC vinculado (`npcIds`). Edite via API ou seed demo.
            </p>
          ) : (
            <div className={styles.npcGrid}>
              {npcs.map((npc) => (
                <article key={npc.id} className={styles.npcCard}>
                  <h4>{npc.name}</h4>
                  <p className={styles.meta}>
                    {npc.role} · {npc.affiliation} · {npc.threat}
                  </p>
                  <p>{npc.summary}</p>
                  <Link href={`/npcs/${npc.id}`}>Ficha</Link>
                </article>
              ))}
            </div>
          )}
        </HudPanel>
        ) : null}

        {!pageLoading && campaign ? (
        <div className={styles.actions}>
          <HudButton type="button" onClick={() => openTable(activeScene || undefined)}>
            Abrir mesa (cena ativa)
          </HudButton>
        </div>
        ) : null}
        <CampaignMigrationModal
          open={migration.open}
          conflict={migration.conflict}
          busy={busy}
          onConfirm={() => void onConfirmMigration()}
          onCancel={() =>
            setMigration({ open: false, conflict: null, mode: 'roster' })
          }
        />
      </div>
    </PageFrame>
  );
};

export default CampaignDetailPage;
