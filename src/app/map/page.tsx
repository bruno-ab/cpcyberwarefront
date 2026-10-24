'use client';

import { useEffect, useState } from 'react';
import { PageFrame } from '../../components/layout/PageFrame';
import { HudPanel } from '../../components/ui/HudPanel';
import { HudButton } from '../../components/ui/HudButton';
import { apiUrl, authHeaders } from '../../lib/api';
import styles from './map.module.css';

type District = { id: string; name: string; danger: number; vibes: string };
type Gig = { id: string; name: string; districtId: string; risk: number; pay: number };
type Control = { districtId: string; controller: string };

const DISTRICT_PATHS: Record<string, string> = {
  watson: 'M40 80 L180 60 L200 160 L60 180 Z',
  westbrook: 'M190 50 L340 40 L350 140 L210 155 Z',
  heywood: 'M60 190 L200 170 L220 280 L80 300 Z',
  santo: 'M210 165 L350 150 L360 260 L230 280 Z',
  pacifica: 'M80 310 L230 290 L250 380 L100 400 Z',
  center: 'M360 80 L480 70 L490 180 L370 190 Z',
  badlands: 'M500 100 L620 90 L640 320 L520 340 Z',
};

const MapPage = () => {
  const [districts, setDistricts] = useState<District[]>([]);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [control, setControl] = useState<Control[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const campaignId = 1;

  useEffect(() => {
    Promise.all([
      fetch(apiUrl('/api/districts')).then((r) => r.json()),
      fetch(apiUrl('/api/gigs')).then((r) => r.json()),
      fetch(apiUrl(`/api/campaigns/${campaignId}`)).then((r) => r.json()).catch(() => null),
    ]).then(([d, g, camp]) => {
      setDistricts(Array.isArray(d) ? d : []);
      setGigs(Array.isArray(g) ? g : []);
      setControl(camp?.district_control || []);
    });
  }, []);

  const selectedDistrict = districts.find((d) => d.id === selected);
  const pins = gigs.filter((g) => !selected || g.districtId === selected);

  const claim = async (districtId: string, controller: string) => {
    const next = control.map((c) =>
      c.districtId === districtId ? { ...c, controller } : c,
    );
    if (!next.find((c) => c.districtId === districtId)) {
      next.push({ districtId, controller });
    }
    setControl(next);
    await fetch(apiUrl(`/api/campaigns/${campaignId}/districts`), {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ district_control: next }),
    });
  };

  return (
    <PageFrame>
      <div className={styles.wrap}>
        <HudPanel title="Night City — mapa de distritos" className={styles.mapPanel}>
          <svg viewBox="0 0 680 420" className={styles.svg} role="img" aria-label="Mapa Night City">
            <rect width="680" height="420" fill="#0a0a0c" />
            {districts.map((d) => {
              const ctrl = control.find((c) => c.districtId === d.id)?.controller;
              return (
                <g key={d.id}>
                  <path
                    d={DISTRICT_PATHS[d.id] || 'M0 0'}
                    className={styles.district}
                    data-selected={selected === d.id}
                    data-danger={d.danger}
                    onClick={() => setSelected(d.id)}
                  />
                  <text
                    x={40}
                    y={20}
                    className={styles.label}
                    style={{ display: 'none' }}
                  >
                    {d.name}
                  </text>
                  <title>{`${d.name} — ${ctrl || 'contested'}`}</title>
                </g>
              );
            })}
            {pins.map((g, i) => {
              const path = DISTRICT_PATHS[g.districtId];
              if (!path) return null;
              const x = 80 + (i % 5) * 90;
              const y = 100 + Math.floor(i / 5) * 40;
              return (
                <circle key={g.id} cx={x} cy={y} r={6} className={styles.pin}>
                  <title>{g.name}</title>
                </circle>
              );
            })}
          </svg>
        </HudPanel>
        <HudPanel title={selectedDistrict?.name || 'Distrito'} className={styles.side}>
          {selectedDistrict ? (
            <>
              <p>{selectedDistrict.vibes}</p>
              <p>Perigo: {selectedDistrict.danger}/5</p>
              <p>
                Controle:{' '}
                {control.find((c) => c.districtId === selected)?.controller || 'contested'}
              </p>
              <div className={styles.actions}>
                <HudButton onClick={() => claim(selectedDistrict.id, 'crew')}>
                  Marcar território (crew)
                </HudButton>
                <HudButton variant="ghost" onClick={() => claim(selectedDistrict.id, 'contested')}>
                  Contestado
                </HudButton>
              </div>
              <h3>Gigs / pins</h3>
              <ul>
                {gigs
                  .filter((g) => g.districtId === selected)
                  .map((g) => (
                    <li key={g.id}>
                      {g.name} — risco {g.risk} — ¤{g.pay}
                    </li>
                  ))}
              </ul>
            </>
          ) : (
            <p>Selecione um distrito no mapa.</p>
          )}
        </HudPanel>
      </div>
    </PageFrame>
  );
};

export default MapPage;
