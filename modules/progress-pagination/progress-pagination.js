/** Reusable progress loop. Consumers may react to selection without page dependencies. */
export function initProgressPagination(root, { duration, onChange = () => {} } = {}) {
  const steps = [...root.children];
  if (!steps.length) return;
  const authoredDuration = getComputedStyle(root).getPropertyValue('--progress-pagination-duration').trim();
  const parsedDuration = parseFloat(authoredDuration) * (authoredDuration.endsWith('ms') ? 1 : 1000);
  duration = Number.isFinite(duration) && duration > 0 ? duration : Number.isFinite(parsedDuration) && parsedDuration > 0 ? parsedDuration : 4000;
  root.style.setProperty('--progress-pagination-count', steps.length);
  root.style.setProperty('--progress-pagination-duration', `${duration}ms`);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let index = Math.max(0, steps.findIndex(step => step.classList.contains('is-active')));
  let inView = false;
  let userPaused = reducedMotion.matches;
  let timer = null;
  let started = 0;
  let remaining = duration;
  let destroyed = false;

  function updateMotion() {
    const paused = userPaused || document.hidden || !inView || destroyed;
    root.classList.toggle('is-paused', paused);
    if (paused && timer !== null) {
      clearTimeout(timer);
      timer = null;
      remaining = Math.max(0, remaining - (performance.now() - started));
    } else if (!paused && timer === null) {
      started = performance.now();
      timer = window.setTimeout(() => {
        timer = null;
        select(index + 1);
      }, remaining);
    }
  }

  function select(next, { manual = false } = {}) {
    if (destroyed) return;
    clearTimeout(timer);
    timer = null;
    remaining = duration;
    index = ((next % steps.length) + steps.length) % steps.length;
    steps.forEach(step => { step.classList.remove('is-active'); step.removeAttribute('aria-current'); });
    void steps[index].offsetWidth;
    steps[index].classList.add('is-active');
    if (steps[index].tagName === 'BUTTON') steps[index].setAttribute('aria-current', 'true');
    onChange(index, { manual });
    updateMotion();
  }

  const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; updateMotion(); });
  const onVisibility = () => updateMotion();
  const onReducedMotion = () => { userPaused = reducedMotion.matches; updateMotion(); };
  observer.observe(root);
  document.addEventListener('visibilitychange', onVisibility);
  reducedMotion.addEventListener('change', onReducedMotion);
  // Initial selection is already in markup; consumers initialize their own content.
  select(index);
  return {
    select,
    setPaused(value) { userPaused = Boolean(value); updateMotion(); },
    destroy() {
      destroyed = true;
      updateMotion();
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      reducedMotion.removeEventListener('change', onReducedMotion);
    },
  };
}

document.querySelectorAll('[data-progress-pagination]').forEach(root => initProgressPagination(root));
