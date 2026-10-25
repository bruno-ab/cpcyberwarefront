'use client';

import styles from './cheader.module.css';
import { defaultHeader } from './defaultSheet';
import { characterImageSrc } from '../../lib/media';

const FIELD_LABELS: Record<string, string> = {
  name: 'Nome',
  age: 'Idade',
  city: 'Cidade',
  background: 'Background',
  concept: 'Conceito',
  filiation: 'Facção',
  origin: 'Origem',
  role: 'Role',
};

type Props = {
  characterData: {
    id?: string | number;
    name?: string;
    role?: string;
    image?: string | null;
    sheet?: { header?: Record<string, string | number> };
  };
};

const CHeader = ({ characterData }: Props) => {
  const header = {
    ...defaultHeader,
    ...(characterData?.sheet?.header || {}),
  };

  const fields = Object.entries(header).filter(([key]) => key !== 'name');
  const portrait = characterImageSrc(characterData);

  return (
    <header className={styles.wrap}>
      <div className={styles.hero}>
        <div className={styles.portraitFrame}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={portrait}
            alt={characterData.name || 'Retrato'}
            className={styles.portrait}
            onError={(e) => {
              const el = e.currentTarget;
              if (el.dataset.fallback === '1') return;
              el.dataset.fallback = '1';
              el.src = '/images/npcs/default.svg';
            }}
          />
        </div>
        <div className={styles.heroText}>
          <div className={styles.titleRow}>
            <h1 className={styles.name} data-text={characterData.name || '—'}>
              {characterData.name || '—'}
            </h1>
            {(characterData.role || header.role) && (
              <span className={styles.role}>
                {String(characterData.role || header.role)}
              </span>
            )}
          </div>
          <dl className={styles.meta}>
            {fields.map(([key, value]) => (
              <div key={key} className={styles.metaItem}>
                <dt>{FIELD_LABELS[key] || key}</dt>
                <dd>{value === '' || value == null ? '—' : String(value)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </header>
  );
};

export default CHeader;
