# DriveOS v0.1 — Pass A implementation summary

## Architecture

- The application is one fixed 8:5 composition with three horizontal regions: A (top status), the continuous B/C/D/F cockpit scene, and E (prototype controls).
- The full composition scales proportionally with `contain` behavior. It does not reflow. Extra viewport space becomes neutral letterboxing.
- B, C, and D are separate semantic containers with stable IDs. F is a separate foreground component layered over C.
- Structural cockpit chrome is a dedicated SVG geometry layer. It is not combined with any display surface or the steering wheel.
- All visible prototype copy is loaded from `data/prototype-content.json`.

## Pass A boundaries

- Controls are disabled placeholders only.
- Display surfaces are inactive placeholders only.
- There are no clipping masks, safe zones, calibration data, debug overlays, motion timelines, state transitions, vehicle data, dashboard features, or steering-wheel hit areas.
- The top status bars are separately addressable and structurally prepared for later visibility behavior; collapse behavior is intentionally deferred.

## Provisional decisions for Gate A

- The unsupported-view guard currently activates for portrait orientation, widths below 768 px, or heights at or below 500 px. These are review values, not final product breakpoints.
- The 8:5 shell ratio follows the annotated A–F composition. On 16:9 desktop and 4:3 tablet-landscape viewports, the composition is proportionally contained instead of stretched.
- Geometry and material values are grayscale construction art intended for composition review. They are not Pass C cockpit styling.

## QA viewports used

- Desktop landscape: 1600 × 1000
- Tablet landscape: 1024 × 768
- Unsupported portrait: 768 × 1024
