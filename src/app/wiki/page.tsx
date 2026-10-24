'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { PageFrame } from '../../components/layout/PageFrame';
import { HudPanel } from '../../components/ui/HudPanel';
import { HudButton } from '../../components/ui/HudButton';
import { apiUrl, authHeaders } from '../../lib/api';
import styles from './wiki.module.css';

type WikiPage = {
  id: number;
  slug: string;
  title: string;
  body: string;
  visibility: string;
};

const WikiPageView = () => {
  const [role, setRole] = useState<'player' | 'gm'>('player');
  const [pages, setPages] = useState<WikiPage[]>([]);
  const [active, setActive] = useState('');
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const campaignId = 1;

  const load = () => {
    fetch(apiUrl(`/api/campaigns/${campaignId}/wiki?role=${role}`), {
      headers: authHeaders(),
    })
      .then((r) => r.json())
      .then((d) => {
        const list = Array.isArray(d) ? d : [];
        setPages(list);
        if (list[0] && !list.some((p: WikiPage) => p.slug === active)) {
          setActive(list[0].slug);
        }
      })
      .catch(() => setPages([]));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const current = pages.find((p) => p.slug === active) || pages[0];
  const privateHidden = useMemo(
    () => role === 'player' && !pages.some((p) => p.visibility === 'private'),
    [pages, role],
  );

  const renderBody = (text: string) => {
    const parts = text.split(/(\[\[[^\]]+\]\])/g);
    return parts.map((part, i) => {
      const m = part.match(/^\[\[([^\]]+)\]\]$/);
      if (!m) return <span key={i}>{part}</span>;
      const target = m[1];
      const exists = pages.some((p) => p.slug === target);
      return (
        <button
          key={i}
          type="button"
          className={styles.wikilink}
          data-missing={!exists}
          onClick={() => {
            if (exists) setActive(target);
            else {
              setSlug(target);
              setTitle(target);
              setMsg(`Página [[${target}]] ainda não existe — crie abaixo (GM).`);
            }
          }}
        >
          {target}
        </button>
      );
    });
  };

  const createPage = async (e: FormEvent) => {
    e.preventDefault();
    if (!slug.trim() || !title.trim()) return;
    setBusy(true);
    setMsg('');
    try {
      const res = await fetch(apiUrl(`/api/campaigns/${campaignId}/wiki`), {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          slug: slug.trim().toLowerCase().replace(/\s+/g, '-'),
          title: title.trim(),
          body: body.trim() || `Nota sobre ${title.trim()}.`,
          visibility,
        }),
      });
      if (!res.ok) throw new Error('Falha ao criar');
      setSlug('');
      setTitle('');
      setBody('');
      setMsg('Página jackada na wiki.');
      load();
    } catch {
      setMsg('Sem permissão ou API offline.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageFrame>
      <div className={styles.page}>
        <header className={styles.hero}>
          <div>
            <h1>Wiki da campanha</h1>
            <p>Páginas com [[links]], notas públicas e privadas do GM.</p>
          </div>
        </header>

        <div className={styles.roles}>
          <HudButton
            variant={role === 'player' ? 'primary' : 'ghost'}
            onClick={() => setRole('player')}
          >
            Vista jogador
          </HudButton>
          <HudButton
            variant={role === 'gm' ? 'primary' : 'ghost'}
            onClick={() => setRole('gm')}
          >
            Vista GM
          </HudButton>
        </div>

        {privateHidden && (
          <p className={styles.note}>Notas privadas do GM ocultas nesta vista.</p>
        )}

        <div className={styles.layout}>
          <ul className={styles.toc}>
            {pages.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  data-active={p.slug === current?.slug}
                  onClick={() => setActive(p.slug)}
                >
                  {p.title}
                  {p.visibility === 'private' ? ' 🔒' : ''}
                </button>
              </li>
            ))}
          </ul>

          <article className={styles.article}>
            <h2>{current?.title || '—'}</h2>
            <p className={styles.slug}>/{current?.slug}</p>
            <div className={styles.body}>{renderBody(current?.body || '')}</div>
          </article>
        </div>

        {role === 'gm' && (
          <HudPanel title="Nova página">
            <form className={styles.form} onSubmit={createPage}>
              <label>
                Slug
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="watson"
                  required
                />
              </label>
              <label>
                Título
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Watson"
                  required
                />
              </label>
              <label>
                Corpo (use [[slug]] para links)
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={4}
                />
              </label>
              <label>
                Visibilidade
                <select
                  value={visibility}
                  onChange={(e) =>
                    setVisibility(e.target.value as 'public' | 'private')
                  }
                >
                  <option value="public">public</option>
                  <option value="private">private</option>
                </select>
              </label>
              {msg && <p className={styles.msg}>{msg}</p>}
              <HudButton type="submit" disabled={busy}>
                {busy ? 'Salvando…' : 'Criar página'}
              </HudButton>
            </form>
          </HudPanel>
        )}
      </div>
    </PageFrame>
  );
};

export default WikiPageView;
