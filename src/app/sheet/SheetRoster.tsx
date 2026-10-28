'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiUrl, authHeaders } from '../../lib/api';
import { useCampaign } from '../../lib/campaign';
import { fetchMineCampaigns } from '../../lib/campaignsApi';
import styles from './sheetRoster.module.css';

type CharBrief = { id: string; name: string; role?: string; credits?: number };
type Mission = {
  id: string;
  title: string;
  district?: string;
  risk?: number;
  characters: CharBrief[];
};
type Campaign = { id: number | string; name: string };
type Roster = {
  campaign: Campaign;
  characters: CharBrief[];
  missions: Mission[];
};

export const SheetRoster = () => {
  const router = useRouter();
  const { campaignId, setCampaignId } = useCampaign();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [roster, setRoster] = useState<Roster | null>(null);
  const [missionId, setMissionId] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }
    const applyRows = (rows: Campaign[]) => {
      setCampaigns(rows);
      if (rows.length && !rows.some((c) => Number(c.id) === campaignId)) {
        setCampaignId(Number(rows[0].id));
      }
    };
    fetchMineCampaigns()
      .then((mine) => {
        applyRows([
          ...(mine?.asGm || []),
          ...(mine?.asPlayer || []),
        ].map((c) => ({ id: c.id, name: c.name })));
      })
      .catch(() =>
        fetch(apiUrl('/api/campaigns'), { headers: authHeaders() })
          .then((r) => (r.ok ? r.json() : []))
          .then((list) => applyRows(Array.isArray(list) ? list : []))
          .catch(() => setError('Falha ao carregar campanhas.')),
      )
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- bootstrap campaign list once
  }, [router]);

  useEffect(() => {
    if (!campaignId) return;
    setLoading(true);
    fetch(apiUrl(`/api/campaigns/${campaignId}/roster`), {
      headers: authHeaders(),
    })
      .then((r) => {
        if (!r.ok) throw new Error('roster');
        return r.json();
      })
      .then((data) => {
        setRoster(data);
        setMissionId('all');
        setError('');
      })
      .catch(() => setError('Não foi possível carregar o roster.'))
      .finally(() => setLoading(false));
  }, [campaignId]);

  const openSheet = (id: string) => {
    router.push(`/sheet?id=${id}`);
  };

  const visibleChars =
    missionId === 'all'
      ? roster?.characters || []
      : roster?.missions.find((m) => m.id === missionId)?.characters || [];

  return (
    <div className={styles.wrap}>
      <header className={styles.hero}>
        <div>
          <h1>Fichas</h1>
          <p>
            Escolha um runner vinculado à campanha ou a uma missão ativa.
          </p>
        </div>
      </header>

      <div className={styles.filters}>
        <label>
          Campanha
          <select
            value={String(campaignId)}
            onChange={(e) => {
              const next = Number(e.target.value);
              if (Number.isFinite(next) && next > 0) setCampaignId(next);
            }}
          >
            {campaigns.map((c) => (
              <option key={String(c.id)} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Missão / gig
          <select
            value={missionId}
            onChange={(e) => setMissionId(e.target.value)}
          >
            <option value="all">Toda a campanha</option>
            {(roster?.missions || []).map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading && <p className={styles.status}>Sincronizando roster…</p>}
      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && visibleChars.length === 0 && (
        <div className={styles.empty}>
          <strong>Nenhum personagem neste filtro</strong>
          Vincule runners à campanha (roster) ou aceite um gig com crew.
        </div>
      )}

      <div className={styles.grid}>
        {visibleChars.map((c) => (
          <button
            key={c.id}
            type="button"
            className={styles.card}
            onClick={() => openSheet(c.id)}
          >
            <span className={styles.art} aria-hidden>
              {(c.name || '?').slice(0, 1).toUpperCase()}
            </span>
            <span className={styles.body}>
              <strong>{c.name}</strong>
              <em>{c.role || 'Edgerunner'}</em>
              <small>Abrir ficha →</small>
            </span>
          </button>
        ))}
      </div>

      {missionId === 'all' && (roster?.missions?.length || 0) > 0 && (
        <section className={styles.missions}>
          <h2>Missões ativas</h2>
          {roster!.missions.map((m) => (
            <article key={m.id} className={styles.mission}>
              <header>
                <strong>{m.title}</strong>
                <span>
                  {m.district || '—'} · risco {m.risk ?? '—'}
                </span>
              </header>
              <div className={styles.missionCrew}>
                {m.characters.length === 0 && (
                  <span className={styles.status}>Sem crew alocada</span>
                )}
                {m.characters.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => openSheet(c.id)}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
};

export default SheetRoster;
