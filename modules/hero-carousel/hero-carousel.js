import { initProgressPagination } from '../progress-pagination/progress-pagination.js';

const hero = document.querySelector('[data-hero-carousel]');
if (hero) {
  const slides = [...hero.querySelectorAll('[data-hero-slide]')];
  const pagination = hero.querySelector('[data-hero-pagination]');
  const controls = [...pagination.querySelectorAll('button')];
  const motion = hero.querySelector('[data-hero-motion]');
  const icon = motion.querySelector('img');
  const status = hero.querySelector('[data-hero-status]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reducedMotion.matches;
  let pointerInside = false;
  let inView = true;
  let focusInside = false;
  function showSlide(index, { manual }) {
    slides.forEach((slide, i) => { slide.hidden = i !== index; slide.inert = i !== index; });
    if (manual) status.textContent = `Slide ${index + 1} of ${slides.length}.`;
  }
  const progress = initProgressPagination(pagination, { duration: 6000, onChange: showSlide });
  function updateMotion() {
    const suspended = paused || pointerInside || focusInside || document.hidden || !inView || Boolean(document.querySelector('[data-prototype-lightbox]')?.open);
    progress.setPaused(suspended);
    hero.classList.toggle('is-motion-paused', suspended);
    hero.querySelectorAll('[data-live-preview]').forEach(preview => {
      preview.dispatchEvent(new CustomEvent('previewmotionchange', { detail: { paused: suspended } }));
    });
    motion.setAttribute('aria-label', paused ? 'Play intro carousel' : 'Pause intro carousel');
    motion.setAttribute('aria-pressed', String(!paused));
    icon.src = paused ? 'assets/icons/slideshow-play.svg' : 'assets/icons/slideshow-pause.svg';
  }
  controls.forEach((control, index) => control.addEventListener('click', () => progress.select(index, { manual: true })));
  pagination.addEventListener('keydown', event => {
    const focused = controls.indexOf(document.activeElement);
    if (focused < 0) return;
    const next = { ArrowRight: (focused + 1) % slides.length, ArrowLeft: (focused + slides.length - 1) % slides.length, Home: 0, End: slides.length - 1 }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    progress.select(next, { manual: true });
    controls[next].focus();
  });
  motion.addEventListener('click', () => {
    paused = !paused;
    if (!paused) focusInside = false;
    updateMotion();
  });
  // Pause while visitors interact with content, leaving the motion control usable.
  const stage = hero.querySelector('.intro-carousel__slides');
  stage.addEventListener('pointerenter', () => { pointerInside = true; updateMotion(); });
  stage.addEventListener('pointerleave', () => { pointerInside = false; updateMotion(); });
  hero.addEventListener('focusin', () => { focusInside = true; updateMotion(); });
  hero.addEventListener('focusout', () => queueMicrotask(() => { focusInside = hero.matches(':focus-within'); updateMotion(); }));
  reducedMotion.addEventListener('change', () => { paused = reducedMotion.matches; updateMotion(); });
  document.addEventListener('visibilitychange', updateMotion);
  document.querySelector('[data-prototype-lightbox]')?.addEventListener('close', updateMotion);
  new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; updateMotion(); }).observe(hero);
  hero.classList.add('is-carousel');
  updateMotion();
}
