# Nickelodeon Interactive TV App Case Study Integration Plan

## Status

Planning and inspection only. No implementation, asset migration, or application-code changes are included in this pass.

## Objective

Migrate the legacy **Nickelodeon Interactive TV App** case study into the current `portfolio-clean` standalone case-study system while:

- preserving the substantive published legacy copy;
- retaining the original narrative and image sequence;
- reusing the original project imagery at its best available resolution;
- adopting the current portfolio's typography, spacing, navigation, responsive behavior, and visual language;
- avoiding recreation of the turquoise/orange 2022 portfolio presentation;
- avoiding shared architecture changes unless the content demonstrates a genuine need.

The primary implementation reference is:

`/portfolio-clean/projects/designing-with-ai/index.html`

The legacy content source is the archive:

`/portfolio-support/archives/AWD-portfolio-Oct-2022.zip`

The path originally supplied in the brief contains an extra `legacy/portfolio/2022` segment; the archive currently exists directly under `portfolio-support/archives/`.

Inside the archive, `index.htm` is only the portfolio entry page. The actual Nickelodeon case study is `project-1.htm`.

The visual reference is:

`/portfolio-support/archives/legacy/portfolio/2022/nick-case-study-legacy-2022.png`

The HTML and referenced assets remain the source of truth. The screenshot is used only to confirm sequence and content relationships.

---

## 1. Legacy Content Inventory

### Page identity

- Browser title: `Angela Wallace's ITV UI Project`
- H1: `Nickelodeon Interactive TV App`
- Description metadata: `Angela Wallace's Multi-device UI Project`
- Author: Angela Wallace
- Client/property named in the overview: Nickelodeon Hotels & Resorts Punta Cana
- Project year: not stated
- Project duration: not stated
- Launch date: not stated

### Overview

The published overview explains that Angela designed the interface of a TV web application for Nickelodeon Hotels & Resorts Punta Cana guest suites as part of a UX/UI team.

The primary design considerations were:

- minimum font sizing and contrast for legibility at a distance;
- simplified design elements for remote-control navigation;
- adherence to client brand guidelines across customer touchpoints.

A commented-out sentence states that mobile and kiosk applications accompanied the design package. Because it was not rendered and is absent from the legacy screenshot, it should remain excluded unless unpublished draft material is explicitly approved for restoration.

### Roles

Published value:

> User Experience (UX) Designer, User Interface (UI) Designer, Mobile App Tester, QA Tester

### Deliverables

Published value:

> High-fidelity mockups, Presentations, Graphic Assets (TV, Kiosk, iPhone, iPad, Android)

### Tools

Published value:

> Photoshop, Illustrator, Adobe XD, Xcode, Android Studio, Github, HTML, CSS, CMS, Microsoft SQL Server, Jira

The source also contains a commented-out list version of Roles, Deliverables, and Tools. It duplicates the published metadata and should not migrate.

### Research

Published method line:

> Methods: Competitive Analysis, User Personas, Online research

The research copy covers:

- reviewing client style guides, websites, articles, and videos;
- synthesizing brand consistencies;
- studying interior design, graphic design, and architecture;
- translating recognizable architectural features into interface motifs;
- recording copy voice and tone, photography style, demographics, and target audiences;
- considering the application environment, visibility, accessibility, and client business units;
- estimating initial project timelines;
- distributing work across a design team;
- rotating designers through client and stakeholder meetings;
- determining whether new modules should be designed and developed;
- monitoring industry trends, platform updates, deprecations, and end-user research.

### High-Fidelity Mockups

Published tools:

> Photoshop, Illustrator

The section describes:

- applying research and brand guidelines to an existing application framework;
- beginning with a home screen and selected inner-module screens;
- obtaining client sign-off before expanding the design;
- evaluating client-annotated requests for feasibility;
- continuing meetings and mockup presentations through a set number of rounds;
- returning to wireframes when new application functionality is requested;
- using front-end knowledge to avoid unnecessary design and engineering rework.

### User Interface Design

Published tools:

> Photoshop, Illustrator, HTML, CSS, Content Management

The section states that Angela:

- began as one of the senior designers;
- became Lead UI Designer toward the end of the project;
- used annotated wireframes and mockups to create native graphic assets;
- followed development naming and folder conventions;
- followed Apple Human Interface Guidelines and Android Material Design guidance;
- created SVG graphics for the Interactive TV experience where appropriate;
- styled the front-end interface with HTML and CSS.

### Internal Team Meetings

Named participants:

- Account Managers
- Designers
- Developers
- Database Administrators
- Quality Assurance Testers

