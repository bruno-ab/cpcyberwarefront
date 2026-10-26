'use client';

import { PageFrame } from '../components/layout/PageFrame';
import { HomeCtaRow } from '../components/home/HomeCtaRow';
import { HomeDeckGadgets } from '../components/home/HomeDeckGadgets';
import { HomeGlitchTitle } from '../components/home/HomeGlitchTitle';
import { HomeUplink } from '../components/home/HomeUplink';
import { useTranslations } from '../i18n/useTranslations';
import styles from './home.module.css';

const Home = () => {
  const { t } = useTranslations();

  return (
    <PageFrame>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>{t('common.tagline')}</p>
          <HomeGlitchTitle
            brand={t('common.appName')}
            headline={t('home.hero')}
          />
          <p className={styles.sub}>{t('home.sub')}</p>
          <HomeCtaRow />
        </div>
        <HomeUplink />
      </section>
      <HomeDeckGadgets />
    </PageFrame>
  );
};

export default Home;
