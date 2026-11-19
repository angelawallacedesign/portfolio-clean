# Standalone chart

The chart uses AWD Lab's SVG scatterplot renderer, its 120 ms dot hover and 240 ms connector reveal, and its 750 ms frame transition. It mounts in a supplied container without loading AWD Lab code or data. The Work page is not wired to this module yet.

## Use

Load `chart.css`, then import `createChart` from `index.js`:

```js
const chart = createChart({ container: document.querySelector("#chart-layer") });
await chart.open();
await chart.close();
chart.destroy();
```

`open()` loads the root `/js/data.json` on each opening, just as the Work page does. Alternatively, supply `projects` as an array or an async function. Optional callbacks are `onClose()` and `onNavigate(project, url)`; the latter intercepts a card's project link. `projectBaseUrl` overrides the repository root used to resolve image and project paths. Initialization leaves the page untouched. `destroy()` ends the instance permanently.

Each project needs a unique `id`, `year`, `complexity` (1–5), and `heading.title` or `title`. Optional fields include `opacity`, `category`, `heading.main`, `heading.accent`, `meta.notes`, `meta.role`, `meta.caption`, `meta.imageUrl`, `projectUrl`, `htmlInclude`, and `hasCaseStudy`. Chart projection and animation settings stay in this module. Content stays in the production JSON.

The chart creates a fixed layer inside its host with stacking level 1000. Its own frame and card overlay stay inside that layer. It does not take over the site's Layer 3 case study overlay. While open, it preserves scroll coordinates and inline overflow/position styles, fixes the body, and restores them on close. It refuses to open if another instance or inline overflow lock already owns scrolling.

## Demo and checks

From the repository root, run `python3 -m http.server 8000`, then visit `/modules/chart/demo.html`. Open, select a dot, close, scroll, and reopen. Run adapter checks with `node --test modules/chart/tests/*.test.js`.

Open `/modules/chart/tests/browser-regression.html` for the first-open geometry check. It compares the triangle SVG bounds and all three anchors with the rendered card and selected node, before and after the reveal, over two open/close cycles. Resize the browser with a card open to inspect live recomputation. The mobile card layout intentionally hides the triangle below 480 px, as in `chart.css`.
Use `?reduced` on the regression URL to simulate zero-duration card and triangle transitions and verify the reveal remains accessible. The panel reveal waits for the triangle's `transitionend` events; canceled transitions are cleaned up when a card closes.

## Limitations

The chart card links to production project pages. It does not import AWD Lab's HTML case study includes or take ownership of the production Layer 3 view. Hosts with a custom scroll container must provide their own scroll management. The module's fixed layer should mount outside transformed ancestors to cover the viewport.
