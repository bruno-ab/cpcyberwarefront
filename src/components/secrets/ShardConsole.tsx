'use client';

import { FormEvent, useState } from 'react';
import { HudButton } from '../ui/HudButton';
import { useTranslations } from '../../i18n/useTranslations';
import { redeemCode } from '../../theme/secrets';
import { useSecrets } from '../../theme/useSecrets';
import { LORE_FRAGMENTS } from '../../theme/secrets';
import styles from './ShardConsole.module.css';

export const ShardConsole = () => {
  const { t, locale } = useTranslations('secrets');
  const { themeUnlocks, loreUnlocks, shardProgress } = useSecrets();
  const [input, setInput] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const result = redeemCode(input);
    if (!result.ok) {
      setErr(true);
      setMsg(
        result.reason === 'empty'
          ? t('console.empty')
          : t('console.unknown'),
      );
      return;
    }
    setErr(false);
    if (result.already) {
      setMsg(t('console.already'));
      return;
    }
    if (result.kind === 'theme') {
      setMsg(`${t('console.themeUnlocked')} ${t(`themes.${result.id}`)}`);
    } else if (result.kind === 'lore') {
      setMsg(t('console.loreUnlocked'));
    } else {
      setMsg(t('console.shardCollected'));
    }
    setInput('');
  };

  const lockedSlots = 3 - themeUnlocks.length;

  return (
    <section className={styles.console} aria-labelledby="shard-console-title">
      <header className={styles.head}>
        <h2 id="shard-console-title">{t('console.title')}</h2>
        <p className={styles.sub}>{t('console.sub')}</p>
      </header>

      <form className={styles.form} onSubmit={onSubmit}>
        <label className={styles.label} htmlFor="shard-code">
          {t('console.inputLabel')}
        </label>
        <div className={styles.row}>
          <input
            id="shard-code"
            className={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('console.placeholder')}
            autoComplete="off"
            spellCheck={false}
          />
          <HudButton type="submit">{t('console.submit')}</HudButton>
        </div>
        {msg ? (
          <p className={styles.msg} data-error={err || undefined}>
            {msg}
          </p>
        ) : null}
      </form>

      <div className={styles.grid}>
        <div className={styles.block}>
          <h3>{t('console.palettes')}</h3>
          <ul className={styles.list}>
            {themeUnlocks.length === 0 ? (
              <li className={styles.dim}>{t('console.noneYet')}</li>
            ) : (
              themeUnlocks.map((id) => (
                <li key={id}>{t(`themes.${id}`)}</li>
              ))
            )}
            {lockedSlots > 0
              ? Array.from({ length: Math.min(lockedSlots, 3) }).map((_, i) => (
                  <li key={`lock-${i}`} className={styles.locked}>
                    {t('console.lockedPalette')}
                  </li>
                ))
              : null}
          </ul>
        </div>

        <div className={styles.block}>
          <h3>{t('console.fragments')}</h3>
          <ul className={styles.shardRow}>
            {shardProgress.map((s) => (
              <li
                key={s.id}
                className={styles.shard}
                data-collected={s.collected || undefined}
                title={s.collected ? t('console.shardOn') : t('console.shardOff')}
              >
                <span aria-hidden>{s.glyph}</span>
              </li>
            ))}
          </ul>
          <p className={styles.dim}>{t('console.fragmentHint')}</p>
        </div>
      </div>

      {loreUnlocks.length > 0 ? (
        <div className={styles.lore}>
          <h3>{t('console.lore')}</h3>
          {loreUnlocks.map((id) => {
            const frag = LORE_FRAGMENTS[id];
            if (!frag) return null;
            const isEn = locale === 'en';
            return (
              <article key={id} className={styles.loreBit}>
                <h4>{isEn ? frag.titleEn : frag.titlePt}</h4>
                <p>{isEn ? frag.bodyEn : frag.bodyPt}</p>
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
};

export default ShardConsole;
