const introStage = document.querySelector('.intro-stage');
const heroVisual = document.querySelector('.hero-visual');
const revealVideos = document.querySelectorAll('.intro-reveal__video');
const revealPanelA = document.querySelector('.intro-reveal__panel--a');
const revealPanelB = document.querySelector('.intro-reveal__panel--b');

const desktopQuery = window.matchMedia('(min-width: 769px)');
const IPHONE_15_PRO_MAX_RATIO = 1290 / 2796;

const EXPANSION_DELAY = 800;
const EXPANSION_DURATION = 1500;

let expansionTimer = null;
let hasExpanded = false;

let isExitReady = false;
let exitProgress = 0;

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

function completeIntroExit() {
  // Return control to the original device screens.
  introStage.classList.add('is-reveal-complete');

  // Release normal document scrolling.
  document.documentElement.classList.remove('intro-reveal-locked');
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
    
    if (isExitReady) {
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
