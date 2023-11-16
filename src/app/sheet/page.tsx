'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation'
import Header from '../header/Header';
import Attributes from './attributes';
import Abilities from './abilities';
import CyberPunkResource from './resource';
import CHeader from './cHeader';
import styles from './page.module.css';

export function Sheet() {
  const [characterData, setCharacterData] = useState(null);
  const searchParams = useSearchParams()
 
  const id = searchParams.get('id')

  useEffect(() => {
    const fetchCharacterData = async () => {
      try {
        if (id) {
          const response = await fetch(`http://localhost:4444/characters/${id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
            },
          });

          if (response.ok) {
            const data = await response.json();
            setCharacterData(data);
          } else {
            console.log('Error fetching character data');
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchCharacterData();
  }, [id]);

  if (!characterData) {
    return null;
  }

  return (
    <section>
      <Header />
      <CHeader characterData={characterData} />
      <h3 className={styles.attributesSection}>Attributes</h3>
      <Attributes characterData={characterData} />
      <h3 className={characterData.attributesSection}>Abilities</h3>
      <Abilities characterData={characterData} />
      <h3 className={styles.attributesSection}>Resources</h3>
      <CyberPunkResource characterData={characterData} />
    </section>
  );
}

export default Sheet;
