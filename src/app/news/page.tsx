'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { PageFrame } from '../../components/layout/PageFrame';
import { HudPanel } from '../../components/ui/HudPanel';
import { HudButton } from '../../components/ui/HudButton';
import { apiUrl, authHeaders } from '../../lib/api';
import {
  CampaignHeat,
  HeatEffects,
  DEFAULT_HEAT,
  wantedLabel,
} from '../../lib/heat';
import { useCampaign } from '../../lib/campaign';
import styles from './news.module.css';

type NewsItem = {
  id: number | string;
  headline: string;
  body: string;
  district?: string;
  source: string;
  tags: string[];
  severity: string;
  at: string;
  heatDelta?: Partial<CampaignHeat>;
};

const NewsPage = () => {
  const { campaignId, refresh: refreshCampaign } = useCampaign();
  const [heat, setHeat] = useState<CampaignHeat>(DEFAULT_HEAT);
  const [effects, setEffects] = useState<HeatEffects | null>(null);
  const [feed, setFeed] = useState<NewsItem[]>([]);
  const [headline, setHeadline] = useState('');
  const [body, setBody] = useState('');
  const [district, setDistrict] = useState('Watson');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const reload = useCallback(async () => {
    const [h, n] = await Promise.all([
      fetch(apiUrl(`/api/campaigns/${campaignId}/heat`))
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
      fetch(apiUrl(`/api/campaigns/${campaignId}/news`))
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => []),
    ]);
    if (h?.heat) setHeat(h.heat);
    if (h?.effects) setEffects(h.effects);
    setFeed(Array.isArray(n) ? n : []);
    await refreshCampaign();
  }, [campaignId, refreshCampaign]);

  useEffect(() => {
    reload();
  }, [reload]);

  const bump = async (delta: Partial<CampaignHeat>, reason: string) => {
    setBusy(true);
    setMsg('');
    try {
      const res = await fetch(apiUrl(`/api/campaigns/${campaignId}/heat`), {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ delta, reason, generateNews: true }),
      });
      if (!res.ok) throw new Error('Falha ao atualizar heat');
      await reload();
      setMsg('Heat atualizado — manchete gerada.');
    } catch (e: any) {
      setMsg(e.message || 'Erro');
    } finally {
      setBusy(false);
    }
  };

  const publish = async (e: FormEvent) => {
    e.preventDefault();
    if (!headline.trim() || !body.trim()) return;
    setBusy(true);
    try {
      const res = await fetch(apiUrl(`/api/campaigns/${campaignId}/news`), {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          headline: headline.trim(),
          body: body.trim(),
          district,
          source: 'N54',
          tags: ['manual'],
          severity: 'city',
          heatDelta: { media: 8, police: 0 },
          applyHeat: true,
        }),
      });
      if (!res.ok) throw new Error('Falha ao publicar');
      setHeadline('');
      setBody('');
      await reload();
      setMsg('No ar.');
    } catch (err: any) {
      setMsg(err.message || 'Erro');
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageFrame>
      <div className={styles.page}>
        <HudPanel title="Noticiário de Night City">
          <p className={styles.empty}>
            Manchetes geradas a partir das sessões e ações da crew. Heat muda
            preços na{' '}
            <Link href="/shop">loja</Link>, encontros e contatos.{' '}
            <Link href="/adventure">Recaps →</Link>
          </p>
        </HudPanel>

        <div className={styles.layout}>
          <HudPanel title="Heat / Procurado">
            <div className={styles.heatCard}>
              <div>
                <div className={styles.stars}>
                  {wantedLabel(heat.police)} NCPD
                </div>
              </div>
              {(
                [
                  ['police', heat.police, 5, 'Polícia'],
                  ['corpo', heat.corpo, 100, 'Corporações'],
                  ['media', heat.media, 100, 'Mídia'],
                ] as const
              ).map(([kind, value, max, label]) => (
                <div key={kind} className={styles.meter}>
                  <label>
                    <span>{label}</span>
                    <span>
                      {value}/{max}
                    </span>
                  </label>
                  <div className={styles.track}>
                    <div
                      className={styles.fill}
                      data-kind={kind}
                      style={{ width: `${(Number(value) / max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              {effects && (
                <p className={styles.effects}>
                  Markup loja ×{effects.shopMarkup.toFixed(2)} · Contatos +
                  {effects.contactPenalty} dif. · {effects.encounterBlurb}
                  {effects.mediaSpotlight ? ' · Spotlight mídia' : ''}
                  {effects.corpoInterest ? ' · Interesse corpo' : ''}
                </p>
              )}
              <div className={styles.row}>
                <HudButton
                  disabled={busy}
                  onClick={() =>
                    bump({ police: 1, media: 6 }, 'Tiroteio público — NCPD alerta')
                  }
                >
                  +Polícia
                </HudButton>
                <HudButton
                  disabled={busy}
                  onClick={() =>
                    bump({ corpo: 15 }, 'Operação contra ativo corporativo')
                  }
                >
                  +Corpo
                </HudButton>
                <HudButton
                  disabled={busy}
                  onClick={() =>
                    bump({ media: 18 }, 'Vídeo viral da crew no N54')
                  }
                >
                  +Mídia
                </HudButton>
                <HudButton
                  disabled={busy}
                  onClick={() =>
                    bump(
                      { police: -1, corpo: -8, media: -10 },
                      'Perfil baixo — heat esfria',
                    )
                  }
                >
                  Esfriar
                </HudButton>
              </div>
            </div>
          </HudPanel>

          <div>
            <HudPanel title="Feed N54">
              <div className={styles.feed}>
                {feed.length === 0 && (
                  <p className={styles.empty}>Sem manchetes ainda.</p>
                )}
                {feed.map((item) => (
                  <article
                    key={item.id}
                    className={styles.item}
                    data-severity={item.severity}
                  >
                    <div className={styles.meta}>
                      <span>{item.source}</span>
                      {item.district && <span>{item.district}</span>}
                      <span>{new Date(item.at).toLocaleString('pt-BR')}</span>
                      <span>{item.severity}</span>
                    </div>
                    <h3>{item.headline}</h3>
                    <p>{item.body}</p>
                    {!!item.tags?.length && (
                      <div className={styles.tags}>
                        {item.tags.map((t) => (
                          <span key={t} className={styles.tag}>
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </HudPanel>

            <HudPanel title="Publicar manchete (GM)">
              <form className={styles.form} onSubmit={publish}>
                <input
                  type="text"
                  placeholder="Manchete"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                />
                <textarea
                  placeholder="Lead / corpo da matéria"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                >
                  {[
                    'Watson',
                    'Westbrook',
                    'Heywood',
                    'Santo Domingo',
                    'City Center',
                    'Pacifica',
                    'Kabuki',
                  ].map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <HudButton type="submit" disabled={busy}>
                  No ar
                </HudButton>
              </form>
              {msg && <p className={styles.empty}>{msg}</p>}
            </HudPanel>
          </div>
        </div>
      </div>
    </PageFrame>
  );
};

export default NewsPage;
