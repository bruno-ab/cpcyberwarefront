'use client';

import Link from 'next/link';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import { useCanOpenTable } from '../../hooks/useCanOpenTable';
import { useIsLoggedIn } from '../../hooks/useIsLoggedIn';
import { useMotion } from '../../motion/useMotion';
import { playCyberSound } from '../../lib/sound/cyberSounds';
import { HomeCyberGrid } from './HomeCyberGrid';
import {
  TERMINAL_BOOT,
  resolveTerminalCommand,
  type TerminalLine,
} from './homeTerminalCommands';
import { HomeMarketTape } from './HomeMarketTape';
import { HomeDistrictHolomap } from './HomeDistrictHolomap';
import { HomeChromeFlipCardGate } from './HomeChromeFlipCardGate';
import { HomeNightCityWeather } from './HomeNightCityWeather';
import { HomeNetGraph } from './HomeNetGraph';
import { HOME_NETWATCH_ALERTS, HOME_WIRE_FEED } from './homeWireFeed';
import {
  nextWeatherMode,
  weatherDef,
  WEATHER_ROTATE_MS,
  type NightCityWeatherMode,
} from './homeWeatherModes';
import styles from './homeLanding.module.css';

const toneClass = (tone?: TerminalLine['tone']) => {
  if (tone === 'white') return styles.logWhite;
  if (tone === 'yellow') return styles.logYellow;
  if (tone === 'red') return styles.logRed;
  if (tone === 'ok') return styles.logOk;
  return undefined;
};

const IconFolder = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M10 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-8l-2-2z" />
  </svg>
);

const IconDice = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5zm2.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm7 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-7 7a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm7 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z" />
  </svg>
);

const IconChip = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M9 3V1h2v2h2V1h2v2h1a2 2 0 0 1 2 2v1h2v2h-2v2h2v2h-2v2h2v2h-2v1a2 2 0 0 1-2 2h-1v2h-2v-2h-2v2H9v-2H7v2H5v-2H4a2 2 0 0 1-2-2v-1H1v-2h2v-2H1v-2h2V9H1V7h2V5a2 2 0 0 1 2-2h1zm1 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6z" />
  </svg>
);

const IconBug = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 2a3 3 0 0 0-3 3v1H6a1 1 0 0 0 0 2h1v1H5a1 1 0 0 0 0 2h2v1H5a1 1 0 0 0 0 2h2v1a3 3 0 0 0 6 0v-1h2a1 1 0 0 0 0-2h-2v-1h2a1 1 0 0 0 0-2h-2v-1h1a1 1 0 0 0 0-2h-3V5a3 3 0 0 0-3-3z" />
  </svg>
);

