'use client';

import { useEffect, useRef } from 'react';

type FogCell = { x: number; y: number; revealed: boolean };

type FogCanvasProps = {
  width: number;
  height: number;
  cellSize: number;
  fog: FogCell[];
  active: boolean;
  /** GM sees unrevealed as translucent; players as solid. */
  gmView?: boolean;
};

/** Single bitmap overlay instead of N×M SVG rects. */
export const FogCanvas = ({
  width,
  height,
  cellSize,
  fog,
  active,
  gmView = false,
}: FogCanvasProps) => {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const w = width * cellSize;
    const h = height * cellSize;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);
    if (!active) return;

    const revealed = new Set(
      fog.filter((f) => f.revealed).map((f) => `${f.x},${f.y}`),
    );
    // When fog list is empty and inactive handled above; when fog:blank, fog has all cells with revealed:false
    const hasAnyFog = fog.length > 0;
    if (!hasAnyFog) return;

    ctx.fillStyle = gmView ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.82)';
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (revealed.has(`${x},${y}`)) continue;
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
  }, [width, height, cellSize, fog, active, gmView]);

  if (!active) return null;

  return (
    <canvas
      ref={ref}
      className="vttFogCanvas"
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: width * cellSize,
        height: height * cellSize,
        pointerEvents: 'none',
        zIndex: 2,
      }}
      aria-hidden
    />
  );
};
