# Architectural audit and targeted consolidation

Date: October 20, 2026 (America/New_York)  
Branch: `codex/architecture-audit-consolidation`  
Source commit: `68e4a26549754acf2ad4742b2dc68a94e3d1e314`  
Status: **Recommendations only; awaiting human review and approval.**

## Recommendation

Preserve the static HTML/CSS/ES-module architecture and its existing separation between shared foundations, portfolio components, page initialization, and project-specific modules. The evidence supports targeted dependency cleanup and a portfolio-local case-study content scope. It does not justify a new framework, build system, universal layout engine, or broad file reorganization.

`.layer-3` is currently both a content styling namespace and the name of an overlay system. A reusable content layout abstraction is appropriate: promote the existing `.case-study-layout` class into the content scope, while keeping overlay positioning, scrolling, and lifecycle separate. Do this incrementally after approval, preserving effective styles and responsive behavior.

The overlay cannot simply be deleted: `/work/` still exposes it through its timeline/chart interaction. This conflicts with the README's statement that the portfolio does not use Layer 3 and requires a product decision.

## Scope and evidence limits

- Inspected the home page, both Method documents, all five `includes/case-studies/` documents, Work routes and their entry modules, the three current top-level project pages, `css/`, `js/`, and `shared/` ownership relevant to those consumers.
- Traced imports, rendering and fetch paths, stylesheet order, selectors, and interaction hooks. Parsed HTML script/link tags to distinguish actual dependencies from commented markup. Compared repeated observer scripts and the two image-lightbox implementations.
- Consulted `README.md`, `docs/architecture-refactor-notes.md`, `docs/codex-outcome-notes.md`, and the October 17 shared-design-system audit. Prior recommendations are context, not approved implementation instructions.
- Archives, prototype passes, embedded app internals, and `awd-lab/` were not exhaustively audited. Their code should not be deleted or merged based on this report.
- This is a static source audit. No live deployment, browser rendering, network waterfall, or responsive screenshot comparison was performed. Runtime consequences below are identified as source-derived risks, not observed browser failures.
- The starting worktree was clean. This audit adds only this document; no HTML, CSS, JS, data, assets, dependencies, or configuration have been changed.

## Existing ownership worth preserving

| Boundary | Current owners | Assessment |
| --- | --- | --- |
| Shared foundations | `shared/css/global-tokens.css`, `global-components.css`, `utilities.css`, `motion.css` | Retain granular consumption; some page policy currently leaks into shared motion. |
| Shared behavior | `shared/js/theme.js`, `page-observers.js`, `pattern-slides.js`, icon modules | Reuse existing APIs where behavior matches; repair the icon dependency direction separately. |
| Portfolio presentation | `css/tokens.css`, `main.css`, `components.css`, layout and Work CSS | Keep layout distinct from component presentation; consolidation should follow actual duplication. |
| Page wiring | `js/site.js`, `method-page.js`, `case-study.js`, `work-index.js`, `interface-projects.js` | Small entry modules are useful. Similar initialization calls alone do not justify a generic bootstrap abstraction. |
| Content and rendering | `js/data.json`, `js/components.js`, authored HTML | Preserve authored content and component variants. Resolve the ambiguous meaning of `htmlInclude` before changing its contract. |
| Project experiences | `projects/`, actively imported `modules/` | Keep expressive project layouts and embedded applications local. Shared case-study behavior does not imply shared project layout. |

No package manifest, lockfile, bundler, or automated test runner was found in the repository inventory. External runtime dependencies include Observable Plot through jsDelivr, Google Fonts, Adobe Fonts, and Google Analytics on some pages. Plot is justified for the Work chart; loading it on unrelated pages is the problem. Font or analytics removal is not justified by this audit.

## Findings, ordered by impact

### F1 — Case-study content and overlay layout share an architectural boundary

**Evidence:** `css/case-study-layout.css:5,36,105,111,123,176,218,264` scope tokens, padding, content width, section spacing, headings, overview, and lists to `.layer-3`. The same file owns fixed overlay/frame/stage behavior at `:51,63,522,584`. All five standalone case-study articles use `.layer-3`; four already also use `.case-study-layout`. The exception is `includes/case-studies/fb-payments-experience.html:89`, which uses `.layer-3.case-study`.

