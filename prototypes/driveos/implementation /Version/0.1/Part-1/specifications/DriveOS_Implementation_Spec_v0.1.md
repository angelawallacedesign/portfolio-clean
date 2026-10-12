# DriveOS — Implementation Specification

**Version:** v0.1 · Part 1  
**Release:** Cockpit Foundation & Vehicle Activation  
**Status:** Approved interaction scope; startup logo artwork and precise motion timing pending review  
**Prepared:** October 12, 2026  
**Design authority:** Selected cockpit storyboard, user-supplied visual references, and approved decisions in this specification.

> **Execution rule:** Build incrementally. Stop at each review gate for visual QA. Do not silently resolve open visual decisions or expand Part 1 into States 2–9.

## 1. Project Objective and Release Boundary

Build a fixed-composition, landscape-only, full-viewport, first-person automotive cockpit prototype. Part 1 establishes a stationary vehicle interior, three independently registered digital surfaces, a windshield identity reveal, a parked instrument cluster, an idle/animated media player, and an intentional shutdown. **The vehicle never moves in Part 1.**

Included: Preparation Pass A (viewport shell), Pass B (surface registration), Pass C (cockpit treatment), State 1A (Off), 1B (Startup), 1C (Parked/Ready), 1D (Visual Music), 1E (Shutdown). Excluded: States 2–9, navigation, calls, voice, driving, real telemetry, real audio, and production safety validation.

Views: Desktop and tablet (landscape orientation only). Tablet portrait and all mobile views are unsupported. No responsive reflow or alternate stacked layouts.

## 2. Visual Authority and Approved Decisions

- **2.A** — The cockpit's physical geometry and driver viewpoint remain fixed through all states; the windshield dominates the composition.
- **2.B** — The forest/mountain road is a separate replaceable environment layer.
- **2.C** — **Windshield:** startup identity/logo reveal only; clear of persistent prototype status or music UI.
- **2.D** — **Cluster:** standby prompt and parked vehicle information, independently illuminated.
- **2.E** — **Center dashboard:** wide horizontal screen; idle media player after startup, visual-only waveform when playing.
- **2.F** — **Prototype chrome:** top status area is hideable; bottom controls are the **only persistent toolbar** and blend with the dark cockpit palette.
- **2.G** — **Controls:** pill-shaped; primary actions left, Reset right; Reset always operable, even if visually muted.
- **2.H** — **Shutdown:** fade active features and ambient light first, then play **only the horizontal blue-white luminance animation from startup** as the last animated event (see Appendix A, Figure A5 for the luminance sweep visual reference); never replay the logo or 3D/motion-blur reveal.
- **2.I** — The approved visual references are directional; if a screenshot conflicts with the written behavior (especially status-bar placement), **this written specification prevails**.

## 3. Architecture

**Hierarchy:** Cockpit Environment → Digital Surface → Feature → Component.

Three independent digital surfaces: **windshield**, **instrument cluster**, and **center dashboard**. Each surface owns its physical boundary, clipping mask, safe zone, perspective, content features, and local animation. Feature content renders in a rectangular local coordinate system; the surface container performs clipping/perspective. Features must not manipulate another surface's DOM or CSS. A central prototype controller coordinates lifecycle transitions without owning presentation.

**Layering:** forest environment; physical cockpit geometry; independently toggleable rendered materials/trim/reflections/ambient treatment; digital display containers; feature content; external prototype chrome. The cockpit treatment cannot be a single flattened image if Debug Surfaces must selectively hide it.

### 3.1 Proposed repository layout

```text
portfolio-clean/prototypes/driveos/html/
+-- index.html
+-- assets/
|   +-- environment/
|   +-- branding/
|   +-- icons/
+-- data/
|   +-- prototype-content.json
+-- cockpit/
|   +-- cockpit.css
|   +-- cockpit.js
+-- windshield/
|   +-- windshield.css
|   +-- windshield.js
|   +-- features/startup-logo/
|       +-- startup-logo.js
|       +-- startup-logo.css
+-- cluster/
|   +-- cluster.css
|   +-- cluster.js
|   +-- features/{standby,vehicle-status}/
+-- dashboard/
|   +-- dashboard.css
|   +-- dashboard.js
|   +-- features/media-player/
+-- steering-wheel/
|   +-- steering-wheel.css
|   +-- steering-wheel.js
+-- prototype/
|   +-- controller.js
|   +-- controls.js
|   +-- controls.css
|   +-- status.js
|   +-- status.css
+-- shared/
    +-- reset.css
    +-- tokens.css
    +-- motion.css
```

