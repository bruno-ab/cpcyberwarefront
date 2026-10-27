'use client';

import { useEffect, useMemo, useState } from 'react';
import { IdCardBadge } from './IdCardBadge';
import {
  buildCharacterFileDossier,
  type CharacterFileSource,
} from './characterFileFlavor';
import { useMotion } from '../../motion/useMotion';
import styles from './CharacterFileDossier.module.css';

type Props = {
  character: CharacterFileSource;
  /** Parent hover/focus — Netrunner decrypt. */
  revealed?: boolean;
  className?: string;
};

export const CharacterFileDossier = ({
  character,
  revealed = false,
  className,
}: Props) => {
  const { animationsOn, mounted: motionMounted } = useMotion();
  const model = useMemo(
    () => buildCharacterFileDossier(character),
    [character],
  );
  const [glitchPulse, setGlitchPulse] = useState(false);

  const encrypted = model.isNetrunner && !revealed;
  const fxLive = motionMounted && animationsOn;

  useEffect(() => {
    if (!fxLive) {
      setGlitchPulse(false);
      return;
    }
    let timeoutId = 0;
    let offId = 0;
    const schedule = () => {
      const delay = 2800 + Math.floor(Math.random() * 5200);
      timeoutId = window.setTimeout(() => {
        setGlitchPulse(true);
        offId = window.setTimeout(() => {
          setGlitchPulse(false);
          schedule();
        }, 150);
      }, delay);
    };
    schedule();
    return () => {
      window.clearTimeout(timeoutId);
      window.clearTimeout(offId);
    };
  }, [fxLive, character.id, encrypted]);

  const idCard = String(character.idCard ?? '').trim();

  return (
    <div
      className={[styles.dossier, className].filter(Boolean).join(' ')}
      data-role={model.roleId}
      data-encrypted={encrypted ? 'true' : 'false'}
      data-glitch={glitchPulse ? 'true' : 'false'}
      data-revealed={revealed ? 'true' : 'false'}
    >
      <div className={styles.head}>
        <span
          className={styles.fileName}
          data-encrypted={encrypted ? 'true' : 'false'}
        >
          FILE: {encrypted ? model.encryptedFileName : model.fileName}
        </span>
        <span
          className={styles.classTag}
          data-encrypted={encrypted ? 'true' : 'false'}
        >
          {encrypted ? model.encryptedClassification : model.classification}
        </span>
      </div>

      <p
        className={styles.tagline}
        data-encrypted={encrypted ? 'true' : 'false'}
      >
        {encrypted ? model.encryptedTagline : model.tagline}
      </p>

      <ul className={styles.rows}>
        {model.rows.map((row) => {
          if (row.key === 'id') {
            return (
              <li key={row.key} className={styles.row}>
                <span className={styles.label}>{row.label}</span>
                <div
                  className={styles.idSlot}
                  data-encrypted={encrypted ? 'true' : 'false'}
                  data-hint="REDACTED — hover / focus to decrypt"
                >
                  {encrypted ? (
                    <span
                      className={styles.value}
                      data-encrypted="true"
                      data-sensitive="true"
                      aria-hidden
                    >
                      {row.encryptedValue}
                    </span>
                  ) : idCard ? (
                    <div className={styles.idReveal}>
                      <IdCardBadge code={idCard} />
                    </div>
                  ) : (
                    <span className={styles.value}>{row.value}</span>
                  )}
                  {encrypted ? (
                    <span className={styles.visuallyHidden}>
                      ID-card oculto. Passe o mouse ou foque o card para
                      descriptografar.
                    </span>
                  ) : null}
                </div>
              </li>
            );
          }

          return (
            <li key={row.key} className={styles.row}>
              <span className={styles.label}>{row.label}</span>
              <span
                className={styles.value}
                data-encrypted={encrypted ? 'true' : 'false'}
              >
                {encrypted ? row.encryptedValue : row.value}
              </span>
            </li>
          );
        })}
      </ul>

      <p className={styles.footer}>{model.footerHint}</p>
      {model.isNetrunner ? (
        <p className={styles.decryptCue}>
          {encrypted
            ? '// handshake pending — hover to decrypt'
            : '// ICE clear — ID-card unlocked'}
        </p>
      ) : null}
    </div>
  );
};

export default CharacterFileDossier;
