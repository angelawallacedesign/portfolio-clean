import { initThemeControls } from "../../shared/js/theme.js";
import { initPatternSlides } from "../../shared/js/pattern-slides.js";
import { initPageLoad, initPageTransitions } from "./interactions.js?v=motion";

initThemeControls();
initPageLoad();
initPageTransitions();
initPatternSlides();

const backToTop = document.querySelector("[data-back-to-top]");

if (backToTop) {
  const backToTopLink = backToTop.querySelector("a");
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

  updateBackToTop();
}
