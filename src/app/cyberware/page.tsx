'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '../header/Header';
import { BodyFigure } from './BodyFigure';
import { CyberwareShop } from '../../components/cyberware/CyberwareShop';
import {
  BodyPart,
  BODY_PART_LABELS,
  bodyPartsWithInstalledChrome,
} from '../../data/bodyPartSlots';
import { apiUrl, authHeaders } from '../../lib/api';
import charStyles from '../characters/background.module.css';
import styles from './cyberware-page.module.css';

const CyberWare = () => {
  const [characterData, setCharacterData] = useState<any>(null);
  const [characters, setCharacters] = useState<any[]>([]);
  const [status, setStatus] = useState('Carregando…');
  const [mounted, setMounted] = useState(false);
  const [selectedPart, setSelectedPart] = useState<BodyPart | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const loadList = async () => {
      try {
        const response = await fetch(apiUrl('/api/characters/player/characters'), {
          method: 'GET',
          headers: authHeaders(),
        });
        if (response.ok) {
          const list = await response.json();
          setCharacters(Array.isArray(list) ? list : []);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadList();
  }, []);

  const fetchCharacterData = async () => {
    if (!id) {
      setCharacterData(null);
      setStatus('Escolha um personagem para acessar o ripperdoc.');
      return;
    }
    setStatus('Carregando personagem…');
    try {
      const response = await fetch(apiUrl(`/api/characters/${id}`), {
        method: 'GET',
        headers: authHeaders(),
      });
      if (response.ok) {
        setCharacterData(await response.json());
        setStatus('');
      } else {
        setStatus('Não foi possível carregar o personagem.');
        setCharacterData(null);
      }
    } catch (error) {
      console.error(error);
      setStatus('Falha de rede ao carregar personagem.');
      setCharacterData(null);
    }
  };

  useEffect(() => {
    fetchCharacterData();
  }, [id]);

  const handleSelectPart = (part: BodyPart) => {
    setSelectedPart((prev) => (prev === part ? null : part));
  };

  if (!mounted) {
    return (
      <section className={styles.page}>
        <Header />
        <h2 className={styles.title}>Chrome</h2>
        <p className={styles.hint}>Carregando…</p>
      </section>
    );
  }

  if (!id || !characterData) {
    return (
      <section className={charStyles.page}>
        <Header />
        <h2 className={charStyles.titulo}>Chrome</h2>
        <p className={charStyles.status}>{status}</p>
        <div className={charStyles.characterGrid}>
          {characters.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`${charStyles.img2} ${charStyles.imagen}`}
              style={{ cursor: 'pointer', color: '#fff' }}
              onClick={() => router.push(`/cyberware?id=${c.id}`)}
            >
              <div className={charStyles.captioncontainer} style={{ opacity: 1 }}>
                <div className={charStyles.caption} style={{ opacity: 1 }}>
                  <h3>{c.name}</h3>
                  <hr />
                  <p>{c.role}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <Header />
      <h2 className={styles.title}>Chrome — {characterData.name}</h2>
      <p className={styles.hint}>
        Clique numa região do corpo para ver o chrome daquela área ·{' '}
        <button
          type="button"
          className={styles.cwBtn}
          onClick={() => router.push(`/sheet?id=${id}`)}
        >
          Abrir ficha
        </button>
      </p>

      <div className={styles.layout}>
        <aside className={styles.bodyCol}>
          <div className={styles.bodyWrap}>
            <BodyFigure
              selectedPart={selectedPart}
              onSelectPart={handleSelectPart}
              installedParts={bodyPartsWithInstalledChrome(
                (characterData.cyberwares || []).map(
                  (cw: { type?: string }) => cw.type,
                ),
              )}
            />
          </div>
          <span className={styles.bodyHint}>
            {selectedPart
              ? BODY_PART_LABELS[selectedPart]
              : 'Toque numa região'}
          </span>
        </aside>

        <div className={styles.mainCol}>
          <CyberwareShop
            characterId={characterData.id}
            sheet={characterData.sheet || {}}
            installed={characterData.cyberwares || []}
            selectedPart={selectedPart}
            onClearPart={() => setSelectedPart(null)}
            onUpdated={fetchCharacterData}
          />
        </div>
      </div>
    </section>
  );
};

export default CyberWare;
