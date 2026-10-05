# Motion Studio --- Prototype Implementation Specification v0.1

**Date:** October 3, 2026\
**Artifact type:** Low-fidelity interaction prototype\
**Prototype effort:** 2--3 / 5\
**Purpose:** Demonstrate the workflow and decision model for converting
approved static photography into restrained, motion-ready assets. The
prototype does not implement a production AI generation engine.

------------------------------------------------------------------------

## 1. Prototype objective

Build a browser-based prototype that makes the following workflow
tangible:

**Approved source asset → AI-suggested motion region → user-controlled
intensity → Generate Preview → Processing → Review → human approval →
Approved**

The prototype should demonstrate product behavior, state transitions,
human control, and visual direction. Prepared assets may be used to
simulate generation.

### Design principle

**Automate preparation and generation. Preserve creative judgment and
approval.**

------------------------------------------------------------------------

## 2. Source of truth

Implementation should use the supplied low-fidelity Motion Studio UI
screenshots as the **visual source of truth**.

The concept PDF supplies the broader workflow and rationale.

Do **not**: - redesign the interface; - add navigation, dashboards,
galleries, analytics, search, or unrelated features; - increase visual
fidelity beyond the supplied mockup; - infer new product behavior from
the screenshots; - connect to a real AI service for this prototype.

------------------------------------------------------------------------

## 3. Visual specification

### Layout

-   Desktop-first internal tool.
-   Thin application header across the top.
-   Main workspace uses two columns:
    -   **Left:** dominant source-asset preview.
    -   **Right:** motion configuration and primary action.
-   Workflow progress/status bar spans the bottom of the workspace.
-   Keep the interface sparse so the workflow remains the focus.

### Brand/presentation direction

The prototype uses a restrained interpretation of visually observed
Carnival presentation cues rather than claiming to reproduce an internal
Carnival design system.

-   Light blue application header.
-   White primary background.
-   Carnival-like blue for structural/status emphasis.
-   Red for the initial **Generate Preview** action.
-   Green for the human **Approve** action and Review/approval state.
-   Light neutral gray for disabled/inactive states.
-   Small, restrained border radius.
-   Thin borders and minimal visual decoration.
-   Typography should remain simple, legible, and web-safe/free-to-use.

### Image presentation

-   Use an approved prototype candidate image in the source-asset area.
-   Source image is the dominant visual element.
-   A small **SOURCE ASSET** label appears within the image area.
-   A **STATIC MASTER** badge identifies the original raster source.
-   The source asset path may be displayed above the image to reinforce
    the internal-production-tool context.

------------------------------------------------------------------------

## 4. Behavioral specification

### 4.1 Asset selection

-   User chooses an image from a list of **approved assets**.
-   Only approved assets are available to the generation workflow.
-   Asset selection may be simulated in the first prototype.

### 4.2 AI-suggested motion region

-   After asset selection, the system automatically identifies **up to
    two** candidate motion regions.
-   The user cannot draw or define a custom motion region.
-   The user is shown no more than two AI-suggested region options.
-   Only **one** region may be selected for a generation.
-   Example options: **Water** or **Sky**.
-   The region is a system suggestion; the user chooses among the
    suggestions.

### 4.3 Intensity

-   User controls motion intensity with a slider.
-   The allowed range is intentionally narrow.
-   User-facing range: **Subtle → Restrained**.
-   The control must not imply dramatic or unrestricted animation.
-   The prototype may use a normalized internal value, but numeric
    values should not be exposed to the user.

### 4.4 Duration

-   Duration is fixed at **2.0 seconds**.
-   Duration is displayed as information, not as a user-editable
    control.

### 4.5 Generation options

The UI includes: - **Seamless loop** - **Preserve transparency**

For the prototype, these controls may toggle visually without changing
the prepared output asset.

### 4.6 Generate Preview

When the user selects **Generate Preview**:

1.  The generation sequence begins.
2.  The primary action enters a disabled Processing state.
3.  The status/progress indicator advances from **Original** through
    **Processing**.
4.  A prepared processing state may be shown in place of real AI
    generation.
5.  Progress continues until it reaches **Review**.
6.  Progress stops at Review and waits for explicit human action.

### 4.7 Human review and approval

-   The system must **not** automatically transition from Review to
    Approved.
-   At Review, the generated/prepared motion result is presented to the
    user.
-   The primary action changes to **Approve** and becomes enabled.
-   The user controls whether the generation advances to Approved.
-   Selecting **Approve** resumes the progress animation and completes
    the workflow.

### 4.8 Stop / close behavior

-   The product concept assumes the user will ultimately control
    stopping and closing the current generation.
-   Detailed stop/close behavior is **out of scope for this prototype**
    and should not be invented during implementation.

------------------------------------------------------------------------

## 5. Functional specification

### 5.1 State model

The prototype has four primary workflow states:

1.  **Original**
2.  **Processing**
3.  **Review**
4.  **Approved**

Valid forward transition:

`Original → Processing → Review → Approved`

**Review is a mandatory human checkpoint.**

