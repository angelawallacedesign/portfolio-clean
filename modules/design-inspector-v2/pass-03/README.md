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
- `assets/artifact-1.jpeg` is the Figma-provided current-design artifact used by the viewport.

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
