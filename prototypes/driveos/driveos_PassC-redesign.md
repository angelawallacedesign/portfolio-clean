# DriveOS — Pass C Redesign + Prototype Version Navigation

## Branch and working directories

**Stay on existing branch:** `prototype/driveos_PassC-redesign`

**Active implementation:**
`/portfolio-clean/prototypes/driveos/html/`

**Archived previous version:**
`/portfolio-clean/prototypes/driveos/html_pass-C_v1/`

**Updated Figma reference:**
https://www.figma.com/design/pkilccu772EARGgIrxGzlk/Drive-OS?node-id=58-673&m=draw

## Current state

The branch has already been created and the initial commit pushed.

The only changes made so far are:

- Copied the previous Pass C implementation into `html_pass-C_v1/`.
- Updated the windshield environment image and its path in the active `html/index.html`.

Preserve these changes. Do not reset the branch or recreate the directories.

## Task 1 — Pass C visual refinement

Use the updated Figma frame as the visual source of truth for the active cockpit implementation.

1. Inspect the existing Pass A–C HTML/CSS/SVG architecture.
2. Compare the Figma composition with the active implementation.
3. Refine cockpit geometry, materials, proportions, and display integration to match the Figma design.
4. Preserve the updated windshield image and its existing asset path.
5. Preserve the independent registered surfaces, masks, safe zones, and Debug Surfaces functionality.
6. Avoid unnecessary restructuring or rebuilding of the cockpit.
7. Do not modify the archived Pass C implementation except for the version-navigation changes described below.

Do not implement State 1 or introduce additional vehicle interactions.

## Task 2 — Prototype version dropdown

Convert the existing prototype pass label in the top status bar (`.status-meta`) into an accessible dropdown navigation component.

### Navigation entries

| Label | Directory |
|---|---|
| Pass C — Redesign | `/prototypes/driveos/html/` |
| Pass C — Initial | `/prototypes/driveos/html_pass-C_v1/` |

The active directory must always represent the latest working version.

### Component requirements

- Retain the existing status bar placement and visual styling.
- Replace only the prototype-pass label, not the other status metadata.
- Display the current prototype version as the dropdown trigger.
- Include a chevron indicating that the menu can expand.
- Highlight the currently selected version.
- Use standard links for navigation between prototype directories.
- Support keyboard navigation, Escape to close, visible focus indication, and appropriate accessibility semantics.
- Close the menu when clicking outside.
- Keep the menu within the viewport.
- Do not interfere with existing prototype controls or Debug Surfaces behavior.

### Architecture

Keep the version navigation lightweight and reusable.

Because the active `/html/` directory will be updated continuously and older implementations will be preserved in separately named directories, use a small version manifest or equivalent centralized configuration where practical.

Avoid unnecessary dependencies.

The version list should be easy to extend when a new archived prototype is created.

Ensure that relative navigation paths work from both the active and archived directories.

### Archived version handling

The previous Pass C implementation should remain visually and functionally unchanged except for adding the version-navigation component.

Do not synchronize future cockpit changes into archived versions.

## Validation

- Verify both dropdown links resolve correctly.
- Verify the correct current version is displayed on each page.
- Verify the menu is keyboard accessible.
- Confirm the archived Pass C cockpit remains unchanged.
- Confirm the active Pass C redesign matches the Figma reference.
- Test at the existing desktop and tablet landscape QA dimensions.
- Confirm Debug Surfaces still works.
- Document any registration geometry changes.

## Deliverables

1. Updated Pass C cockpit in `/html/`.
2. Working prototype version dropdown in both directories.
3. Updated documentation describing the version-navigation convention.
4. Summary of modified files and QA results.

**Do not mark Pass C as approved.** Leave it ready for visual review.

## Implementation notes

### Prototype version navigation convention

The pass label in each prototype header is a shared, accessible version menu. Its centralized manifest and behavior live in `prototype-version-nav.js`; its presentation lives in `prototype-version-nav.css`.

- The active working directory uses `data-prototype-version="pass-c-redesign"` and remains at `html/`.
- The archived baseline uses `data-prototype-version="pass-c-initial"` and remains at `html_pass-C_v1/`.
- Manifest links are sibling-relative (`../html/` and `../html_pass-C_v1/`) so they resolve from either directory and under the deployed `/prototypes/driveos/` base path.
- Add a future archive by appending one manifest record, adding that record's `data-prototype-version` id to the archived page, and leaving `html/` as the latest working version.
- The component uses standard links, `aria-haspopup="menu"`, `aria-expanded`, `aria-current="page"`, roving arrow-key focus, Home/End, Escape-to-close, outside-click dismissal, and visible focus rings.

### Pass C redesign geometry

The active cockpit retains the three independent surface elements, local canvases, registration overlays, masks, safe zones, exclusions, and the Debug Surfaces switch. The Figma frame changed the registered scene geometry as follows:

- Shell aspect ratio: `8:5` to `1470:831`.
- Scene coordinate system: `1600 × 800` to the Figma cockpit export's `1463 × 664` coordinate system.
- Windshield: changed from a rounded trapezoid to a rectangular glazing plane behind the Figma-defined pillar occlusions; safe zone is now `0.07 / 0.08 / 0.90 / 0.82`, and the rearview-mirror exclusion was removed with the mirror.
- Instrument cluster: moved to `left 8.11% / top 64.37% / width 28.08% / height 26.66%`; its mask is now flat-bottomed with a deep rounded crown.
- Wide dashboard: moved to `left 39.41% / top 71.45% / width 37.15% / height 27.92%`; correction is now `rotate(-0.39deg) skewX(0.75deg)`.
- Steering wheel: moved to `left 5.97% / top 60.30% / width 32.13%`, with the spoke and hub proportions aligned to the updated frame.

No State 1 UI, vehicle behavior, or additional prototype interaction was added. Pass C remains unapproved and ready for visual review.

### QA record

- Figma reference render checked at `1470 × 831`.
- Desktop landscape checked at `1600 × 1000`.
- Tablet landscape checked at `1024 × 768`.
- Active and archived menus display the correct current label and navigate in both directions.
- Arrow-key movement, Home/End handling, Escape-to-close with focus restoration, outside-click dismissal, and visible focus styling are implemented.
- Debug Surfaces toggles the material layers while retaining the revised registered boundaries, masks, safe zones, exclusions, and local canvases.
- Archived cockpit files remain byte-for-byte unchanged from the branch baseline; only `html_pass-C_v1/index.html` received the shared version-navigation stylesheet, mount point, and script.
