import { initSurfaceMotion } from '../../awd-lab/modules/shared/interaction-engine.js';
import { createDisposables, resolveContainer } from '../../awd-lab/modules/shared/visualization-utils.js';
import { createPlanesArtwork } from './planes-artwork.js';

const instances = new WeakMap();
const stylesheet = new URL('./interlocking-planes.css', import.meta.url);
let nextId = 0;

/** A decorative, container-sized scene. It has no knowledge of pages or slides. */
export function mountInterlockingPlanes(container, { active = true, paused = false, pointerTarget } = {}) {
  const host = resolveContainer(container);
  if (instances.has(host)) return instances.get(host);
  if (![...document.querySelectorAll('link[rel="stylesheet"]')].some(link => link.href === stylesheet.href)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = stylesheet.href;
    document.head.append(link);
  }

  const disposables = createDisposables();
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const scene = document.createElement('div');
  scene.className = 'interlocking-planes';
  scene.setAttribute('aria-hidden', 'true');
  scene.innerHTML = `<div class="interlocking-planes__atmosphere"></div>
    <div class="interlocking-planes__art"><div class="interlocking-planes__pointer">
      <div data-sn-orientation>${createPlanesArtwork(`planes-${++nextId}`)}</div>
    </div></div>`;
  host.append(scene);

  // The shared orientation API preserves scale(1) and resets smoothly on exit.
  const surface = initSurfaceMotion({
    surface: scene.querySelector('.interlocking-planes__pointer'),
    pointerTarget: pointerTarget ?? host,
    orientation: 'default', maxRotation: 12, enabled: false,
  });
  disposables.add(() => surface.destroy());
  let inView = false;
  let destroyed = false;
  let pointerEnabled = false;

  function update() {
    if (destroyed) return;
    const running = active && !paused && inView && !document.hidden && !reducedMotion.matches;
    scene.dataset.active = String(active);
    scene.dataset.running = String(running);
    const enablePointer = running && finePointer.matches;
    if (enablePointer !== pointerEnabled) {
      pointerEnabled = enablePointer;
      surface.setEnabled(enablePointer);
    }
  }

  const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; update(); });
  observer.observe(host);
  disposables.add(() => observer.disconnect());
  disposables.listen(document, 'visibilitychange', update);
  disposables.listen(reducedMotion, 'change', update);
  disposables.listen(finePointer, 'change', update);

  const instance = {
    setActive(value) { active = Boolean(value); update(); },
    setPaused(value) { paused = Boolean(value); update(); },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      disposables.cleanup();
      scene.remove();
      instances.delete(host);
    },
  };
  instances.set(host, instance);
  update();
  return instance;
}