The published copy covers weekly SCRUM meetings, daily design-team meetings, cross-team blockers and dependencies, and senior-level support for other designers with hardware, software, and production-design issues such as `.9` graphics.

### Application and QA Testing

Published tools and environments:

- Xcode
- Android Studio
- Virtual Computers
- Native smartphones, tablets, and TV screens
- GitHub
- HTML
- CSS
- Microsoft SQL Server
- Jira

The published ordered workflow contains 12 substantive steps:

1. Run the build in each platform-specific virtual device.
2. Create test users by entering data into database tables.
3. Pull the latest development repository from GitHub.
4. Run the code through the appropriate IDE and create virtual devices.
5. Diagnose crashes or loading failures across graphic, code, software-update, and database causes.
6. Inspect stack traces and document bugs with highlighted screenshots.
7. Verify project database tables and fields.
8. Create and prioritize Jira tickets when the design team cannot immediately resolve an error.
9. Escalate unresolved tickets to the relevant platform or module developer.
10. Follow developer resolution instructions or retest updated code.
11. Address QA-created or reopened tickets and use QA scripts for final functionality testing.
12. Repeat the process until QA approves the application for asset handoff.

Two additional testing details exist only in HTML comments: an expanded repository-check explanation and a third-party dependency example. They should remain excluded by default.

### Graphic Asset Handoff

Published tools:

> Zip files, Microsoft SQL Server

The handoff copy covers:

- cross-device screenshots across platforms and operating systems;
- saving graphic assets into the required file structure;
- packaging assets as a zip archive;
- clearing test data and preparing the database for client use;
- setting the Jira project status to complete;
- retaining project comments for later reference.

### App Publishing

Published destinations:

> App Store, Google Play

The copy states that developers and database administrators finalized application packaging for publication or updates through both stores.

### Summary

The published conclusion explains that the project allowed the client to iterate native, device-specific branded applications across multiple sub-brands under tight deadlines. The existing framework could be customized with new modules and functionality, improving future project features and usability.

A more personal UI-versus-UX reflection exists only in an HTML comment and should remain excluded by default.

### Published captions

1. `Viewing at a distance emphasizes contrast and minimum font sizes`
2. `Nickelodeon website design reference`
3. `Nickelodeon ITV Homescreen Mockup`
4. `Client-annotated Mockup`
5. The Android icon sheet is labeled `Fig.4 Example Android icons` in the legacy source.

The icon-sheet numbering is an evident duplicate. The recommended migration corrects it to `Fig.5` while preserving the caption wording.

### Editorial preservation rules

- Preserve all published substantive paragraphs and ordered testing steps.
- Preserve original terminology, including references to SCRUM, IDEs, native devices, database testing, Jira, and cross-device testing.
- Do not shorten paragraphs to fit a component.
- Do not introduce new process claims.
- Exclude commented-out draft material unless separately approved.
- Permit only non-substantive corrections: `Github` to `GitHub`, duplicate figure numbering, malformed punctuation, and accessibility text.

---

## 2. Current Designing with AI Architecture

### Page shell

The current reference is a semantic standalone document composed of:

- a sticky sub-navigation header;
- an `All Work` return link;
- four numbered in-page navigation anchors;
- a full-width hero area;
- a centered project title and eyebrow;
- a long-form `<main>` content rail;
- a theme-aware footer;
- a fixed back-to-top control.

### Navigation behavior

The reference page uses an `IntersectionObserver` to update the active navigation item as major content groups enter the viewport.

Recommended Nickelodeon navigation:

1. Overview
2. Research
3. Design
4. Delivery

The mobile implementation may reduce navigation labels primarily to their step numbers, matching the current system.

The reference has no previous/next-project control. The legacy previous/next footer should not be recreated during this migration.

### Typography and content width

The page uses:

- Inter for primary UI and body typography;
- DM Serif for accent title typography;
- the shared `.section-heading`, `.heading-main`, and `.heading-accent` hierarchy;
- a title rail capped at `78rem`;
- a main editorial rail capped at `65rem`;
- uppercase section headings with a divider;
- unrestricted long-form paragraphs and lists.

### Reusable content patterns

Available patterns include:

- full-width hero;
- centered title and case-study eyebrow;
- `5fr / 4fr` overview and summary grid;
- definition-list metadata;
- standard long-form sections;
- semantic lists and ordered lists;
- contained full-width media;
- visible captions;
- image lightbox behavior;
- result/goal blockquotes;
- reflection treatment;
- theme-aware footer.

