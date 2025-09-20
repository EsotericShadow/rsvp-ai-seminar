'use client';

import { useRef, useEffect, useMemo, useState, useCallback } from 'react';

type Props = {
  glitchColors?: string[];
  glitchSpeed?: number;
  centerVignette?: boolean;
  outerVignette?: boolean;
  smooth?: boolean;
  characters?: string;
  className?: string; // allow Tailwind classes from parent
};

export default function LetterGlitch({
  glitchColors = ['#A0AD92', '#6A7166', '#DFE5DC', '#30332E'],
  glitchSpeed = 40,
  centerVignette = true,
  outerVignette = true,
  smooth = true,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ! @#$&*()-_+=/[]{};:<>.,0123456789',
  className = '',
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const letters = useRef<{ char: string; color: string; targetColor: string; colorProgress: number }[]>([]);
  const grid = useRef({ columns: 0, rows: 0 });
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const pixelRatioRef = useRef(1);
  const lastGlitchTime = useRef(0);
  const [motionEnabled, setMotionEnabled] = useState(true);

  const colorPalette = useMemo(() => (glitchColors.length ? glitchColors : ['#0f172a', '#1e293b']), [glitchColors]);
  const chars = useMemo(() => Array.from(characters), [characters]);
  const fontSize = 16;
  const charWidth = 12;
  const charHeight = 22;

  const rand = useCallback(<T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)], []);
  const getRandomChar = useCallback(() => rand(chars), [chars, rand]);
  const getRandomColor = useCallback(() => rand(colorPalette), [colorPalette, rand]);

  const hexToRgb = useCallback((hex: string) => {
    const short = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const normalized = hex.replace(short, (_m, r, g, b) => r + r + g + g + b + b);
    const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalized);
    return match ? { r: parseInt(match[1], 16), g: parseInt(match[2], 16), b: parseInt(match[3], 16) } : null;
  }, []);

  const interp = useCallback(
    (a: { r: number; g: number; b: number }, b: { r: number; g: number; b: number }, t: number) =>
      `rgb(${Math.round(a.r + (b.r - a.r) * t)}, ${Math.round(a.g + (b.g - a.g) * t)}, ${Math.round(a.b + (b.b - a.b) * t)})`,
    [],
  );

  const calcGrid = useCallback((w: number, h: number) => ({ columns: Math.ceil(w / charWidth), rows: Math.ceil(h / charHeight) }), [charHeight, charWidth]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setMotionEnabled(!mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const resize = useCallback(() => {
    if (!motionEnabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    if (ctxRef.current) {
      ctxRef.current.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    pixelRatioRef.current = dpr;

    const { columns, rows } = calcGrid(rect.width, rect.height);
    grid.current = { columns, rows };
    const total = columns * rows;
    const nextLetters = Array.from({ length: total }, () => ({
      char: getRandomChar(),
      color: getRandomColor(),
      targetColor: getRandomColor(),
      colorProgress: 1,
    }));
    letters.current = nextLetters;
  }, [motionEnabled, calcGrid, getRandomChar, getRandomColor]);

  const draw = useCallback(() => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    const ratio = typeof (ctx as any).getTransform === 'function' ? (ctx as any).getTransform().a || 1 : pixelRatioRef.current;
    const width = canvas.width / ratio;
    const height = canvas.height / ratio;
    ctx.clearRect(0, 0, width, height);
    ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, monospace`;
    ctx.textBaseline = 'top';

    letters.current.forEach((letter, i) => {
      const x = (i % grid.current.columns) * charWidth;
      const y = Math.floor(i / grid.current.columns) * charHeight;
      ctx.fillStyle = letter.color;
      ctx.fillText(letter.char, x, y);
    });
  }, [charHeight, charWidth, fontSize]);

  const glitchUpdate = useCallback(() => {
    const changeCount = Math.max(1, Math.floor(letters.current.length * 0.015));
    for (let i = 0; i < changeCount; i++) {
      const idx = Math.floor(Math.random() * letters.current.length);
      const item = letters.current[idx];
      if (!item) continue;
      item.char = getRandomChar();
      item.targetColor = getRandomColor();
      if (!smooth) {
        item.color = item.targetColor;
        item.colorProgress = 1;
      } else {
        item.colorProgress = 0;
      }
    }
  }, [getRandomChar, getRandomColor, smooth]);

  const smoothStep = useCallback(() => {
    let redraw = false;
    letters.current.forEach((letter) => {
      if (letter.colorProgress < 1) {
        letter.colorProgress += 0.06;
        if (letter.colorProgress > 1) letter.colorProgress = 1;
        const from = hexToRgb(typeof letter.color === 'string' ? letter.color : '#000');
        const to = hexToRgb(letter.targetColor);
        if (from && to) {
          letter.color = interp(from, to, letter.colorProgress);
          redraw = true;
        }
      }
    });
    if (redraw) draw();
  }, [draw, hexToRgb, interp]);

  const loop = useCallback(() => {
    if (!motionEnabled) return;
    if (document.visibilityState === 'hidden') {
      animationRef.current = requestAnimationFrame(loop);
      return;
    }

    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (now - lastGlitchTime.current >= glitchSpeed) {
      glitchUpdate();
      draw();
      lastGlitchTime.current = now;
    }
    if (smooth) smoothStep();
    animationRef.current = requestAnimationFrame(loop);
  }, [draw, glitchSpeed, glitchUpdate, motionEnabled, smooth, smoothStep]);

  useEffect(() => {
    if (!motionEnabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    ctxRef.current = context;

    resize();
    draw();
    lastGlitchTime.current = typeof performance !== 'undefined' ? performance.now() : Date.now();
    animationRef.current = requestAnimationFrame(loop);

    let resizeTimer: number | undefined;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        resize();
        draw();
      }, 120);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible' && motionEnabled) {
        lastGlitchTime.current = typeof performance !== 'undefined' ? performance.now() : Date.now();
      }
    };

    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (resizeTimer) window.clearTimeout(resizeTimer);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [draw, loop, motionEnabled, resize]);

  if (!motionEnabled) {
    return (
      <div className={`relative w-full h-full bg-black ${className}`} aria-hidden="true">
        {outerVignette && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(circle, rgba(0,0,0,0) 60%, rgba(0,0,0,0.9) 100%)' }}
          />
        )}
        {centerVignette && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(circle, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 55%)' }}
          />
        )}
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full bg-black ${className}`} aria-hidden="true">
      <canvas ref={canvasRef} className="block w-full h-full" />
      {outerVignette && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(circle, rgba(0,0,0,0) 60%, rgba(0,0,0,0.9) 100%)' }}
        />
      )}
      {centerVignette && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(circle, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 55%)' }}
        />
      )}
    </div>
  );
}
