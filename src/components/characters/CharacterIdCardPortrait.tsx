'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { characterImageSrc } from '../../lib/media';
import { useMotion } from '../../motion/useMotion';
import styles from './CharacterIdCardPortrait.module.css';

const SILHOUETTE = '/images/npcs/default.svg';
const MIN_UPLINK_MS = 520;

export type CharacterIdCardPortraitCharacter = {
  id?: string | number;
  name?: string;
  image?: string | null;
  idCard?: string | null;
  id_card?: string | null;
};

type Props = {
  character: CharacterIdCardPortraitCharacter;
  className?: string;
};

export const CharacterIdCardPortrait = ({ character, className }: Props) => {
  const { animationsOn, mounted: motionMounted } = useMotion();
  const [mounted, setMounted] = useState(false);
  const [uplink, setUplink] = useState(true);
  const [imgFailed, setImgFailed] = useState(false);
  const [glitchPulse, setGlitchPulse] = useState(false);
  const uplinkStarted = useRef(0);

  const displayName = (character.name || 'Runner').trim();
  const idHint =
    character.idCard ??
    character.id_card ??
    (character.id != null ? `NC-${String(character.id).slice(0, 8)}` : 'NC-ID');

  const src = useMemo(() => characterImageSrc(character), [character]);

  const showPhoto = mounted && !uplink && !imgFailed;
  const showSilhouette = mounted && !uplink && imgFailed;
  const fxLive = motionMounted && mounted && animationsOn;

  useEffect(() => {
    setMounted(true);
    uplinkStarted.current = Date.now();
  }, []);

  useEffect(() => {
    if (!mounted) return;
    setImgFailed(false);
    setUplink(true);
    uplinkStarted.current = Date.now();
  }, [mounted, src]);

  const finishUplink = () => {
    const elapsed = Date.now() - uplinkStarted.current;
    const wait = Math.max(0, MIN_UPLINK_MS - elapsed);
    window.setTimeout(() => setUplink(false), wait);
  };

  useEffect(() => {
    if (!fxLive) {
      setGlitchPulse(false);
      return;
    }
    let timeoutId = 0;
    let glitchOffId = 0;
    const schedule = () => {
      const delay = 3200 + Math.floor(Math.random() * 4800);
      timeoutId = window.setTimeout(() => {
        setGlitchPulse(true);
        glitchOffId = window.setTimeout(() => {
          setGlitchPulse(false);
          schedule();
        }, 140);
      }, delay);
    };
    schedule();
    return () => {
      window.clearTimeout(timeoutId);
      window.clearTimeout(glitchOffId);
    };
  }, [fxLive, src]);

  const ariaLabel = `Retrato ID Night City de ${displayName}${
    character.idCard || character.id_card
      ? `, código ${character.idCard ?? character.id_card}`
      : ''
  }`;

  return (
    <figure
      className={[styles.root, className].filter(Boolean).join(' ')}
      aria-label={ariaLabel}
    >
      <div
        className={styles.card}
        data-fx={fxLive ? 'on' : 'off'}
        data-glitch={glitchPulse ? 'true' : 'false'}
        data-state={uplink ? 'uplink' : showSilhouette ? 'fallback' : 'live'}
      >
        <div className={styles.holoFrame} aria-hidden />
        <div className={styles.photoWell}>
          {uplink ? (
            <div className={styles.uplink} aria-busy="true" aria-live="polite">
              <span className={styles.uplinkTag}>UPLINK</span>
              <span className={styles.uplinkBar} aria-hidden />
              <span className={styles.uplinkText}>Decodificando biometria…</span>
            </div>
          ) : null}
          {!uplink && showSilhouette ? (
            <div className={styles.silhouette} role="img" aria-label="Silhueta padrão sem foto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={SILHOUETTE} alt="" draggable={false} />
            </div>
          ) : null}
          {!imgFailed ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={src}
              alt=""
              draggable={false}
              className={styles.photo}
              data-visible={showPhoto ? 'true' : 'false'}
              onLoad={() => {
                finishUplink();
              }}
              onError={() => {
                setImgFailed(true);
                finishUplink();
              }}
            />
          ) : null}
        </div>
        <div className={styles.scanlines} aria-hidden />
        <div className={styles.scanSweep} aria-hidden />
        <div className={styles.rgbSplit} aria-hidden />
        <div className={styles.nameStrip}>
          <span className={styles.nameText}>{displayName}</span>
        </div>
        <div className={styles.idHint}>
          <span className={styles.idLabel}>NIGHT CITY</span>
          <span className={styles.idCode}>{String(idHint).slice(0, 14)}</span>
        </div>
      </div>
    </figure>
  );
};

export default CharacterIdCardPortrait;
