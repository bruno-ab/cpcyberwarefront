'use client';

import { useMemo, useState } from 'react';
import shell from './MinigameShell.module.css';
import styles from './BraindanceEditGame.module.css';

type Status = 'menu' | 'playing' | 'won' | 'lost';
type Clip = { id: string; label: string; tag: 'hook' | 'fact' | 'fluff' | 'spin' };

const POOL: Clip[] = [
  { id: 'c1', label: 'Close-up: lágrima do corpo', tag: 'hook' },
  { id: 'c2', label: 'Áudio: grito na avenida', tag: 'hook' },
  { id: 'c3', label: 'Dado: 12 civis no local', tag: 'fact' },
  { id: 'c4', label: 'Badge NCPD borrado', tag: 'fact' },
  { id: 'c5', label: 'Neon de bar ao fundo', tag: 'fluff' },
  { id: 'c6', label: 'Anúncio de corpo', tag: 'fluff' },
  { id: 'c7', label: 'Narração: “Militech mentiu”', tag: 'spin' },
  { id: 'c8', label: 'Corte: logo Arasaka', tag: 'spin' },
];

/** Media: edite um braindance para a manchete certa. */
export const BraindanceEditGame = () => {
  const [status, setStatus] = useState<Status>('menu');
  const [deck, setDeck] = useState<Clip[]>([]);
  const [cut, setCut] = useState<Clip[]>([]);
  const [headline, setHeadline] = useState('');

  const start = () => {
    const shuffled = [...POOL].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCut([]);
    setHeadline('');
    setStatus('playing');
  };

  const score = useMemo(() => {
    if (cut.length < 3) return 0;
    let s = 0;
    if (cut[0]?.tag === 'hook') s += 30;
    if (cut.some((c) => c.tag === 'fact')) s += 25;
    if (cut.some((c) => c.tag === 'spin')) s += 20;
    if (cut.filter((c) => c.tag === 'fluff').length <= 1) s += 15;
    if (cut.length === 4) s += 10;
    return Math.min(100, s);
  }, [cut]);

  const publish = () => {
    if (cut.length < 3) return;
    setHeadline(
      score >= 70
        ? 'MANCHETE: “Noite sangrenta — quem cobriu os rastros?”'
        : score >= 45
          ? 'MANCHETE: “Caos em Watson; versões conflitam”'
          : 'MANCHETE: “Mais um vídeo viral sem contexto”',
    );
    setStatus(score >= 60 ? 'won' : 'lost');
  };

  const add = (clip: Clip) => {
    if (cut.length >= 5) return;
    setCut((c) => [...c, clip]);
    setDeck((d) => d.filter((x) => x.id !== clip.id));
  };

  const remove = (id: string) => {
    const clip = cut.find((c) => c.id === id);
    if (!clip) return;
    setCut((c) => c.filter((x) => x.id !== id));
    setDeck((d) => [...d, clip]);
  };

  return (
    <div className={shell.wrap} data-accent="yellow">
      <header className={shell.head}>
        <h3>Media — Edição de Braindance</h3>
        <p>
          Monte 3–5 clips: comece com gancho, inclua fato, evite fluff demais.
          Impacta reputação de Media.
        </p>
      </header>

      {status === 'menu' && (
        <div className={shell.menu}>
          <button type="button" className={shell.start} onClick={start}>
            Abrir timeline
          </button>
        </div>
      )}

      {status !== 'menu' && (
        <>
          <div className={shell.hud}>
            <span>IMPACTO {score}%</span>
            <span>CLIPS {cut.length}/5</span>
          </div>
          <div className={styles.timeline}>
            <h4>Timeline</h4>
            <div className={styles.row}>
              {cut.length === 0 && <span className={styles.empty}>vazia</span>}
              {cut.map((c, i) => (
                <button
                  key={c.id}
                  type="button"
                  className={styles.clip}
                  data-tag={c.tag}
                  onClick={() => status === 'playing' && remove(c.id)}
                >
                  {i + 1}. {c.label}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.pool}>
            <h4>Takes brutos</h4>
            <div className={styles.row}>
              {deck.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={styles.clip}
                  data-tag={c.tag}
                  disabled={status !== 'playing'}
                  onClick={() => add(c)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          {status === 'playing' && (
            <button
              type="button"
              className={shell.start}
              disabled={cut.length < 3}
              onClick={publish}
            >
              Publicar manchete
            </button>
          )}
          {headline && <p className={styles.headline}>{headline}</p>}
          {(status === 'won' || status === 'lost') && (
            <div className={shell.result} data-ok={status === 'won' ? '1' : '0'}>
              <p>
                {status === 'won'
                  ? `Viral bom. Reputação Media +${Math.round(score / 10)}.`
                  : 'Peça fraca — reputação estagna ou cai.'}
              </p>
              <button type="button" className={shell.start} onClick={start}>
                De novo
              </button>
              <button type="button" className={shell.ghost} onClick={() => setStatus('menu')}>
                Menu
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BraindanceEditGame;
