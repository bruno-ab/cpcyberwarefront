'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageFrame } from '../../components/layout/PageFrame';
import { CharacterWizard } from '../characters/CharacterWizard';
import styles from '../characters/characters.module.css';

const CreateWizardPage = () => {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <PageFrame>
        <p className={styles.status}>Aguardando uplink…</p>
      </PageFrame>
    );
  }

  return (
    <PageFrame>
      <div className={styles.page}>
        <header className={styles.hero}>
          <div>
            <h1>Novo personagem</h1>
            <p>
              Wizard de jack-in. Preencha identidade, origem e conceito — a ficha
              abre assim que o runner entrar na rede.
            </p>
          </div>
        </header>
        <CharacterWizard
          onCreated={() => {
            /* redirect handled inside wizard when id returns */
          }}
        />
      </div>
    </PageFrame>
  );
};

export default CreateWizardPage;
