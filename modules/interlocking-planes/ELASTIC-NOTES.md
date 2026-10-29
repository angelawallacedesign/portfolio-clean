# Elastic interaction update

- Three planes only: teal, pink, gold. The fourth front fragment is not rendered.
- Ambient group drift runs continuously while the module is active and visible.
- Pointer movement slowly pushes the individual planes apart, rotates and expands them.
- Pointer exit springs the planes back with a small overshoot.
- The existing `mountInterlockingPlanes()` API, `setActive`, `setPaused`, and `destroy` remain available.
- No WebGL or new runtime dependencies. Existing shared surface helper is not required for this standalone module.
- Tune the `configs` object (x/y/angle/scale), target displacement multipliers (100/85), and spring stiffness/damping in `interlocking-planes.js`.
- Respects reduced-motion preference and pauses when offscreen.

**Note:** This package retains the original SVG path geometry from the supplied ZIP. If you have newer Illustrator-edited paths, replace the three `shapes` values in `planes-artwork.js`.