The small image-plus-copy thumbnail pattern should not be used for essential Nickelodeon imagery without modification. The reference hides those thumbnails below `480px` and crops them to a `4 / 3` aspect ratio. Every substantive Nickelodeon figure must remain visible and uncropped at all breakpoints.

### Responsive behavior

Verified reference behavior:

- the overview columns stack below `768px`;
- metadata changes to a single-column definition list below `480px`;
- section headings center at narrow widths;
- the editorial rail becomes `calc(100% - 40px)`;
- result blocks expand to full width;
- the sticky navigation becomes compact;
- body content remains in normal document flow.

The reference's narrow-screen hero rule may crop an image. Nickelodeon should override that rule locally with `height: auto` and `object-fit: contain` to preserve the complete legacy hero composition.

### Shared styles and scripts to reuse

Styles:

- `/shared/css/global-tokens.css`
- `/shared/css/global-components.css`
- `/shared/css/utilities.css`
- `/shared/css/motion.css`
- `/css/tokens.css`
- `/css/main.css`
- `/css/components.css`

Scripts:

- `/js/case-study.js`
- `/js/interactions.js`
- `/shared/js/theme.js`
- `/shared/js/base.js`
- `/shared/js/createIcon.js`
- `/shared/js/icons.js`

The Designing with AI animated hero, Pattern Inspector module, video, and project-specific JavaScript are not relevant to Nickelodeon and should not be included.

### Accessibility conventions

Reuse:

- semantic `<article>`, `<header>`, `<main>`, `<section>`, and `<footer>` structure;
- ordered heading hierarchy;
- labeled primary and section navigation;
- visible keyboard focus behavior;
- `aria-hidden` decorative icons;
- screen-reader text for the back-to-top control;
- semantic `<figure>` and `<figcaption>` markup;
- modal lightbox semantics and focus return;
- reduced-motion protection.

Improve the original weak or mismatched image alt text without changing visible captions.

---

## 3. Recommended Content Mapping

| Legacy content | Current pattern | Implementation notes |
| --- | --- | --- |
| Hero composite | Full-width project hero | Display the complete 2500×2000 original; do not use a cropped derivative. |
| Project title | Shared section-heading pattern | `Nickelodeon` as main title; `Interactive TV App` as accent/title continuation. |
| Case-study label | Existing eyebrow | Use `Case Study`. |
| Overview | `case-overview` left column | Preserve the complete overview paragraph. |
| Roles, deliverables, tools | `component-summary` definition list | Use exact published metadata. |
| Remote-control context | Contained figure inside overview content | Keep visible at every breakpoint; do not use the mobile-hidden thumbnail pattern. |
| Research methods | Standard case section | Preserve method line and all research paragraphs. |
| Website reference | Full contained lightbox-enabled figure | Place between the paragraphs it originally supports. |
| High-fidelity process | Standard case section | Preserve tools and all paragraphs. |
| Homescreen and annotated mockup | Project-scoped two-image figure row | Side by side at wide widths; stack without cropping on mobile. |
| UI design | Standard case section | Preserve tools, role progression, production details, and front-end responsibilities. |
| Android icon sheet | Full-width lightbox-enabled figure | Correct figure number to Fig. 5; write accurate alt text. |
| Internal team meetings | Standard case section | Preserve participant line and complete collaboration copy. |
| Application and QA testing | Standard case section with semantic `<ol>` | Preserve all 12 published steps. |
| Graphic asset handoff | Standard case section | Preserve tools and complete handoff paragraph. |
| App publishing | Standard case section | Preserve destinations and publication paragraph. |
| Summary | Final standard case section | Preserve the published summary as prose, not a fabricated quotation. |

No content should be rewritten or reduced to a character limit.

---

## 4. Recommended Asset Migration

### Canonical project-local directory

Use:

`/portfolio-clean/projects/nickelodeon/assets/`

This isolates the archived project from the older `assets/work/allin/nick/` namespace and makes the new standalone case study self-contained.

### Source-to-destination map

| Legacy archive source | Dimensions | Proposed destination | Purpose |
| --- | ---: | --- | --- |
| `images/projects/nick-itv.jpg` | 2500×2000 | `projects/nickelodeon/assets/nickelodeon-itv-hero.jpg` | Full hero image |
| `images/ui/remote-and-tv.jpg` | 1200×800 | `projects/nickelodeon/assets/remote-and-tv.jpg` | Overview context |
| `images/projects/nick-itv-4.jpg` | 3098×2098 | `projects/nickelodeon/assets/nickelodeon-website-reference.jpg` | Research figure |
| `images/projects/nick-itv2.jpg` | 1920×1080 | `projects/nickelodeon/assets/nickelodeon-itv-homescreen.jpg` | High-fidelity homescreen |
| `images/projects/nick-itv3.jpg` | 2176×1408 | `projects/nickelodeon/assets/client-annotated-mockup.jpg` | Annotated client feedback |
| `images/ui/icons.png` | 1738×1234 | `projects/nickelodeon/assets/android-icons.png` | UI production asset sheet |

