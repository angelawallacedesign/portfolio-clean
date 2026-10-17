# Portfolio Clean `/shared` Design-System Extraction Audit

**Date:** 2026-10-17  
**Scope:** `/Users/awd/Development/portfolio-clean/shared` and its consumers in `portfolio-clean`  
**Mode:** Read-only audit; no migration or architecture decision was implemented.  
**Source-of-truth rule:** The in-repository `shared/` directory was audited as authoritative. The older sibling shared repository was not inspected or treated as migration input.

## Executive Summary

`shared/` is a small, useful runtime seed, not yet a standalone design-system package. It contains 11 tracked files: four plain-CSS files and seven browser ES modules. It has no SCSS, SVG files, package manifest, build configuration, tests, generated distribution, or documentation of its own.

Extraction is currently blocked by one inverted dependency: `shared/js/createIcon.js` imports the portfolio registry at `js/icons.js`, which then imports `shared/js/icons.js`. Shared CSS also relies on portfolio-local typography, spacing, and motion tokens in `css/tokens.css`. The safest path is to make the existing shared source internally complete, add a minimal build without changing consumer URLs, and migrate one asset family at a time.

Highest-priority findings:

1. Break the shared-to-portfolio icon dependency before moving files.
2. Preserve the current CSS order: shared tokens/components/utilities/motion, then portfolio tokens/layout/components.
3. Split global motion side effects (`body { opacity: 0 }`, global reduced-motion wildcard, `html` smooth scrolling) from opt-in motion utilities before external adoption.
4. Treat buttons as a consolidation project, not as already-shared components: the principal buttons live in `css/components.css` and have multiple page-specific overrides.
5. Do not replace `shared/` with the four-month-old sibling repository. Use a copy/publish step from this directory until package consumption is proven.

## 1. Current `/shared` Inventory

| File | Contents / public surface | Classification | Notes |
|---|---|---|---|
| `shared/css/global-tokens.css` | Brand, semantic color, frame, text, icon, and theme custom properties; `dark` and `night` theme overrides | Reusable core | Color/theme tokens only; typography, spacing, and motion foundations remain portfolio-local. |
| `shared/css/global-components.css` | `.icon`, icon sizes/rotations, `.control`, fixed-position control, flex helpers, `.theme-switcher` | Candidate core | Depends on `--font-sans`, `--motion-fast`, and `--ease-standard` from `css/tokens.css`; `.flex-row/.flex-col` duplicate utility responsibility. |
| `shared/css/utilities.css` | Flow, cluster, slot, visually-hidden utilities | Reusable core | `u-flow-*` reads portfolio-local spacing variables but has pixel fallbacks. `.sr-only` is also defined in Motion Studio CSS. |
| `shared/css/motion.css` | Motion custom properties, page fade-in, reveal/lift utilities, smooth scrolling, reduced-motion rules | Mixed | Utilities are reusable; `html`, `body`, and universal reduced-motion selectors are global policy with cascade/runtime risk. |
| `shared/js/icons.js` | SVG-node definitions for 13 icons: `settings`, `add`, `edit`, `delete`, `search`, `filter`, `close`, `refresh`, `calendar`, `chevron`, `arrow`, `contact`, `ai` | Reusable core | Icons are JS data, not standalone `.svg` files. |
| `shared/js/createIcon.js` | `createIcon()` and `[data-icon]` auto-initializer | Candidate core | **Extraction blocker:** imports `../../js/icons.js`, a portfolio file. |
| `shared/js/base.js` | Runs `initializeIcons()` | Reusable entry point after dependency repair | Side-effect-only; no DOM-ready guard and repeated execution can append duplicate SVGs. |
| `shared/js/theme.js` | Theme validation, DOM state, `aria-pressed`, `localStorage` persistence | Reusable with contract documentation | Hard-codes theme names and storage key `awd-theme`; can throw where storage is unavailable. |
| `shared/js/pattern-slides.js` | Progressive carousel wrappers, controls, pagination, keyboard and focus state | Candidate component | Imports `createIcon` but never uses it; presentation lives in portfolio `css/components.css:1586-1712`. |
| `shared/js/page-observers.js` | Intro-nav, profile-image, and anchor-active observers | Mixed / portfolio adapter | `initAnchorActiveState` is broadly reusable; intro/profile selectors and thresholds are portfolio-specific. |
| `shared/js/interactions.js` | Page transition and immediate page-load classes | Outdated duplicate | No current importer; `js/interactions.js` is the actively used, expanded implementation. |

