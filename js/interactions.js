(function () {
  console.log("Micro-interactions loaded");
})();

let scrollAnimationFrame = null;

function cancelSmoothScroll() {
  if (scrollAnimationFrame === null) return;
  window.cancelAnimationFrame(scrollAnimationFrame);
  scrollAnimationFrame = null;
}

function smoothScrollTo(targetY, reducedMotion) {
  cancelSmoothScroll();

  const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const destination = Math.max(0, Math.min(targetY, maxScroll));
  const startY = window.scrollY;
  const distance = destination - startY;

  if (reducedMotion || Math.abs(distance) < 2) {
    window.scrollTo(0, destination);
    return;
  }

  const duration = 520;
  const startTime = window.performance.now();

  const step = (now) => {
    const progress = Math.min((now - startTime) / duration, 1);
    const easedProgress = 1 - Math.pow(1 - progress, 4);

    window.scrollTo(0, startY + distance * easedProgress);

    if (progress < 1) {
      scrollAnimationFrame = window.requestAnimationFrame(step);
    } else {
      scrollAnimationFrame = null;
    }
  };

  scrollAnimationFrame = window.requestAnimationFrame(step);
}

export function initPageTransitions() {
  const links = document.querySelectorAll('.js-page-transition');

  links.forEach(link => {
    link.addEventListener('click', handleTransitionClick);
  });
}

function handleTransitionClick(e) {
  const link = e.currentTarget;
  const href = link.getAttribute('href');

  if (
    link.target === '_blank' ||
    href.startsWith('#') ||
    link.hostname !== window.location.hostname
  ) return;

  if (document.body.classList.contains('fade-out')) return;

  e.preventDefault();

  document.body.classList.add('fade-out');

  setTimeout(() => {
    window.location.href = href;
  }, 220);
}

export function initPageLoad() {
  let loaded = false;

  const markLoaded = () => {
    if (loaded) return;
    loaded = true;

    requestAnimationFrame(() => {
      document.body.classList.add('is-loaded');
      document.body.classList.add('fade-in');
    });
  };

  if (document.readyState === 'complete') {
    markLoaded();
  } else {
    window.addEventListener('load', markLoaded, { once: true });
  }
}

export function initSmoothAnchors() {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  window.addEventListener("wheel", cancelSmoothScroll, { passive: true });
  window.addEventListener("touchstart", cancelSmoothScroll, { passive: true });

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;

    const link = event.target.closest('a[href^="#"]');
    if (!link || link.closest("[data-back-to-top]") || link.hasAttribute("data-nav")) {
      return;
    }

    const hash = link.getAttribute("href");
    if (!hash || hash === "#") return;

    let target = null;
    try {
      target = document.querySelector(hash);
    } catch {
      target = null;
    }

    if (!target) return;

    event.preventDefault();
    const scrollMarginTop = Number.parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
    const targetY = window.scrollY + target.getBoundingClientRect().top - scrollMarginTop;

    smoothScrollTo(targetY, reducedMotion.matches);

    if (window.location.hash !== hash) {
      window.history.pushState(null, "", hash);
    }
  });
}

export function initBackToTop() {
  const backToTop = document.querySelector("[data-back-to-top]");
  if (!backToTop) return;

  const backToTopLink = backToTop.querySelector('a[href="#top"]');
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let scrollUpdatePending = false;

  const updateBackToTop = () => {
    const hasScrolled = window.scrollY > 1;

    backToTop.classList.toggle("is-visible", hasScrolled);
    backToTop.setAttribute("aria-hidden", String(!hasScrolled));

    if (backToTopLink) {
      backToTopLink.tabIndex = hasScrolled ? 0 : -1;
    }

    scrollUpdatePending = false;
  };

  window.addEventListener("scroll", () => {
    if (scrollUpdatePending) return;
    scrollUpdatePending = true;
    window.requestAnimationFrame(updateBackToTop);
  }, { passive: true });

  backToTopLink?.addEventListener("click", (event) => {
    event.preventDefault();

    if (window.location.hash !== "#top") {
      window.history.pushState(null, "", "#top");
    }

    smoothScrollTo(0, reducedMotion.matches);
  });

  updateBackToTop();
}
