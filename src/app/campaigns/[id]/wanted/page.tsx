'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { PageFrame } from '../../../../components/layout/PageFrame';
import { HudPanel } from '../../../../components/ui/HudPanel';
import { HudButton } from '../../../../components/ui/HudButton';
import { apiUrl, authHeaders } from '../../../../lib/api';
import { getAccessToken, getPlayerIdFromToken } from '../../../../lib/authSession';
import {
  fetchCampaignNpcs,
  type CampaignNpc,
  type CampaignRow,
} from '../../../../lib/campaignsApi';
import { npcImageSrc, resolveMediaSrc } from '../../../../lib/media';
import { useCampaign } from '../../../../lib/campaign';
import styles from './wanted.module.css';

type WantedEntry = {
  id: number | string;
  campaignId: number;
  name: string;
  crime: string;
  bounty: number;
  notes?: string;
  portraitUrl?: string | null;
  npcId?: string | null;
  active: boolean;
};

const formatBounty = (n: number) =>
  `€$ ${Number(n || 0).toLocaleString('pt-BR')}`;

const WantedBoardPage = () => {
  const params = useParams();
  const router = useRouter();
  const campaignId = Number(params?.id);
  const { setCampaignId } = useCampaign();

  const [campaign, setCampaign] = useState<CampaignRow | null>(null);
  const [entries, setEntries] = useState<WantedEntry[]>([]);
  const [npcs, setNpcs] = useState<CampaignNpc[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [crime, setCrime] = useState('');
  const [bounty, setBounty] = useState('0');
  const [notes, setNotes] = useState('');
  const [portraitUrl, setPortraitUrl] = useState('');
  const [npcId, setNpcId] = useState('');
  const [active, setActive] = useState(true);
  const [showInactive, setShowInactive] = useState(false);

  const playerId = getPlayerIdFromToken();
  const isGm =
    campaign != null && Number(campaign.gmPlayerId) === playerId;
  const isMember =
    campaign != null &&
    playerId != null &&
    (isGm ||
      (campaign.memberPlayerIds || []).some((id) => Number(id) === playerId));

  useEffect(() => {
    if (Number.isFinite(campaignId) && campaignId > 0) {
      setCampaignId(campaignId);
    }
  }, [campaignId, setCampaignId]);

  const resetForm = () => {
    setEditId(null);
    setName('');
    setCrime('');
    setBounty('0');
    setNotes('');
    setPortraitUrl('');
    setNpcId('');
    setActive(true);
  };

  const load = useCallback(async () => {
    if (!Number.isFinite(campaignId) || campaignId <= 0) return;
    setLoading(true);
    setMsg('');
    if (!getAccessToken()) {
      router.replace(`/login?next=/campaigns/${campaignId}/wanted`);
      return;
    }
    try {
      const [campRes, wantedRes, npcList] = await Promise.all([
        fetch(apiUrl(`/api/campaigns/${campaignId}`), { headers: authHeaders() }),
        fetch(apiUrl(`/api/campaigns/${campaignId}/wanted`), {
          headers: authHeaders(),
        }),
        fetchCampaignNpcs(campaignId),
      ]);
      if (campRes.status === 401) {
        router.replace(`/login?next=/campaigns/${campaignId}/wanted`);
        return;
      }
      if (campRes.status === 403) {
        setMsg('Sem acesso a esta campanha.');
        setCampaign(null);
        setEntries([]);
        return;
      }
      if (campRes.ok) {
        setCampaign((await campRes.json()) as CampaignRow);
      }
      if (wantedRes.ok) {
        const data = await wantedRes.json();
        setEntries(Array.isArray(data) ? data : []);
      } else if (wantedRes.status === 403) {
        setMsg('Apenas membros da campanha veem o mural.');
        setEntries([]);
      } else {
        setMsg('Não foi possível carregar procurados.');
      }
      setNpcs(npcList);
    } catch {
      setMsg('Falha de rede.');
    } finally {
      setLoading(false);
    }
  }, [campaignId, router]);

  useEffect(() => {
    void load();
  }, [load]);

  const visibleEntries = useMemo(
    () =>
      showInactive || isGm
        ? entries
        : entries.filter((e) => e.active !== false),
    [entries, isGm, showInactive],
  );

  const portraitForEntry = (entry: WantedEntry): string | null => {
    if (entry.portraitUrl) {
      return resolveMediaSrc(entry.portraitUrl) || entry.portraitUrl;
    }
    if (entry.npcId) {
      const npc = npcs.find((n) => String(n.id) === String(entry.npcId));
      if (npc) return npcImageSrc(npc);
    }
    return null;
  };

  const onNpcPick = (id: string) => {
    setNpcId(id);
    const npc = npcs.find((n) => String(n.id) === id);
    if (npc && !name.trim()) setName(npc.name);
    if (npc?.image && !portraitUrl.trim()) {
      setPortraitUrl(npc.image);
    }
  };

  const onEdit = (entry: WantedEntry) => {
    setEditId(String(entry.id));
    setName(entry.name);
    setCrime(entry.crime);
    setBounty(String(entry.bounty ?? 0));
    setNotes(entry.notes || '');
    setPortraitUrl(entry.portraitUrl || '');
    setNpcId(entry.npcId || '');
    setActive(entry.active !== false);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isGm) return;
    setBusy(true);
    setMsg('');
    const body = {
      name: name.trim(),
      crime: crime.trim(),
      bounty: Number(bounty) || 0,
      notes: notes.trim() || undefined,
      portraitUrl: portraitUrl.trim() || null,
      npcId: npcId.trim() || null,
      active,
    };
    try {
      const url = editId
        ? apiUrl(`/api/campaigns/${campaignId}/wanted/${editId}`)
        : apiUrl(`/api/campaigns/${campaignId}/wanted`);
      const res = await fetch(url, {
        method: editId ? 'PUT' : 'POST',
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Falha ao salvar');
      }
      resetForm();
      await load();
      setMsg(editId ? 'Cartaz atualizado.' : 'Cartaz publicado no mural.');
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : 'Erro');
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (entryId: string) => {
    if (!isGm || !window.confirm('Remover este cartaz do mural?')) return;
    setBusy(true);
    try {
      const res = await fetch(
        apiUrl(`/api/campaigns/${campaignId}/wanted/${entryId}`),
        { method: 'DELETE', headers: authHeaders() },
      );
      if (!res.ok) throw new Error('Falha ao remover');
      if (editId === entryId) resetForm();
      await load();
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : 'Erro');
    } finally {
      setBusy(false);
    }
  };

  if (!Number.isFinite(campaignId)) {
    return (
      <PageFrame>
        <p className={styles.status}>Campanha inválida.</p>
      </PageFrame>
    );
  }

  return (
    <PageFrame>
      <div className={styles.page}>
        <Link href={`/campaigns/${campaignId}`} className={styles.back}>
          ← Campanha
        </Link>

        <header className={styles.hero}>
          <h1>NCPD · Mural de Procurados</h1>
          <p>
            {campaign?.name || `Campanha #${campaignId}`} — cartazes de recompensa
            da mesa. {isGm ? 'Modo narrador: edite abaixo.' : 'Somente leitura.'}
          </p>
        </header>

        {msg ? <p className={styles.status}>{msg}</p> : null}

        {!loading && !isMember && campaign ? (
          <HudPanel title="Acesso">
            <p className={styles.status}>
              Entre na campanha como membro para ver o mural.
            </p>
            <Link href={`/campaigns/${campaignId}`}>
              <HudButton variant="ghost">Voltar</HudButton>
            </Link>
          </HudPanel>
        ) : null}

        {isGm ? (
          <HudPanel title={editId ? 'Editar cartaz' : 'Novo procurado'}>
            <form className={styles.formGrid} onSubmit={onSubmit}>
              <label>
                Nome / alias
                <input
                  value={name}
                  onChange={(ev) => setName(ev.target.value)}
                  required
                  maxLength={120}
                />
              </label>
              <label>
                Crime(s)
                <textarea
                  value={crime}
                  onChange={(ev) => setCrime(ev.target.value)}
                  required
                  maxLength={500}
                />
              </label>
              <label>
                Recompensa (€$)
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={bounty}
                  onChange={(ev) => setBounty(ev.target.value)}
                />
              </label>
              <label>
                NPC da campanha (opcional)
                <select
                  value={npcId}
                  onChange={(ev) => onNpcPick(ev.target.value)}
                >
                  <option value="">— nenhum —</option>
                  {npcs.map((npc) => (
                    <option key={npc.id} value={npc.id}>
                      {npc.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Retrato (URL / media key)
                <input
                  value={portraitUrl}
                  onChange={(ev) => setPortraitUrl(ev.target.value)}
                  placeholder="https://… ou chave de upload"
                />
              </label>
              <label>
                Notas internas / pistas
                <textarea
                  value={notes}
                  onChange={(ev) => setNotes(ev.target.value)}
                  maxLength={800}
                />
              </label>
              <label className={styles.checkRow}>
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(ev) => setActive(ev.target.checked)}
                />
                Cartaz ativo no mural
              </label>
              <div className={styles.formRow}>
                <HudButton type="submit" disabled={busy}>
                  {editId ? 'Salvar cartaz' : 'Publicar cartaz'}
                </HudButton>
                {editId ? (
                  <HudButton
                    type="button"
                    variant="ghost"
                    disabled={busy}
                    onClick={resetForm}
                  >
                    Cancelar
                  </HudButton>
                ) : null}
              </div>
            </form>
          </HudPanel>
        ) : null}

        <div className={styles.formRow}>
          {isGm ? (
            <label className={styles.checkRow}>
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(ev) => setShowInactive(ev.target.checked)}
              />
              Mostrar cartazes inativos
            </label>
          ) : null}
        </div>

        {loading ? (
          <p className={styles.status}>Carregando mural…</p>
        ) : visibleEntries.length === 0 ? (
          <HudPanel title="Mural vazio">
            <p className={styles.status}>
              Nenhum procurado publicado. O narrador pode colar cartazes acima.
            </p>
          </HudPanel>
        ) : (
          <div className={styles.board}>
            {visibleEntries.map((entry) => {
              const src = portraitForEntry(entry);
              return (
                <article
                  key={String(entry.id)}
                  className={`${styles.poster} ${
                    entry.active === false ? styles.posterInactive : ''
                  }`.trim()}
                >
                  <span className={styles.posterStamp}>WANTED</span>
                  {src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className={styles.portrait}
                      src={src}
                      alt=""
                      loading="lazy"
                    />
                  ) : (
                    <div className={styles.portraitPlaceholder}>SEM FOTO</div>
                  )}
                  <p className={styles.posterName}>{entry.name}</p>
                  <p className={styles.posterCrime}>{entry.crime}</p>
                  <p className={styles.bounty}>
                    Recompensa: {formatBounty(entry.bounty)}
                  </p>
                  {entry.notes ? (
                    <p className={styles.notes}>{entry.notes}</p>
                  ) : null}
                  {entry.npcId ? (
                    <Link href={`/npcs/${entry.npcId}`} className={styles.notes}>
                      Ficha NPC →
                    </Link>
                  ) : null}
                  {isGm ? (
                    <div className={styles.posterActions}>
                      <HudButton
                        type="button"
                        variant="ghost"
                        disabled={busy}
                        onClick={() => onEdit(entry)}
                      >
                        Editar
                      </HudButton>
                      <HudButton
                        type="button"
                        variant="ghost"
                        disabled={busy}
                        onClick={() => void onDelete(String(entry.id))}
                      >
                        Remover
                      </HudButton>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </PageFrame>
  );
};

export default WantedBoardPage;