Absent from `shared/`: `*.scss`, `*.sass`, standalone `*.svg`, images/fonts, README/API docs, component examples, package/build files, lint/test configuration, and distribution files.

Related but outside the source boundary:

- `design-system/icon-table.html` is the only shared-icon catalog/demo.
- `css/awd-design-system.css` contains one `.intro-link` rule plus four duplicated metadata blocks for primary buttons; it is not a reliable registry.
- `assets/icons/*.svg` and `assets/components/icon--ai*.svg` are portfolio assets and are not represented by the shared build.
- `awd-lab/` and `prototypes/` contain separate local token/utility systems; architecture notes explicitly describe `awd-lab` as preserved legacy/lab content.

## 2. Integration and Loading Trace

### CSS

Thirty HTML files reference `shared/css/global-tokens.css`; 22 load `global-components.css`; 12 load the four-file shared CSS stack. The principal order is:

```text
external fonts
→ shared/global-tokens.css
→ shared/global-components.css
→ shared/utilities.css
→ shared/motion.css
→ css/tokens.css
→ css/main.css and layout CSS
→ css/components.css
→ project/page overrides
```

Representative locations:

- Home: `index.html:30-46`
- Method pages: `method.html:29-35`, `methodology.html:29-35`
- Standalone case studies: `includes/case-studies/*.html:14-21`
- Current project pages: `projects/designing-with-ai/index.html:19-29`, `projects/motion-studio/index.html:18-27`, `projects/production-design-references/index.html:18-29`
- Work archive/category/individual pages generally load only shared global tokens before portfolio CSS, e.g. `work/index.html:11-18` and `work/branding/index.html:14-18`.
- `work/visual-design/exposed.html` and `outside-in.html` additionally load shared components and base icon JS.
- Module demos inconsistently load only tokens or only components.

This order intentionally lets `css/tokens.css` and later component/page CSS supply missing foundations and override shared rules. Changing it during extraction is a visual breaking change.

### JavaScript

```text
HTML entry
├─ js/site.js → shared/theme.js + shared/page-observers.js
├─ js/method-page.js → shared/theme.js + shared/page-observers.js
├─ js/case-study.js → shared/theme.js + shared/pattern-slides.js
│                    └─ shared/createIcon.js (currently unused import)
├─ js/navigation-drawer.js → shared/createIcon.js
└─ shared/base.js → shared/createIcon.js
                     → portfolio js/icons.js
                       → shared/js/icons.js
```

`shared/js/base.js` is loaded by 22 HTML documents to inject `[data-icon]` elements. The portfolio entry modules initialize theme, observers, page transitions, and slides separately; `base.js` does not initialize those behaviors.

URL caution: many pages deliberately use parent-traversing paths such as `../shared` or `../../../shared`. On the custom-domain web root these normalize to `/shared`; when HTML is opened directly from disk they can resolve to the old sibling repository. Local verification must use an HTTP server rooted at `portfolio-clean`, and migration should adopt one explicit deployment/base-URL contract.

## 3. Dependencies, Duplicates, Outdated Code, and Cascade Risks

### Dependency blockers

