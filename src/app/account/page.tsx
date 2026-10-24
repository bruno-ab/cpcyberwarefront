'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageFrame } from '../../components/layout/PageFrame';
import { HudButton } from '../../components/ui/HudButton';
import { HudPanel } from '../../components/ui/HudPanel';
import styles from './account.module.css';

const AccountPage = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setMounted(true);
    setHasToken(!!localStorage.getItem('access_token'));
  }, []);

  const logout = () => {
    localStorage.removeItem('access_token');
    setHasToken(false);
    router.push('/login');
  };

  if (!mounted) {
    return (
      <PageFrame>
        <p className={styles.status}>Sincronizando conta…</p>
      </PageFrame>
    );
  }

  return (
    <PageFrame>
      <div className={styles.page}>
        <header className={styles.hero}>
          <div>
            <h1>Conta</h1>
            <p>Sessão na rede Night City — link, crew e saída segura.</p>
          </div>
        </header>

        <HudPanel title="Sessão">
          <p className={styles.meta}>
            Status:{' '}
            <strong data-ok={hasToken}>
              {hasToken ? 'LINK ATIVO' : 'OFFLINE'}
            </strong>
          </p>
          <div className={styles.actions}>
            {hasToken ? (
              <>
                <Link href="/characters">
                  <HudButton>Personagens</HudButton>
                </Link>
                <HudButton variant="ghost" type="button" onClick={logout}>
                  Desconectar
                </HudButton>
              </>
            ) : (
              <>
                <Link href="/login">
                  <HudButton>Jack in</HudButton>
                </Link>
                <Link href="/register">
                  <HudButton variant="ghost">Registrar</HudButton>
                </Link>
              </>
            )}
          </div>
        </HudPanel>
      </div>
    </PageFrame>
  );
};

export default AccountPage;