The implementation root is `portfolio-clean/prototypes/driveos/html/`. Documentation stays under `driveos/implementation/Version/0.1/Part-1/`; visual references stay under `driveos/reference/`. The directory layout is a proposed target, not an instruction to create empty files. A shared luminance *behavior contract* may coordinate independent per-surface animations; avoid cross-surface DOM dependencies.

## 4. JSON Content Contract

All user-facing copy and simulated media/vehicle content must be sourced from `data/prototype-content.json`; do not hard-code labels in HTML or JavaScript. Suggested initial values are mock data, not verified vehicle specifications.

```json
{
  "prototype": {"name": "DriveOS", "version": "v0.1"},
  "controls": {
    "start": "Start Car", "starting": "Starting...",
    "stop": "Turn Car Off", "play": "Play Music",
    "pause": "Pause Music", "reset": "Reset",
    "hideStatus": "Hide Status", "showStatus": "Show UI Status",
    "debugSurfaces": "Debug Surfaces"
  },
  "status": {
    "off": "Vehicle Off", "starting": "Starting...",
    "ready": "Parked · Ready", "stopping": "Shutting Down..."
  },
  "cluster": {
    "standby": "Press Start Car to begin", "speedUnit": "MPH", "gear": "P"
  },
  "vehicle": {"speed": 0, "rangeMiles": 248, "batteryPercent": 72},
  "media": {"title": "Drift", "artist": "Ford Sessions", "durationSeconds": 236}
}
```

The top-status keyboard shortcut and its visible caption are pending final assignment. Store its caption in JSON once selected.

## 5. Pass A — Viewport Shell

Use `cockpit-wireframe.webp` for geometry and `cockpit-wireframe-sections.png` for the A–F region registry. Pass A establishes rectangular HTML containers and provisional irregular silhouettes; final masks, safe zones, and calibration belong to Pass B. The uncolored, unlettered white areas in the annotated wireframe are noninteractive cockpit chrome.

- **5.A** — Fill viewport without unintended scroll; maintain a stable first-person cockpit perspective.
- **5.B** — Register the annotated regions A (two top status bars), B (windshield), C (instrument cluster), D (wide dashboard), E (bottom prototype controls), and F (independent foreground steering wheel). Preserve the continuous cockpit scene and steering wheel/cluster overlap. Reserve future steering-wheel controls without defining hit areas.
- **5.C** — Keep digital displays inactive; do not implement State 1 animation or media yet.
- **5.D** — Support desktop landscape and tablet landscape only, using one fixed cockpit composition with proportional scaling where needed. No responsive reflow. Show a JSON-driven unsupported-view message for tablet portrait and mobile.
- **5.E** — **Gate A:** stop for composition, proportions, layering, and desktop/tablet-landscape QA.

## 6. Pass B — Digital Surface Registration

Each surface exposes physical boundary, rectangular local canvas, clipping mask, inner safe zone, position/scale, perspective treatment, and debug visualization.

- **6.A** — **Windshield:** four-point trapezoidal/perspective boundary; mirror and pillar exclusions; driver-focused safe zone.
- **6.B** — **Cluster:** behind steering wheel; account for occlusion; preserve safe area for gear, speed, range, and charge.
- **6.C** — **Dashboard:** wide rectangle with minimal perspective correction.
- **6.D** — **Debug guides:** neon green physical boundary; neon yellow safe zone; neon red exclusion; cyan/magenta registration guides.
- **6.E** — Temporary calibration text must be sourced from JSON and visibly marked as temporary.
- **6.F** — **Gate B:** debug geometry aligns and remains stable at supported widths; no feature animations yet.

## 7. Pass C — Cockpit Environment and Debug Surfaces

Render restrained dark steering-wheel material, soft-touch dash, subtle trim, minimal vents/metallic details, realistic pillars/headliner, soft reflections, and discreet ambient lighting. The environment and digital surfaces remain separately controllable.

**Debug Surfaces** is a development-mode toggle, independent of vehicle/media state:

