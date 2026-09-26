const introStage = document.querySelector('.intro-stage');
const heroVisual = document.querySelector('.hero-visual');

const desktopQuery = window.matchMedia('(min-width: 769px)');
const IPHONE_15_PRO_MAX_RATIO = 1290 / 2796;

const EXPANSION_DELAY = 800;

let expansionTimer = null;
let hasExpanded = false;


/**
 * Calculate the two starting rectangles from the existing
 * production hero geometry and the final viewport split.
 */
function updateRevealGeometry() {
  if (!introStage || !heroVisual || !desktopQuery.matches) return;

  const heroRect = heroVisual.getBoundingClientRect();

  // A: existing laptop-screen geometry.
  const laptopRect = {
    left: heroRect.left + heroRect.width * 0.00714285714,
    top: heroRect.top + heroRect.height * 0.00011428574,
    width: heroRect.width * 0.573428571,
    height: heroRect.height * 0.684782609
  };

  // B: existing phone-screen geometry.
  const phoneWidth = heroRect.width * 0.164736842;

  const phoneRect = {
    left: heroRect.right - heroRect.width * 0.0115 - phoneWidth,
    top: heroRect.top + heroRect.height * 0.23714286,
    width: phoneWidth,
    height: heroRect.height * 0.391304348
  };

  document.documentElement.style.setProperty(
    '--intro-a-start-left',
    `${laptopRect.left}px`
  );

  document.documentElement.style.setProperty(
    '--intro-a-start-top',
    `${laptopRect.top}px`
  );

  document.documentElement.style.setProperty(
    '--intro-a-start-width',
    `${laptopRect.width}px`
  );

  document.documentElement.style.setProperty(
    '--intro-a-start-height',
    `${laptopRect.height}px`
  );

  document.documentElement.style.setProperty(
    '--intro-b-start-left',
    `${phoneRect.left}px`
  );

  document.documentElement.style.setProperty(
    '--intro-b-start-top',
    `${phoneRect.top}px`
  );

  document.documentElement.style.setProperty(
    '--intro-b-start-width',
    `${phoneRect.width}px`
  );

  document.documentElement.style.setProperty(
    '--intro-b-start-height',
    `${phoneRect.height}px`
  );

  document.documentElement.style.setProperty(
    '--intro-target-height',
    `${window.innerHeight}px`
  );

  // Frame 3:
  // B preserves the iPhone recording ratio at full viewport height.
  // A receives the remaining viewport width.
  const phoneTargetWidth =
    window.innerHeight * IPHONE_15_PRO_MAX_RATIO;

  const laptopTargetWidth =
    window.innerWidth - phoneTargetWidth;

  document.documentElement.style.setProperty(
    '--intro-a-target-width',
    `${laptopTargetWidth}px`
  );

  document.documentElement.style.setProperty(
    '--intro-b-target-width',
    `${phoneTargetWidth}px`
  );
}


/**
 * Start the authored expansion on the first downward gesture.
 */
function startIntroExpansion() {
  if (
    !introStage ||
    !desktopQuery.matches ||
    hasExpanded ||
    expansionTimer
  ) {
    return;
  }

  expansionTimer = window.setTimeout(() => {
    introStage.classList.add('is-expanding');

    hasExpanded = true;
    expansionTimer = null;
  }, EXPANSION_DELAY);
}


/**
 * Initialize after the page layout has settled.
 */
function initializeReveal() {
  if (!introStage || !heroVisual || !desktopQuery.matches) return;

  updateRevealGeometry();
  introStage.classList.add('is-reveal-ready');
  document.documentElement.classList.add('intro-reveal-locked');
}


function handleIntroWheel(event) {
  if (!desktopQuery.matches) return;

  const isLocked =
    document.documentElement.classList.contains('intro-reveal-locked');

  if (!isLocked) return;

  // Consume the gesture so the document cannot move.
  event.preventDefault();

  // Only downward intent starts the sequence.
  if (event.deltaY > 0) {
    startIntroExpansion();
  }
}

window.addEventListener('wheel', handleIntroWheel, {
  passive: false
});

function refreshRevealGeometry() {
  requestAnimationFrame(() => {
    requestAnimationFrame(updateRevealGeometry);
  });
}

window.addEventListener('resize', refreshRevealGeometry);
window.addEventListener('load', () => {
  refreshRevealGeometry();
  initializeReveal();
});

// Remove the experimental state entirely when returning to the mobile layout.
desktopQuery.addEventListener('change', () => {
  window.clearTimeout(expansionTimer);
  expansionTimer = null;
  hasExpanded = false;
  introStage?.classList.remove('is-expanding', 'is-reveal-ready');
  document.documentElement.classList.remove('intro-reveal-locked');
  initializeReveal();
});

// Module scripts run after markup is parsed: lock before the first gesture,
// then recalculate once images and fonts have finished loading.
initializeReveal();
document.fonts.ready.then(refreshRevealGeometry);
