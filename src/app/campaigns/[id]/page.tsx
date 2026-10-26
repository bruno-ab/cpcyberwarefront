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
  removeCampaignMember,
  updateCampaign,
  type CampaignMember,
  type CampaignInvite,
  type CampaignNpc,
  type CampaignRow,
  type ScenesListResponse,
  type VttSceneSummary,
} from '../../../lib/campaignsApi';
import { apiUrl, authHeaders } from '../../../lib/api';
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
  const [pageLoading, setPageLoading] = useState(true);

  const playerId = getPlayerIdFromToken();
  const isGm = campaign != null && Number(campaign.gmPlayerId) === playerId;

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
            <div className={styles.heroActions}>
              <HudButton type="button" onClick={() => openTable(activeScene || undefined)}>
                Abrir mesa
              </HudButton>
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
        <HudPanel title="Jogadores">
          {members.length === 0 ? (
            <p className={styles.empty}>Nenhum jogador listado.</p>
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
        </HudPanel>
        ) : null}

        {!pageLoading && campaign && isGm ? (
          <div id="convites-campanha">
          <HudPanel title="Convites">
            <p className={styles.inviteHint}>
              Convide por e-mail ou pelo ID numérico da conta do jogador (visível
              em Conta). Convites pendentes aparecem abaixo.
            </p>
            <form className={styles.formRow} onSubmit={onInvite}>
              <input
                value={inviteEmail}
                onChange={(ev) => setInviteEmail(ev.target.value)}
                placeholder="E-mail do jogador"
                type="email"
              />
              <input
                value={invitePlayerId}
                onChange={(ev) => setInvitePlayerId(ev.target.value)}
                placeholder="ID do jogador (opcional)"
                inputMode="numeric"
              />
              <HudButton type="submit" disabled={busy}>
                Convidar
              </HudButton>
            </form>
            {pendingInvites.length === 0 ? (
              <p className={styles.empty}>Nenhum convite pendente.</p>
            ) : (
              <ul className={styles.list}>
                {pendingInvites.map((inv) => (
                  <li key={inv.id} className={styles.listItem}>
                    <span>
                      {inv.email || `Jogador #${inv.invitedPlayerId || '?'}`}
                    </span>
                    <span className={styles.meta}>pendente</span>
                  </li>
                ))}
              </ul>
            )}
          </HudPanel>
          </div>
        ) : null}

        {!pageLoading && campaign ? (
        <HudPanel title="Roster (personagens)">
          {rosterChars.length === 0 ? (
            <>
              <p className={styles.empty}>
                Nenhum personagem no roster desta campanha.
              </p>
              <div className={styles.ctaRow}>
                <Link href="/characters">
                  <HudButton variant="ghost">Criar personagem</HudButton>
                </Link>
                <Link href="/sheet">
                  <HudButton variant="ghost">Abrir fichas</HudButton>
                </Link>
              </div>
            </>
          ) : (
            <ul className={styles.list}>
              {rosterChars.map((c) => (
                <li key={c.id} className={styles.listItem}>
                  <span>
                    <strong>{c.name}</strong>
                    {c.role ? ` · ${c.role}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </HudPanel>
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
      </div>
    </PageFrame>
  );
};

export default CampaignDetailPage;
