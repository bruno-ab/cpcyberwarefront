'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../header/Header';
import styles from './background.module.css';
import CreateForm from './createCharacterForm';
import { apiUrl, authHeaders } from '../../lib/api';

const imgPath = '/characters/placeholder.png';

const getPlayerCharacters = async () => {
  try {
    const response = await fetch(apiUrl('/api/characters/player/characters'), {
      method: 'GET',
      headers: authHeaders(),
    });
    if (response.ok) {
      const json = await response.json();
      return Array.isArray(json) ? json : [];
    }
    return [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

function Characters() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }
    (async () => {
      setLoading(true);
      const result = await getPlayerCharacters();
      setData(result);
      setError(
        result.length === 0
          ? 'Nenhum runner cadastrado nesta conta ainda.'
          : '',
      );
      setLoading(false);
    })();
  }, [router]);

  const handleCharacterClick = (characterId: number) => {
    router.push(`/sheet?id=${characterId}`);
  };

  const openCyberware = (e: React.MouseEvent, characterId: number) => {
    e.stopPropagation();
    router.push(`/cyberware?id=${characterId}`);
  };

  // Evita mismatch de hydration: SSR e 1º paint do cliente são iguais
  if (!mounted) {
    return (
      <div className={styles.page}>
        <Header />
        <h2 className={styles.titulo}>Personagens</h2>
        <p className={styles.status}>Carregando personagens…</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Header />
      <h2 className={styles.titulo}>Personagens</h2>
      {loading && <p className={styles.status}>Carregando personagens…</p>}
      {!loading && error ? <p className={styles.status}>{error}</p> : null}
      <div className={styles.characterGrid}>
        {data.map((character: any) => (
          <div
            key={character.id}
            className={`${styles.img2} ${styles.imagen}`}
            onClick={() => handleCharacterClick(character.id)}
          >
            <img
              src={imgPath}
              alt={character.name}
              style={{ width: '100%', height: '100%' }}
            />
            <div className={styles.captioncontainer}>
              <div className={styles.caption}>
                <h3>{character.name}</h3>
                <hr />
                <p>{character.role}</p>
                <p>Um runner que ainda quer virar lenda em Night City.</p>
                <button
                  type="button"
                  className={styles.cwBtn}
                  onClick={(e) => openCyberware(e, character.id)}
                >
                  Chrome
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <CreateForm />
    </div>
  );
}

export default Characters;
