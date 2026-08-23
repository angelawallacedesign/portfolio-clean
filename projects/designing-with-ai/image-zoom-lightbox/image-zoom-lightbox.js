(() => {
  'use strict';

  const triggerSelector = '.u-image-lightbox-trigger[data-lightbox-image]';
  const openClass = 'u-image-lightbox-is-open';
  const scrollLockClass = 'u-image-lightbox-scroll-lock';

  function initImageLightbox() {
    if (document.querySelector('.u-image-lightbox-overlay')) {
      return;
    }

    const overlay = document.createElement('div');
    overlay.className = 'u-image-lightbox-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Expanded image viewer');
    overlay.setAttribute('aria-hidden', 'true');

    const dialog = document.createElement('div');
    dialog.className = 'u-image-lightbox-dialog';

    const closeButton = document.createElement('button');
    closeButton.className = 'u-image-lightbox-close';
    closeButton.type = 'button';
    closeButton.setAttribute('aria-label', 'Close expanded image');
    closeButton.innerHTML = [
      '<svg class="u-image-lightbox-close-icon" aria-hidden="true"',
      ' viewBox="0 0 24 24" fill="none" stroke="currentColor"',
      ' stroke-width="2.5" stroke-linecap="round">',
      '<path d="M6 6l12 12M18 6L6 18"></path>',
      '</svg>'
    ].join('');

    const figure = document.createElement('figure');
    figure.className = 'u-image-lightbox-figure';

    const image = document.createElement('img');
    image.className = 'u-image-lightbox-image';
    image.alt = '';

    const caption = document.createElement('figcaption');
    caption.className = 'u-image-lightbox-caption';

    figure.append(image, caption);
    dialog.append(closeButton, figure);
    overlay.append(dialog);
    document.body.append(overlay);

    let activeTrigger = null;

    function openLightbox(trigger) {
      const thumbnail = trigger.querySelector('img');
      const description = thumbnail?.getAttribute('alt')?.trim() || '';

      activeTrigger = trigger;
      image.src = trigger.href;
      image.alt = description;
      caption.textContent = description;
      overlay.classList.add(openClass);
      overlay.setAttribute('aria-hidden', 'false');
      document.documentElement.classList.add(scrollLockClass);
      closeButton.focus({ preventScroll: true });
    }

    function closeLightbox() {
      if (!overlay.classList.contains(openClass)) {
        return;
      }

      overlay.classList.remove(openClass);
      overlay.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove(scrollLockClass);
      image.removeAttribute('src');
      image.alt = '';
      caption.textContent = '';

      if (activeTrigger?.isConnected) {
        activeTrigger.focus({ preventScroll: true });
      }

      activeTrigger = null;
    }

    document.addEventListener('click', (event) => {
      const trigger = event.target.closest(triggerSelector);

      if (!trigger) {
        return;
      }

      event.preventDefault();
      openLightbox(trigger);
    });

    closeButton.addEventListener('click', closeLightbox);

    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (!overlay.classList.contains(openClass)) {
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        closeLightbox();
      } else if (event.key === 'Tab') {
        event.preventDefault();
        closeButton.focus({ preventScroll: true });
      }
    });

    document.addEventListener('focusin', (event) => {
      if (
        overlay.classList.contains(openClass) &&
        !overlay.contains(event.target)
      ) {
        closeButton.focus({ preventScroll: true });
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initImageLightbox, {
      once: true
    });
  } else {
    initImageLightbox();
  }
})();
