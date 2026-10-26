'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMotion } from '../../motion/useMotion';
import styles from './HomeNetGraph.module.css';

const SPARK_LEN = 20;
const STATIC_RX = 1_284_092;
const STATIC_TX = 892_441;
const STATIC_BUFFER = 58;
const STATIC_LATENCY = 16;

const seedSpark = () => Array.from({ length: SPARK_LEN }, (_, i) => 22 + ((i * 17) % 55));

const formatPkts = (n: number) => n.toLocaleString('pt-BR');

export const HomeNetGraph = () => {
  const { animationsOn } = useMotion();
  const [rx, setRx] = useState(STATIC_RX);
  const [tx, setTx] = useState(STATIC_TX);
  const [bufferPct, setBufferPct] = useState(STATIC_BUFFER);
  const [latencyMs, setLatencyMs] = useState(STATIC_LATENCY);
  const [spark, setSpark] = useState(seedSpark);

  useEffect(() => {
    if (!animationsOn) {
      setRx(STATIC_RX);
      setTx(STATIC_TX);
      setBufferPct(STATIC_BUFFER);
      setLatencyMs(STATIC_LATENCY);
      setSpark(seedSpark());
      return undefined;
    }

    const id = window.setInterval(() => {
      setRx((v) => v + Math.floor(Math.random() * 720 + 180));
      setTx((v) => v + Math.floor(Math.random() * 540 + 120));
      setBufferPct((b) => {
        const drift = (Math.random() > 0.45 ? 1 : -1) * (Math.random() * 5 + 2);
        const next = b + drift;
        if (next >= 92) return 10 + Math.random() * 18;
        return Math.max(12, Math.min(90, next));
      });
      setLatencyMs((l) => {
        const next = l + (Math.random() > 0.55 ? 1 : -1) * Math.ceil(Math.random() * 2);
        return Math.max(6, Math.min(42, next));
      });
      setSpark((prev) => [...prev.slice(1), Math.floor(Math.random() * 68 + 18)]);
    }, 420);

    return () => window.clearInterval(id);
  }, [animationsOn]);

  const rxShare = useMemo(() => {
    const total = rx + tx;
    if (total <= 0) return 50;
    return Math.round((rx / total) * 100);
  }, [rx, tx]);

  const latencyPct = Math.round((latencyMs / 48) * 100);

  return (
    <section
      className={styles.panel}
      data-live={animationsOn || undefined}
      aria-label="Telemetria de rede do deck neural"
    >
      <div className={styles.head}>
        <span>NET STACK / TELEMETRIA</span>
        <span className={styles.tag}>{animationsOn ? 'AO VIVO' : 'SNAPSHOT'}</span>
      </div>

      <div className={styles.body}>
        <div className={styles.counters}>
          <div className={styles.counter}>
            <div className={styles.counterLabel}>PACOTES RX</div>
            <div className={`${styles.counterValue} ${styles.counterValueRx}`}>
              {formatPkts(rx)}
            </div>
            <div className={styles.counterMeta}>IN · {rxShare}% do fluxo</div>
          </div>
          <div className={styles.counter}>
            <div className={styles.counterLabel}>PACOTES TX</div>
            <div className={`${styles.counterValue} ${styles.counterValueTx}`}>
              {formatPkts(tx)}
            </div>
            <div className={styles.counterMeta}>OUT · {100 - rxShare}% do fluxo</div>
          </div>
        </div>

        <div className={styles.bars}>
          <div className={styles.barBlock}>
            <div className={styles.barLabel}>
              <span>BUFFER</span>
              <span className={`${styles.barPct} ${styles.barPctCyan}`}>
                {Math.round(bufferPct)}%
              </span>
            </div>
            <div className={styles.barTrack}>
              <div
                className={`${styles.barFill} ${styles.barFillCyan}`}
                data-animate={animationsOn || undefined}
                style={{ width: `${bufferPct}%` }}
              />
            </div>
          </div>
          <div className={styles.barBlock}>
            <div className={styles.barLabel}>
              <span>LATÊNCIA</span>
              <span className={`${styles.barPct} ${styles.barPctMag}`}>
                {latencyMs} ms
              </span>
            </div>
            <div className={styles.barTrack}>
              <div
                className={`${styles.barFill} ${styles.barFillMag}`}
                data-animate={animationsOn || undefined}
                style={{ width: `${latencyPct}%` }}
              />
            </div>
          </div>
        </div>

        <div className={styles.sparkWrap}>
          <div className={styles.sparkHead}>
            <span>FLUXO DE PACOTES</span>
            <span className={styles.barPctCyan}>Δ 420 ms</span>
          </div>
          <div className={styles.sparkChart} aria-hidden>
            {spark.map((h, i) => (
              <div
                key={`${i}-${h}`}
                className={styles.sparkBar}
                data-animate={animationsOn || undefined}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
