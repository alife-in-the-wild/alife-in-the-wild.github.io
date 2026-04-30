/* Artificial Life in the Wild — generative background
 * Flow-field particle system inspired by Universal Everything's "Ultrasound".
 * No dependencies. Single canvas. Cheap.
 */
(() => {
  const canvas = document.getElementById('bg');
  if (!canvas) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ctx = canvas.getContext('2d', { alpha: true });

  let W = 0, H = 0, DPR = 1;
  let particles = [];
  let t = 0;
  let raf = 0;
  let running = true;

  // tuning
  const TARGET_DENSITY = 1 / 9000;   // particles per CSS px²
  const MAX_PARTICLES = 480;
  const MIN_PARTICLES = 90;
  const FADE_ALPHA = 0.06;           // trail fade per frame
  const SPEED = reduced ? 0.0 : 0.6;
  const NOISE_SCALE = 0.0014;
  const NOISE_TIME = 0.00018;

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    W = canvas.clientWidth = window.innerWidth;
    H = canvas.clientHeight = window.innerHeight;
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    // recompute population
    const target = Math.max(MIN_PARTICLES, Math.min(MAX_PARTICLES, Math.floor(W * H * TARGET_DENSITY)));
    if (particles.length < target) {
      while (particles.length < target) particles.push(makeParticle());
    } else {
      particles.length = target;
    }
    // clear with full opacity once on resize
    ctx.fillStyle = 'rgba(11,13,18,1)';
    ctx.fillRect(0, 0, W, H);
  }

  function makeParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      px: 0, py: 0,
      life: Math.random() * 360 + 80,
      age: 0,
      hue: Math.random(),    // 0..1 — biases toward mint vs amber
      size: Math.random() * 0.9 + 0.35,
    };
  }

  // cheap pseudo-noise: layered sines; fast, stable, no library
  function flow(x, y, time) {
    const a =
      Math.sin(x * NOISE_SCALE + time) +
      Math.sin(y * NOISE_SCALE * 1.3 - time * 0.7) +
      Math.sin((x + y) * NOISE_SCALE * 0.6 + time * 0.4);
    // Map to angle, with a gentle vertical bias for "drift"
    return a * 1.8 + Math.sin(y * 0.0008) * 0.4;
  }

  function colorFor(p) {
    // Mint (~150°) <-> Amber (~36°), softly mixed
    // Output rgba string with low alpha (additive look via lighter blend later)
    const mint  = [191, 230, 201];
    const amber = [212, 165, 116];
    const k = p.hue;
    const r = Math.round(mint[0] * (1 - k) + amber[0] * k);
    const g = Math.round(mint[1] * (1 - k) + amber[1] * k);
    const b = Math.round(mint[2] * (1 - k) + amber[2] * k);
    return `rgba(${r},${g},${b},`;
  }

  function step() {
    t += 1;
    const time = t * NOISE_TIME * 1000;

    // Trail fade — paint a translucent dark rectangle over previous frame
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = `rgba(11,13,18,${FADE_ALPHA})`;
    ctx.fillRect(0, 0, W, H);

    // Additive blend for particles so overlaps glow softly
    ctx.globalCompositeOperation = 'lighter';

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.age++;

      const angle = flow(p.x, p.y, time);
      const vx = Math.cos(angle) * SPEED;
      const vy = Math.sin(angle) * SPEED;

      p.px = p.x;
      p.py = p.y;
      p.x += vx;
      p.y += vy;

      // wrap / respawn
      if (p.x < -10 || p.x > W + 10 || p.y < -10 || p.y > H + 10 || p.age > p.life) {
        Object.assign(p, makeParticle());
        continue;
      }

      // alpha envelope: fade in at birth, hold, fade at death
      const a = Math.min(1, p.age / 30) * Math.min(1, (p.life - p.age) / 60);
      const alpha = 0.22 * a;

      const col = colorFor(p);
      ctx.strokeStyle = col + alpha.toFixed(3) + ')';
      ctx.lineWidth = p.size;
      ctx.beginPath();
      ctx.moveTo(p.px, p.py);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();

      // occasional bright "spore" head
      if (Math.random() < 0.008) {
        ctx.fillStyle = col + (alpha * 1.6).toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (running) raf = requestAnimationFrame(step);
  }

  function start() {
    if (running) return;
    running = true;
    raf = requestAnimationFrame(step);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  // boot
  resize();
  if (reduced) {
    // Draw a single calm frame and stop — accessibility.
    running = false;
    for (let i = 0; i < 120; i++) step();
    return;
  }
  raf = requestAnimationFrame(step);

  // events
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 120);
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else start();
  });
})();
