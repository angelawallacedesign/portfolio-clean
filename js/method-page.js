import {
  initPageLoad,
  initPageTransitions,
  initSmoothAnchors
} from "./interactions.js?v=smooth-scroll-3";
import { initSlideShow } from "./slideshow.js?v=motion";
import { initThemeControls } from "../../shared/js/theme.js";
import { initAnchorActiveState } from "../../shared/js/page-observers.js";

initThemeControls();
initPageLoad();
initPageTransitions();
initSmoothAnchors();
initAnchorActiveState();

document.querySelectorAll(".slide-show").forEach(initSlideShow);
