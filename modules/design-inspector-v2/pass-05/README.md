# Design Inspector v2 — Review

Focused standalone prototype adapted from Pattern Inspector v4 Pass 3. It retains the copied module split, panel state model, synchronized annotation controls, accessible tabs, drawer focus management, and target-relative callout approach while presenting the Design Inspector Review frame.

## Run locally

From `/portfolio-clean`:

```sh
python3 -m http.server 4173
```

Open `http://localhost:4173/modules/design-inspector-v2/demo.html`.

## Files

- `demo.html` mounts the prototype.
- `design-inspector.html` contains trusted static workspace chrome.
- `design-inspector-data.js` owns review, callout, reply, and history records.
- `design-inspector-renderers.js` renders date navigation, artifact callouts, discussions, and history.
- `design-inspector.js` coordinates tabs, panel/drawer behavior, date disclosures, and synchronized callout selection.
- `design-inspector.css` implements the Figma-aligned three-panel layout and responsive drawers.

The module has no package or build dependency; it uses native HTML, CSS, JavaScript modules, and DOM APIs.

---

## Pass-03 Report — 2026-10-02

### Purpose
Reset pass-03 to the pass-02 implementation after revisiting the artifact-source security model.

### Changes
- Created `pass-03` as a direct copy of `pass-02`.
- Removed the previously explored pass-03 URL/local HTML rendering implementation by reverting to the pass-02 baseline.
- No new runtime behavior was added in this pass.

### Direction
Design Inspector should not inspect arbitrary external URLs. Future artifact loading should remain aligned to trusted sources such as local artifacts and connected repository/branch sources.

### Next
Continue artifact-loading work from this clean baseline without implementing arbitrary public URL loading.


---

## Pass-04 Report — 2026-10-02

### Purpose
Continue artifact loading from the clean pass-03 baseline while preserving the trusted-source boundary.

### Changes
- Removed the arbitrary public URL field from the empty workspace state.
- Kept local `.html` / `.htm` selection as the only artifact-loading path in this pass.
- Added local HTML rendering inside the workspace after file selection.
- The loaded artifact is rendered at the workspace viewport width with no CSS scaling, zoom, or shrink-to-fit transform.
- Updated the design title to the selected local HTML filename.
- Kept the review callout layer empty until later review-session behavior is introduced.

### Security / source boundary
- This pass does not accept or navigate to arbitrary public URLs.
- The local artifact is rendered in a sandboxed iframe.
- Repository / branch loading remains future work and is not simulated in this pass.

### Not included yet
- Hand/grab panning.
- Start / End Review session state.
- Session timestamps or ownership state.
- Repo / branch connection.
- Artifact reset / replacement controls after load.

### Next
Add the hand/grab viewport interaction so a loaded local artifact can be moved within the inspection workspace without introducing shrink-to-fit behavior.


---

## Pass-05 Report — 2026-10-02

### Purpose
Replace single-file HTML upload with a local development environment connection so Design Inspector inspects a running artifact with its CSS, JavaScript, assets, fonts, and runtime intact.

### Changes
- Removed the local HTML upload button and hidden file input.
- Added a **Local development environment** field with a **Load** action.
- Accepts only loopback development hosts: `localhost`, `127.0.0.1`, and `::1`, over HTTP or HTTPS.
- Addresses without a protocol are normalized to `http://`.
- Rejects arbitrary public hosts instead of treating DI as a general-purpose browser.
- Loads the accepted local environment directly into the artifact iframe so relative project resources resolve through that project's own development server.
- Enter submits the local address as an alternative to the Load button.
- Removed the obsolete screenshot asset and its data reference from pass-05.

### Source boundary
This pass intentionally supports a running **local development environment**, not arbitrary public URLs. Repository / branch sources remain future work.

### Not included yet
- Hand/grab panning.
- Start / End Review session state.
- Session timestamps or ownership state.
- Repo / branch connection.
- Artifact reset / replacement controls after load.

### Next
Validate local-server loading against a real project, then add the hand/grab viewport interaction without scaling the inspected artifact.
