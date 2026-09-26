const introStage = document.querySelector('.intro-stage');
const introCopy = document.querySelector('.intro-copy');
const mockupBase = document.querySelector('.mockup-base');
const laptopScreen = document.querySelector('.screen--laptop');
const phoneScreen = document.querySelector('.screen--phone');
const heroVisual = document.querySelector('.hero-visual');

const desktopQuery = window.matchMedia('(min-width: 769px)');

const IPHONE_15_PRO_MAX_RATIO = 1290 / 2796;

function updateIntroProgress() {
  if (!introStage || !desktopQuery.matches) {
    document.documentElement.style.removeProperty('--intro-reveal-progress');
    return;
  }

  const rect = introStage.getBoundingClientRect();

  // Total distance available while the sticky intro travels
  // through its scroll stage.
  const scrollDistance = introStage.offsetHeight - window.innerHeight;

  if (scrollDistance <= 0) return;

  // How far we've traveled through that distance.
  const traveled = Math.min(Math.max(-rect.top, 0), scrollDistance);

  // Normalize to a value from 0 → 1.
  const progress = traveled / scrollDistance;
  // Frame 1 → Frame 2 occupies the first 45% of the scroll stage.
    const expansionProgress = Math.min(progress / 0.45, 1);

    document.documentElement.style.setProperty(
    '--intro-expansion-progress',
    expansionProgress.toFixed(4)
    );

    // Frame 3 destination geometry.
    // B preserves the portrait iPhone 15 Pro Max recording ratio.
    // A receives the remaining viewport width.
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const heroRect = heroVisual.getBoundingClientRect();

    const laptopRect = {
    left: heroRect.left + heroRect.width * 0.00714285714,
    top: heroRect.top + heroRect.height * 0.00011428574,
    width: heroRect.width * 0.573428571,
    height: heroRect.height * 0.684782609
    };

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

    const phoneTargetWidth = viewportHeight * IPHONE_15_PRO_MAX_RATIO;
    const laptopTargetWidth = viewportWidth - phoneTargetWidth;

    document.documentElement.style.setProperty(
    '--intro-a-target-width',
    `${laptopTargetWidth}px`
    );

    document.documentElement.style.setProperty(
    '--intro-b-target-width',
    `${phoneTargetWidth}px`
);

  document.documentElement.style.setProperty(
    '--intro-reveal-progress',
    progress.toFixed(4)
  );
}

function enableReveal() {
  if (!introStage || !desktopQuery.matches) return;

  introStage.classList.add('is-reveal-ready');
}

window.addEventListener('scroll', updateIntroProgress, { passive: true });
window.addEventListener('resize', updateIntroProgress);
window.addEventListener('load', updateIntroProgress);

window.addEventListener('load', () => {
  setTimeout(enableReveal, 1000);
});

updateIntroProgress();