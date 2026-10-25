'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageFrame } from '../../components/layout/PageFrame';
import { HudButton } from '../../components/ui/HudButton';
import { HudPanel } from '../../components/ui/HudPanel';
import { ShardConsole } from '../../components/secrets/ShardConsole';
import { useTranslations } from '../../i18n/useTranslations';
import styles from './account.module.css';

const AccountPage = () => {
  const router = useRouter();
  const { t } = useTranslations('account');
  const { t: tc } = useTranslations('common');
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
        <p className={styles.status}>{tc('loading')}</p>
      </PageFrame>
    );
  }

  return (
    <PageFrame>
      <div className={styles.page}>
        <header className={styles.hero}>
          <div>
            <h1>{t('title')}</h1>
            <p>{t('sub')}</p>
          </div>
        </header>

        <HudPanel title={t('sessionTitle')}>
          <p className={styles.meta}>
            {t('statusLabel')}{' '}
            <strong data-ok={hasToken}>
              {hasToken ? t('statusOnline') : t('statusOffline')}
            </strong>
          </p>
          <div className={styles.actions}>
            {hasToken ? (
              <>
                <Link href="/characters">
                  <HudButton>{t('characters')}</HudButton>
                </Link>
                <HudButton variant="ghost" type="button" onClick={logout}>
                  {t('logout')}
                </HudButton>
              </>
            ) : (
              <>
                <Link href="/login">
                  <HudButton>{t('jackIn')}</HudButton>
                </Link>
                <Link href="/register">
                  <HudButton variant="ghost">{t('register')}</HudButton>
                </Link>
              </>
            )}
          </div>
        </HudPanel>

        <ShardConsole />
      </div>
    </PageFrame>
  );
};

export default AccountPage;