### 5.2 Primary action states

  -----------------------------------------------------------------------
  Workflow state    Button label      Visual state      Interaction
  ----------------- ----------------- ----------------- -----------------
  Original          Generate Preview  Red / enabled     Starts simulated
                                                        generation

  Processing        Processing...     Gray / disabled   No user action

  Review            Approve           Green / enabled   Human approval

  Approved          Approved          Completed state   No generation
                                                        action required
  -----------------------------------------------------------------------

### 5.3 Progress/status behavior

-   Base progress track is white/light neutral.
-   Active progress fills **blue from left to right**.
-   During generation, progress advances through Original and
    Processing.
-   Progress stops precisely at the **Review** status marker.
-   Progress remains locked at Review until the user selects
    **Approve**.
-   After approval, blue progress resumes from Review and fills through
    Approved.
-   Completed progress remains blue.

The pause at Review is not decorative; it communicates the product rule:

**AI generates. Human approves.**

### 5.4 Generation configuration state

The interface maintains the current configuration:

-   selected approved asset;
-   selected AI-suggested region;
-   intensity;
-   seamless-loop selection;
-   preserve-transparency selection;
-   fixed duration: 2.0 seconds.

### 5.5 Activity logging

The production concept assumes an authenticated user.

For generation-related activity, the system should eventually record:

-   logged-in user;
-   action performed;
-   calendar date;
-   local time;
-   timestamp.

Persistent authentication and audit-log infrastructure are not required
for this prototype. The implementation should not fabricate a production
authentication system.

------------------------------------------------------------------------

## 6. Prototype simulation requirements

No production AI engine is required.

The prototype may use prepared assets to simulate:

1.  approved static source;
2.  processing state;
3.  generated 2-second motion preview;
4.  Review pause;
5.  human approval;
6.  Approved completion.

The goal is to test whether the **workflow is understandable and
useful**, not whether the generation technology is production-ready.

------------------------------------------------------------------------

## 7. Creative-governance constraints

Motion Studio is intended for **restrained ambient motion**, not
unrestricted image animation.

-   Motion should preserve the original composition and brand intent.
-   Primary subjects should remain visually stable unless explicitly
    supported by a future use case.
-   Motion intensity is deliberately constrained.
-   Hero imagery is the primary use case.
-   Selected sub-hero/editorial imagery may be considered.
-   Preferred page usage: **one motion asset**.
-   Conceptual maximum: **up to three motion assets on sufficiently long
    pages**.
-   The capability to generate motion does not imply that every eligible
    image should be animated.

------------------------------------------------------------------------

## 8. Accessibility and interaction baseline

For the prototype:

-   Use semantic HTML controls.
-   All interactive controls must be keyboard reachable.
-   Provide visible focus states.
-   Do not communicate workflow state through color alone; retain text
    labels and status markers.
-   Respect `prefers-reduced-motion` for UI transition/progress
    animation.
-   A reduced-motion preference should not remove workflow information;
    it should replace animated transitions with immediate state changes.

------------------------------------------------------------------------

## 9. Implementation guidance

Preferred implementation:

-   semantic HTML;
-   CSS;
-   minimal JavaScript;
-   no framework unless the hosting project already requires one;
-   no AI SDK/API;
-   no production authentication;
-   no backend required for the first pass.

Keep the code small enough to understand and modify during a
stakeholder-feedback cycle.

### Suggested prototype data shape

``` js
{
  asset: "approved-source-image",
  suggestedRegions: ["water", "sky"],
  selectedRegion: "water",
  intensity: 0.5,
  durationSeconds: 2,
  seamlessLoop: true,
  preserveTransparency: true,
  status: "original"
}
```

This is illustrative only; implementation may use an equivalent
structure.

------------------------------------------------------------------------

## 10. Acceptance criteria

The first-pass prototype is complete when:

-   the supplied low-fidelity layout is reproduced without redesign;
-   an approved source image can be represented/selected;
-   up to two AI-suggested regions are shown;
-   exactly one suggested region can be selected;
-   intensity can be adjusted within the constrained range;
-   duration displays 2.0 seconds and is not editable;
-   seamless-loop and preserve-transparency controls can be toggled;
-   Generate Preview initiates a simulated Processing state;
-   the primary action is disabled during Processing;
-   progress visibly advances and stops at Review;
-   the Review state presents the prepared result;
-   the primary action becomes a green Approve button;
-   approval resumes and completes progress through Approved;
-   reduced-motion behavior preserves the same state sequence without
    unnecessary animation;
-   no real AI generation or production backend is required.

------------------------------------------------------------------------

## 11. Out of scope for v0.1

-   Production AI/video-generation engine.
-   Model selection or model training.
-   DAM/API integration.
-   Persistent asset storage.
-   Production authentication.
-   Production audit-log persistence.
-   Custom user-drawn motion masks.
-   More than two AI-suggested regions.
-   Multi-region generation in a single pass.
-   User-controlled duration.
-   Detailed stop/cancel/close behavior.
-   Downstream approval workflows.
-   Production publishing.
-   High-fidelity visual design.

------------------------------------------------------------------------

## 12. Case-study framing

This prototype is an experiment in compressing the path from idea to
something stakeholders can evaluate:

**Concept reasoning → concept PDF → AI-assisted visual exploration →
human sketch and design judgment → low-fidelity Figma direction →
behavioral/functional specification → browser prototype**

The artifact should make it possible to discuss the workflow before
investing in production AI infrastructure.
