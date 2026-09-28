import { mountPatternInspector } from
    "../projects/designing-with-ai/pattern-inspector/pattern-inspector-loader.js";

const introStage = document.querySelector('.intro-stage');
const heroVisual = document.querySelector('.hero-visual');
const revealVideos = document.querySelectorAll('.intro-reveal__video');
const revealPanelA = document.querySelector('.intro-reveal__panel--a');
const revealPanelB = document.querySelector('.intro-reveal__panel--b');
const playButton = document.querySelector('.intro-play');
const closeButton = document.querySelector('.intro-close');

const prototypeSlot = document.querySelector('.intro-reveal__prototype');

mountPatternInspector({
    slot: prototypeSlot,
    baseUrl: "../projects/designing-with-ai/pattern-inspector/",
});

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

// Straight-edge intersections measured from the existing WebP alpha masks
// (alpha >= 128), in source-image pixels, clockwise from top left.
// Each edge is fitted away from its corners; maximum fit residual is 1.16px.
const screenShapes = {
    a: { width: 3230, height: 2520, corners: [
        [11.1473, 184.4794], [2977.8511, 60.3231],
        [3227.5279, 2151.2221], [252.8468, 2494.7312]
    ] },
    b: { width: 924, height: 1440, corners: [
        [178.6319, 35.6689], [903.3884, 80.0206],
        [766.4253, 1389.3513], [41.6530, 1333.0192]
    ] }
};

function updateScreenClip(panel, rect, shape) {
    // Match the production/reveal images' object-fit: cover and centered crop.
    const scale = Math.max(rect.width / shape.width, rect.height / shape.height);
    const offsetX = (rect.width - shape.width * scale) / 2;
    const offsetY = (rect.height - shape.height * scale) / 2;
    const points = shape.corners.map(([x, y]) =>
        `${(x * scale + offsetX) / rect.width * 100}% ${(y * scale + offsetY) / rect.height * 100}%`
    );
    panel.style.setProperty('--intro-screen-clip', `polygon(${points.join(', ')})`);
}

// Map the still's four opaque corners onto the current animated clipping
// polygon. Clipping alone cannot reshape the transparency baked into a WebP.
function perspectiveMatrix(source, target, width, height) {
    const rows = source.flatMap(([x, y], i) => {
        const [u, v] = target[i];
        return [
            [x, y, 1, 0, 0, 0, -u * x, -u * y, u],
            [0, 0, 0, x, y, 1, -v * x, -v * y, v]
        ];
    });
    for (let col = 0; col < 8; col++) {
        let pivot = col;
        for (let row = col + 1; row < 8; row++) {
            if (Math.abs(rows[row][col]) > Math.abs(rows[pivot][col])) pivot = row;
        }
        [rows[col], rows[pivot]] = [rows[pivot], rows[col]];
        const divisor = rows[col][col];
        for (let j = col; j <= 8; j++) rows[col][j] /= divisor;
        for (let row = 0; row < 8; row++) {
            if (row === col) continue;
            const factor = rows[row][col];
            for (let j = col; j <= 8; j++) rows[row][j] -= factor * rows[col][j];
        }
    }
    const [a, b, c, d, e, f, g, h] = rows.map(row => row[8]);
    return `matrix3d(${[
        a, d * height / width, 0, g / width,
        b * width / height, e, 0, h / height,
        0, 0, 1, 0, c * width, f * height, 0, 1
    ].join(',')})`;
}

let stillMorphFrame = null;
const stillMorphs = [
    { panel: revealPanelA, shape: screenShapes.a },
    { panel: revealPanelB, shape: screenShapes.b }
].map(item => ({ ...item, image: item.panel.querySelector('.intro-reveal__still') }));

function updateStillMorph() {
    // Read the browser's interpolated polygon: no separate clock or easing.
    const updates = stillMorphs.map(({ panel, shape, image }) => {
        const style = getComputedStyle(panel);
        const width = parseFloat(style.width);
        const height = parseFloat(style.height);
        // Keep every source pixel available to the perspective transform.
        // `cover` crops the replaced image before its transform is applied.
        const scale = Math.min(width / shape.width, height / shape.height);
        const source = shape.corners.map(([x, y]) => [
            (x * scale + (width - shape.width * scale) / 2) / width,
            (y * scale + (height - shape.height * scale) / 2) / height
        ]);
        const target = style.clipPath.slice(8, -1).split(',').map(point =>
            point.trim().split(/\s+/).map((value, axis) =>
                parseFloat(value) / (value.endsWith('%') ? 100 : axis ? height : width)
            )
        );
        const start = style.getPropertyValue('--intro-screen-clip').slice(8, -1)
            .split(',').map(point => point.trim().split(/\s+/).map(value => parseFloat(value) / 100));
        const rectangle = [[0, 0], [1, 0], [1, 1], [0, 1]];
        let travelled = 0;
        let distance = 0;
        start.forEach((point, i) => point.forEach((value, axis) => {
            const delta = rectangle[i][axis] - value;
            travelled += (target[i][axis] - value) * delta;
            distance += delta * delta;
        }));
        const progress = Math.max(0, Math.min(1, travelled / distance));
        // Use the mean opposing source-edge lengths, excluding transparent
        // padding, to avoid forcing the content into the viewport's aspect.
        const edge = (a, b) => Math.hypot(
            shape.corners[a][0] - shape.corners[b][0],
            shape.corners[a][1] - shape.corners[b][1]
        );
        const aspect = (edge(0, 1) + edge(3, 2)) / (edge(0, 3) + edge(1, 2));
        const fitWidth = Math.min(width - 4, (height - 4) * aspect);
        const fitHeight = fitWidth / aspect;
        const insetX = (width - fitWidth) / (2 * width);
        const insetY = (height - fitHeight) / (2 * height);
        const fitted = [[insetX, insetY], [1 - insetX, insetY],
            [1 - insetX, 1 - insetY], [insetX, 1 - insetY]];
        target.forEach((point, i) => point.forEach((value, axis) => {
            target[i][axis] = value + progress * (fitted[i][axis] - rectangle[i][axis]);
        }));
        return { image, transform: perspectiveMatrix(source, target, width, height) };
    });
    updates.forEach(({ image, transform }) => { image.style.transform = transform; });
}

function startStillMorph() {
    cancelAnimationFrame(stillMorphFrame);
    const tick = () => {
        stillMorphFrame = null;
        if (!desktopQuery.matches) return;
        updateStillMorph();
        if (stillMorphs.some(({ panel }) => panel.getAnimations().some(animation =>
            animation.playState === 'running' || animation.pending
        ))) stillMorphFrame = requestAnimationFrame(tick);
    };
    tick();
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

    updateScreenClip(revealPanelA, laptopRect, screenShapes.a);
    updateScreenClip(revealPanelB, phoneRect, screenShapes.b);
    
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
    updateStillMorph();
    introStage.classList.add('is-reveal-ready');
    expansionTimer = window.setTimeout(() => {
        introStage.classList.add('is-expanding');
        startStillMorph();
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
    startStillMorph();
    await Promise.allSettled([revealPanelA, revealPanelB]
        .flatMap((panel) => panel.getAnimations())
        .map((animation) => animation.finished));
    if (currentGeneration !== generation || !desktopQuery.matches) return;

    updateStillMorph();

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
    cancelAnimationFrame(stillMorphFrame);
    stillMorphs.forEach(({ image }) => image.style.removeProperty('transform'));
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