This coupling crosses files: `css/components.css:819,2027` contains `.layer-3` heading rules, and `:1334` contains overlay-specific background blur rules. The content stylesheet also contains unscoped `.copyright`, `.list__title`, `.component-blockquote`, and `.pattern-callout--hero` rules, plus mobile `.section`, `.snap-section`, and header rules (`:206,298,417,442,713,723`).

**Consequence:** A content layout depends on an overlay name, and removing the apparently obsolete stylesheet can change unrelated page presentation. Home loads it at `index.html:37` despite having no `.layer-3` article or overlay root. That import is a cleanup candidate, not proven safe to remove wholesale.

**Recommendation:** Approve the bounded content/overlay split described below. Retain component ownership and explicit compatibility selectors initially. Do not globally replace every `layer-3` string.

### F2 — Chart/modal coupling pulls an external dependency into non-chart pages

**Evidence:** `js/data.js:3` imports `openCaseStudy` from `modal.js`; `js/modal.js:8` imports `positionOverlayPanel` from `chart.js`; `js/chart.js:3-4` imports Observable Plot and imports `openModal` back from `modal.js`. This is an actual module cycle. `chart.js:180` awaits a data fetch before its page guard at `:191` decides whether to render.

Home loads `data.js` and `modal.js` (`index.html:590,592`) but has `data-page="intro"` and no chart/modal root. Its current featured cards use ordinary case-study links (`js/components.js:256`). Three standalone documents also actively load `modal.js`: `allin-social-feature.html:304`, `payments-experience.html:341`, and `social-feature.html:341`.

**Consequence:** The chart module and CDN import enter non-chart module graphs even when rendering is skipped. A CDN/import failure can prevent dependent home data rendering. The page guard does not avoid module loading or the top-level data fetch. This is not a claim that Plot should be removed from the Work timeline.

**Recommendation:** Separate chart-specific positioning from the generic modal dependency, or inject positioning from the chart caller. Keep chart initialization behind the chart entry point. Once F3's interaction policy is decided, remove unnecessary overlay imports/listeners from pages with no overlay consumer. Removing only the direct home `<script>` is insufficient because `data.js` still imports it.

### F3 — The Work timeline still uses an incompatible document-as-fragment path

**Evidence:** `work/index.html:119-138` contains an overlay stage and loads the chart. Chart clicks call `openModal`; the panel's case-study action calls `openCaseStudy` (`js/chart.js:110`, `js/modal.js:110-117`). That function fetches `project.htmlInclude` and assigns the entire response to `.layer-3-stage.innerHTML` (`js/modal.js:297-306`). The targets are complete standalone documents, including their own shells and script tags.

The JSON paths are site-root-relative in intent but lack a leading slash. For example, `includes/case-studies/data-sharing.html` resolves from `/work/` to `/work/includes/case-studies/data-sharing.html`, which has no matching file in this checkout. The list renderer explicitly supplies `basePath: "../"` (`js/work-index.js:115-118`); the overlay fetch does not. It also does not check `res.ok` before injecting a response.

**Consequence:** Under ordinary root-served static hosting, timeline actions request the wrong path. Even after path repair, injecting full documents creates conflicting shell/ID/style ownership, page-relative asset resolution, and no explicit initialization of inserted content. Script tags inserted using `innerHTML` do not provide the normal page startup contract. These are source-derived failure risks; deployment routing was not tested.

**Recommendation requiring a product decision:** Prefer ordinary navigation to the existing standalone case-study routes. If the overlay experience must be preserved, give it a deliberate fragment extraction/rendering and initialization contract, correct URL resolution, and error handling. Neither option is a behavior-neutral cleanup. Keep the current overlay implementation until the choice is approved.

### F4 — An unselected feature module gates all home featured content

**Evidence:** `js/data.js:26-33` unconditionally fetches the Designing-with-AI pass-4 HTML in the same `Promise.all` as project data. The current `designing-with-ai` record has `featured: false`, while rendering filters to featured projects at `:38`. `renderWorkFeature` uses the fetched HTML only for that project (`js/components.js:209`). Home also loads its stylesheet (`index.html:43`).

**Consequence:** An unused feature fragment is still requested; its failure rejects the combined promise and prevents the other featured cards from rendering. This adds a dependency unrelated to the selected content.

