Repo: portfolio-clean

## Codex Brief — Work Gallery Navigation + Filtering

I want to revise the **Work browsing experience in `portfolio-clean`** to reduce navigation friction while preserving the existing spacious project-list presentation.

**Do not implement or modify any code yet.** Review the current implementation and the Figma references below, then return a recommended implementation plan.

### Figma references

**A. Work — On page load**
[Figma: Work — On page load](https://www.figma.com/design/NLRV4Dry5176FP9YISkIm8/AWD-Portfolio?node-id=1849-10508&t=gppKr02iEubw1ep2-0&utm_source=chatgpt.com)

**B. Work — Scrolled / sticky state**
[Figma: Work — Scrolled](https://www.figma.com/design/NLRV4Dry5176FP9YISkIm8/AWD-Portfolio?node-id=1849-11245&t=gppKr02iEubw1ep2-0&utm_source=chatgpt.com)

### Objective

The current Work architecture requires users to enter individual category pages and repeatedly return to the main Work page to browse another category. Once users scroll down a category page, they also lose access to category navigation.

Replace this browsing pattern with a **single filterable Work project list**.

The available filters should be:

* All
* Interface Design
* Graphic Design
* Branding

`All` should be the default List state.

Filtering should happen within the Work page without page navigation or reload. Preserve the existing editorial project-row presentation, including current imagery, titles, client information, descriptions, project links, and CTAs.

### Page-load state

Follow Figma reference **A**.

Preserve the large `WORK` page heading and existing introductory spacing on initial page load. The page should retain the breathing room of the current `portfolio-clean` design.

The large page heading remains the page's semantic H1.

### Scrolled / sticky state

Follow Figma reference **B**.

As the project collection scrolls, provide a compact **sticky local Work navigation** beneath the existing global navigation.

This local navigation contains:

**WORK + category filters + existing List/Chart toggle**

The compact `WORK` label should use the existing `--type-display` treatment shown in Figma. It is a local-navigation label and should not introduce a second H1.

The project list should scroll underneath this sticky region.

Preserve the hierarchy between:

**Global navigation → local Work navigation → project content**

### List / Chart scope

Preserve the existing **List / Chart toggle** and incorporate it into the local Work navigation as shown in Figma.

For this implementation:

* **List** uses the new category filtering.
* **Chart** continues to display all projects.
* Category filtering does **not** need to affect Chart.
* Do not refactor the Chart.
* Do not modify its data, rendering, visualization, or existing behavior.
* Only make changes necessary to preserve access to the existing Chart view within the revised Work navigation.

A future pass can determine whether Chart should respond to category filtering.

### Existing category pages

Do **not** delete the existing Interface Design, Graphic Design, or Branding pages during this pass.

The new filtered Work index should eliminate the need to use those pages for normal browsing, but they can remain intact for now.

### Existing design system

Reuse the existing `portfolio-clean` typography, tokens, spacing, active-state treatments, project-row styles, and navigation language.

Do not introduce a new visual system or third-party gallery/filtering dependency.

Keep implementation changes scoped to the Work experience wherever possible. Do not redesign project pages or modify unrelated global styling.

### Requested audit + implementation plan

Before making any changes, inspect the current `portfolio-clean` implementation and return a proposed plan covering:

1. Current Work page/category architecture and the files involved.
2. Current project data source and how projects are associated with Interface Design, Graphic Design, and Branding.
3. How the existing List / Chart toggle is implemented, only to determine how to preserve it without refactoring Chart.
4. Recommended approach for rendering all projects through one filterable Work list.
5. Recommended filter state and interaction behavior.
6. Recommended structure for the initial and sticky local-navigation states shown in Figma.
7. How sticky positioning should coexist with the existing global navigation.
8. Responsive behavior and any likely edge cases.
9. Whether existing category-page code/data can be reused without duplication.
10. Exact files you recommend modifying, adding, or leaving untouched.
11. Any risks, dependencies, or conflicts you identify before implementation.

**Do not execute the plan. Do not edit, create, delete, move, or refactor files. Return the audit findings and proposed implementation plan for approval first.**