- **7.A** — **On:** hide rendered cockpit materials, trim, reflections, and ambient treatments; expose base geometry and Pass B registration/safe-zone guides; preserve display boundaries, masks, and feature content.
- **7.B** — **Off:** restore rendered physical treatments and hide temporary debug guides.
- **7.C** — Toggling does not reset the vehicle, alter playback state, interrupt active animation, or shift geometry.
- **7.D** — Treat the physical cockpit as separable layers or supply an alternate debug geometry plate; do not flatten the only usable cockpit image.
- **7.E** — **Gate C:** stop for rendered cockpit and Debug Surfaces QA.

## 8. State 1A — Vehicle Off / Standby

- **8.A** — **Windshield (B):** clear forest/mountain environment; no HUD or logo.
- **8.B** — **Cluster (C):** low-power power/vehicle icon and JSON-driven activation prompt; no active driving gauges.
- **8.C** — **Dashboard (D):** black/inactive.
- **8.D** — **Top status (A, when shown):** DriveOS/version, Vehicle Off, Hide Status control, small shortcut caption.
- **8.E** — **Bottom controls (E):** Start Car enabled; Play Music disabled; Reset visually muted but operable. Show UI Status appears left of Reset only when top status is hidden.
- **8.F** — **Steering wheel (F):** independent foreground component, inactive; no thumb-control zones defined in Part 1.
- **8.G** — **Exit:** Start Car → `starting`.

## 9. State 1B — Startup / Logo Reveal

1. Set vehicle `starting`; update status; disable Start Car temporarily. If top status (A) is visible, hide it using a short genie-style or bounce transition before any vehicle startup animation begins. Reveal Show UI Status in bottom controls (E). The status transition must finish before the next step; exact motion parameters require review.
2. Fade cluster standby content.
3. Begin restrained synchronized cluster and dashboard wake-up illumination, including the approved horizontal luminance treatment.
4. Run independent windshield identity reveal with controlled depth/lighting and directional blur: **Brand → Object → Velocity → Interface**.
5. Clear windshield back to forest/mountain view.
6. Resolve cluster to parked information and dashboard to **idle media player**.
7. Set vehicle `ready`.

Startup logo plays once per activation, not on pause or status-toggle changes. Reset must cancel startup. Exact artwork, 3D technique, keyframes, duration, easing, and luminance intensity remain subject to motion review; the agent must not invent a final brand animation without approval.

## 10. State 1C — Parked / Ready

Top status (A) remains hidden after startup unless the visitor explicitly restores it using Show UI Status in bottom controls (E). If restored, it shows the current Parked · Ready state and can be hidden again without changing vehicle state.

- **10.A** — **Windshield:** unobstructed forest/mountain view.
- **10.B** — **Cluster:** 0 MPH, P, mock range and battery/charge; never simulate movement.
- **10.C** — **Dashboard:** **minimal media player visible immediately in idle state**, with title/artist from JSON and an inactive waveform. No separate home screen, navigation icon, or calling placeholder in v0.1.
- **10.D** — **Bottom controls:** Turn Car Off, Play Music, Reset.
- **10.E** — **Exits:** Play Music → State 1D; Turn Car Off → State 1E; Reset → State 1A immediately.

## 11. State 1D — Visual-Only Music

- **11.A** — Play Music activates an SVG waveform/equalizer **inside the center dashboard only**; retain the same media-player layout.
- **11.B** — Button changes to Pause Music. Pause stops/settles waveform, leaves player visible, and changes button to Play Music; resume restarts visual animation.
- **11.C** — Windshield stays clear; cluster remains 0 MPH/P.
- **11.D** — **No audio files, streaming, sound engine, mute, or simulated volume controls.**
- **11.E** — Provide a reduced-motion static or minimally animated waveform state.
- **11.F** — Turn Car Off stops media visualization and initiates State 1E; Reset cancels immediately.

## 12. State 1E — Shutdown (Approved Final Choreography)

**Critical sequencing: horizontal luminance is the LAST animation, after feature fade-out and before power-off.**

1. Set vehicle state to `stopping`; stop SVG media animation.
2. Fade out media-player content and other active dashboard features.
3. Fade out cluster speed/gear/range/charge indicators.
4. Reduce ambient cockpit lighting toward standby; complete active feature fade-out.
5. **Only after features have disappeared**, perform the restrained **horizontal blue-white luminance sweep** shown in the supplied shutdown reference. Coordinate the sweep across the windshield, cluster, and dashboard regions, each clipped to its registered mask and perspective.
6. Finish the luminance sweep; digital dashboard settles to black, cluster returns to low-power standby prompt, and windshield remains transparent to the forest/mountain environment.
7. If top status (A) is visible, quietly hide it without replaying the startup genie/bounce effect; bottom controls (E) expose Show UI Status. Then set state `off`, update status to Vehicle Off, and restore Start Car / disabled Play Music / Reset controls. The cockpit settles in Off mode.

