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
import RoleAbilities from './RoleAbilities';
import SheetAmbientGlitches from './SheetAmbientGlitches';
import SheetPhone from './SheetPhone';
import SheetRoster from './SheetRoster';
import styles from './page.module.css';
import { apiUrl, authHeaders } from '../../lib/api';

type TabId =
  | 'resumo'
  | 'atributos'
  | 'habilidades'
  | 'role'
  | 'chrome'
  | 'recursos'
  | 'inventario';

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'resumo', label: 'Resumo' },
  { id: 'atributos', label: 'Atributos' },
  { id: 'habilidades', label: 'Habilidades' },
  { id: 'role', label: 'Role' },
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
      setCharacterData(null);
      setError('');
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
        setCharacterData(null);
      }
    } catch (err) {
      console.error(err);
      setError('Falha de rede ao carregar personagem.');
      setCharacterData(null);
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

  if (!id) {
    return (
      <section className={styles.sheetPage}>
        <Header />
        <SheetRoster />
      </section>
    );
  }

  if (error && !characterData) {
    return (
      <section className={styles.sheetPage}>
        <Header />
        <p className={styles.error}>{error}</p>
        <p className={styles.hint}>
          <Link href="/sheet">← Voltar ao roster da campanha</Link>
        </p>
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
      <SheetAmbientGlitches />
      <Header />
      <p className={styles.backRow}>
        <Link href="/sheet">← Campanha / missões</Link>
      </p>
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
              <div className={styles.summaryCard} data-band="bruise">
                <span className={styles.cardScan} aria-hidden />
                <span>Edges (E)</span>
                <strong>{edges}</strong>
              </div>
              <div className={styles.summaryCard} data-band="ok">
                <span className={styles.cardScan} aria-hidden />
                <span>Eddies</span>
                <strong>{Number(credits) || 0}</strong>
              </div>
              <div className={styles.summaryCard} data-band="hurt">
                <span className={styles.cardScan} aria-hidden />
                <span>Chrome</span>
                <strong>{characterData.cyberwares?.length || 0} peças</strong>
              </div>
              <div className={styles.summaryCard} data-band="crit">
                <span className={styles.cardScan} aria-hidden />
                <span>Role</span>
                <strong>
                  {characterData.role ||
                    characterData.sheet?.header?.role ||
                    '—'}
                </strong>
              </div>
            </div>

            <h3 className={styles.attributesSection}>Role Ability</h3>
            <RoleAbilities characterData={characterData} compact />

            <h3 className={styles.attributesSection}>Atributos</h3>
            <Attributes characterData={characterData} />

            <h3 className={styles.attributesSection}>Habilidades</h3>
            <Abilities characterData={characterData} />

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

        {tab === 'role' && (
          <>
            <h3 className={styles.attributesSection}>Habilidades de Role</h3>
            <RoleAbilities characterData={characterData} />
            <p className={styles.hint}>
              Detalhes de patamares e lore: capítulo{' '}
              <Link href="/book">Roles e Role Abilities</Link> no Book.
            </p>
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
            <div className={styles.inventoryRow} data-band="ok">
              <span className={styles.cardScan} aria-hidden />
              <span>Eddies na conta</span>
              <strong>{Number(credits) || 0}</strong>
            </div>
            <div className={styles.inventoryRow} data-band="bruise">
              <span className={styles.cardScan} aria-hidden />
              <span>Edges (moeda de chrome)</span>
              <strong>{Number(edges) || 0} E</strong>
            </div>
            <p className={styles.hint}>
              Itens de gear e veículos da campanha ficam no{' '}
              <Link href="/shop">Ripperdoc / loja</Link> e no quadro de{' '}
              <Link href="/gigs">gigs</Link>.
            </p>
          </div>
        )}
      </div>

      <SheetPhone
        characterId={String(characterData.id)}
        characterName={characterData.name || 'Runner'}
      />
    </section>
  );
};

export default Sheet;