- `shared/js/createIcon.js:1` imports `../../js/icons.js`; `js/icons.js:1` imports `../shared/js/icons.js` and adds `menu`. This circular ownership pattern makes the shared directory non-portable. The shared renderer should import the shared registry; portfolio-only icons should be registered or merged by the consumer.
- `global-components.css:177-182` requires `--font-sans`, `--motion-fast`, and `--ease-standard` from `css/tokens.css` without complete fallbacks.
- `utilities.css:11-13` depends on `--space-sm/md/lg` but does provide fallbacks.
- `pattern-slides.js` depends on class presentation in `css/components.css:1586-1712`, so moving JS alone produces unstyled controls.

### Duplicates and drift

- `shared/js/interactions.js` duplicates only the older subset of `js/interactions.js`; it is unused and lacks smooth anchors, back-to-top behavior, and the load-event-safe `is-loaded` flow.
- `shared/js/pattern-slides.js:1` imports `createIcon` but renders text glyphs and never calls it.
- `.theme-switcher` is defined in shared CSS and then globally hidden by `css/components.css:8-13`. This is product policy overriding a component.
- `.sr-only` is shared, but separate copies exist in `prototypes/motion-studio/styles.css` and `projects/motion-studio/motion-studio/styles.css`.
- AWD Lab redefines older shared color tokens (`--color-secondary: #C3C3C3`, `--color-focus: #D7154D`) in both `awd-lab/css/tokens.css` and `awd-lab/css/styles.css`; the active shared values differ.
- `css/awd-design-system.css` repeats the same button mapping metadata four times and does not own the button CSS it describes.
- `index.html` uses the older Designing-with-AI hero `pass-4`, while the project page and documentation demos use `pass-7`; both contain substantial duplicated hero/button CSS.

### Runtime and cascade risks

- `shared/css/motion.css:23-31` makes every consuming page body transparent until JS adds `is-loaded` or `fade-in`. A failed entry-module import can leave the entire page invisible.
- Its reduced-motion rule applies `!important` to every element and pseudo-element, potentially disabling intentional component state transitions beyond the design-system boundary.
- Shared `html { scroll-behavior: smooth }` overlaps custom smooth scrolling in `js/interactions.js`.
- `global-components.css` owns generic names (`.icon`, `.control`, `.flex-row`, `.flex-col`, `.is-bottom-right`) with no namespace or cascade layer, increasing collision risk for external consumers.
- `initializeIcons()` appends without checking for an existing generated SVG; duplicate entry execution duplicates icons.
- The active home intro script queries `.intro-play`, but the only `.intro-play` button is commented out (`index.html:204-208`); `js/intro-reveal.js:55-60` dereferences it and can fail. This behavior is portfolio-specific and should be repaired outside the extraction.
- Some pages load only tokens while using portfolio components; that is valid today but means a future package cannot assume one monolithic stylesheet without increasing page CSS and cascade scope.

## 4. Existing Button Implementations