**Do not** replay the startup logo, 3D brand reveal, depth animation, or directional blur. No physical cockpit movement. Reset cancels the luminance animation. Reduced-motion users receive a non-sweeping transition into standby.

## 13. State Management

Vehicle lifecycle: `off → starting → ready → stopping → off`. Media: `idle`, `playing`, `paused`; media cannot power the car. Status visibility and Debug Surfaces are independent presentation states.

```text
OFF --Start Car--> STARTING --startup complete--> READY
READY --Play Music--> READY + PLAYING
READY + PLAYING --Pause Music--> READY + PAUSED
READY --Turn Car Off--> STOPPING --fade + final luminance--> OFF
ANY STATE --Reset--> OFF (immediate cancellation)
```

Reset cancels all timers/animations (including luminance), stops media visualization, restores mock data and initial cockpit/controls, but **preserves the user's top-status visibility preference**. Debug mode should not be changed by Reset unless specifically requested through its own control.

## 14. Prototype Chrome and Accessibility

All white, uncolored, unlettered areas in `cockpit-wireframe-sections.png` are noninteractive structural UI chrome. They are not dynamic surfaces, controls, or hit targets. Steering wheel F remains an independent component for later interactive design.

**Top status area:** separate from windshield, hideable, never reserved as empty space when hidden. When visible show identity, live vehicle status, Hide Status button, and small keyboard-toggle caption. The chosen shortcut must not fire inside editable fields. When hidden, reveal **Show UI Status** text link immediately to the left of Reset in the bottom toolbar; hide that link when status is visible. Restoring status must immediately reflect the current vehicle state.

**Bottom controller:** the only persistent toolbar, integrated into the same dark cockpit palette. Pill-shaped actions on left, Reset far right, conditional Show UI Status link just left of Reset. Preserve legibility and visible keyboard focus. No extra rectangular black surrounds around pills.

Use semantic buttons, programmatic disabled states, accessible state text/live updates, non-color-only status cues, keyboard navigation, readable contrast, and reduced-motion support. Debug controls may be developer-facing but must remain operable for QA.

## 15. Motion, Landscape Viewport and Asset Constraints

- **15.A** — Physical cockpit and surface geometry remain stationary; display illumination can change independently.
- **15.B** — Startup: synchronized surface wake-up, horizontal luminance, windshield brand/depth/blur reveal, interface resolve.
- **15.C** — Media: dashboard-only SVG visualizer, play/pause states.
- **15.D** — Shutdown: feature fades → ambient dim → **final horizontal luminance only** → standby.
- **15.E** — Animations must be cancellable; respect `prefers-reduced-motion`.
- **15.F** — Maintain one fixed driver POV and stable surface registration in desktop and tablet landscape. No responsive reflow. Validate minimum supported landscape dimensions at the review gate; do not invent a final breakpoint.
- **15.G** — Keep environment image, cockpit geometry/treatments, UI layers, and debug guides separately addressable.

## 16. Acceptance Checklist

### Preparation
- **16.A** — [ ] Pass A viewport shell and spatial proportions approved
- **16.B** — [ ] Pass B boundaries, safe zones, exclusions and masks approved
- **16.C** — [ ] Debug Surfaces on/off works without disturbing geometry or state
- **16.D** — [ ] Pass C physical cockpit rendering approved
- **16.E** — [ ] Wide dashboard proportions validated in desktop and tablet landscape

### Startup and Ready
- **16.F** — [ ] Off shows cluster standby prompt and inactive dashboard
- **16.G** — [ ] Start Car plays windshield logo exactly once per activation
- **16.H** — [ ] Cluster and dashboard wake-up lighting coordinate
- **16.I** — [ ] Parked cluster reads 0 MPH and P
- **16.J** — [ ] Dashboard shows **idle media player**, not a home screen

### Media
- **16.K** — [ ] Play/Pause affects only center-dashboard SVG waveform
- **16.L** — [ ] Pausing leaves player visible
- **16.M** — [ ] No audio implementation or volume control

