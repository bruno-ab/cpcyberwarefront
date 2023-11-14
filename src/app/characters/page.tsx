'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../header/Header';
import styles from './background.module.css';
const imgPath = '/characters/placeholder.png';
import CreateForm from './createCharacterForm'


const getPlayerCharacters = async () => {
  try {
    const response = await fetch('http://localhost:4444/characters/player/characters', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
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

export function Characters() {
  const router = useRouter();
  const accessToken = localStorage.getItem('access_token');

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

  return (
    <div>
      <Header />
      <h2 className={styles.titulo}>Characters</h2>
      <div className={styles.characterGrid}>
        {data && data.map((character) => (
        // eslint-disable-next-line react/jsx-key
        <div className={`${styles.img2} ${styles.imagen}`}>
          <img src={imgPath} alt={character.name} style={{ width: '100%', height: '100%' }} />
          <div className={styles.captioncontainer}>
            <div className={styles.caption}>
              <h3>{character.name}</h3>
              <hr />
              <p>
                {character.role}
              </p>
              <p>
                An iconic character that wants to be a legend in Nigh City.
              </p>
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
