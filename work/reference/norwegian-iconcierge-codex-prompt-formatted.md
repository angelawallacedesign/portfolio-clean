#PASS ONE

You are updating an existing implementation to match a revised Figma design. The original HTML structure was captured with a Figma Chrome plugin and imported into Figma as editable layers, so the Figma structure originated from the existing implementation.

**Figma is now the source of truth for the updated visual design and layout.** Use the existing implementation as the architectural/code foundation, not as the visual source of truth.

You are working in:

`/Development/portfolio-clean/work/`

Before making any changes, create a new branch for this work.

Update the existing Norwegian iConcierge project page located at /Development/portfolio-clean/work/ to match this Figma frame:

https://www.figma.com/design/NLRV4Dry5176FP9YISkIm8/AWD-Portfolio?node-id=1775-5310&t=hD00nacD8yo74Ade-0

Work within the existing portfolio codebase and reuse the current HTML structure, CSS architecture, components, utilities, and design tokens wherever possible. Do not introduce Tailwind or rebuild the page in React.

## Match the Figma frame closely, including:

- Existing sticky global navigation with the bottom fade treatment
- Breadcrumb:
  - Work
  - Interface Design
  - Norwegian iConcierge
- Hero title:
  - NORWEGIAN
  - ICONCIERGE
  - italic pink app
- Hero copy:
  - “Following brand guidelines, I designed skins for an app that allowed guests to explore activities and events during their cruise.”
  - “This project contains the work of multiple designers.”
- Keep the existing download-app button styling from the portfolio system
- Supporting text: Shipped on the App Store, Google Play and Microsoft Stores.
- Add the angled device mockup on the right side of the hero with the white fade treatment shown in Figma
- Keep the mockup image proportions and placement faithful to Figma; do not redesign the device treatment

## Update the project section labels to:

- DASHBOARD
- LEFT NAVIGATION DRAWER
- RIGHT COMMUNICATION DRAWER

## Each section should:

- Use the same uppercase section-heading treatment shown in Figma
- Include the thin bottom rule
- Preserve the existing 3-column artifact layout
- Preserve the original project screenshots and their aspect ratios
- Keep captions beneath each image
- Maintain lightbox/expand behavior if it already exists

## Captions should remain:

### Dashboard:

- Homepage - iPhone
- Homepage - iPad
- Homepage - Android

### Left Navigation Drawer:

- Left Menu - iPhone
- Left Menu - iPad
- Left MenuHome - Android

### Right Communication Drawer:

- Right Menu - iPhone
- Right Menu - iPad
- Right Menu - Android

## Important implementation constraints:

- Treat the Figma output as visual reference, not generated code to copy.
- Reuse existing portfolio CSS variables and typography tokens.
- Do not create duplicate styles if an equivalent already exists.
- Do not change unrelated project pages.
- Do not alter the original screenshots.
- Do not add scroll locking, frame borders, or AWD Lab behaviors.
- Preserve responsive behavior and adapt the Figma desktop layout cleanly for tablet/mobile.
- Keep the existing footer.

Before making changes, inspect the current Norwegian project page and the existing portfolio styles used by `index.html` and the redesigned project pages so this implementation stays consistent with the rest of the site.

After implementation, compare the rendered page against the Figma frame and correct spacing, typography, section widths, hero alignment, device mockup placement, and image-grid proportions before stopping.

After refactoring the code from this page against, the other two work pages (landing and category pages) will follow the same workflow.

#PASS TWO 

The next refactor is the work category page located at /Development/portfolio-clean/work/index.html. The Figma file is https://www.figma.com/design/NLRV4Dry5176FP9YISkIm8/AWD-Portfolio?node-id=1780-5880&t=hD00nacD8yo74Ade-0
This one is a minor lift.  The only changes are updating the fonts for the page header and category titles

#PASS 2.1
Add a hover state using the --color-accent global token, and a focus state using --color-control to the three category title links

#PASS 2.2
Update the focus color token to apply to the border, not the text.  So the blue focus borders should use --color-control, and the text should keep the existing color tokens
** This didn't work and the focus state was no longer showing **

#PASS 2.3
Apply the existing focus color token to the keyboard focus indicator, not to the anchor text. Preserve the existing :focus-visible behavior and use the token for the outline/outline-color that appears when tabbing with the keyboard. Do not remove the focus indicator and do not replace it with a text-color change.
** This worked **


#PASS 3
Pass 3 — Interface Design Project List

Use the existing project-list implementation found at:

http://127.0.0.1:5500/portfolio-srvd/work.html

as the implementation foundation.

Update that existing pattern to match this revised Figma frame:

https://www.figma.com/design/NLRV4Dry5176FP9YISkIm8/AWD-Portfolio?node-id=1799-6287&t=hD00nacD8yo74Ade-0

Do not recreate the project-list architecture from Figma. Compare the existing implementation against the Figma redesign and modify only the differences described below.

Changes from the existing implementation
Primary button placement
In the existing implementation, the project content is arranged more horizontally.
In the revised Figma design, Auto Layout changes the content stack so the primary button appears in a column underneath the description paragraph.
Preserve the existing primary button component and styling. Only update its placement within the project content stack.
2019 project data architecture
Inspect the existing data-loading architecture before making this decision.
Determine whether the 2019 work projects should:
be appended to the existing data.json, or
live in a separate JSON file dedicated to the 2019 work archive.
Do not create a new data file by default.
Base the decision on the existing data model, how the current project list is populated, separation of concerns, maintainability, and whether the 2019 projects use the same schema as the existing work.
Briefly state the chosen approach and reasoning before implementing it.
Prefer the smallest architectural change that remains clean and maintainable.

Project content stack

Preserve the existing project container, presentation behavior, image treatment, overall architecture, and current implementation patterns from portfolio-srvd.
Update only the content structure inside each project item to match Figma.

The revised content stack is:

Title row
Client row
Client label
client meta name
Description paragraph
no Description or Solution label
Primary button
positioned below the description paragraph

The description should remain plain paragraph content and should not receive a metadata label.

Project-row spacing
The Figma redesign appears to use more vertical space between project row containers than the current portfolio-srvd implementation.
This is a nice-to-have, not a reason to create new spacing tokens or restructure the layout.
If the existing spacing system already supports a closer match, use it.
Otherwise preserve the current spacing rather than introducing a one-off value.
Preserve
Existing HTML/CSS architecture
Existing project-list rendering logic
Existing image presentation
Existing project container behavior
Existing primary button component
Existing design tokens
Existing typography system
Existing responsive behavior
Existing interaction behavior

Do not rebuild the project list from generated Figma code. Treat the Figma frame as the visual reference for the differences only.
