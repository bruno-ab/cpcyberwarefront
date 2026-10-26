'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageFrame } from '../../components/layout/PageFrame';
import { HudPanel } from '../../components/ui/HudPanel';
import { HudButton } from '../../components/ui/HudButton';
import { IdCardBadge } from '../../components/characters/IdCardBadge';
import { apiUrl, authHeaders } from '../../lib/api';
import { getAccessToken, getPlayerIdFromToken } from '../../lib/authSession';
import styles from './characters.module.css';

type CharacterRow = {
  id: string;
  name: string;
  role?: string;
  idCard?: string | null;
  id_card?: string | null;
  campaign_id?: number | null;
  campaignId?: number | null;
};

const CharactersPage = () => {
  const router = useRouter();
  const [rows, setRows] = useState<CharacterRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [hasToken, setHasToken] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setMsg('');
    const token = getAccessToken();
    setHasToken(!!token);
    if (!token) {
      setRows([]);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(apiUrl('/api/characters'), {
        headers: authHeaders(),
      });
      if (res.status === 401) {
        router.replace('/login?next=/characters');
        return;
      }
      if (!res.ok) {
        setMsg('Não foi possível carregar seus personagens.');
        setRows([]);
        return;
      }
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      const pid = getPlayerIdFromToken();
      setRows(
        list
          .filter(
            (c: CharacterRow & { player_id?: number }) =>
              !pid || Number(c.player_id) === pid,
          )
          .map((c: CharacterRow) => ({
            ...c,
            id: String(c.id),
            idCard: c.idCard ?? c.id_card ?? null,
          })),
      );
    } catch {
      setMsg('Falha de rede.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <PageFrame>
      <div className={styles.page}>
        <header className={styles.hero}>
          <div>
            <h1>Personagens</h1>
            <p>
              Crie fichas sem campanha e compartilhe o ID-card com o narrador
              para entrar na mesa. Um personagem por campanha.
            </p>
          </div>
          {hasToken ? (
            <Link href="/characters/create">
              <HudButton>Novo personagem</HudButton>
            </Link>
          ) : null}
        </header>

        {!hasToken && (
          <HudPanel title="Sessão">
            <p className={styles.status}>Faça login para ver suas fichas.</p>
            <Link href="/login?next=/characters">
              <HudButton>Entrar</HudButton>
            </Link>
          </HudPanel>
        )}

        {msg ? <p className={styles.status}>{msg}</p> : null}

        <HudPanel title="Minhas fichas">
          {loading ? (
            <p className={styles.status} aria-busy="true">
              Carregando…
            </p>
          ) : !hasToken ? (
            <p className={styles.empty}>
              Faça login para listar e criar personagens.
            </p>
          ) : rows.length === 0 ? (
            <>
              <p className={styles.status}>
                Nenhum personagem ainda. Crie um runner ou use Campanhas → Criar
                personagem para vincular direto à mesa.
              </p>
              <Link href="/characters/create">
                <HudButton>Criar personagem</HudButton>
              </Link>
            </>
          ) : (
            <ul className={styles.list}>
              {rows.map((c) => {
                const campId = c.campaignId ?? c.campaign_id;
                return (
                  <li key={c.id} className={styles.listItem}>
                    <div className={styles.listMain}>
                      <strong>{c.name}</strong>
                      {c.role ? (
                        <span className={styles.meta}> · {c.role}</span>
                      ) : null}
                      {c.idCard ? (
                        <div className={styles.idCardRow}>
                          <IdCardBadge code={c.idCard} />
                        </div>
                      ) : null}
                      <p className={styles.meta}>
                        {campId
                          ? `Campanha #${campId}`
                          : 'Sem campanha — use o ID-card para convite'}
                      </p>
                    </div>
                    <Link href={`/sheet?id=${encodeURIComponent(c.id)}`}>
                      <HudButton variant="ghost">Abrir ficha</HudButton>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </HudPanel>
      </div>
    </PageFrame>
  );
};

export default CharactersPage;