**Recommendation:** Fetch the optional fragment only when its project is selected, with a fallback that preserves other cards. Review stylesheet usage separately before removing the link; do not delete the pass directory or alter other pages using it. Keep the project-specific hero module and data-driven rendering boundaries.

### F5 — Slide presentation is duplicated, but CSS specificity makes deletion nontrivial

**Evidence:** `css/case-study-layout.css:350-381` repeats `.pattern-slides`, slide, image, caption, and caption-span declarations also in `css/components.css:1599-1604,1708-1733`, adding a `.layer-3` ancestor. Enhancement controls/state live in `components.css:1606-1706`; behavior lives in `shared/js/pattern-slides.js`. Case-study desktop caption padding is local at `case-study-layout.css:611`.

**Consequence:** Two places own the same component base, but the scoped copy has greater specificity. The enhanced and base selectors can have equal specificity in some cases, so stylesheet order matters. Home and standalone cases load case-study CSS before component CSS; Work loads it after component CSS.

**Recommendation:** Give the base slide presentation one owner in `css/components.css`, keeping case-study-specific spacing in the case-study layout. Preserve current winning declarations, source order, and enhancement behavior. Do not move the entire component to a new shared package as part of this audit's narrow scope.

### F6 — Six identical navigation observers duplicate an existing shared capability

**Evidence:** Whitespace-normalized inline observer bodies match in all five case-study documents (`allin-social-feature.html:308`, `data-sharing.html:616`, `fb-payments-experience.html:337`, `payments-experience.html:345`, `social-feature.html:345`) and `projects/designing-with-ai/index.html:545`. They observe anchors within `#navList` at threshold `0.5`. `shared/js/page-observers.js:55` already implements related behavior, but observes all fragment anchors at threshold `0.4`.

**Recommendation:** Parameterize the existing helper's scope and threshold, preserving its current defaults for other pages. Invoke it from case-study wiring with `#navList` and `0.5`. Do not simply substitute the current helper: that would broaden its targets and change activation timing. Also keep the home scroll-marker logic in `js/navigation.js:65` separate until its overlap with `site.js`'s observer is validated in the browser.

### F7 — Shared modules have unnecessary or reversed dependency edges

**Evidence:** `shared/js/pattern-slides.js:1` imports `createIcon`, but its controls use text glyphs and it never calls that import. `shared/js/createIcon.js:1` imports the portfolio registry `js/icons.js`, which imports `shared/js/icons.js` and adds `menu`. This is a shared-to-portfolio ownership inversion, not itself a circular ES-module import. `shared/js/interactions.js` duplicates an older subset of `js/interactions.js`; no repository HTML/JS consumer of the shared copy was found.

**Recommendation:** Removing the unused slide import is a small, justified first change after approval. Retain the portfolio interactions module as the current owner; retire its unused shared counterpart only after confirming external/direct consumers. Repair icon ownership separately with an explicit extension API or agreed shared ownership of `menu`; changing the renderer import alone would lose the drawer icon. Preserve small page entry modules.

### F8 — Lightbox overlap is not sufficient evidence for merging implementations

**Evidence:** `js/lightbox.js` enhances existing `#lightbox` markup and `[data-lightbox]` links, copies figure-caption HTML, and supports desktop image zoom. It is reused by standalone cases and Work adapters (`js/work-lightbox.js:21-37`, `js/interface-projects.js:39`). The implementation under `projects/designing-with-ai/image-zoom-lightbox/` creates its own overlay, uses different trigger/classes, derives caption text from image alt text, locks the document element, and implements focus containment. It is already consumed by Data Sharing, Motion Studio, and Production Design References as well as its original project.

**Recommendation:** Keep these contracts separate during the layout refactor. Consider relocating the latter CSS/JS pair to a portfolio component location in a later, explicitly approved migration, preserving compatibility paths and behavior. A universal modal/lightbox controller is not justified yet.

**Existing defect to review separately:** `js/lightbox.js:25` marks the overlay `inert`; the open path at `:33-48` does not remove it. Source inspection therefore indicates that supported browsers will keep its contents inert while it is visually open. Confirm in-browser and approve a focused interaction repair independently of visual consolidation.

