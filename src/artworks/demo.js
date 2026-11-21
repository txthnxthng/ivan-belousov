export function startDemo(onExit) {
  const overlay = document.createElement('div');
  overlay.className = 'artwork-overlay';
  overlay.innerHTML = '<canvas aria-label="Generative artwork"></canvas><button type="button">EXIT [ESC]</button>';
  document.body.append(overlay);
  const canvas = overlay.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const button = overlay.querySelector('button');
  let raf = 0;
  let running = true;
  let pointer = { x: 0, y: 0 };
  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(innerWidth * dpr);
    canvas.height = Math.round(innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const move = (event) => { pointer = { x: event.clientX, y: event.clientY }; };
  const key = (event) => { if (event.key === 'Escape') stop(); };
  const stop = () => {
    if (!running) return;
    running = false;
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
    window.removeEventListener('pointermove', move);
    window.removeEventListener('keydown', key);
    overlay.remove();
    onExit?.();
  };
  const draw = (time) => {
    if (!running) return;
    const w = innerWidth, h = innerHeight;
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1;
    const t = time / 1000;
    const cx = w / 2 + (pointer.x - w / 2) * .08;
    const cy = h / 2 + (pointer.y - h / 2) * .08;
    for (let ring = 0; ring < 26; ring++) {
      const base = 26 + ring * 9;
      ctx.beginPath();
      for (let a = 0; a <= Math.PI * 2 + .05; a += .045) {
        const deform = Math.sin(a * 7 + t * .55 + ring * .22) * (7 + ring * .17) + Math.cos(a * 3 - t * .3) * 8;
        const r = base + deform;
        const x = cx + Math.cos(a) * r * 1.25;
        const y = cy + Math.sin(a) * r * .76;
        if (a === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    raf = requestAnimationFrame(draw);
  };
  button.addEventListener('click', stop);
  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', move);
  window.addEventListener('keydown', key);
  resize(); raf = requestAnimationFrame(draw);
  return stop;
}
