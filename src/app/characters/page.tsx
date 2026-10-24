'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../header/Header';
import styles from './background.module.css';
const imgPath = '/characters/placeholder.png';
import CreateForm from './createCharacterForm'
import { apiUrl, authHeaders } from '../../lib/api'

const getLocalStorage = () => {
    return typeof window !== "undefined" ? window.localStorage.getItem('access_token') : null
}

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
    console.log('characters fetch failed', response.status);
    return [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

function Characters() {
  const router = useRouter();
  const accessToken = getLocalStorage();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
     if (!accessToken) {
    router.push("/login");
    }
  },[accessToken, router])

  useEffect(() => {
    if (!accessToken) return;
    const fetchData = async () => {
      setLoading(true);
      const result = await getPlayerCharacters();
      setData(result);
      setError(result.length === 0 ? 'Nenhum personagem encontrado para esta conta.' : '');
      setLoading(false);
    };
    fetchData();
  }, [accessToken]);

  const handleCharacterClick = (characterId) => {
    router.push(`/sheet?id=${characterId}`);
  };

  const openCyberware = (e, characterId) => {
    e.stopPropagation();
    router.push(`/cyberware?id=${characterId}`);
  };

  return (
    <div className={styles.page}>
      <Header />
      <h2 className={styles.titulo}>Characters</h2>
      {loading && <p className={styles.status}>Carregando personagens…</p>}
      {!loading && error && <p className={styles.status}>{error}</p>}
      <div className={styles.characterGrid}>
        {data.map((character) => (
          <div
            key={character.id}
            className={`${styles.img2} ${styles.imagen}`}
            onClick={() => handleCharacterClick(character.id)}
          >
            <img src={imgPath} alt={character.name} style={{ width: '100%', height: '100%' }} />
            <div className={styles.captioncontainer}>
              <div className={styles.caption}>
                <h3>{character.name}</h3>
                <hr />
                <p>{character.role}</p>
                <p>An iconic character that wants to be a legend in Night City.</p>
                <button
                  type="button"
                  className={styles.cwBtn}
                  onClick={(e) => openCyberware(e, character.id)}
                >
                  Cyberware
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