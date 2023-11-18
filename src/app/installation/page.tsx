'use client';
import { useEffect, useState } from 'react';
import styles from './installation.module.css';
import { useRouter } from 'next/navigation';

const ProgressBar = () => {
  const [progress, setProgress] = useState(0);
  const router = useRouter();
  useEffect(() => {

    const interval = setInterval(() => {
      // Simula a progressão aleatória
      const newProgress = Math.min(progress + Math.random() * 10, 100);
       if (newProgress >= 100) {
        clearInterval(interval);
        // Quando atingir 100%, redirecione para a página de cyberwares
        router.push("/cyberware");
      }
      setProgress(newProgress);
    }, 500);

    

    // Limpa o intervalo quando o componente é desmontado
    return () => clearInterval(interval);
  }, [progress]);

  const DrawLoadingBar = async (values) => {
    const RandomNumber = (min, max) => Math.floor(Math.random() * max) + min;

    return new Promise((resolve) => {
      const loadingBarAnimation = setInterval(() => {
        if (!values.includes('.')) {
          clearInterval(loadingBarAnimation);
          resolve();
        }

        values.pop('.');
        values.unshift('#');
        RenderBar(values);
      }, RandomNumber(50, 300));
    });
  };

  const RenderBar = (values) => {
    const currentLoaded = values.lastIndexOf('#') + 1;
    const loaded = values.slice(0, currentLoaded).join('');
    const unloaded = values.slice(currentLoaded).join('');

    document.querySelectorAll(`.${styles.loadingBar}`).forEach((loadingBar) => {
      loadingBar.innerHTML = `(${loaded}<span class=${styles.loadingBarUnloaded}>${unloaded}</span>)`;
    });

    const loadingPercent = Math.floor((currentLoaded / 24) * 100);
    document.querySelectorAll(`.${styles.processAmount}`).forEach((processAmount) => {
      processAmount.innerText = loadingPercent;
    });
  };

  const PlayHydra = async () => {
    const glitchElements = document.querySelectorAll(`.${styles.glitch}`);
    const rebootSuccessText = document.querySelector(`.${styles.hydraRebootSuccess}`);
    const spinners = document.querySelectorAll(`.${styles.spinner}`);
    const rebootingText = document.querySelectorAll(`.${styles.hydraRebooting}`);
    const progressBar = document.querySelector(`.${styles.progressBar}`);

    document.querySelector(`.${styles.terminal}`).classList.add(styles.glitch);
    rebootSuccessText.classList.add(styles.hidden);

    document.querySelector(`.${styles.hydra}`).classList.remove(styles.hidden);
    document.querySelectorAll(`.${styles.spinner}, .${styles.glitch}, .${styles.hydraRebooting}`).forEach((element) => {
      element.classList.remove(styles.hidden);
    });

    const loadingBar = new Array(24).fill('.');
    const spinnerInterval = DrawSpinner();

    // Play the loading bar
    await DrawLoadingBar(loadingBar);

    // Loading is complete on the next frame, hide spinner and glitch
    requestAnimationFrame(() => {
      clearInterval(spinnerInterval);
      document.querySelector(`.${styles.terminal}`).classList.remove(styles.glitch);
      AnimateBox();
      setTimeout(PlayHydra, 5000);
    });
  };

  const DrawSpinner = () => {
    const spinnerFrames = ['/', '-', '\\', '|'];
    let spinnerFrame = 0;

    return setInterval(() => {
      spinnerFrame += 1;
      document.querySelectorAll(`.${styles.spinner}`).forEach((spinner) => {
        spinner.innerText = `[${spinnerFrames[spinnerFrame % spinnerFrames.length]}]`;
      });
    }, Math.floor(Math.random() * 250) + 50);
  };

  const AnimateBox = () => {
    const hydra = document.querySelector(`.${styles.hydra}`);
    const rebootSuccessText = document.querySelector(`.${styles.hydraRebootSuccess}`);
    const glitchElements = document.querySelectorAll(`.${styles.glitch}`);
    const progressBar = document.querySelector(`.${styles.progressBar}`);
    const first = hydra.getBoundingClientRect();

    rebootSuccessText.classList.remove(styles.hidden);
    rebootSuccessText.style.visibility = 'hidden';
    const last = hydra.getBoundingClientRect();

    const hydraAnimation = hydra.animate(
      [
        { transform: `scale(${first.width / last.width}, ${first.height / last.height})` },
        { transform: `scale(${first.width / last.width}, 1.2)` },
        { transform: 'none' },
      ],
      {
        duration: 600,
        easing: 'cubic-bezier(0,0,0.32,1)',
      }
    );

    hydraAnimation.addEventListener('finish', () => {
      rebootSuccessText.removeAttribute('style');
      hydra.removeAttribute('style');
    });
  };

  return (
    <div className={`${styles.terminal} ${styles.glitch}`}>
      <div className={styles.scanline}></div>
      <p className={styles.spinner}>[ ]</p>
      <div className={styles.hydra}>
        <div className={styles.hydraRebooting}>
          <p>&lt; SYSTEM STATUS &gt;</p>
          <p className={styles.textSm}>INSTALLING CYBERWARE VER 2.1 </p>
          <p className={styles.textSm}>PROCCESS: <span className={styles.processAmount}>{progress.toFixed(2)}%</span></p>
            <div className={styles.progressBar}>
                 <div className={styles.progress} style={{ width: `${progress}%` }}></div>
            </div> 
        </div>
        <div className={`${styles.hydraRebootSuccess} ${styles.hidden}`}>
          <p>REBOOTING SUCCESSFUL</p>
        </div>
      </div>
      <div className={`${styles.glitch} ${styles.hydra}`}>
        <div className={`${styles.glitchBottom}`}></div>
        <div className={`${styles.glitchTop}`}></div>
      </div>
    </div>
  );
};

export default ProgressBar;
