import { createPlanesArtwork } from './planes-artwork.js';

const instances = new WeakMap();
const stylesheet = new URL('./interlocking-planes.css', import.meta.url);
let nextId = 0;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/** Standalone three-plane scene with pointer resistance and spring release. */
export function mountInterlockingPlanes(container, { active = true, paused = false, pointerTarget } = {}) {
  const host = typeof container === 'string' ? document.querySelector(container) : container;
  if (!host) throw new Error('Interlocking planes: container not found');
  if (instances.has(host)) return instances.get(host);
  if (![...document.querySelectorAll('link[rel="stylesheet"]')].some(link => link.href === stylesheet.href)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet'; link.href = stylesheet.href; document.head.append(link);
  }
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const scene = document.createElement('div');
  scene.className = 'interlocking-planes';
  scene.setAttribute('aria-hidden', 'true');
  scene.innerHTML = `<div class="interlocking-planes__atmosphere"></div><div class="interlocking-planes__art"><div class="interlocking-planes__pointer"><div data-sn-orientation>${createPlanesArtwork(`planes-${++nextId}`)}</div></div></div>`;
  host.append(scene);
  const planes = [...scene.querySelectorAll('[data-plane]')];
  const pointer = pointerTarget ?? host;
  const configs = {
    teal: { x: -1, y: -.58, angle: -13, scale: .055 },
    pink: { x:  .85, y: -.9, angle: 15, scale: .065 },
    gold: { x:  .4, y: 1, angle: -9, scale: .045 },
  };
  const states = planes.map(el => ({ el, config: configs[el.dataset.plane], p: [0,0,0,1], v: [0,0,0,0] }));
  let intensity = 0, desired = 0, pointerX = 0, pointerY = 0;
  let inView = true, destroyed = false, raf = 0, last = 0;
  const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; update(); });
  observer?.observe(host);
  function enabled() { return active && !paused && inView && !document.hidden && !reduced.matches; }
  function tick(time) {
    raf = 0;
    if (!enabled() || destroyed) return;
    const dt = last ? Math.min((time-last)/1000, .035) : 1/60;
    last = time;
    // Slow stretch on entry, brisk elastic recoil on release.
    const rate = desired > intensity ? 2.2 : 8;
    intensity += (desired - intensity) * (1 - Math.exp(-rate * dt));
    for (const { el, config, p, v } of states) {
      const target = [
        intensity * (config.x * 100 + pointerX * 14),
        intensity * (config.y * 85 + pointerY * 14),
        intensity * config.angle,
        1 + intensity * config.scale,
      ];
      for (let i = 0; i < 4; i++) {
        const stiffness = desired ? 38 : 160;
        const damping = desired ? 15 : 16;
        v[i] += (stiffness * (target[i] - p[i]) - damping * v[i]) * dt;
        p[i] += v[i] * dt;
      }
      el.style.transform = `translate(${p[0].toFixed(2)}px, ${p[1].toFixed(2)}px) rotate(${p[2].toFixed(3)}deg) scale(${p[3].toFixed(4)})`;
    }
    raf = requestAnimationFrame(tick);
  }
  function update() {
    scene.dataset.active = String(active);
    scene.dataset.running = String(enabled());
    if (enabled() && !raf) { last = 0; raf = requestAnimationFrame(tick); }
    if (!enabled()) {
      cancelAnimationFrame(raf); raf = 0; last = 0; desired = 0; intensity = 0;
      states.forEach(({el,p,v}) => { p.splice(0,4,0,0,0,1); v.fill(0); el.style.transform = ''; });
    }
  }
  function move(e) {
    if (!enabled() || !fine.matches) return;
    const r = pointer.getBoundingClientRect();
    if (!r.width || !r.height) return;
    pointerX = clamp((e.clientX-r.left)/r.width*2-1,-1,1);
    pointerY = clamp((e.clientY-r.top)/r.height*2-1,-1,1);
    // Respond to the whole interactive region, with greater tension near center.
    desired = clamp(1 - .28 * Math.hypot(pointerX,pointerY), .6, 1);
  }
  function leave() { desired = 0; pointerX = pointerY = 0; }
  pointer.addEventListener('pointermove',move);
  pointer.addEventListener('pointerleave',leave);
  document.addEventListener('visibilitychange',update);
  reduced.addEventListener('change',update);
  fine.addEventListener('change',update);
  const instance = {
    setActive(value) { active = Boolean(value); update(); },
    setPaused(value) { paused = Boolean(value); update(); },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      cancelAnimationFrame(raf); observer?.disconnect();
      pointer.removeEventListener('pointermove',move);
      pointer.removeEventListener('pointerleave',leave);
      document.removeEventListener('visibilitychange',update);
      reduced.removeEventListener('change',update);
      fine.removeEventListener('change',update);
      scene.remove(); instances.delete(host);
    },
  };
  instances.set(host,instance); update(); return instance;
}
