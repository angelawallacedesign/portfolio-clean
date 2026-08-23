import {
  initBackToTop,
  initPageLoad,
  initPageTransitions,
  initSmoothAnchors
} from "./interactions.js?v=smooth-scroll-3";
import { initThemeControls } from "../../shared/js/theme.js";
import {
  initAnchorActiveState,
  initIntroNavVisibility,
  initProfileImageBehavior
} from "../../shared/js/page-observers.js";

initThemeControls();
initPageLoad();
initPageTransitions();
initSmoothAnchors();
initIntroNavVisibility();
initProfileImageBehavior();
initAnchorActiveState();
initBackToTop();
