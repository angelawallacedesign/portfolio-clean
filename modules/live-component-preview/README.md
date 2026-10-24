# Live component preview

The homepage renders the production `.primary-btn` from `css/components.css`.
Its compact frame lives here; it does not reproduce the Pattern Inspector UI.

- State controls apply shared CSS declarations for hover and focus, the existing
  `.small` class, and the native `disabled` attribute.
- HTML is serialized from the rendered button. CSS is read from the linked
  stylesheet, with authored source formatting fetched from the same file.
- Token values and geometry are read from `getComputedStyle()`. Geometry labels
  are CSS properties, not additional design tokens.
- HTML/CSS/Tokens tabs support arrow keys, Home, and End. Copy uses the active
  source tab and reports success or failure through a live region.
- Pagination uses the shared stylesheet extracted from the Pass 7 hero.

The Figma links map to verified variants in AWD Design System 2
(`HxeLi68wxFByOWStEVOGam`): Default `7193:278`, Hover `7193:277`, Focus
`7193:276`, and Small `7194:286`. Disabled is a native HTML state and links to
the base component; the UI explicitly identifies this distinction. These are
component deep links, not a runtime Figma synchronization service.

The homepage's approved Pass 5 blueprint markup and stylesheet are loaded from
their original files by `js/intro-bridge.js`. A decorative shadow root isolates
that stylesheet from the independently versioned Pass 4 featured project hero.
The intro and header consume the existing dark theme; the preview canvas and
opaque metrics strip use the default theme. No token names were added.

`css/intro-background-motion.css` adds homepage-only ambient light inside the
same shadow root. The stationary bar mask preserves the approved silhouettes;
its diffuse highlight travels from bottom left to upper right on a 32-second
cycle. Three traces reuse existing SVG path geometry with staggered 28–38 second
cycles. Grid and node luminance changes take 22–26 seconds. All decorative motion
pauses offscreen or in a hidden tab, and reduced-motion preferences retain the
static background without traveling highlights.