### Shutdown
- **16.N** — [ ] Media stops; dashboard and cluster features fade first
- **16.O** — [ ] Ambient lighting dims before final animation
- **16.P** — [ ] **Horizontal luminance sweep is last animation**
- **16.Q** — [ ] Sweep respects all surface masks and is cancellable
- **16.R** — [ ] Startup logo/3D/blur never replay on shutdown
- **16.S** — [ ] Windshield environment remains visible; dashboard off; cluster standby
- **16.T** — [ ] Restart replays full startup

### Controls and Quality
- **16.U** — [ ] Top status is outside windshield and hideable
- **16.V** — [ ] Keyboard toggle caption appears; shortcut works outside editable fields
- **16.W** — [ ] Show UI Status link appears immediately left of Reset only when hidden
- **16.X** — [ ] Bottom toolbar is persistent, dark, integrated and pill-based
- **16.Y** — [ ] Reset always works and preserves status visibility
- **16.Z** — [ ] All user-facing copy is JSON-driven
- **16.27** — [ ] Keyboard and reduced-motion paths work
- **16.28** — [ ] No cross-surface feature coupling or essential-content clipping
- **16.29** — [ ] Approved release deploys to testable portfolio URL

## 17. Implementation Sequence and Review Gates

1. **Gate A — Shell:** complete Pass A; stop for visual QA.
2. **Gate B — Surfaces:** complete Pass B and neon geometry; stop for registration QA.
3. **Gate C — Environment:** complete Pass C and Debug Surfaces toggle; stop for physical treatment QA.
4. **Gate 1A — Standby:** off state and chrome; stop for placement/status QA.
5. **Gate 1B — Startup:** logo and synchronized illumination; stop for motion QA.
6. **Gate 1C — Ready:** cluster and idle media player; stop for visual QA.
7. **Gate 1D — Media:** visual-only waveform and pause; stop for interaction QA.
8. **Gate 1E — Shutdown:** fade, final luminance, reset; stop for full lifecycle QA.
9. **Release Gate:** deploy approved v0.1; defer States 2–9.

## 18. Open Decisions and Definition of Done

**Pending creative/implementation decisions:** exact logo asset and 3D construction; startup motion keyframes/timing/easing; luminance sweep duration/intensity/offsets; exact status keyboard shortcut; final mock vehicle/media values; minimum supported landscape viewport; layered cockpit asset production method. These must be reviewed at their relevant gates, not silently invented as final design decisions.

**Done when:** a visitor can open the stationary cockpit, start the car, see the windshield identity reveal and coordinated display wake-up, arrive at parked state with idle media player, play/pause dashboard SVG, turn off with feature fade and final horizontal luminance, reset/restart, and hide/restore top status—on an accessible, fixed-composition, landscape-only, modular, deployed prototype.

## Appendix A — Visual References

**Pass A authoritative references:** `cockpit-wireframe.webp` (black-and-white geometry) and `cockpit-wireframe-sections.png` (colored A–F architecture), both in `driveos/reference/`. They supersede older cockpit wireframes for Pass A layout. The storyboard and other images remain references for later passes/states.


The PDF edition embeds the following chat-supplied reference images. Paths below are relative to this Markdown file and are intended for local implementation reference.

**Figure A1 — Selected five-state high-fidelity storyboard (States 1A–1E).** Written status-bar and shutdown decisions supersede any conflicting screenshot labels.

![Selected State 1A–1E storyboard](a_clean_high_fidelity_wireframe_storyboard_stor.png)

**Figure A2 — Initial driver-POV wireframe (revised).** Spatial composition and major surfaces.

![Initial wireframe revised](Initial%20Wireframe%20-%20101126_v2.png)

**Figure A3 — Sectioned design moodboard.** Visual language, layout groupings, and surface-treatment inspiration; not a mandate to implement all reference features.

![Sectioned design moodboard](DriveOS-sectioned-moodboard_100726.png)

**Figure A4 — Windshield-first UX reference.** Future-state design context; States 2–9 are out of scope.

![Windshield-first UX wireframes](DriveOS%20Windshield-First%20UX%20Wireframes.png)

**Figure A5 — Horizontal blue-white luminance reference.** The ONLY startup animation treatment reused as the final shutdown animation, after feature fade-out.

![Shutdown horizontal luminance reference](Screenshot%202026-10-12%20at%2012.39.44%E2%80%AFAM.png)

**Source note:** Images are conceptual references, not final exported UI assets. No precise timing, animation keyframes, or approved surface coordinates can be extracted reliably from static screenshots alone.