Copy the original bytes without image editing, cropping, resampling, recoloring, or format conversion.

### Existing duplicates in `portfolio-clean`

The following files already exist byte-for-byte under `/assets/work/allin/nick/`:

- `nick-itv-4.jpg`
- `nick-itv2.jpg`
- `nick-itv3.jpg`
- `remote-and-tv.jpg`
- `icons.png`
- `android-icons.png`

`icons.png` and `android-icons.png` are exact duplicates of each other.

The current `nick-itv.jpg` and `nick-itv-hero.jpg` are cropped derivatives rather than the full legacy 2500×2000 hero and should not be used as the new case-study hero.

### Assets to exclude

- `nick-itv-4.png`: unreferenced 6.7 MB duplicate of the published JPG at the same pixel dimensions.
- `punta-cana-mobile.png`: not referenced by the legacy HTML or screenshot.
- Current intro laptop and phone composites: promotional portfolio assets, not original case-study evidence.
- Standalone Nickelodeon logo: not required by the original case-study content.
- Automatically generated thumbnails: unnecessary for the case-study body.

Do not delete or reorganize existing current-repository assets during this migration. Repository-wide duplicate cleanup should be a separate task.

---

## 5. Proposed Directory and File Structure

```text
portfolio-clean/
├── projects/
│   └── nickelodeon/
│       ├── index.html
│       ├── nickelodeon.css
│       ├── assets/
│       │   ├── nickelodeon-itv-hero.jpg
│       │   ├── remote-and-tv.jpg
│       │   ├── nickelodeon-website-reference.jpg
│       │   ├── nickelodeon-itv-homescreen.jpg
│       │   ├── client-annotated-mockup.jpg
│       │   └── android-icons.png
│       └── image-zoom-lightbox/
│           ├── image-zoom-lightbox.css
│           └── image-zoom-lightbox.js
└── js/
    └── data.json
```

No additional project-specific JavaScript is required. Follow the Designing with AI page's existing inline active-section observer and reuse the shared case-study initialization.

---

## 6. Required Changes

### New project files

#### `projects/nickelodeon/index.html`

Responsibilities:

- metadata and Open Graph information;
- shared style dependencies;
- sticky section navigation;
- full-width original hero;
- case-study title and eyebrow;
- overview and summary metadata;
- all published legacy sections and copy;
- semantic figures and captions;
- ordered QA workflow;
- footer and theme controls;
- shared script dependencies;
- active-section observer.

#### `projects/nickelodeon/nickelodeon.css`

Responsibilities:

- page-scoped adaptation of the Designing with AI case-study presentation;
- `.nickelodeon-case-study` scoping;
- uncropped hero behavior;
- full-width figure behavior;
- one responsive two-image grid for the high-fidelity mockups;
- caption spacing where the existing `.caption` class is insufficient;
- mobile stacking without hiding substantive imagery.

Do not copy legacy CSS or introduce turquoise/orange portfolio chrome.

#### Project-local image lightbox

Copy the current independent Designing with AI image-zoom component without changing its behavior. This avoids coupling Nickelodeon to another project's folder while avoiding shared architecture changes during the migration.

### Existing integration file

Update `/portfolio-clean/js/data.json` with a new record:

```json
{
  "id": "nickelodeon-interactive-tv",
  "featured": false,
  "category": "case-studies",
  "layout": "left",
  "heading": {
    "title": "Nickelodeon Interactive TV App",
    "main": "Nickelodeon",
    "accent": "Interactive TV App"
  },
  "year": "TO_BE_CONFIRMED",
  "users": 0,
  "complexity": 5,
  "opacity": 1,
  "hasCaseStudy": true,
  "htmlInclude": "projects/nickelodeon/",
  "meta": {
    "type": "Interactive TV application",
    "client": "Nickelodeon Hotels & Resorts Punta Cana",
    "role": "UX/UI Designer, Lead UI Designer, Mobile App Tester, QA Tester",
    "impact": "Use the published legacy summary without inventing quantitative results.",
    "disciplines": "UX/UI design, Cross-platform production, Application and QA testing",
    "notes": "Use the published overview copy.",
    "caption": "Nickelodeon Interactive TV App",
    "imageUrl": "projects/nickelodeon/assets/nickelodeon-itv-hero.jpg",
    "featuredUrl": ""
  }
}
```

