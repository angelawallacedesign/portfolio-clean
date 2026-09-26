const introStage = document.querySelector('.intro-stage');
const introCopy = document.querySelector('.intro-copy');
const mockupBase = document.querySelector('.mockup-base');
const laptopScreen = document.querySelector('.screen--laptop');
const phoneScreen = document.querySelector('.screen--phone');

const desktopQuery = window.matchMedia('(min-width: 769px)');

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

  document.documentElement.style.setProperty(
    '--intro-reveal-progress',
    progress.toFixed(4)
  );
}

window.addEventListener('scroll', updateIntroProgress, { passive: true });
window.addEventListener('resize', updateIntroProgress);

updateIntroProgress();