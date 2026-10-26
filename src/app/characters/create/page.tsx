'use client';

import Link from 'next/link';
import { PageFrame } from '../../../components/layout/PageFrame';
import { HudButton } from '../../../components/ui/HudButton';
import { CharacterWizard } from '../CharacterWizard';
import styles from '../characters.module.css';

const CreateCharacterPage = () => (
  <PageFrame>
    <div className={styles.page}>
      <header className={styles.hero}>
        <div>
          <h1>Novo personagem</h1>
          <p>
            Ficha independente de campanha. Depois, compartilhe o ID-card com o
            narrador ou entre no roster em Campanhas.
          </p>
        </div>
        <Link href="/characters">
          <HudButton variant="ghost">Voltar</HudButton>
        </Link>
      </header>
      <CharacterWizard />
    </div>
  </PageFrame>
);

export default CreateCharacterPage;
