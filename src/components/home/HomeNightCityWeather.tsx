'use client';

import { useCallback } from 'react';
import { playCyberSound } from '../../lib/sound/cyberSounds';
import {
  nextWeatherMode,
  weatherDef,
  WEATHER_ROTATE_MS,
  type NightCityWeatherMode,
} from './homeWeatherModes';
import styles from './HomeNightCityWeather.module.css';

type Props = {
  mode: NightCityWeatherMode;
  onModeChange: (mode: NightCityWeatherMode) => void;
  autoRotate: boolean;
};

export const HomeNightCityWeather = ({ mode, onModeChange, autoRotate }: Props) => {
  const def = weatherDef(mode);

  const cycle = useCallback(() => {
    playCyberSound('ui', { volume: 0.22 });
    onModeChange(nextWeatherMode(mode));
  }, [mode, onModeChange]);

  return (
    <section className={styles.panel} aria-label="Clima ambiente de Night City">
      <div className={styles.head}>METEO NC · SENSOR AMBIENTE</div>
      <p className={styles.hud}>{def.hudLabel}</p>
      <p className={styles.ambient}>{def.ambient}</p>
      <div className={styles.actions}>
        <button type="button" className={styles.cycleBtn} onClick={cycle}>
          CICLAR CLIMA
        </button>
      </div>
      {autoRotate ? (
        <span className={styles.autoHint}>
          Rotação automática a cada {Math.round(WEATHER_ROTATE_MS / 60000)} min (FX on).
        </span>
      ) : (
        <span className={styles.autoHint}>Rotação automática pausada (FX off / movimento reduzido).</span>
      )}
    </section>
  );
};