## `.layer-3` abstraction decision and migration constraints

**Decision: use a case-study-specific content scope, not a global layout abstraction.** The five related documents establish reuse. Their shared shape is an article with header, content body/sections, and footer. Existing `.case-body`, `.case-section`, `.case-overview`, and component classes already express the needed responsibilities; `.case-study-layout` can name their containing scope.

| Responsibility | Proposed owner | Preservation requirement |
| --- | --- | --- |
| Case-study tokens, outer padding, header/body/footer arrangement | `.case-study-layout` in the existing case-study CSS file | Initially alias content selectors with `.layer-3`; add the explicit class to the FB Payments article. |
| Body width and section rhythm | Scoped `.case-body` / `.case-section` rules | Preserve `70dvw`, 40px body padding, 50px body gap, 70px section top padding, 24px section gap, and existing exceptions. |
| Overview, intro, reflection, and case-specific variants | Existing case-study rules | Keep their authored differences; no generalized grid/stack API is required. |
| Slide base and controls | `css/components.css` | Consolidate only proven overlap and retain effective cascade winners. |
| Fixed overlay, stage, close button, watermark, body lock and blur | Overlay-specific rules and behavior | Retain until the Work interaction decision; extract to a separate portfolio CSS file only if the overlay remains supported. |
| Page-wide mobile/header behavior currently in case-study CSS | Explicitly identified page/layout owner | Relocate only after consumer and computed-style comparison; do not silently scope or drop it. |

The existing `u-flow`/`u-slot` utilities do not match the full content-width, spacing, and responsive contract. Replacing the case-study layout with those utilities would increase markup churn without solving the overlay coupling.

An alias such as `:is(.case-study-layout, .layer-3)` preserves a single-class specificity contribution; every compound selector and its ordering still needs comparison. Avoid `:where(...)` as an automatic replacement because it lowers specificity. Migrate the `.layer-3` content rules in `components.css` too, while retaining its `body.is-layer-3-open` overlay behavior until separately approved.

Preserve the existing breakpoint boundaries at 480px, 768px, and 990px, including article spacing, overview stacking, thumbnail visibility, caption padding, mobile content padding, and overlay stage sizing. Do not combine breakpoints or normalize dimensions during this pass. The mobile `.section/.snap-section` override at `case-study-layout.css:723` explicitly documents overlap prevention and must be treated as an existing behavior dependency.

## Lower-priority review items and deliberate non-changes

- **Duplicate authored pages:** `method.html` and `methodology.html` share most markup but differ in copy, title, navigation, and footer/theme placement. Older `social-feature.html` and `payments-experience.html` also overlap substantially; current JSON points to the separately named Allin/FB pages. Decide canonical URLs, content, and redirects before removing or merging any document. A missing internal link does not establish that a public URL is unused.
- **Shared motion policy:** `shared/css/motion.css:23-31` makes the body transparent until JS marks it loaded. `js/interactions.js:74` owns that startup state. A failed entry import can leave consuming pages invisible unless another rule overrides it. Consider opt-in portfolio page transitions in a later resilience pass; preserve timing and successful-load appearance.
- **Token and selector defects:** `--cs-font-body` and `--text-secondary` have uses but no definitions in the inspected portfolio/shared CSS; `--color-text-primary` is defined only in the inspected project-local Pattern Inspector stylesheet, not the shared case-study foundations. `case-study-layout.css:642` uses `layer-3` without the class dot. Defining aliases or correcting the selector may change currently rendered output, so these are separate reviewed fixes, not mechanical cleanup.
- **Deployment contract:** Root-served HTTP paths currently allow parent-traversing shared imports to normalize to `/shared`. Do not evaluate them only as filesystem paths or normalize all URLs casually. Agree on custom-domain root versus subpath support before a path-wide change.
- **Archives and experiments:** Retain `awd-lab/`, backups, prototype passes, and embedded application styles. Do not treat similar filenames or repeated CSS across separate experiences as permission to consolidate.
- **Shared design-system extraction:** The October 17 audit proposes a larger packaging effort. This report does not authorize that migration, package installation, Sass/esbuild adoption, or a new repository.

## Human review required before any source change

