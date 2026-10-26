'use client';

import { useEffect, useRef } from 'react';
import { useMotion } from '../../motion/useMotion';
import styles from './homeLanding.module.css';

export const HomeCyberGrid = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { animationsOn, mounted } = useMotion();
  const offsetRef = useRef(0);

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    const gridSize = 40;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
      ctx.lineWidth = 1;

      if (animationsOn) {
        offsetRef.current = (offsetRef.current + 0.5) % gridSize;
      }

      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      const startY = animationsOn ? offsetRef.current : 0;
      for (let y = startY; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      raf = window.requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    raf = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [animationsOn, mounted]);

  return (
    <canvas
      ref={canvasRef}
      className={styles.gridLayer}
      aria-hidden
    />
  );
};