| Surface | Markup / generation | Styling ownership | Assessment |
|---|---|---|---|
| Home intro CTA | `index.html:176-177` uses `.primary-btn.intro` | Base in `css/components.css:117-141`; intro size/layout in `css/intro-layout.css:302-334,734-737` | Strong candidate for a shared primary-button primitive plus portfolio size variant. |
| Intro prototype controls | `.intro-play` (currently commented) and `.intro-close` at `index.html:204-240` | `css/intro-reveal.css:6-59,94-126`; behavior in `js/intro-reveal.js` | Portfolio-specific behavior; keep out of core. Current null-reference risk noted above. |
| Featured hero, normal | Generated in `js/components.js:242-275` as `.primary-btn-small` | `css/components.css:143-162` plus feature/layout context | Candidate shared button style; feature placement remains portfolio-specific. |
| Featured Designing-with-AI hero | `modules/designing-with-ai-hero/pass-4/component.html:64-65` uses `.designing-ai-hero__cta.primary-btn` | Base button plus extensive pass-specific effects in `pass-4/designing-ai-hero.css:322-398` (pass 7 has a parallel version) | Keep expressive animation as portfolio/project recipe; reuse only base button contract. |
| Project lists/cards | Generated in `js/components.js:79-95,124-159,191-200` using `.primary-btn-small` and `.link-btn` | Base CSS plus `css/work-gallery.css:269-276,874-885,959-972` | Shared button/link candidates; card/action layout stays portfolio-specific. |
| Work archive filters/view switch | `work/index.html:70-79` uses `.work-nav-control` | `css/work-gallery.css:723-780`; Cruise page adds local override | Portfolio navigation/filter pattern, not a generic button until its state API is formalized. |
| Individual Work pages | `.primary-btn-small` links in `work/interface-design/norwegian.html`, `cruise-campaign-motion.html`, `work/visual-design/exposed.html`, and `outside-in.html` | Base CSS; hero/campaign overrides in `work-gallery.css:433-438` and `cruise-campaign-motion.css:26` | Reusable visual button, portfolio content/layout. |
| Shared controls | `.control`, `.theme-switcher__button`; pattern-slide buttons are JS-generated | `shared/css/global-components.css`; pattern slide CSS remains local | `.control` and theme button are closest to extraction-ready. Pattern slides must move as a CSS+JS unit. |
| App/prototype buttons | Design Inspector and Motion Studio define their own scoped buttons | Module/project-local CSS | Product UI, not portfolio design-system core unless deliberately promoted later. |

Button gaps: no single state/size/disabled contract; `.primary-btn-small` hard-codes black/white instead of semantic theme tokens; link-buttons have their focus-visible rule commented out; anchors and buttons share visual classes without documented semantic/accessibility requirements.

## 5. Reusable Assets vs. Portfolio-Specific Code

**Extract first:** global color/theme tokens; icon data/renderer; icon/control/theme-switcher CSS; visually-hidden and small layout utilities; opt-in reveal/lift motion utilities; theme controller after its configuration/storage contract is agreed.

**Extract as complete components after cleanup:** pattern slides (markup contract + CSS + JS + accessibility example); primary/compact/text-link buttons after states and tokens are normalized.

**Keep in portfolio:** intro/profile observers; page fade/navigation policy; back-to-top positioning; global navigation and drawer; project-card/work-feature rendering; work filters; intro reveal; case-study shells/lightboxes; Designing-with-AI and Motion Studio hero effects; all content/data and page layout.

**Do not migrate by default:** AWD Lab and prototype token systems, archived pass directories, `index copy.html`, hard-coded product UI controls, and the old sibling repository.

## 6. Smallest Viable Build and Distribution Pipeline

There is currently no `package.json`, lockfile, Sass source, bundler, or task runner. The smallest viable future pipeline is two development dependencies and npm scripts:

