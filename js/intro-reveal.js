const introStage = document.querySelector('.intro-stage');
const heroVisual = document.querySelector('.hero-visual');
const revealVideos = document.querySelectorAll('.intro-reveal__video');
const revealPanelA = document.querySelector('.intro-reveal__panel--a');
const revealPanelB = document.querySelector('.intro-reveal__panel--b');

const desktopQuery = window.matchMedia('(min-width: 769px)');
const originalScrollRestoration = window.history.scrollRestoration;
const IPHONE_15_PRO_MAX_RATIO = 1290 / 2796;

const EXPANSION_DELAY = 800;
const EXPANSION_DURATION = 1500;
const EXIT_WHEEL_IDLE = 200;

let expansionTimer = null;
let hasExpanded = false;

let isExitReady = false;
let exitProgress = 0;
let hasReturnedToStill = false;
let isExitSettling = false;
let isHandoffReady = false;
let isExitWheelIdle = false;
let exitWheelTimer = null;
let exitGeneration = 0;

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

function startRevealVideos() {
    revealVideos.forEach((video) => {
        video.currentTime = 0;
        video.play().catch(() => {});
    });
    
    introStage.classList.add('is-video-playing');
    isExitReady = true;
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
        
        window.setTimeout(() => {
            startRevealVideos();
        }, EXPANSION_DURATION);
        
        hasExpanded = true;
        expansionTimer = null;
    }, EXPANSION_DELAY);
}


/**
* Initialize after the page layout has settled.
*/
function initializeReveal() {
    if (!introStage || !heroVisual || !desktopQuery.matches) return;
    if (introStage.classList.contains('is-reveal-ready')) return;

    // A fresh desktop reveal owns the initial viewport. Reloading after the
    // handoff must not restore the metrics scroll position beneath its lock.
    window.history.scrollRestoration = 'manual';
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    
    updateRevealGeometry();
    introStage.classList.add('is-reveal-ready');
    document.documentElement.style.setProperty(
    '--intro-exit-progress',
    '0'
    );
    document.documentElement.classList.add('intro-reveal-locked');
}

function lerp(start, end, progress) {
  return start + (end - start) * progress;
}

function unlockAfterExit() {
    if (isHandoffReady && isExitWheelIdle && desktopQuery.matches) {
        document.documentElement.classList.remove('intro-reveal-locked');
    }
}

function waitForExitWheelIdle() {
    isExitWheelIdle = false;
    window.clearTimeout(exitWheelTimer);
    exitWheelTimer = window.setTimeout(() => {
        isExitWheelIdle = true;
        unlockAfterExit();
    }, EXIT_WHEEL_IDLE);
}

async function completeIntroExit() {
    if (isExitSettling) return;
    isExitSettling = true;
    const generation = exitGeneration;
    waitForExitWheelIdle();

    // Keep the stills visible until the existing geometry transitions land.
    const geometryAnimations = [revealPanelA, revealPanelB]
        .flatMap((panel) => panel.getAnimations());
    await Promise.allSettled(geometryAnimations.map((animation) => animation.finished));
    if (generation !== exitGeneration || !desktopQuery.matches) return;

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

    // Give the matching production pair a rendered frame beneath the stills.
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    if (generation === exitGeneration && desktopQuery.matches) {
        introStage.classList.add('is-reveal-complete');
        isHandoffReady = true;
    }
    slideshowAnimations.forEach((animation) => animation.play());
    unlockAfterExit();
}

function updateExitProgress(deltaY) {
    const EXIT_SCROLL_DISTANCE = 700;
    
    exitProgress += deltaY / EXIT_SCROLL_DISTANCE;
    exitProgress = Math.min(Math.max(exitProgress, 0), 1);
    
    document.documentElement.style.setProperty(
        '--intro-exit-progress',
        exitProgress.toString()
    );

    const heroRect = heroVisual.getBoundingClientRect();

    const laptopStart = {
    left: heroRect.left + heroRect.width * 0.00714285714,
    top: heroRect.top + heroRect.height * 0.00011428574,
    width: heroRect.width * 0.573428571,
    height: heroRect.height * 0.684782609
    };

    const phoneWidth = heroRect.width * 0.164736842;

    const phoneStart = {
    left: heroRect.right - heroRect.width * 0.0115 - phoneWidth,
    top: heroRect.top + heroRect.height * 0.23714286,
    width: phoneWidth,
    height: heroRect.height * 0.391304348
    };

    const phoneTargetWidth =
    window.innerHeight * IPHONE_15_PRO_MAX_RATIO;

    const laptopTargetWidth =
    window.innerWidth - phoneTargetWidth;

    /* Calculate A */
    revealPanelA.style.left =
    `${lerp(0, laptopStart.left, exitProgress)}px`;

    revealPanelA.style.top =
    `${lerp(0, laptopStart.top, exitProgress)}px`;

    revealPanelA.style.width =
    `${lerp(laptopTargetWidth, laptopStart.width, exitProgress)}px`;

    revealPanelA.style.height =
    `${lerp(window.innerHeight, laptopStart.height, exitProgress)}px`;

    /* Calculate B */
    revealPanelB.style.left =
    `${lerp(laptopTargetWidth, phoneStart.left, exitProgress)}px`;

    revealPanelB.style.top =
    `${lerp(0, phoneStart.top, exitProgress)}px`;

    revealPanelB.style.width =
    `${lerp(phoneTargetWidth, phoneStart.width, exitProgress)}px`;

    revealPanelB.style.height =
    `${lerp(window.innerHeight, phoneStart.height, exitProgress)}px`;

    if (exitProgress >= 1) {
    completeIntroExit();
    }
}



function handleIntroWheel(event) {
    if (!desktopQuery.matches) return;
    
    const isLocked =
    document.documentElement.classList.contains('intro-reveal-locked');
    
    if (!isLocked) return;
    
    event.preventDefault();

    // Consume the entire finishing gesture, including its momentum tail.
    if (isExitSettling) {
        waitForExitWheelIdle();
        return;
    }
    
    if (isExitReady) {
        if (!hasReturnedToStill) {
            if (event.deltaY <= 0) return;

            revealVideos.forEach((video) => {
                video.pause();
                video.currentTime = 0;
            });
            introStage.classList.remove('is-video-playing');
            hasReturnedToStill = true;
        }

        updateExitProgress(event.deltaY);
        return;
    }
    
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

window.addEventListener('pageshow', () => {
    if (!desktopQuery.matches ||
        !document.documentElement.classList.contains('intro-reveal-locked')) return;

    // Reconcile the viewport after browser history/fragment restoration.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    refreshRevealGeometry();
});

// Remove the experimental state entirely when returning to the mobile layout.
desktopQuery.addEventListener('change', () => {
    if (!desktopQuery.matches) {
        window.history.scrollRestoration = originalScrollRestoration;
    }
    exitGeneration++;
    window.clearTimeout(exitWheelTimer);
    isExitSettling = false;
    isHandoffReady = false;
    isExitWheelIdle = false;
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
