'use client';

import { useEffect, useState } from 'react';
import Header from '../header/Header';
import { HudButton } from '../../components/ui/HudButton';
import { apiUrl, authHeaders } from '../../lib/api';
import charStyles from '../characters/background.module.css';
import styles from './map.module.css';

type District = { id: string; name: string; danger: number; vibes: string };
type Gig = { id: string; name: string; districtId: string; risk: number; pay: number };
type Control = { districtId: string; controller: string };

type MapSource = {
  id: string;
  label: string;
  url: string;
  note: string;
};

/** Mapas interativos públicos de Night City (terceiros; créditos no rodapé). */
const MAP_SOURCES: MapSource[] = [
  {
    id: 'piggyback',
    label: 'Oficial (Piggyback)',
    url: 'https://maps.piggyback.com/cyberpunk-2077/maps/night-city',
    note: 'Mapa oficial Ultra HD · colaborativo com CDPR',
  },
  {
    id: 'mapgenie',
    label: 'MapGenie',
    url: 'https://mapgenie.io/cyberpunk-2077/maps/night-city',
    note: 'Gigs, NCPD, veículos, shards e Phantom Liberty',
  },
  {
    id: 'nightcity-io',
    label: 'NightCity.io',
    url: 'https://www.nightcity.io/2077',
    note: 'POIs, megabuildings, gangues e apartamentos',
  },
  {
    id: 'cyberpunkmap',
    label: 'cyberpunkmap.app',
    url: 'https://cyberpunkmap.app/',
    note: 'Mapa interativo com Phantom Liberty',
  },
];

const MapPage = () => {
  const [districts, setDistricts] = useState<District[]>([]);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [control, setControl] = useState<Control[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [sourceId, setSourceId] = useState(MAP_SOURCES[0].id);
  const [iframeBlocked, setIframeBlocked] = useState(false);
  const campaignId = 1;

  const source = MAP_SOURCES.find((s) => s.id === sourceId) || MAP_SOURCES[0];

  useEffect(() => {
    Promise.all([
      fetch(apiUrl('/api/districts')).then((r) => r.json()),
      fetch(apiUrl('/api/gigs')).then((r) => r.json()),
      fetch(apiUrl(`/api/campaigns/${campaignId}`))
        .then((r) => r.json())
        .catch(() => null),
    ]).then(([d, g, camp]) => {
      setDistricts(Array.isArray(d) ? d : []);
      setGigs(Array.isArray(g) ? g : []);
      setControl(camp?.district_control || []);
    });
  }, []);

  useEffect(() => {
    setIframeBlocked(false);
  }, [sourceId]);

  const selectedDistrict = districts.find((d) => d.id === selected);

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
    <div className={charStyles.page}>
      <Header />
      <h2 className={charStyles.titulo}>Night City Map</h2>
      <p className={styles.intro}>
        Mapa interativo fiel ao jogo · escolha a fonte abaixo. Distritos da campanha ficam no painel.
      </p>

      <div className={styles.sourceRow}>
        {MAP_SOURCES.map((s) => (
          <button
            key={s.id}
            type="button"
            className={sourceId === s.id ? styles.sourceActive : styles.sourceBtn}
            onClick={() => setSourceId(s.id)}
          >
            {s.label}
          </button>
        ))}
        <a
          className={styles.openExt}
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Abrir em nova aba ↗
        </a>
      </div>
      <p className={styles.sourceNote}>{source.note}</p>

      <div className={styles.wrap}>
        <div className={styles.mapFrame}>
          {!iframeBlocked ? (
            <iframe
              key={source.url}
              title={`Night City — ${source.label}`}
              src={source.url}
              className={styles.iframe}
              allow="fullscreen; geolocation"
              referrerPolicy="no-referrer-when-downgrade"
              onError={() => setIframeBlocked(true)}
            />
          ) : (
            <div className={styles.fallback}>
              <p>Este site bloqueou o embed no iframe.</p>
              <a href={source.url} target="_blank" rel="noopener noreferrer">
                Abrir {source.label}
              </a>
            </div>
          )}
          <button
            type="button"
            className={styles.blockedHint}
            onClick={() => setIframeBlocked(true)}
          >
            Mapa em branco? Use “Abrir em nova aba”
          </button>
        </div>

        <aside className={styles.side}>
          <h3 className={styles.sideTitle}>Distritos (campanha)</h3>
          <div className={styles.districtList}>
            {districts.map((d) => {
              const ctrl =
                control.find((c) => c.districtId === d.id)?.controller || 'contested';
              return (
                <button
                  key={d.id}
                  type="button"
                  className={
                    selected === d.id ? styles.districtActive : styles.districtBtn
                  }
                  onClick={() => setSelected(d.id)}
                >
                  <strong>{d.name}</strong>
                  <span>
                    perigo {d.danger}/5 · {ctrl}
                  </span>
                </button>
              );
            })}
          </div>

          <div className={styles.detail}>
            {selectedDistrict ? (
              <>
                <h4>{selectedDistrict.name}</h4>
                <p>{selectedDistrict.vibes}</p>
                <p>
                  Controle:{' '}
                  {control.find((c) => c.districtId === selected)?.controller ||
                    'contested'}
                </p>
                <div className={styles.actions}>
                  <HudButton onClick={() => claim(selectedDistrict.id, 'crew')}>
                    Território crew
                  </HudButton>
                  <HudButton
                    variant="ghost"
                    onClick={() => claim(selectedDistrict.id, 'contested')}
                  >
                    Contestado
                  </HudButton>
                </div>
                <h4>Gigs</h4>
                <ul>
                  {gigs
                    .filter((g) => g.districtId === selected)
                    .map((g) => (
                      <li key={g.id}>
                        {g.name} — risco {g.risk} — ¤{g.pay}
                      </li>
                    ))}
                  {gigs.filter((g) => g.districtId === selected).length === 0 && (
                    <li>Nenhum gig neste distrito</li>
                  )}
                </ul>
              </>
            ) : (
              <p>Selecione um distrito na lista.</p>
            )}
          </div>

          <p className={styles.credits}>
            Mapas: Piggyback / CDPR · MapGenie · NightCity.io · cyberpunkmap.app — uso
            embutido para referência de mesa; conteúdo permanece dos respectivos
            autores.
          </p>
        </aside>
      </div>
    </div>
  );
};

export default MapPage;