export const HomeLanding = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const { animationsOn } = useMotion();
  const loggedIn = useIsLoggedIn();
  const { canOpen: canOpenTable, loading: tableLoading } = useCanOpenTable();

  const [logs, setLogs] = useState<TerminalLine[]>(TERMINAL_BOOT);
  const [termInput, setTermInput] = useState('');
  const [alarm, setAlarm] = useState(false);
  const [newsIdx, setNewsIdx] = useState(0);
  const [cyberLoad, setCyberLoad] = useState(78);
  const [psychoRisk, setPsychoRisk] = useState(24);
  const [adVisible, setAdVisible] = useState(false);
  const [hackOpen, setHackOpen] = useState(false);
  const [breachPct, setBreachPct] = useState(100);
  const [glitchFlash, setGlitchFlash] = useState(false);
  const breachTimer = useRef<number | null>(null);
  const [weatherMode, setWeatherMode] = useState<NightCityWeatherMode>('acid-rain');
  const weatherAuto = animationsOn;

  const appendLog = useCallback((line: TerminalLine | TerminalLine[]) => {
    setLogs((prev) => {
      const next = Array.isArray(line) ? line : [line];
      return [...prev.slice(-24), ...next];
    });
  }, []);

  const beep = useCallback(() => {
    playCyberSound('ui', { volume: 0.22 });
  }, []);

  const triggerGlitch = useCallback(() => {
    if (!animationsOn) {
      playCyberSound('glitch', { volume: 0.35 });
      return;
    }
    playCyberSound('glitch', { volume: 0.4 });
    setGlitchFlash(true);
    window.setTimeout(() => setGlitchFlash(false), 120);
  }, [animationsOn]);

  const triggerNcpd = useCallback(() => {
    playCyberSound('alarm', { volume: 0.45 });
    setAlarm(true);
    appendLog({
      text: 'ALERTA DA POLÍCIA DE NIGHT CITY: MAXTAC A CAMINHO!',
      tone: 'red',
    });
    window.setTimeout(() => setAlarm(false), 3000);
  }, [appendLog]);

  const closeHack = useCallback(() => {
    playCyberSound('ui', { volume: 0.2 });
    if (breachTimer.current != null) {
      window.clearInterval(breachTimer.current);
      breachTimer.current = null;
    }
    setHackOpen(false);
    setBreachPct(100);
  }, []);

  const openHack = useCallback(() => {
    triggerGlitch();
    setHackOpen(true);
    setBreachPct(100);
    if (breachTimer.current != null) {
      window.clearInterval(breachTimer.current);
    }
    breachTimer.current = window.setInterval(() => {
      setBreachPct((p) => {
        const drop = Math.floor(Math.random() * 8) + 2;
        const next = Math.max(0, p - drop);
        if (next === 0 && breachTimer.current != null) {
          window.clearInterval(breachTimer.current);
          breachTimer.current = null;
        }
        return next;
      });
    }, 200);
  }, [triggerGlitch]);

  const resolveHack = useCallback(
    (success: boolean) => {
      playCyberSound(success ? 'confirm' : 'deny', { volume: 0.4 });
      closeHack();
      if (success) {
        appendLog({
          text: 'ICE Purgado com sucesso. Sistema Estabilizado.',
          tone: 'ok',
        });
      } else {
        triggerGlitch();
        appendLog({
          text: 'Falha ao desafiar o ICE! Carga de Ciberware Aumentada.',
          tone: 'red',
        });
        setCyberLoad((c) => Math.min(100, c + 10));
        setPsychoRisk((p) => Math.min(100, p + 4));
      }
    },
    [appendLog, closeHack, triggerGlitch],
  );

  useEffect(() => {
    const id = window.setTimeout(() => setAdVisible(true), 3000);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(
    () => () => {
      if (breachTimer.current != null) {
        window.clearInterval(breachTimer.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (!weatherAuto) return undefined;
    const id = window.setInterval(() => {
      setWeatherMode((m) => nextWeatherMode(m));
    }, WEATHER_ROTATE_MS);
    return () => window.clearInterval(id);
  }, [weatherAuto]);

  const onTerminalSubmit = (e: FormEvent) => {
    e.preventDefault();
    const val = termInput.trim();
    if (!val) return;
    beep();
    appendLog({ text: val, tone: 'white' });
    setTermInput('');

    window.setTimeout(() => {
      const result = resolveTerminalCommand(val);
      if (result.sideEffects === 'clear') {
        setLogs([]);
        return;
      }
      if (result.sideEffects === 'breach') {
        openHack();
        return;
      }
      if (result.sideEffects === 'ncpd') {
        triggerNcpd();
        return;
      }
      if (result.lines.length) appendLog(result.lines);
    }, 280);
  };

  const rotateNews = () => {
    beep();
    setNewsIdx((i) => (i + 1) % HOME_WIRE_FEED.length);
  };

  const wireItem = HOME_WIRE_FEED[newsIdx];
  const weatherHud = weatherDef(weatherMode);

  const tableHref =
    loggedIn && (tableLoading || canOpenTable) ? '/table' : '/login';
  const tableLocked = loggedIn && !tableLoading && !canOpenTable;
  const fichasHref = loggedIn ? '/characters' : '/login';

  return (
    <div ref={rootRef} className={styles.landing}>
      <HomeCyberGrid />
      <div
        className={styles.weatherFxLayer}
        data-mode={weatherMode}
        aria-hidden
      />
      <div
        className={styles.weatherScanBoost}
        data-mode={weatherMode}
        data-animate={weatherAuto || undefined}
        aria-hidden
      />
      <div className={styles.scanlines} aria-hidden />
      <div className={styles.alarmOverlay} data-active={alarm || undefined} aria-hidden />
      <div
        className={styles.glitchFlashOverlay}
        data-active={glitchFlash || undefined}
        aria-hidden
      />

      <div className={styles.inner}>
        <div className={styles.statusBar}>
          <div className={styles.statusLeft}>
            <span className={styles.pingDot} aria-hidden />
            <span className={styles.brandLine}>CYBERPUNK STORYTELLER</span>
            <span className={styles.dim}>|</span>
            <span className={styles.dim}>
              LOC: <span className={styles.cyan}>NIGHT CITY — WATSON</span>
            </span>
            <span className={styles.dim}>|</span>
            <span className={styles.dim}>
              LINK: <span className={styles.ok}>NEURALINK ONLINE</span>
            </span>
            <span className={styles.dim}>|</span>
            <span className={styles.climaHud} title={weatherHud.ambient}>
              {weatherHud.hudLabel}
            </span>
          </div>
          <button
            type="button"
            className={styles.fxBtn}
            onClick={() => triggerGlitch()}
          >
            FX GLITCH
          </button>
        </div>

        <nav className={styles.navPipes} aria-label="Atalhos da mesa">
          <Link
            href="/campaigns"
            className={`${styles.pipeLink} ${styles.pipeCyan}`}
            onClick={() => beep()}
          >
            <IconFolder />
            CAMPANHAS
          </Link>
          {tableLocked ? (
            <span
              className={`${styles.pipeLink} ${styles.pipeMagenta} ${styles.ctaDisabled}`}
              title="Entre em uma campanha em Campanhas para abrir a mesa."
            >
              <IconDice />
              MESA VIRTUAL
            </span>
          ) : (
            <Link
              href={tableHref}
              className={`${styles.pipeLink} ${styles.pipeMagenta}`}
              onClick={() => beep()}
            >
              <IconDice />
              MESA VIRTUAL
            </Link>
          )}
          <Link
            href={fichasHref}
            className={`${styles.pipeLink} ${styles.pipeYellow}`}
            onClick={() => beep()}
          >
            <IconChip />
            RIPPERDOC / FICHAS
          </Link>
          <Link
            href="/breach"
            className={`${styles.pipeLink} ${styles.pipeRed} ${styles.pipePulse}`}
            onClick={() => beep()}
          >
            <IconBug />
            INVASÃO ICE [BREACH]
          </Link>
        </nav>

        <div className={styles.heroGrid}>
          <section className={styles.heroPanel}>
            <span className={styles.watermark} aria-hidden>
              2077
            </span>
            <div>
              <div className={styles.badgeRow}>
                <span className={styles.sysBadge}>SISTEMA DE MESA VTT</span>
                <span className={styles.verPulse}>v2.077_NETBUILD</span>
              </div>
              <h1
                className={`${styles.title} ${styles.glitchTitle}`}
                data-text="CHROME, SANGUE E DADOS."
              >
                CHROME, SANGUE E DADOS.
              </h1>
              <p className={styles.lead}>
                Interface Neural Direct-Jack para Narradores e Edgerunners. Fichas
                integradas, simulador de brechas da NetWatch, mapas interativos e
                combate ciberpsicótico em tempo real.
              </p>
            </div>
            <div className={styles.ctaRow}>
              {tableLocked ? (
                <span
                  className={`${styles.ctaPrimary} ${styles.ctaDisabled}`}
                  title="Entre em uma campanha em Campanhas para abrir a mesa."
                >
                  ENTRAR NA MESA VIRTUAL
                </span>
              ) : (
                <Link
                  href={tableHref}
                  className={styles.ctaPrimary}
                  onClick={() => {
                    playCyberSound('jack', { volume: 0.35 });
                    triggerGlitch();
                  }}
                >
                  ENTRAR NA MESA VIRTUAL
                </Link>
              )}
              <button
                type="button"
                className={styles.ctaSecondary}
                onClick={() => {
                  beep();
                  openHack();
                }}
              >
                INICIAR DECK SCAN
              </button>
            </div>
          </section>

          <aside className={styles.uplinkPanel}>
            <div className={styles.uplinkHead}>
              <span className={styles.uplinkTitle}>NETWATCH UPLINK FEED</span>
              <span className={styles.standby}>STANDBY</span>
            </div>
            <div className={styles.termScreen}>
              <span className={styles.iceTag}>ICE_LEVEL: 4.8</span>
              <div className={styles.termLogs} role="log" aria-live="polite">
                {logs.map((line, idx) => (
                  <div key={`${idx}-${line.text.slice(0, 12)}`} className={toneClass(line.tone)}>
                    &gt; {line.text}
                  </div>
                ))}
              </div>
            </div>
            <form className={styles.termForm} onSubmit={onTerminalSubmit}>
              <span className={styles.cyan}>&gt;</span>
              <input
                className={styles.termInput}
                value={termInput}
                onChange={(e) => setTermInput(e.target.value)}
                placeholder="Digite comandos (ex: scan, breach, ncpd, help)"
                aria-label="Comando NetWatch"
                autoComplete="off"
                spellCheck={false}
              />
              <button type="submit" className={styles.runBtn}>
                RUN
              </button>
            </form>
          </aside>
        </div>

        <div className={styles.gadgetStrip}>
          <HomeDistrictHolomap />
          <HomeChromeFlipCardGate />
          <HomeNightCityWeather
            mode={weatherMode}
            onModeChange={setWeatherMode}
            autoRotate={weatherAuto}
          />
          <HomeNetGraph />
        </div>

        <div className={styles.modules}>
          <div className={`${styles.module} ${styles.modRed}`}>
            <div className={`${styles.modHead} ${styles.pipeRed}`}>
              <span>NCPD WIRE ALERT</span>
              <span className={styles.modLive}>AO VIVO</span>
            </div>
            <Link href="/campaigns" className={styles.wantedBox} title="Mural de procurados por campanha">
              <p className={styles.wantedName}>PROCURADO: &quot;CYBER-JACK&quot;</p>
              <p className={styles.dim}>
                Recompensa: <span className={styles.brandLine}>€$ 50,000</span>
              </p>
              <p className={styles.pipeRed} style={{ fontSize: '0.55rem', marginTop: '0.25rem' }}>
                Crimes: Invasão de Sub-rede Arasaka e Roubo de Ciberware.
              </p>
              <p className={styles.dim} style={{ fontSize: '0.5rem', marginTop: '0.35rem' }}>
                Abrir campanhas → Procurados
              </p>
            </Link>
            <div className={styles.alertTickerWrap} aria-label="Alertas NetWatch fictícios">
              <span className={styles.alertTickerTag}>NETWATCH</span>
              <div className={styles.alertTickerTrack}>
                <div className={styles.alertTickerInner}>
                  {[...HOME_NETWATCH_ALERTS, ...HOME_NETWATCH_ALERTS].map((line, i) => (
                    <span key={`${line}-${i}`} className={styles.alertTickerItem}>
                      {line}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <button type="button" className={styles.modBtn} onClick={triggerNcpd}>
              SIMULAR ALERTA MAXTAC
            </button>
          </div>

          <div className={`${styles.module} ${styles.modYellow}`}>
            <div className={`${styles.modHead} ${styles.pipeYellow}`}>
              <span>NOTÍCIAS N54</span>
              <span>GLOBAL FEED</span>
            </div>
            <div className={styles.newsMeta}>
              <span className={styles.newsRegion}>{wireItem.regionLabel}</span>
              {wireItem.kicker ? (
                <span className={styles.newsKicker}>{wireItem.kicker}</span>
              ) : null}
            </div>
            <p className={styles.newsBody}>{wireItem.headline}</p>
            <HomeMarketTape compact />
            <button type="button" className={styles.modBtnYellow} onClick={rotateNews}>
              PRÓXIMA NOTÍCIA
            </button>
          </div>

          <div className={`${styles.module} ${styles.modCyan}`}>
            <div className={`${styles.modHead} ${styles.cyan}`}>
              <span>NEURALINK MONITOR</span>
              <span>SISTEMA ATIVO</span>
            </div>
            <div className={styles.barBlock}>
              <div className={styles.barLabel}>
                <span>Carga de Cyberware:</span>
                <span className={styles.cyan}>{cyberLoad}%</span>
              </div>
              <div className={styles.barTrack}>
                <div
                  className={styles.barFillCyan}
                  style={{ width: `${cyberLoad}%` }}
                />
              </div>
            </div>
            <div className={styles.barBlock}>
              <div className={styles.barLabel}>
                <span>Risco Ciberpsicose:</span>
                <span className={styles.pipeYellow}>{psychoRisk}%</span>
              </div>
              <div className={styles.barTrack}>
                <div
                  className={styles.barFillYellow}
                  style={{ width: `${psychoRisk}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className={styles.footer}>
        <div>
          <span className={styles.cyan}>STATUS DO VTT:</span>{' '}
          <span className={styles.footerOk}>
            <span className={styles.footerDot} aria-hidden />
            SERVIDORES PRONTOS
          </span>
        </div>
        <span>CYBERPUNK VTT SYSTEM © 2077 — MESA STORYTELLER</span>
      </footer>

      <div
        className={`${styles.adPopup} ${adVisible ? '' : styles.adHidden}`}
        role="complementary"
        aria-label="Propaganda Kiroshi"
      >
        <div className={styles.adHead}>
          <span>[PROPAGANDA PATROCINADA]</span>
          <button
            type="button"
            className={styles.adClose}
            onClick={() => {
              triggerGlitch();
              setAdVisible(false);
            }}
            aria-label="Fechar propaganda"
          >
            [X]
          </button>
        </div>
        <div className={styles.adBody}>
          <svg className={styles.adIcon} width="36" height="36" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
          </svg>
          <div>
            <h4 className={styles.adTitle}>KIROSHI OPTICS MK.IV</h4>
            <p className={styles.adCopy}>
              Enxergue o invisível. Realidade aumentada com scanner de pontos fracos
              corporal.
            </p>
            <Link href="/catalog" className={styles.adBuy} onClick={() => beep()}>
              COMPRAR NA RIPPERDOC »
            </Link>
          </div>
        </div>
      </div>

      <div
        className={`${styles.modalBackdrop} ${hackOpen ? '' : styles.modalHidden}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="hack-modal-title"
      >
        <div className={styles.modalPanel}>
          <div className={styles.modalHead}>
            <h2 id="hack-modal-title" className={styles.modalTitle}>
              ALERTA DE INVASÃO DA NETWATCH
            </h2>
            <button type="button" className={styles.modalClose} onClick={closeHack}>
              [FECHAR]
            </button>
          </div>
          <p className={styles.modalText}>
            Seu Deck Neural foi detectado por um contra-ataque de ICE Vermelho.
            Sobrecarga de dados iminente!
          </p>
          <div className={styles.modalLog}>
            <div>[AVISO]: Protocolo Daemon ativado...</div>
            <div>[AVISO]: Tentando quebrar criptografia da chave neural...</div>
            <div>
              [STATUS]: Estabilidade da Mente:{' '}
              <span className={styles.pipeYellow}>{breachPct}%</span>
            </div>
          </div>
          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.modalBtnPrimary}
              onClick={() => resolveHack(true)}
            >
              PURGAR DECK (OVERRIDE)
            </button>
            <button
              type="button"
              className={styles.modalBtnGhost}
              onClick={() => resolveHack(false)}
            >
              CONTRATACAR ICE
            </button>
          </div>
          <p className={styles.dim} style={{ fontSize: '0.6rem', marginTop: '0.75rem' }}>
            Minigame completo:{' '}
            <Link href="/breach" className={styles.cyan} onClick={closeHack}>
              /breach
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
