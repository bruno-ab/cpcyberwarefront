'use client';

import { useRef } from 'react';
import { PageFrame } from '../../components/layout/PageFrame';
import { HudPanel } from '../../components/ui/HudPanel';
import { HudButton } from '../../components/ui/HudButton';
import styles from './id.module.css';

const IdCardPage = () => {
  const ref = useRef<HTMLDivElement>(null);

  const downloadPng = async () => {
    // Lightweight export via SVG foreignObject snapshot fallback: print / canvas
    const node = ref.current;
    if (!node) return;
    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360">
  <foreignObject width="100%" height="100%">
    <div xmlns="http://www.w3.org/1999/xhtml">${node.innerHTML}</div>
  </foreignObject>
</svg>`;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nc-id-card.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageFrame>
      <HudPanel title="Cartão ID — Night City">
        <div ref={ref} className={styles.card}>
          <div className={styles.stripe}>NCPD / CITIZEN</div>
          <div className={styles.body}>
            <div className={styles.photo} aria-hidden />
            <div>
              <h2>V</h2>
              <p>Role: Solo</p>
              <p>Distrito: Watson</p>
              <p>Street Cred: 12</p>
              <p className={styles.mono}>ID-2077-NC-0001</p>
            </div>
          </div>
          <footer>Cyberpunk Storyteller · não oficial</footer>
        </div>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
          <HudButton onClick={downloadPng}>Exportar SVG/ID</HudButton>
          <HudButton variant="ghost" onClick={() => window.print()}>
            Imprimir / PDF
          </HudButton>
        </div>
      </HudPanel>
    </PageFrame>
  );
};

export default IdCardPage;