The exact record should use valid JSON and the confirmed numeric year. The placeholder above is planning guidance only.

The existing Work index should then render and link the project without changes to `/work/index.html`.

### Reused existing architecture

Reuse without modification:

- global tokens and theme aliases;
- typography tokens;
- global header and sub-navigation;
- navigation step treatment;
- shared heading pattern;
- back-to-top control;
- overview and metadata structure;
- section heading hierarchy;
- list and ordered-list styling;
- caption styling;
- footer and theme switcher;
- shared page transitions;
- reduced-motion behavior;
- Work data rendering and project linking.

### Additions to shared architecture

None are required.

The two-image row and hero-preservation rules are specific to this project's source material and belong in `nickelodeon.css`.

---

## 7. Content and Design Decisions

### Recommended decisions

1. **Published copy is authoritative.** Exclude all HTML-commented draft copy.
2. **Correct non-substantive errors.** Change `Github` to `GitHub` and the icon-sheet figure number from Fig. 4 to Fig. 5.
3. **Improve accessibility text.** Replace weak or incorrect legacy alt text with factual descriptions of the visible images.
4. **Use `case-studies` as the Work category.** Do not extend the filter model solely to place the project in multiple categories.
5. **Use `nickelodeon-interactive-tv` as the data ID.** Use `/projects/nickelodeon/` as the concise route.
6. **Use project-local assets.** This avoids long-term coupling to the older `allin/nick` directory.
7. **Do not add previous/next navigation.** Follow the current reference's `All Work`, section navigation, and back-to-top behavior.
8. **Do not create quantitative impact claims.** The source describes benefits but gives no measurements.

### Required owner input

The project year must be supplied before adding the project to `js/data.json`. It cannot be inferred reliably from the 2022 archive date.

If a year is not available, implementation should pause before Work-index integration rather than fabricate one. The standalone page can still be built and reviewed independently.

---

## 8. Implementation Sequence for a Later Coding Pass

1. Confirm the project year.
2. Create `projects/nickelodeon/` and its project-local asset directory.
3. Copy only the six approved original assets from the archive.
4. Verify copied-file dimensions and checksums against the archive.
5. Create the semantic page shell from the Designing with AI standalone structure.
6. Remove all Designing with AI-specific hero, Pattern Inspector, video, and project-module dependencies.
7. Add the four-part sticky navigation: Overview, Research, Design, Delivery.
8. Add the full original hero and responsive no-crop rules.
9. Add the title, case-study eyebrow, overview, and exact metadata.
10. Transcribe all published legacy copy without shortening it.
11. Add the remote-control, research, high-fidelity, and icon-sheet figures in their original narrative positions.
12. Add the project-scoped two-image mockup grid.
13. Add all 12 QA steps as a semantic ordered list.
14. Add the existing image lightbox component.
15. Add accurate alt text while preserving visible captions.
16. Add the confirmed project record to `js/data.json`.
17. Validate HTML structure and heading order.
18. Validate all local routes, assets, CSS, and JavaScript requests.
19. Test keyboard navigation, lightbox focus behavior, theme switching, active-section navigation, and back-to-top behavior.
20. Test desktop, tablet, and narrow mobile layouts.
21. Verify that every substantive image remains visible, uncropped, and unstretched.
22. Compare the final content sequence against both `project-1.htm` and the legacy full-page screenshot.
23. Confirm that no `/portfolio-support` file was modified.
24. Confirm that shared `portfolio-clean` styles were not changed.

---

## Acceptance Criteria

The migration is complete when:

- the project is available at `/projects/nickelodeon/`;
- the Work index links to the standalone case study;
- all published legacy sections and substantive copy are present;
- all 12 published QA steps are present and ordered;
- all five published captions are present with corrected numbering;
- the six approved original assets are used without image alteration;
- the page visually belongs to the current portfolio rather than the 2022 portfolio;
- the original narrative sequence and image relationships remain recognizable;
- no required image is hidden or cropped at mobile widths;
- the page supports the current theme, navigation, transitions, and accessibility behavior;
- no shared CSS change was required;
- no legacy application code or CSS was incorporated;
- no process information, dates, results, or metrics were fabricated.

## Decisions Needed Before Implementation

- Supply the Nickelodeon project year required by the Work data model.
- Confirm that approval of this plan also approves the recommended minor corrections: `GitHub` capitalization and Fig. 5 numbering.
- Confirm that unpublished HTML-commented copy should remain excluded.
