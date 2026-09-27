const introStage = document.querySelector('.intro-stage');
const heroVisual = document.querySelector('.hero-visual');
const revealVideos = document.querySelectorAll('.intro-reveal__video');
const revealPanelA = document.querySelector('.intro-reveal__panel--a');
const revealPanelB = document.querySelector('.intro-reveal__panel--b');
const playButton = document.querySelector('.intro-play');
const closeButton = document.querySelector('.intro-close');
const desktopQuery = window.matchMedia('(min-width: 769px)');
const IPHONE_15_PRO_MAX_RATIO = 1290 / 2796;
const EXPANSION_DELAY = 800;
const EXPANSION_DURATION = 1500;
let state = 'default';
let expansionTimer = null;
let videoTimer = null;
let generation = 0;

function setState(next) {
    state = next;
    introStage.dataset.revealState = next;
    playButton.disabled = next !== 'default' && next !== 'ready';
    closeButton.hidden = next !== 'playing';
    closeButton.disabled = next !== 'playing';
}

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

function startIntroExpansion() {
    if (!desktopQuery.matches || !['default', 'ready'].includes(state)) return;
    setState('opening');
    document.documentElement.classList.add('intro-reveal-locked');
    updateRevealGeometry();
    // Commit the device rectangles before the existing expansion transition.
    revealPanelA.getBoundingClientRect();
    introStage.classList.add('is-reveal-ready');
    expansionTimer = window.setTimeout(() => {
        introStage.classList.add('is-expanding');
        videoTimer = window.setTimeout(() => {
            revealVideos.forEach((video) => {
                video.currentTime = 0;
                video.play().catch(() => {});
            });
            introStage.classList.add('is-video-playing');
            setState('playing');
            closeButton.focus({ preventScroll: true });
        }, EXPANSION_DURATION);
    }, EXPANSION_DELAY);
}

async function closeIntro() {
    if (!desktopQuery.matches || state !== 'playing') return;
    const currentGeneration = generation;
    setState('closing');
    revealVideos.forEach((video) => {
        video.pause();
        video.currentTime = 0;
    });
    introStage.classList.remove('is-video-playing');
    updateRevealGeometry();
    // The same CSS geometry transition now returns automatically to its origin.
    introStage.classList.remove('is-expanding');
    await Promise.allSettled([revealPanelA, revealPanelB]
        .flatMap((panel) => panel.getAnimations())
        .map((animation) => animation.finished));
    if (currentGeneration !== generation || !desktopQuery.matches) return;

    // Seek the existing CSS slideshow to its first fully opaque pair.
    // Read its authored timing/keyframes rather than duplicating fadeCycle.
    const firstImage = heroVisual.querySelector('.screen--laptop img');
    const firstAnimation = firstImage.getAnimations()
        .find((animation) => animation.animationName === 'fadeCycle');
    const timing = firstAnimation.effect.getTiming();
    const visibleFrame = firstAnimation.effect.getKeyframes()
        .find((frame) => Number(frame.opacity) === 1);
    const pairTime = timing.delay + timing.duration * visibleFrame.computedOffset;
    const slideshowAnimations = Array.from(heroVisual.querySelectorAll('.screen img'))
        .flatMap((image) => image.getAnimations())
        .filter((animation) => animation.animationName === 'fadeCycle');

    slideshowAnimations.forEach((animation) => {
        animation.pause();
        animation.currentTime = pairTime;
    });

    // Render the matching production pair before removing its reveal copy.
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    slideshowAnimations.forEach((animation) => animation.play());
    if (currentGeneration !== generation || !desktopQuery.matches) return;
    introStage.classList.remove('is-reveal-ready');
    document.documentElement.classList.remove('intro-reveal-locked');
    setState('default');
    playButton.focus({ preventScroll: true });
}

playButton.addEventListener('click', startIntroExpansion);
closeButton.addEventListener('click', closeIntro);
heroVisual.addEventListener('pointerenter', () => {
    if (desktopQuery.matches && state === 'default') setState('ready');
});
heroVisual.addEventListener('pointerleave', () => {
    if (state === 'ready' && !heroVisual.contains(document.activeElement)) setState('default');
});
playButton.addEventListener('focus', () => {
    if (desktopQuery.matches && state === 'default') setState('ready');
});
playButton.addEventListener('blur', () => {
    if (state === 'ready' && !heroVisual.matches(':hover')) setState('default');
});

function refreshRevealGeometry() {
    requestAnimationFrame(() => requestAnimationFrame(updateRevealGeometry));
}
window.addEventListener('resize', refreshRevealGeometry);
window.addEventListener('load', refreshRevealGeometry);
document.fonts.ready.then(refreshRevealGeometry);

desktopQuery.addEventListener('change', () => {
    generation++;
    window.clearTimeout(expansionTimer);
    window.clearTimeout(videoTimer);
    revealVideos.forEach((video) => {
        video.pause();
        video.currentTime = 0;
    });
    introStage.classList.remove('is-expanding', 'is-video-playing', 'is-reveal-ready');
    document.documentElement.classList.remove('intro-reveal-locked');
    setState('default');
    refreshRevealGeometry();
});
setState('default');
