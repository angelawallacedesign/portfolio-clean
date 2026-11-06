import { initProgressPagination } from '../progress-pagination/progress-pagination.js';
import { mountInterlockingPlanes } from '../interlocking-planes/interlocking-planes.js';

const hero = document.querySelector('[data-hero-carousel]');
if (hero) {
  const composition = hero.closest('.intro-transition');
  const backgroundHost = composition?.querySelector('[data-intro-planes]');
  const planes = backgroundHost ? mountInterlockingPlanes(backgroundHost, { pointerTarget: hero }) : null;
  const slides = [...hero.querySelectorAll('[data-hero-slide]')];
  const pagination = hero.querySelector('[data-hero-pagination]');
  const controls = [...pagination.querySelectorAll('button')];
  const motion = hero.querySelector('[data-hero-motion]');
  const icon = motion.querySelector('img');
  const status = hero.querySelector('[data-hero-status]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = window.matchMedia('(max-width: 480px)');
  let paused = reducedMotion.matches;
  let pointerInside = false;
  let inView = true;
  let focusInside = false;
  function showSlide(index, { manual }) {
    if (mobile.matches) index = 0;
    slides.forEach((slide, i) => { slide.hidden = i !== index; slide.inert = i !== index; });
    if (composition) composition.dataset.heroActive = String(index);
    planes?.setActive(index === 0);
    if (manual) status.textContent = `Slide ${index + 1} of ${slides.length}.`;
  }
  const progress = initProgressPagination(pagination, { duration: 6000, onChange: showSlide });
  function updateMotion() {
    const suspended = mobile.matches || paused || pointerInside || focusInside || document.hidden || !inView || document.body.classList.contains('is-lightbox-open');
    progress.setPaused(suspended);
    hero.classList.toggle('is-motion-paused', suspended);
    // Hover/focus pause slide advancement, but selecting Slide 01 should leave
    // its decorative motion running. Explicit pause and visibility stop both.
    planes?.setPaused(mobile.matches || paused || document.hidden || !inView || document.body.classList.contains('is-lightbox-open'));
    hero.querySelectorAll('[data-live-preview]').forEach(preview => {
      preview.dispatchEvent(new CustomEvent('previewmotionchange', { detail: { paused: suspended } }));
    });
    motion.setAttribute('aria-label', paused ? 'Play intro carousel' : 'Pause intro carousel');
    motion.setAttribute('aria-pressed', String(!paused));
    icon.src = paused ? 'assets/icons/slideshow-play.svg' : 'assets/icons/slideshow-pause.svg';
  }
  controls.forEach((control, index) => control.addEventListener('click', () => { if (!mobile.matches) progress.select(index, { manual: true }); }));
  pagination.addEventListener('keydown', event => {
    if (mobile.matches) return;
    const focused = controls.indexOf(document.activeElement);
    if (focused < 0) return;
    const next = { ArrowRight: (focused + 1) % slides.length, ArrowLeft: (focused + slides.length - 1) % slides.length, Home: 0, End: slides.length - 1 }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    progress.select(next, { manual: true });
    controls[next].focus();
  });
  motion.addEventListener('click', () => {
    if (mobile.matches) return;
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
  mobile.addEventListener('change', () => {
    updateMotion();
    progress.select(0);
    status.textContent = '';
  });
  reducedMotion.addEventListener('change', () => { paused = reducedMotion.matches; updateMotion(); });
  document.addEventListener('visibilitychange', updateMotion);
  new MutationObserver(updateMotion).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; updateMotion(); }).observe(hero);
  hero.classList.add('is-carousel');
  updateMotion();
}
