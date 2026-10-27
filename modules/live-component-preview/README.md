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
- The footer uses the compact variant of the shared Pass 7 step indicator.
  The original numbered presentation remains available; this variant hides
  the numbers without replacing its markup or fill element.
- Each step fills over four seconds, then its CSS animation completion advances
  the existing state selection. The loop wraps from Disabled to Default.
  Hover, keyboard focus, a hidden tab, and scrolling out of view pause the fill.
  Manual selection restarts that step; leaving the module resumes the fill.
  Reduced-motion users retain manual states with a static active indicator.
  Automatic changes do not repeatedly announce through the live region.
- State handoffs use 200ms transitions for button colors, borders, opacity,
  shadow, and outline color. Width, padding, and font size are not animated.
  Changing source, token rows, component name, and caption crossfade using
  temporary inert snapshots outside layout; copy data updates immediately.
  Rapid selections cancel older snapshots. Reduced motion disables both the
  button transitions and these crossfades, and resizing removes snapshots.
- The preview card and footer share an outer module container. The footer's
  Design Inspector link opens `/design-inspector/coming-soon.html`.

The Figma links map to verified variants in AWD Design System 2: Default, Hover, Focus, and Small. Disabled is a native HTML state and links to
the base component; the UI explicitly identifies this distinction. These are
component deep links, not a runtime Figma synchronization service.

The homepage's approved Pass 5 blueprint markup and stylesheet are loaded from
their original files by `js/intro-bridge.js`. A decorative shadow root isolates
that stylesheet from the independently versioned Pass 4 featured project hero.
The intro and header consume the existing dark theme; the selected button and
opaque metrics strip use the default theme. No token names were added.

`css/intro-background-motion.css` adds homepage-only ambient light inside the
same shadow root. The stationary bar mask preserves the approved silhouettes;
its diffuse highlight travels from bottom left to upper right on a 32-second
cycle. Three traces reuse existing SVG path geometry with staggered 28–38 second
cycles. Grid and node luminance changes take 22–26 seconds. All decorative motion
pauses offscreen or in a hidden tab, and reduced-motion preferences retain the
static background without traveling highlights.
