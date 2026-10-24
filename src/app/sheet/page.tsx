'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
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

type TabId = 'resumo' | 'atributos' | 'habilidades' | 'chrome' | 'recursos' | 'inventario';

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'resumo', label: 'Resumo' },
  { id: 'atributos', label: 'Atributos' },
  { id: 'habilidades', label: 'Habilidades' },
  { id: 'chrome', label: 'Chrome' },
  { id: 'recursos', label: 'Recursos' },
  { id: 'inventario', label: 'Inventário' },
];

const Sheet = () => {
  const [characterData, setCharacterData] = useState<any>(null);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<TabId>('resumo');
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

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
        setCharacterData(await response.json());
        setError('');
      } else {
        setError('Erro ao carregar personagem.');
      }
    } catch (err) {
      console.error(err);
      setError('Falha de rede ao carregar personagem.');
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchCharacterData();
  }, [id]);

  if (!mounted) {
    return (
      <section className={styles.sheetPage}>
        <Header />
        <p className={styles.loading}>Carregando ficha…</p>
      </section>
    );
  }

  if (error && !characterData) {
    return (
      <section className={styles.sheetPage}>
        <Header />
        <p className={styles.error}>{error}</p>
      </section>
    );
  }

  if (!characterData) {
    return (
      <section className={styles.sheetPage}>
        <Header />
        <p className={styles.loading}>Carregando ficha…</p>
      </section>
    );
  }

  const edges = characterData.sheet?.other_traits?.edges ?? 0;
  const credits = characterData.credits ?? 0;

  return (
    <section className={styles.sheetPage}>
      <Header />
      <CHeader characterData={characterData} />

      <nav className={styles.tabs} aria-label="Seções da ficha">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={tab === t.id ? styles.tabActive : styles.tab}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className={styles.tabBody}>
        {tab === 'resumo' && (
          <>
            <h3 className={styles.attributesSection}>Vitalidade</h3>
            <VitalityField characterData={characterData} />
            <div className={styles.summaryCards}>
              <div className={styles.summaryCard}>
                <span>Edges (E)</span>
                <strong>{edges}</strong>
              </div>
              <div className={styles.summaryCard}>
                <span>Eddies</span>
                <strong>¤{credits}</strong>
              </div>
              <div className={styles.summaryCard}>
                <span>Chrome</span>
                <strong>{characterData.cyberwares?.length || 0} peças</strong>
              </div>
            </div>
            <p className={styles.hint}>
              Para comprar e instalar chrome, use o{' '}
              <Link href={`/cyberware?id=${characterData.id}`}>ripperdoc</Link>.
            </p>
          </>
        )}

        {tab === 'atributos' && (
          <>
            <h3 className={styles.attributesSection}>Atributos</h3>
            <Attributes characterData={characterData} />
          </>
        )}

        {tab === 'habilidades' && (
          <>
            <h3 className={styles.attributesSection}>Habilidades</h3>
            <Abilities characterData={characterData} />
          </>
        )}

        {tab === 'chrome' && (
          <>
            <CyberCapacity characterData={characterData} />
            <p className={styles.hint}>
              <Link href={`/cyberware?id=${characterData.id}`}>
                Abrir ripperdoc (comprar & instalar) →
              </Link>
            </p>
          </>
        )}

        {tab === 'recursos' && (
          <>
            <h3 className={styles.attributesSection}>Recursos & Antecedentes</h3>
            <CyberPunkResource characterData={characterData} />
          </>
        )}

        {tab === 'inventario' && (
          <div className={styles.inventory}>
            <h3 className={styles.attributesSection}>Inventário</h3>
            <p>
              Eddies na conta: <strong>¤{credits}</strong>
            </p>
            <p>
              Edges (moeda de chrome): <strong>{edges} E</strong>
            </p>
            <p className={styles.hint}>
              Itens de gear e veículos da campanha ficam no{' '}
              <Link href="/shop">Ripperdoc / loja</Link> e no quadro de{' '}
              <Link href="/gigs">gigs</Link>.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Sheet;
