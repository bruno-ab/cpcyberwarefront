'use client';

import styles from './cheader.module.css';
import { defaultHeader } from './defaultSheet';

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
    name?: string;
    role?: string;
    sheet?: { header?: Record<string, string | number> };
  };
};

const CHeader = ({ characterData }: Props) => {
  const header = {
    ...defaultHeader,
    ...(characterData?.sheet?.header || {}),
  };

  const fields = Object.entries(header).filter(([key]) => key !== 'name');

  return (
    <header className={styles.wrap}>
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
    </header>
  );
};

export default CHeader;