- Dart Sass: compile `src/scss/index.scss` to readable `dist/css/design-system.css` and compressed `dist/css/design-system.min.css`, with source maps. Sass supports direct one-to-one/directory compilation and watch mode ([official CLI documentation](https://sass-lang.com/documentation/cli/dart-sass/)).
- esbuild: bundle browser ESM entry points to `dist/js/index.js` (ESM, sourcemap, non-minified) and `dist/js/index.min.js`; optionally emit a separate `icons.js` entry if consumers need tree-independent icon loading. esbuild supports entry-point bundling, output directories, source maps, and watch mode ([official API documentation](https://esbuild.github.io/api/)).
- A small Node copy/validation script may copy SVG/static assets and fail the build on missing exports; avoid Gulp/Webpack/a framework until requirements exceed these tools.
- Commit `dist/` only if consumers install via Git/CDN without a package build. Otherwise publish it through a tagged release/package and keep generated output out of source review.

Keep plain CSS valid as SCSS initially; move files nearly verbatim into partials before introducing maps/mixins. Produce one compatibility bundle matching today’s order, plus optional granular exports. Pin dependencies in a lockfile and test a production build in CI.

## 7. Proposed Standalone Repository Structure

```text
awd-design-system/
├─ package.json
├─ package-lock.json
├─ README.md
├─ CHANGELOG.md
├─ LICENSE
├─ src/
│  ├─ scss/
│  │  ├─ index.scss
│  │  ├─ foundations/_colors.scss
│  │  ├─ foundations/_typography.scss
│  │  ├─ foundations/_spacing.scss
│  │  ├─ foundations/_motion.scss
│  │  ├─ components/_button.scss
│  │  ├─ components/_control.scss
│  │  ├─ components/_icon.scss
│  │  ├─ components/_theme-switcher.scss
│  │  ├─ components/_pattern-slides.scss
│  │  └─ utilities/_accessibility.scss
│  ├─ js/
│  │  ├─ index.js
│  │  ├─ icons.js
│  │  ├─ create-icon.js
│  │  ├─ theme.js
│  │  └─ pattern-slides.js
│  └─ icons/                 # optional exported standalone SVGs
├─ registry/
│  ├─ components.json
│  └─ schemas/component.schema.json
├─ docs/
│  ├─ foundations.md
│  ├─ migration.md
│  └─ components/
├─ examples/
│  └─ browser-smoke.html
├─ scripts/
│  ├─ build.mjs
│  └─ validate-registry.mjs
├─ test/
│  ├─ exports.test.mjs
│  └─ fixtures/
└─ dist/
   ├─ css/design-system.css
   ├─ css/design-system.min.css
   ├─ js/index.js
   ├─ js/index.min.js
   └─ icons/
```

### Component Registry minimum fields

Each entry should record: stable `id`, human name, status (`experimental`, `candidate`, `stable`, `deprecated`), version introduced, owner, source files, distribution exports, required tokens, markup example, variants/states, JS initializer (if any), accessibility contract, browser support, portfolio consumers, Figma mapping, visual-test fixture, and deprecation/replacement notes. Start with `icon`, `control`, `theme-switcher`, `pattern-slides`, `button`, and `text-link`; do not register portfolio layouts as components.

## 8. Migration Risks and Controls

| Risk | Impact | Control |
|---|---|---|
| Old sibling snapshot accidentally becomes source | Regression/data loss | Seed the new repository only from this commit’s `portfolio-clean/shared`; record source commit SHA and copy manifest. |
| Existing relative URLs resolve differently in file, custom-domain, project-subpath, or package contexts | 404s or silent use of sibling files | Choose a base/deployment contract; test through HTTP at root and subpath before URL changes. |
| Icon dependency inversion | Package cannot build/run alone | Make shared registry the renderer default; expose consumer extension API; test `menu` as a portfolio extension. |
| CSS order/specificity changes | Broad visual regressions | First release a compatibility bundle preserving order and selectors; add cascade layers/namespacing only in a reviewed major step. |
| Global body opacity and reduced-motion rules | Blank pages or suppressed interactions | Separate opt-in page-transition policy from reusable motion primitives. |
| Token boundary changes | Missing fonts, spacing, timings | Promote only agreed foundation tokens or add explicit fallbacks; validate computed styles on representative pages. |
| JS initialization duplication | Duplicate SVGs/listeners | Make initializers idempotent and document one entry strategy. |
| Button consolidation | State/size/theme regressions | Inventory visual baselines and migrate one surface at a time behind compatibility aliases. |
| Unversioned direct-file consumption | Breaking edits deploy immediately | Use tagged releases and exact package/CDN versions; publish changelog and migration notes. |
| Archives/prototypes treated as consumers | Scope expansion and conflicting tokens | Define supported consumer routes; keep labs/prototypes outside initial compatibility guarantees. |

## 9. Recommended Migration Sequence

Each step is intentionally small and independently verifiable; implementation requires review before starting.

1. **Freeze and fingerprint source.** Record the portfolio commit SHA, hashes for the 11 `shared/` files, supported routes, and baseline screenshots/computed styles. Verify no content is sourced from the sibling repository.
2. **Define supported consumers.** Approve the route matrix and whether demos, legacy case studies, AWD Lab, and prototypes are in scope. Verify every supported route over an HTTP server.
3. **Repair the icon boundary in portfolio first.** Point the shared renderer at the shared registry and provide an explicit consumer extension for `menu`. Verify the icon table, navigation drawer, back-to-top, and Work-page arrow icons.
4. **Remove no-op/stale shared edges.** Remove the unused pattern-slide import and decide whether to delete, replace, or port `shared/js/interactions.js`. Verify the module graph has no shared-to-portfolio imports. (No removal in this audit.)
5. **Create the new repository from current `shared/`.** Copy only after steps 1-4; preserve history/source attribution. Verify file hashes before refactoring.
6. **Add packaging without semantic changes.** Add `package.json`, locked Sass/esbuild tooling, source maps, exports, and a compatibility bundle. Compare built output and browser behavior against the source files.
7. **Make shared foundations self-contained.** Resolve font/spacing/motion token ownership or fallbacks. Verify all shared examples without portfolio CSS.
8. **Separate global policy from primitives.** Move body fade, root smooth-scroll, and broad reduced-motion rules to an opt-in entry. Verify no page remains transparent when JS fails.
9. **Move pattern slides as a unit.** Bring its CSS, JS, markup contract, and accessibility fixture together. Verify keyboard, focus, no-JS fallback, and reduced motion.
10. **Normalize buttons behind compatibility aliases.** Define tokens/states/sizes, implement shared primitives, and retain `.primary-btn`, `.primary-btn-small`, and `.link-btn` aliases initially. Migrate intro, featured hero, project list, then individual Work pages in separate reviews.
11. **Switch portfolio consumption without changing URLs first.** Publish/copy `dist` into `portfolio-clean/shared` so deployed paths remain stable. Run route, screenshot, keyboard, and console-error checks.
12. **Version and automate distribution.** Tag the first stable release; only then consider package imports/CDN URLs and automated dependency updates.
13. **Deprecate compatibility aliases gradually.** Remove aliases and legacy files only after usage search, visual regression, and explicit approval.

## 10. Open Decisions

1. What is the official distribution model: npm package, Git submodule/subtree, release artifact copied into `portfolio-clean/shared`, or CDN? The lowest-risk first step is a versioned release artifact copied to the existing path.
2. Must the design system support GitHub project subpaths as well as the custom-domain root? This determines URL strategy and asset `publicPath` behavior.
3. Should `dist/` be committed, release-only, or published to a registry?
4. Are typography, spacing, and base motion tokens part of the design system, or intentional consumer-supplied peer tokens?
5. Should CSS keep current global class names for compatibility, adopt an `awd-` namespace, use cascade layers, or combine these over major versions?
6. Should themes remain the fixed `default/dark/night` set and `awd-theme` storage key, or become consumer-configurable?
7. Should icons remain JS node data, also ship standalone SVGs, or move to an SVG sprite? How should product-only icons be registered?
8. Is page-transition behavior a design-system feature or portfolio application behavior? Current evidence favors portfolio ownership.
9. Which button visual is canonical, and which differences are formal variants versus portfolio recipes?
10. Are archived case studies, demos, AWD Lab, and prototypes supported consumers or reference-only artifacts?
11. What browser/accessibility support matrix and visual-regression tooling are required before `stable` registry status?
12. Who approves component promotion, breaking changes, Figma mappings, and release versions?

## Recommended Review Gate

Approve only steps 1-3 first: source fingerprint, supported-route matrix, and icon-boundary repair design. Those decisions unblock extraction while preserving current URLs and visual behavior. No repository creation, file movement, package installation, or consumer rewiring should occur before that review.
