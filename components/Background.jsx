'use client';

import { useEffect, useRef } from 'react';

/* Flow-field particle background, inspired by Universal Everything's "Ultrasound".
 * Pure canvas, no deps, pauses when the tab is hidden, respects reduced motion.
 */
export default function Background() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let W = 0, H = 0, DPR = 1;
    let particles = [];
    let t = 0, raf = 0, running = true;

    const TARGET_DENSITY = 1 / 9000;
    const MAX_PARTICLES = 480;
    const MIN_PARTICLES = 90;
    const FADE_ALPHA = 0.06;
    const SPEED = reduced ? 0.0 : 0.6;
    const NOISE_SCALE = 0.0014;
    const NOISE_TIME = 0.00018;

    const make = () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      px: 0, py: 0,
      life: Math.random() * 360 + 80,
      age: 0,
      hue: Math.random(),
      size: Math.random() * 0.9 + 0.35,
    });

    const flow = (x, y, time) =>
      Math.sin(x * NOISE_SCALE + time) +
      Math.sin(y * NOISE_SCALE * 1.3 - time * 0.7) +
      Math.sin((x + y) * NOISE_SCALE * 0.6 + time * 0.4) * 1.8 +
      Math.sin(y * 0.0008) * 0.4;

    const colorFor = (p) => {
      const mint  = [191, 230, 201];
      const amber = [212, 165, 116];
      const k = p.hue;
      const r = Math.round(mint[0] * (1 - k) + amber[0] * k);
      const g = Math.round(mint[1] * (1 - k) + amber[1] * k);
      const b = Math.round(mint[2] * (1 - k) + amber[2] * k);
      return `rgba(${r},${g},${b},`;
    };

    const resize = () => {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth = window.innerWidth;
      H = canvas.clientHeight = window.innerHeight;
      canvas.width = Math.floor(W * DPR);
      canvas.height = Math.floor(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

      const target = Math.max(MIN_PARTICLES, Math.min(MAX_PARTICLES,
        Math.floor(W * H * TARGET_DENSITY)));
      if (particles.length < target) {
        while (particles.length < target) particles.push(make());
      } else {
        particles.length = target;
      }
      ctx.fillStyle = 'rgba(11,13,18,1)';
      ctx.fillRect(0, 0, W, H);
    };

    const step = () => {
      t += 1;
      const time = t * NOISE_TIME * 1000;

      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = `rgba(11,13,18,${FADE_ALPHA})`;
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.age++;
        const angle = flow(p.x, p.y, time);
        p.px = p.x; p.py = p.y;
        p.x += Math.cos(angle) * SPEED;
        p.y += Math.sin(angle) * SPEED;

        if (p.x < -10 || p.x > W + 10 || p.y < -10 || p.y > H + 10 || p.age > p.life) {
          Object.assign(p, make());
          continue;
        }

        const a = Math.min(1, p.age / 30) * Math.min(1, (p.life - p.age) / 60);
        const alpha = 0.22 * a;
        const col = colorFor(p);
        ctx.strokeStyle = col + alpha.toFixed(3) + ')';
        ctx.lineWidth = p.size;
        ctx.beginPath();
        ctx.moveTo(p.px, p.py);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();

        if (Math.random() < 0.008) {
          ctx.fillStyle = col + (alpha * 1.6).toFixed(3) + ')';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 1.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (running) raf = requestAnimationFrame(step);
    };

    resize();
    if (reduced) {
      for (let i = 0; i < 120; i++) step();
      return;
    }
    raf = requestAnimationFrame(step);

    let resizeTimer;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 120);
    };
    const onVis = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        raf = requestAnimationFrame(step);
      }
    };
    window.addEventListener('resize', onResize, { passive: true });
    document.addEventListener('visibilitychange', onVis);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return (
    <>
      <canvas id="bg" ref={canvasRef} aria-hidden="true" />
      <div className="bg-veil" aria-hidden="true" />
      <div className="bg-grain" aria-hidden="true" />
    </>
  );
}
