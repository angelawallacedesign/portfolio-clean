# Elastic Spatial Button — standalone module

**Effort:** 2/5 to preview; 3/5 to integrate into an existing portfolio page without CSS collisions.

A self-contained HTML/CSS/vanilla JavaScript experiment. No React, Vite, npm, node_modules, external dependencies, or network requests.

## Preview

Open `index.html` in a browser. If your browser restricts module scripts from `file://`, serve the directory locally:

```bash
cd spatial-button-module
python3 -m http.server 8000
```

Visit `http://localhost:8000`.

## Features

- Press to compress the button (soft, squishy visual feedback)
- Drag the button; the nearby spatial mesh deforms and springs back
- Drag any of four corners to resize within min/max constraints
- Elastic resistance near viewport boundaries, with spring-back after release
- Toggle visible mesh on/off (the behavior remains active)
- Adjust elastic depth from 0–100%
- Reduce motion toggle, initialized from the OS preference
- Reset button
- Keyboard: Tab to button, Space/Enter to activate; Alt+Arrow keys to reposition, Shift+Alt+Arrow for larger steps; Tab to a corner and Arrow keys to resize (Shift for larger steps)

## Integrating into Ocean Melt

1. Copy `css/spatial-button.css` and `js/spatial-button.js` into your portfolio's appropriate module directories.
2. Copy the `<section class="spatial-button-module" ...>` element from `index.html` into your Ocean Melt page. You do **not** need the surrounding demo-shell or demo-header.
3. Add `<link rel="stylesheet" href="PATH/TO/spatial-button.css">` to the page, using the correct relative path.
4. Add `<script type="module" src="PATH/TO/spatial-button.js"></script>` near the end of the page, using the correct relative path.
5. Change the UI kit anchor's `href="#"` to the real UI kit route.
6. Test mouse, touch, keyboard, resize, mobile, and reduced-motion behavior on the target page.

## Architecture

- The canvas is visual-only, never a DOM node per dot.
- The resting mesh is fixed and anchored at its edges.
- Pointer movement injects temporary velocity into nearby mesh points.
- A damped spring returns the mesh to its original positions.
- The button's position/size are managed separately and persist after dragging/resizing.
- The mesh is not a collision solver and does not yet move other widgets.
- No state persistence across page reloads.

## Production hardening still needed

This is a **prototype**, not a finished design-system primitive. Before shipping broadly, add automated interaction tests, refine accessibility instructions and resize announcements, test screen readers, address multiple concurrent touches for pinch resizing, provide optional pointer-handle drag instead of pressing the action button, and avoid a continuously running animation loop when offscreen or idle. Consider isolating the demo CSS from existing portfolio global styles and wrapping the behavior in an instance-safe controller if multiple modules appear on one page.

The 'depth' control adjusts mesh displacement, not actual 3D depth. The press effect uses CSS transforms and shadows; it is not a true soft-body simulation.
