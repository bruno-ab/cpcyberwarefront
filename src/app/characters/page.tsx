'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageFrame } from '../../components/layout/PageFrame';
import { HudButton } from '../../components/ui/HudButton';
import { apiUrl, authHeaders } from '../../lib/api';
import { characterImageSrc } from '../../lib/media';
import { CharacterWizard } from './CharacterWizard';
import styles from './characters.module.css';

type Character = {
  id: string;
  name: string;
  role?: string;
  image?: string | null;
  credits?: number;
  sheet?: {
    header?: Record<string, string>;
    other_traits?: { edges?: number };
  };
};

const loadCharacters = async (): Promise<Character[]> => {
  try {
    const response = await fetch(apiUrl('/api/characters/player/characters'), {
      method: 'GET',
      headers: authHeaders(),
    });
    if (!response.ok) return [];
    const json = await response.json();
    return Array.isArray(json) ? json : [];
  } catch {
    return [];
  }
};

const CharactersPage = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setData(await loadCharacters());
    setLoading(false);
  }, []);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }
    if (new URLSearchParams(window.location.search).get('wizard') === '1') {
      setShowWizard(true);
    }
    refresh();
  }, [router, refresh]);

  if (!mounted) {
    return (
      <PageFrame>
        <div className={styles.page}>
          <p className={styles.status}>Sincronizando crew…</p>
        </div>
      </PageFrame>
    );
  }

  return (
    <PageFrame>
      <div className={styles.page}>
        <header className={styles.hero}>
          <div>
            <h1>Personagens</h1>
            <p>
              Sua crew em Night City. Abra a ficha, o ripperdoc ou registre um
              novo runner no wizard.
            </p>
          </div>
          <HudButton
            type="button"
            onClick={() => setShowWizard((v) => !v)}
          >
            {showWizard ? 'Fechar wizard' : 'Novo personagem'}
          </HudButton>
        </header>

        {showWizard && (
          <div className={styles.wizardSlot}>
            <CharacterWizard
              onCreated={() => {
                refresh();
                setShowWizard(false);
              }}
            />
          </div>
        )}

        {loading && <p className={styles.status}>Carregando personagens…</p>}

        {!loading && data.length === 0 && (
          <div className={styles.empty}>
            <strong>Nenhum runner nesta conta</strong>
            Abra o wizard e jacke o primeiro personagem.
          </div>
        )}

        <div className={styles.grid}>
          {data.map((character) => {
            const header = character.sheet?.header || {};
            const edges = character.sheet?.other_traits?.edges ?? '—';
            const initial = (character.name || '?').slice(0, 1).toUpperCase();
            return (
              <div key={character.id} className={styles.card}>
                <div className={styles.cardArt} aria-hidden>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={characterImageSrc(character)}
                    alt=""
                    className={styles.cardPortrait}
                    onError={(e) => {
                      const el = e.currentTarget;
                      el.style.display = 'none';
                      const sibling = el.nextElementSibling as HTMLElement | null;
                      if (sibling) sibling.style.display = 'grid';
                    }}
                  />
                  <span className={styles.cardInitial}>{initial}</span>
                </div>
                <div className={styles.cardBody}>
                  <h3>{character.name}</h3>
                  <p className={styles.role}>{character.role || 'Edgerunner'}</p>
                  <p className={styles.meta}>
                    {header.city || 'Night City'}
                    {header.origin ? ` · ${header.origin}` : ''}
                    {' · '}
                    {edges} E · {character.credits ?? 0} eddies
                  </p>
                  {header.concept && (
                    <p className={styles.meta}>{header.concept}</p>
                  )}
                  <div className={styles.cardActions}>
                    <button
                      type="button"
                      onClick={() => router.push(`/sheet?id=${character.id}`)}
                    >
                      Ficha
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        router.push(`/cyberware?id=${character.id}`)
                      }
                    >
                      Chrome
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        router.push(`/id-card?id=${character.id}`)
                      }
                    >
                      ID
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PageFrame>
  );
};

export default CharactersPage;
