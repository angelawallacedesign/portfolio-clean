# Slide 02 — Design Systems Responsive Artwork Implementation

**Status:** Ready for Codex implementation  
**Scope:** Portfolio landing intro carousel, **Design Systems slide (Slide 02)** only  
**Purpose:** Implement the approved desktop and tablet-portrait Figma compositions using two independently controlled image layers. Extend the gradient-only treatment to tablet landscape and mobile.

## References

- **Desktop Figma:** https://www.figma.com/design/NLRV4Dry5176FP9YISkIm8/AWD-Portfolio?node-id=2140-779&t=FoKMmfRYSCn0IoQH-0
- **Tablet portrait Figma:** https://www.figma.com/design/NLRV4Dry5176FP9YISkIm8/AWD-Portfolio?node-id=2145-2609&t=FoKMmfRYSCn0IoQH-0
- **Gradient/glass background:** `/design-system/ui-kit-hero.png`
- **Angled UI screens (transparent image):** `/assets/intro/UI-kit-intro-hero_no-bg_EDITED.png`

Inspect the actual repository structure, existing carousel markup, CSS, and responsive rules before editing. These are repository-relative asset paths, not necessarily CSS-relative URLs. Confirm that both files exist and resolve correctly. Use the actual Design Systems slide selector rather than introducing an assumed global `.intro-stage` rule.

## Design intent

The artwork is a layered composition, **not a single flattened image**. The gradient and angled screens must be positioned and controlled separately. Artwork is decorative and must not obscure, displace, or reduce the legibility of the slide's heading, description, CTA, or text link.

### Desktop (approved Figma reference)

- Display **both** the gradient background and transparent angled-screen composition.
- Place artwork on the **right**, with the overall visual treatment occupying approximately the right **70% of the slide's background area**. Match the Figma reference rather than forcing every layer to exactly 70% width.
- Fade the gradient toward the **left** so the copy sits on a clean, legible white reading area. Preserve the soft top/bottom integration visible in the reference where needed.
- Display angled screens over the gradient; their **left side fades out** into the reading area.
- Allow the angled screens to extend **beyond the right edge of the viewport**; clip at the appropriate slide/viewport boundary. Do not introduce horizontal scrolling.
- Preserve image aspect ratio. Cropping is acceptable; stretching or distortion is not.
- Keep intro copy and actions above the decorative layers.
- Keep pagination in the position shown by the desktop reference.

### Tablet portrait (approved Figma reference)

- **Hide the angled-screen layer entirely.**
- Show **only the gradient/glass background**.
- Figma gradient position reference: **x: -114, y: -34** relative to its Figma positioning context. Translate this to CSS relative to the actual image and container dimensions; do not blindly apply those numbers as universal pixel offsets.
- Maintain a white/low-contrast area behind the heading, description, and actions.
- Position the existing pagination strip **upward into the bottom of the intro background composition**, as shown in Figma. Adjust its placement using the existing carousel structure; do not create duplicate pagination.
- Maintain appropriate spacing between copy, CTA, pagination, and subsequent metrics/content.

### Tablet landscape

- Use the **gradient-only treatment**: hide angled screens.
- Position and scale the gradient to support the available landscape viewport, with clear copy and no unintended cropping, stretching, overflow, or overlap.
- The tablet portrait coordinates are **not** mandatory for landscape. Adapt placement to the layout while preserving the same visual intent.

### Mobile

- Use the **gradient-only treatment**: hide angled screens.
- Preserve visible, readable Slide 02 heading, description, CTA, and text link.
- Scale typography and controls using the existing responsive type system rather than hardcoded one-off dimensions.
- Position/crop the gradient so it remains atmospheric, does not interfere with copy, and does not cause horizontal scrolling.
- Ensure the pagination remains accessible and does not collide with copy, controls, or the next section.

## Responsive switching

The change from two-layer desktop artwork to gradient-only artwork must be based on the **actual tablet landscape/portrait and mobile layout rules** in the codebase. Do not assume that a conventional `768px` media query covers tablet landscape. Inspect existing breakpoints and choose a clear transition consistent with the approved designs. Avoid adding redundant or conflicting overrides.

## Implementation constraints

1. **Only modify Slide 02 artwork/layout and the minimum shared carousel CSS needed for its responsive positioning.** Do not redesign Slide 01 or Slide 03.
2. Preserve existing carousel timing, transitions, autoplay, navigation, and play/pause behavior. Do not implement unrelated carousel features in this pass.
3. Preserve existing Slide 02 copy, CTA labels, destinations, typography, and visual styles; do not change text or links.
4. Do not modify `/design-system/ui-kit.html` or the UI Kit page presentation.
5. Reuse existing layout wrappers/selectors and tokens where possible. Do not add unnecessary DOM wrappers, duplicate image assets, or competing background implementations.
6. Decorative layers must not intercept pointer events or interfere with keyboard interaction. Mark decorative `<img>` elements appropriately (e.g. empty `alt` and `aria-hidden` where suitable).
7. Respect existing reduced-motion behavior; no new animation is requested.
8. Do not merge, push, or publish. Keep changes local for review.

## Suggested implementation sequence

1. **Inspect:** Identify the actual Slide 02 element, carousel structure, current artwork/background CSS, image asset paths, responsive breakpoints, and pagination positioning rules. Report any conflicts or missing assets before editing.
2. **Implement desktop:** Introduce independently positioned gradient and angled-screen layers; match the desktop Figma reference, including left fades and right-edge clipping.
3. **Implement responsive:** Hide angled screens on tablet landscape, tablet portrait, and mobile; adjust gradient positioning by layout. Match tablet portrait Figma reference closely.
4. **Validate:** Check the slide in desktop, tablet landscape, tablet portrait, and mobile; check carousel slide transitions and neighboring slides for regressions.
5. **Report:** List changed files, actual selectors/breakpoints used, any deviations from the Figma references, and remaining QA concerns. Do not merge or push.

## Acceptance criteria

- [ ] Desktop: both image layers visible, with the angled screens extending past the right viewport edge and fading on the left.
- [ ] Desktop: gradient fades left; heading, description, CTA, and text link remain legible.
- [ ] Tablet landscape: angled screens hidden; gradient only; copy unobstructed.
- [ ] Tablet portrait: angled screens hidden; gradient placement and raised pagination match the Figma composition.
- [ ] Mobile: angled screens hidden; gradient only; all copy and actions remain visible and usable.
- [ ] No stretched artwork, horizontal overflow, duplicate pagination, or unintended content overlap.
- [ ] Slide 01 and Slide 03 are unchanged visually and functionally.
- [ ] Carousel transitions and existing interactions remain functional.
- [ ] UI Kit page remains unchanged.
- [ ] Changes remain local and ready for review; no merge/push/deployment.

## Out of scope

- Implementing any **unfinished** responsive copy-reveal or right-side-visual behavior for other slides.
- Redesigning the UI Kit or Design Inspector pages.
- Changing carousel controls, timing, or autoplay behavior.
- Updating copy, links, or global typography.

**Important:** If the existing responsive carousel implementation prevents Slide 02 from displaying its copy or decorative background as specified, flag that dependency explicitly rather than silently expanding scope to rewrite other slides.