| Decision | Recommendation to review | Why approval matters |
| --- | --- | --- |
| 1. Supported consumers | Cover home, Work list/timeline, all five standalone cases, both Method URLs, and affected current project/Work pages; preserve archives without refactoring them. | Establishes the compatibility surface and prevents deleting direct-entry routes as supposedly unused. |
| 2. Case-study naming and scope | Adopt the existing `.case-study-layout` content scope with temporary `.layer-3` aliases; retain current component and project boundaries. | Approves the central architectural change and its HTML/CSS touch points. |
| 3. Work timeline behavior | Choose between standalone navigation (recommended) and maintaining an explicitly supported overlay. | Changes navigation, scrolling, focus, and document lifecycle; it cannot be inferred from cleanup intent. |
| 4. First implementation batch | Approve only named findings: start with F7's unused slide import, then F4's optional feature loading and F2's chart dependency separation; review each diff before broadening. | Makes approval granular; no dead-file deletion or behavior migration is implied. |
| 5. CSS and observer consolidation | Approve F1/F5/F6 after baseline capture, preserving computed styles, selectors' effective priority, nav scope, and thresholds. | Apparently identical rules or helpers may have different cascade/interaction effects. |
| 6. Shared icon ownership | Decide whether `menu` is shared or a portfolio extension; preserve its rendering either way. | Prevents a shared-module cleanup from breaking the navigation drawer. |
| 7. Route/content retirement | Select canonical Method and older case-study documents, and a redirect policy, if retirement is desired. | Requires editorial and public-URL judgment; not part of the default refactor. |
| 8. Separate defect fixes | Explicitly choose whether to include overlay URL/error handling, the inert lightbox repair, missing tokens, and the malformed mobile selector. | These repairs may change current behavior or appearance and should not be hidden in consolidation. |
| 9. Acceptance evidence | Agree on browser/device coverage and approve before/after comparisons; baseline screenshots are required before implementation. | This audit establishes source findings, not visual parity. |

## Proposed verification and implementation sequence — not yet authorized

1. Record baseline screenshots/computed styles on the approved routes through an HTTP server rooted at this repository. Include current failures as known baselines instead of silently treating fixes as refactors.
2. Apply only the approved dependency cleanup batch. Verify home featured cards with the optional hero unselected and selected, and confirm unrelated cards survive an optional-fragment failure. Verify non-chart routes no longer request Plot after decoupling, while the Work chart still works.
3. Introduce the case-study content aliases without changing values or stylesheet order. Compare all five direct-entry case studies and the retained Work overlay, if applicable. Then consolidate duplicate slide styles, checking enhanced and unenhanced slides.
4. Consolidate inline observers with their original scope/threshold and verify active navigation at section boundaries. Keep home navigation behavior unchanged unless separately approved.
5. Make the approved Work navigation/overlay change as its own reviewable behavior change. Test URL resolution, browser Back, chart panel open/close, loading/error states, nested close/Escape handling, and restoration of scrolling/focus as applicable.
6. Remove compatibility selectors, unused imports/files, or duplicate documents only after all approved consumers have migrated and public/direct consumers have been reviewed. Update architecture documentation to match the final behavior.

Minimum visual matrix: 390px, 480/481px, 768/769px, 989/990px, and 1440px; test portrait/landscape and touch/fine-pointer behavior where it affects interactions. Compare content width, typography, heading alignment, section spacing, image sizing, captions, frame, header, footer, scroll extent, and horizontal overflow. Include themes currently reachable through saved settings and reduced motion.

Functional checks: home featured links; Work filters/list/chart and case-study actions; all direct case-study URLs; back-to-top and anchor navigation; slideshow arrows/dots/keyboard/focus; both lightbox contracts; mobile scrolling; console and failed-request checks. For relevant entry points, test unavailable external/optional modules and no-JS content visibility. Fixes to existing fallback behavior require the separate approval above.

## Audit completion and stop point

Completed: new branch, source audit, dependency/consumer tracing, consolidation recommendations, and human-review checklist. Static HTML dependency checks found no missing directly linked local script/stylesheet files among the inspected entry documents under a root-served URL model; this does not validate transitive resources, injected documents, or runtime requests.

**No source implementation is approved or performed. Stop here and obtain approval for the selected recommendations and behavior decisions before editing code.**
