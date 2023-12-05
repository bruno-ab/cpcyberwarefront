'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation'
import Header from '../header/Header';
import Attributes from './attributes';
import Abilities from './abilities';
import CyberPunkResource from './resource';
import CHeader from './cHeader';
import styles from './page.module.css';
import VitalityField from './vitality'

function Sheet() {
  const [characterData, setCharacterData] = useState(null);
  const searchParams = useSearchParams()
  const id = searchParams.get('id')

  useEffect(() => {
    const fetchCharacterData = async () => {
      try {
        if (id) {
          const response = await fetch(`https://cyberpunk-api-262d98a845d6.herokuapp.com/api/characters/${id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
            },
          });

      
          if (response.ok) {
            const data = await response.json();
            console.log(data)
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
      <h3 className={styles.attributesSection}>Vitality</h3>
      <VitalityField characterData={characterData} />
      <h3 className={styles.attributesSection}>Attributes</h3>
      <Attributes characterData={characterData} />
         <h3 className={styles.attributesSection}>Abilities</h3>
      <Abilities characterData={characterData} />
      <h3 className={styles.attributesSection}>Resources</h3>
      <CyberPunkResource characterData={characterData} />
 
    </section>
  );
}

export default Sheet;
