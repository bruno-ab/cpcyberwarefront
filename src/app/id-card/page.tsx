'use client';

import { useEffect, useRef, useState } from 'react';
import { PageFrame } from '../../components/layout/PageFrame';
import { HudPanel } from '../../components/ui/HudPanel';
import { HudButton } from '../../components/ui/HudButton';
import { apiUrl, authHeaders } from '../../lib/api';
import styles from './id.module.css';

type CharBrief = {
  id: string;
  name: string;
  role?: string;
  sheet?: { header?: Record<string, string> };
};

const IdCardPage = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [chars, setChars] = useState<CharBrief[]>([]);
  const [selected, setSelected] = useState<CharBrief | null>(null);
  const [streetCred, setStreetCred] = useState(12);

  useEffect(() => {
    const q =
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('id')
        : null;
    fetch(apiUrl('/api/characters/player/characters'), {
      headers: authHeaders(),
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((list) => {
        const rows = Array.isArray(list) ? list : [];
        setChars(rows);
        const pick =
          rows.find((c: CharBrief) => String(c.id) === String(q)) || rows[0];
        setSelected(pick || null);
      })
      .catch(() => setChars([]));

    fetch(apiUrl('/api/campaigns/1'))
      .then((r) => (r.ok ? r.json() : null))
      .then((c) => {
        if (c?.streetCred != null) setStreetCred(Number(c.streetCred));
      })
      .catch(() => undefined);
  }, []);

  const name = selected?.name || 'UNKNOWN';
  const role =
    selected?.role || selected?.sheet?.header?.role || 'Edgerunner';
  const city = selected?.sheet?.header?.city || 'Night City';
  const origin = selected?.sheet?.header?.origin || 'Watson';
  const idCode = `ID-2077-NC-${String(selected?.id || '0000')
    .replace(/-/g, '')
    .slice(0, 8)
    .toUpperCase()}`;

  const downloadPng = () => {
    const node = ref.current;
    if (!node) return;
    const w = 640;
    const h = 360;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Badge background
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#12141a');
    grad.addColorStop(1, '#1a1030');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Yellow stripe
    ctx.fillStyle = '#ffb800';
    ctx.fillRect(0, 0, w, 42);
    ctx.fillStyle = '#0a0a0c';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('NCPD / CITIZEN  ·  NIGHT CITY', 16, 28);

    // Photo block
    ctx.strokeStyle = '#00f3ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(24, 64, 140, 170);
    ctx.fillStyle = 'rgba(0, 243, 255, 0.08)';
    ctx.fillRect(24, 64, 140, 170);
    ctx.fillStyle = '#00f3ff';
    ctx.font = '48px sans-serif';
    ctx.fillText((name || '?').slice(0, 1).toUpperCase(), 70, 165);

    // Text
    ctx.fillStyle = '#ffb800';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(name.toUpperCase().slice(0, 22), 190, 100);
    ctx.fillStyle = '#e8e8e8';
    ctx.font = '18px sans-serif';
    ctx.fillText(`Role: ${role}`, 190, 140);
    ctx.fillText(`Distrito: ${origin}`, 190, 170);
    ctx.fillText(`Cidade: ${city}`, 190, 200);
    ctx.fillText(`Street Cred: ${streetCred}`, 190, 230);
    ctx.fillStyle = '#00f3ff';
    ctx.font = '16px monospace';
    ctx.fillText(idCode, 190, 270);

    ctx.fillStyle = '#8b93a7';
    ctx.font = '12px monospace';
    ctx.fillText('Cyberpunk Storyteller · não oficial', 24, 340);

    // Border
    ctx.strokeStyle = '#ffb800';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, w - 4, h - 4);

    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `nc-id-${name.replace(/\s+/g, '-').toLowerCase()}.png`;
    a.click();
  };

  return (
    <PageFrame>
      <HudPanel title="Cartão ID — Night City" className={styles.printHide}>
        {chars.length > 0 && (
          <label className={styles.picker}>
            Runner
            <select
              value={selected ? String(selected.id) : ''}
              onChange={(e) => {
                const c = chars.find((x) => String(x.id) === e.target.value);
                setSelected(c || null);
              }}
            >
              {chars.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        )}

        <div ref={ref} className={styles.card}>
          <div className={styles.stripe}>NCPD / CITIZEN · NIGHT CITY</div>
          <div className={styles.body}>
            <div className={styles.photo} aria-hidden>
              {(name || '?').slice(0, 1).toUpperCase()}
            </div>
            <div>
              <h2>{name}</h2>
              <p>Role: {role}</p>
              <p>Distrito: {origin}</p>
              <p>Cidade: {city}</p>
              <p>Street Cred: {streetCred}</p>
              <p className={styles.mono}>{idCode}</p>
            </div>
          </div>
          <footer>Cyberpunk Storyteller · não oficial</footer>
        </div>

        <div className={styles.actions}>
          <HudButton type="button" onClick={downloadPng}>
            Exportar PNG
          </HudButton>
          <HudButton
            type="button"
            variant="ghost"
            onClick={() => window.print()}
          >
            Imprimir / PDF
          </HudButton>
        </div>
      </HudPanel>
    </PageFrame>
  );
};

export default IdCardPage;
