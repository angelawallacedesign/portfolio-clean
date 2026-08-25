const lightbox = document.getElementById('lightbox');
const img = lightbox?.querySelector('img');
const caption = lightbox?.querySelector('figcaption');
const supportsImageZoom = window.matchMedia('(hover: hover) and (pointer: fine)');

let isOpen = false;
let isZoomed = false;
let activeTrigger = null;

let closeButton = lightbox?.querySelector('.lightbox__close');

if (lightbox && !closeButton) {
  closeButton = document.createElement('button');
  closeButton.className = 'lightbox__close';
  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', 'Close expanded image');
  closeButton.textContent = '\u00d7';
  lightbox.querySelector('.lightbox__inner')?.prepend(closeButton);
}

lightbox?.setAttribute('role', 'dialog');
lightbox?.setAttribute('aria-modal', 'true');
lightbox?.setAttribute('aria-label', 'Expanded image viewer');
lightbox?.setAttribute('aria-hidden', 'true');

document.addEventListener('click', (e) => {
  if (!lightbox || !img || !caption) return;

  const trigger = e.target.closest('[data-lightbox]');

  // OPEN
  if (trigger && !isOpen) {
    e.preventDefault();

    img.src = trigger.href;

    const figure = trigger.closest('figure');
    const figcaption = figure?.querySelector('figcaption');
    caption.innerHTML = figcaption ? figcaption.innerHTML : '';

    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-lightbox-open');
    activeTrigger = trigger;
    isOpen = true;
    closeButton?.focus({ preventScroll: true });
    return;
  }

  // CLICK IMAGE → zoom or close
  if (isOpen && e.target === img) {
    if (supportsImageZoom.matches && !isZoomed) {
      lightbox.classList.add('is-zoomed');
      isZoomed = true;
    } else if (supportsImageZoom.matches) {
      closeLightbox();
    }
    return;
  }

  // CLICK OUTSIDE → close
  if (isOpen && !e.target.closest('.lightbox__content')) {
  closeLightbox();
}
});

closeButton?.addEventListener('click', closeLightbox);

document.addEventListener('keydown', (e) => {
  if (!isOpen || e.key !== 'Escape') return;
  closeLightbox();
});

function closeLightbox() {
  if (!lightbox) return;

  lightbox.classList.remove('is-open', 'is-zoomed');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('is-lightbox-open');
  isOpen = false;
  isZoomed = false;
  img?.removeAttribute('src');

  if (activeTrigger?.isConnected) {
    activeTrigger.focus({ preventScroll: true });
  }

  activeTrigger = null;
}
