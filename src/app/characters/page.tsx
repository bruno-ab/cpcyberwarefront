'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../header/Header';
import styles from './background.module.css';
const imgPath = '/characters/placeholder.png';
import CreateForm from './createCharacterForm'

const getLocalStorage = () => {
    return typeof window !== "undefined" ? window.localStorage.getItem('access_token') : false
}

const setLocalStorage = (token: string) => {
    typeof window !== "undefined" ? window.localStorage.setItem('access_token', token) : false
}

const getPlayerCharacters = async () => {
  try {
    const response = await fetch('https://cyberpunk-api-262d98a845d6.herokuapp.com/characters/player/characters', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getLocalStorage(),
      },
    });

    if (response.ok) {
      return response.json();
    } else {
      console.log("error");
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

function Characters() {
  const router = useRouter();
  const accessToken = getLocalStorage();

  if (!accessToken) {
    router.push("/login");
  }

  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const result = await getPlayerCharacters();
      setData(result);
    };
    fetchData();
  }, []);

  const handleCharacterClick = (characterId) => {
    // Redirecionar para a página '/sheet' com o ID do personagem na URL
    router.push(`/sheet?id=${characterId}`);
  };

  return (
    <div>
      <Header />
      <h2 className={styles.titulo}>Characters</h2>
      <div className={styles.characterGrid}>
        {data && data.map((character) => (
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