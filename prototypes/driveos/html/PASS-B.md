# DriveOS v0.1 — Pass B surface registration

## Added in Pass B

- Normalized surface-registration metadata for windshield B, cluster C, and dashboard D.
- An independently clipped local canvas inside each existing Pass A surface container.
- A physical boundary, inner safe zone, perspective contract, and surface-specific exclusion registry.
- Temporary Gate B overlays: green physical boundary, yellow safe zone, red exclusions, cyan vertical registration guide, and magenta horizontal registration guide.
- A keyboard-operable control that shows or hides the temporary overlays without changing surface geometry.

## Registration contract

The scene uses the approved Pass A 1600 × 800 cockpit coordinate system. Feature content renders in each surface's rectangular local canvas; the child viewport applies the surface clip. Registration data lives in `data/surface-registration.json` and is intentionally separate from user-facing prototype content.

## Scope boundaries

- The calibration values are temporary Gate B review values because no approved numeric calibration package exists.
- Pass A shell geometry, cockpit chrome, A–F layout, and grayscale construction styling remain unchanged.
- No cockpit materials, final lighting, state UI, feature content, startup behavior, vehicle data, media, or motion were added.
- The Debug Surfaces material-hiding behavior specified for Pass C is not implemented. The Pass B control only changes registration-guide visibility.

## Gate B QA viewports

- Desktop landscape: 1600 × 1000
- Tablet landscape: 1024 × 768
- Unsupported portrait: 768 × 1024
