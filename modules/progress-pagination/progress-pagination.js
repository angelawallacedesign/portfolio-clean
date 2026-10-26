/** Independent decorative progress loop. No slide or page behavior is implied. */
export function initProgressPagination(root) {
  const steps = [...root.children];
  if (!steps.length) return;
  root.style.setProperty('--progress-pagination-count', steps.length);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let index = Math.max(0, steps.findIndex(step => step.classList.contains('is-active')));
  let inView = false;

  function select(next) {
    index = ((next % steps.length) + steps.length) % steps.length;
    steps.forEach(step => step.classList.remove('is-active'));
    void steps[index].offsetWidth;
    steps[index].classList.add('is-active');
  }

  function updateMotion() {
    root.classList.toggle('is-paused', document.hidden || !inView || reducedMotion.matches);
  }

  function advance(event) {
    if (event.animationName !== 'progress-pagination-fill' || event.target !== steps[index] || root.classList.contains('is-paused')) return;
    select(index + 1);
  }

  const observer = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    updateMotion();
  });
  observer.observe(root);
  root.addEventListener('animationend', advance);
  document.addEventListener('visibilitychange', updateMotion);
  reducedMotion.addEventListener('change', updateMotion);
  select(index);
  updateMotion();

  return {
    select,
    destroy() {
      observer.disconnect();
      root.removeEventListener('animationend', advance);
      document.removeEventListener('visibilitychange', updateMotion);
      reducedMotion.removeEventListener('change', updateMotion);
      root.classList.add('is-paused');
    },
  };
}

document.querySelectorAll('[data-progress-pagination]').forEach(initProgressPagination);
