'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { PageFrame } from '../../components/layout/PageFrame';
import { HudPanel } from '../../components/ui/HudPanel';
import { HudButton } from '../../components/ui/HudButton';
import { apiUrl, authHeaders } from '../../lib/api';
import styles from './adventure.module.css';

type Act = {
  id: string;
  title: string;
  summary: string;
  scenes?: string[];
  stakes?: string;
};

type Adventure = {
  id: string;
  title: string;
  tagline?: string;
  tone?: string;
  hooks?: string[];
  acts?: Act[];
};

type Recap = {
  id: number | string;
  sessionNumber: number;
  title: string;
  summary: string;
  at: string;
};

const AdventurePage = () => {
  const [adv, setAdv] = useState<Adventure | null>(null);
  const [recaps, setRecaps] = useState<Recap[]>([]);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [busy, setBusy] = useState(false);
  const campaignId = 1;

  const loadRecaps = () => {
    fetch(apiUrl(`/api/campaigns/${campaignId}/recaps`))
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setRecaps(Array.isArray(d) ? d : []))
      .catch(() => setRecaps([]));
  };

  useEffect(() => {
    fetch(apiUrl('/api/adventures/adv-neon-debt'))
      .then((r) => (r.ok ? r.json() : null))
      .then(async (d) => {
        if (d) {
          setAdv(d);
          return;
        }
        const list = await fetch(apiUrl('/api/adventures')).then((r) =>
          r.ok ? r.json() : [],
        );
        setAdv(Array.isArray(list) ? list[0] : null);
      })
      .catch(() => setAdv(null));
    loadRecaps();
  }, []);

  const submitRecap = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim()) return;
    setBusy(true);
    try {
      const res = await fetch(apiUrl(`/api/campaigns/${campaignId}/recaps`), {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ title: title.trim(), summary: summary.trim() }),
      });
      if (res.ok) {
        setTitle('');
        setSummary('');
        loadRecaps();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageFrame>
      <div className={styles.page}>
        <header className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>Aventura-exemplo · 3 atos</p>
            <h1>{adv?.title || 'Dívida Neon'}</h1>
            {adv?.tagline && <p className={styles.tagline}>{adv.tagline}</p>}
            {adv?.tone && (
              <p className={styles.meta}>Tom: {adv.tone}</p>
            )}
          </div>
          <Link href="/wiki" className={styles.link}>
            Wiki da campanha →
          </Link>
        </header>

        {!!adv?.hooks?.length && (
          <HudPanel title="Ganchos">
            <ul className={styles.hooks}>
              {adv.hooks.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </HudPanel>
        )}

        <div className={styles.acts}>
          {(adv?.acts || []).map((act, i) => (
            <article key={act.id} className={styles.act} data-act={i + 1}>
              <h2>{act.title}</h2>
              <p>{act.summary}</p>
              {act.stakes && (
                <p className={styles.stakes}>
                  <strong>Stakes:</strong> {act.stakes}
                </p>
              )}
              <ul>
                {(act.scenes || []).map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <section className={styles.timeline} aria-label="Anteriormente em Night City">
          <h2>Anteriormente em Night City</h2>
          <p className={styles.timelineIntro}>
            Resumos de sessão da campanha — o que a crew já queimou, deve e
            sobreviveu. Cada recap gera manchete no{' '}
            <Link href="/news">Noticiário N54</Link> e pode subir Heat.
          </p>
          {recaps.length === 0 && (
            <p className={styles.empty}>Nenhum recap ainda. Jacke a primeira sessão.</p>
          )}
          <ol className={styles.recaps}>
            {recaps.map((r) => (
              <li key={String(r.id)}>
                <header>
                  <span>Sessão {r.sessionNumber}</span>
                  <strong>{r.title}</strong>
                  <time dateTime={r.at}>
                    {new Date(r.at).toLocaleDateString()}
                  </time>
                </header>
                <p>{r.summary}</p>
              </li>
            ))}
          </ol>

          <form className={styles.form} onSubmit={submitRecap}>
            <h3>Novo resumo (GM)</h3>
            <label>
              Título
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ex.: Telhado e chuva ácida"
                maxLength={80}
              />
            </label>
            <label>
              Resumo
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="O que aconteceu, quem ficou ferido, o que muda na cidade…"
                rows={4}
              />
            </label>
            <HudButton type="submit" disabled={busy || !title || !summary}>
              {busy ? 'Gravando…' : 'Salvar recap'}
            </HudButton>
          </form>
        </section>
      </div>
    </PageFrame>
  );
};

export default AdventurePage;
