'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '../header/Header';
import Attributes from './attributes';
import Abilities from './abilities';
import CyberPunkResource from './resource';
import CHeader from './cHeader';
import VitalityField from './vitality';
import CyberCapacity from './CyberCapacity';
import styles from './page.module.css';
import { apiUrl, authHeaders } from '../../lib/api';

const Sheet = () => {
  const [characterData, setCharacterData] = useState(null);
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  useEffect(() => {
    const fetchCharacterData = async () => {
      if (!id) {
        setError('Informe ?id= na URL da ficha.');
        return;
      }
      try {
        const response = await fetch(apiUrl(`/api/characters/${id}`), {
          method: 'GET',
          headers: authHeaders(),
        });

        if (response.ok) {
          const data = await response.json();
          setCharacterData(data);
          setError('');
        } else {
          setError('Erro ao carregar personagem.');
        }
      } catch (err) {
        console.error(err);
        setError('Falha de rede ao carregar personagem.');
      }
    };

    fetchCharacterData();
  }, [id]);

  if (error && !characterData) {
    return (
      <section>
        <Header />
        <p style={{ color: '#e8615a', padding: '1rem' }}>{error}</p>
      </section>
    );
  }

  if (!characterData) {
    return (
      <section>
        <Header />
        <p style={{ color: '#2be4ea', padding: '1rem' }}>Carregando ficha…</p>
      </section>
    );
  }

  return (
    <section>
      <Header />
      <CHeader characterData={characterData} />

      <h3 className={styles.attributesSection}>Vitality</h3>
      <VitalityField characterData={characterData} />

      <CyberCapacity characterData={characterData} />

      <h3 className={styles.attributesSection}>Attributes</h3>
      <Attributes characterData={characterData} />

      <h3 className={styles.attributesSection}>Abilities</h3>
      <Abilities characterData={characterData} />

      <h3 className={styles.attributesSection}>Resources</h3>
      <CyberPunkResource characterData={characterData} />
    </section>
  );
};

export default Sheet;
