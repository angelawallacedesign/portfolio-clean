# Interlocking planes

A native SVG interpretation of the approved Version 2 composition, with softer
highlight intensity and stronger local color density. Gradients, selective
translucency, directional traces and a small static contact shadow describe the
folds. The reference image is not shipped as a flattened bitmap.

## Mount on any page

The host needs a positioned box with a nonzero height. The scene fills that box;
its SVG viewBox adapts to the available space. Load the portfolio's global color
tokens and local tokens for its palette; standalone fallback colors are included.
The module loads its own stylesheet once, or it can be linked in the document
head to avoid waiting for JavaScript.

```html
<div id="planes" style="position: relative; height: 600px"></div>
<script type="module">
  import { mountInterlockingPlanes } from './modules/interlocking-planes/interlocking-planes.js';
  const scene = mountInterlockingPlanes('#planes');
  scene.setPaused(true);  // Freeze movement while keeping the artwork visible.
  scene.setPaused(false);
  scene.setActive(false); // Hide and suspend immediately.
  scene.setActive(true);
  // scene.destroy();    // Remove artwork, listeners and observers; safe to repeat.
</script>
```

Options: `active` (default true), `paused` (default false), and `pointerTarget`
(default host). Mounting an existing instance returns the same controller.
After destruction, the host can be mounted again. SVG IDs are unique per mount.

The scene is decorative and noninteractive. Pointer events are observed on the
host or optional target without preventing foreground link/button interactions.
Motion stops when inactive, paused, offscreen, the tab is hidden, or reduced
motion is requested. Reduced motion also resets the art to its stable rest pose.
No animation frames or timers are scheduled by this module.

## Reused portfolio code

- `awd-lab/modules/shared/interaction-engine.js`: `initSurfaceMotion`, using its
  default orientation to retain scale 1 and a small `maxRotation: 2.4` (maximum
  pointer tilt about 1.56 degrees). Enable/disable, reset and disposal are shared.
- `awd-lab/modules/shared/visualization-utils.js`: `resolveContainer` and
  `createDisposables` for mounting and listener/observer cleanup.
- `shared/css/global-tokens.css`: accent pink, control teal, theme surface/text.
  `css/tokens.css`: yellow accent. CSS color mixes derive materials from these.
- `shared/css/motion.css`: reveal-duration and standard easing for smooth pointer
  settling. The module also declares its own reduced-motion rules so standalone
  use does not require the page-wide motion stylesheet.
- `modules/hero-carousel/hero-carousel.js` and progress pagination: existing
  selection, timing, focus, visibility and pause behavior. The integration calls
  the scene controller; the scene never queries carousel elements or state.

New component motion consists of a 28-second coordinated CSS flex. The assembly
and two shallow depth offsets share the same phase. Hover still pauses carousel
advancement while allowing decorative pointer response. Keyboard focus also
pauses slide advancement without freezing the selected scene; explicit pause,
lightbox, mobile and visibility states suspend the scene.

## Composition and theme

The homepage host is a background child of `.intro-transition`, a sibling of
the intro and metrics. Both foreground sections remain above it. Slide 01 has
no media slot. A true alpha mask fades the art through the metrics into the page
surface. The metrics retain their markup and use a locally translucent surface
on Slide 01; reduced-transparency preferences restore the opaque surface.

The implementation reuses the parent-layer/fade approach from
`codex/design-code-intro` (commit `f6f7824`, `css/intro-bridge.css`) and the
noninteractive, surface-aware fade pattern inspected on the Norwegian iConcierge
page (`.project-hero-media` in `css/work-gallery.css`). Project files are unchanged.

Inherited `--planes-pink`, `--planes-teal`, `--planes-yellow` are defined on the
scene from portfolio tokens. Theme surfaces control highlights and optical
mixing without a baked white rectangle. Optional placement properties on the
host: `--planes-left`, `--planes-top`, `--planes-width`, `--planes-height`.

Open `demo.html` to exercise two differently sized instances, theme changes,
activation, pause, destruction and remounting without the carousel.
