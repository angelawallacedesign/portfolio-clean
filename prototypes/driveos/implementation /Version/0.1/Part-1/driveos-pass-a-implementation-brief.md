# DriveOS — Pass A Implementation Brief

**Phase:** A — Viewport Shell  
**Objective:** Establish the cockpit's structural HTML/CSS architecture and verify visual alignment against the approved wireframes.

## 1. Reference Package

The reference package contains two authoritative wireframes:

- `cockpit-wireframe.webp` — Black-and-white visual reference for cockpit geometry, proportions, composition, and layering.
- `cockpit-wireframe-sections.png` — Color-coded architectural reference identifying regions A–F.

Use both references together. The annotated wireframe defines architectural boundaries; the original wireframe defines visual fidelity.

The existing prototype HTML/CSS is documentation reference only. **Begin with a fresh implementation. Do not reuse the previous prototype's markup or styling as the foundation.**

## 2. Supported Viewports

Support exactly two presentation contexts:

- Desktop, landscape
- Tablet, landscape

Do not implement mobile, tablet portrait, responsive reflow, or alternate stacked layouts.

Preserve the cockpit's spatial relationships and composition in both supported contexts. Proportional scaling within the supported landscape presentation is permitted.

The application should fit within the available browser viewport without page scrolling.

For unsupported contexts, provide a simple fallback message instead of attempting to rearrange the cockpit.

## 3. Application Architecture

Create three primary horizontal application regions:

1. **A — Top Status Region**
2. **Cockpit Scene — Regions B, C, D, and F**
3. **E — Prototype Controls**

The cockpit must be one continuous composition with a shared coordinate system.

Do not construct the cockpit as a collection of rigid, visually separate rows or sliced image fragments.

Use semantic HTML, CSS Grid/Flexbox for the application shell, and independently positioned layers within the cockpit scene.

SVG may be used for irregular structural geometry, but the entire application must not be implemented as one monolithic SVG.

## 4. Region Specifications

### A — Top Status Region

- Establish the top status container and two independently addressable status bars.
- Prepare the structure for collapsible behavior.
- Implement basic expand/collapse behavior if both states can be accommodated without disrupting the approved cockpit composition.
- Use provisional grayscale styling.

### B — Windshield

- Establish an independent dynamic-content container.
- Match its position and intended visible geometry to the approved wireframe.
- Provide a clearly identifiable surface placeholder.
- Do not implement environmental imagery, spatial navigation, or animation.

### C — Instrument Cluster

- Establish an independent dynamic-content container.
- Preserve its relationship to the steering wheel and windshield.
- Match the approved cluster geometry and positioning.
- Do not implement gauges, vehicle data, or animations.

### D — Wide Dashboard

- Establish an independent dynamic-content container.
- Match its position, proportions, and visible geometry to the approved wireframe.
- Keep it independently addressable for future UI states.
- Do not implement dashboard functionality.

### E — Prototype Controls

- Establish a separate bottom control region outside the cockpit scene.
- Prepare a container for future prompt chips and prototype actions.
- Use provisional controls or labeled placeholders only.
- Do not implement the Start Car motion sequence.

### F — Steering Wheel

- Establish an independent foreground component.
- Preserve the wheel's positioning and overlap with the instrument cluster.
- Keep its structure separate from Region C and the static cockpit background.
- Prepare the component for future interactive regions.

Do not define individual thumb-control hit areas or implement steering-wheel interactions yet.

A separate, zoomed-in annotated wireframe will define those requirements in a later phase.

## 5. Cockpit Artwork and Layering

Preserve the visual relationships established by the reference wireframes.

Use independently addressable layers for:

- Dynamic surface placeholders B, C, and D
- Structural cockpit chrome
- Foreground steering-wheel component F

Separate structural artwork into background and foreground layers only where necessary to preserve correct visual overlap.

Use rectangular HTML containers as positioning boundaries. Their visible content may follow irregular geometry.

Do not flatten dynamic surfaces or the steering wheel into one background image.

**Pass A may use provisional SVG silhouettes or outlines to reproduce the approved geometry. It must not implement the final animation clipping or masking system.**

## 6. Surface Preparation

Assign stable identifiers to the three dynamic surfaces:

- `windshield-surface`
- `instrument-cluster-surface`
- `wide-dashboard-surface`

Each surface must have its own independently addressable container.

Reserve the architecture for future clipping masks, animation content, and surface calibration.

Do not implement mask definitions, animation timelines, calibration JSON, or debugging overlays in Pass A. These belong to Pass B.

## 7. Visual Treatment

Pass A is a structural wireframe.

Use grayscale placeholders and simple outlines to distinguish major regions.

Match the original cockpit wireframe's geometry as closely as practical, including:

- Windshield shape and proportions
- Instrument cluster position
- Wide dashboard position
- Steering-wheel silhouette and overlap
- Surrounding cockpit chrome

Do not introduce final branding, materials, textures, lighting, or polished dashboard UI.

The colored architectural reference is an annotation guide, not the final UI color palette.

## 8. Implementation Quality

- Keep region components modular and independently addressable.
- Use predictable CSS stacking and positioning.
- Avoid unnecessary dependencies.
- Avoid arbitrary viewport-specific positioning patches.
- Maintain consistent cockpit proportions across the two supported presentation contexts.
- Use semantic markup where appropriate.
- Ensure unsupported viewports cannot accidentally expose broken cockpit layouts.
- Keep the implementation ready for Pass B without requiring a structural rewrite.

## 9. Deliverables

Produce:

1. A working standalone Pass A HTML/CSS prototype.
2. A clear component and layout structure corresponding to regions A–F.
3. Provisional cockpit artwork or SVG geometry where needed.
4. Desktop and tablet-landscape presentation support.
5. A simple unsupported-viewport fallback.
6. A short implementation summary documenting architectural decisions and any deviations from the approved references.

Do not begin Pass B or Pass C.

## 10. Acceptance Criteria

Pass A is complete when:

- [ ] The application contains the three primary horizontal regions.
- [ ] Regions A–F are represented by independently addressable components or containers.
- [ ] The cockpit visually resembles `cockpit-wireframe.webp`.
- [ ] Region placement agrees with `cockpit-wireframe-sections.png`.
- [ ] B, C, and D are independently addressable dynamic-surface placeholders.
- [ ] F is an independent foreground component, not part of C.
- [ ] Cockpit structural chrome preserves the correct visual overlaps.
- [ ] Desktop landscape is supported.
- [ ] Tablet landscape is supported.
- [ ] Portrait and mobile layouts are not implemented.
- [ ] No responsive reflow occurs.
- [ ] The supported composition fits without page scrolling.
- [ ] No final masks, motion sequences, or visual styling have been introduced.
- [ ] The implementation can proceed to Pass B without rebuilding the layout architecture.

## 11. Scope Boundary

**Stop after Pass A.**

Do not implement:

- Surface masks or animation calibration (Pass B)
- Final cockpit materials or lighting (Pass C)
- Start Car interaction or 3D logo reveal (State 1)
- Instrument cluster functionality
- Wide dashboard functionality
- Steering-wheel interactions
- States 2–6

Provide the implementation for visual review before proceeding.

**Definition of Done:** A standalone, landscape-only HTML/CSS cockpit wireframe that closely matches the approved reference geometry, establishes independent A–F regions, and provides a stable architectural foundation for Pass B.
