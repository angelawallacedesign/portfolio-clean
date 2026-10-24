# UI Kit architecture note

**Discussed:** October 23, 2026, 6:42 PM EDT  
**Model:** Codex GPT-6 Sol Light

This note records our discussion about a web UI Kit for cataloging Angela Wallace's implemented design system components, mapping them to Figma, and supplying live components for Design Inspector review before promotion into the kit.

- **Source of truth:** Start in the portfolio repository. Keep a versioned component manifest and render `design-system/ui-kit.html` from it. Extract shared assets to a separate repository or package when another product consumes them.
- **Identity and mapping:** Give each component a stable, product-neutral ID. Store that ID in the Figma component Description field; use Figma's Link field for the corresponding anchored UI Kit row. The manifest records the Figma component URL or key and mapping status.
- **Scope:** Inventory the root `index.html` first, then expand page by page. Reuse an existing entry for the same component; add variants when implementation or behavior differs.
- **Presentation:** Keep compact controls and states previewable in table rows. Give compositions that need layout, multiple components, responsive behavior, or interaction their own live pattern page; link to it from the relevant rows. A table modal may offer a quick look, but is not the canonical review surface.
- **Review:** Design Inspector inspects the live rendered component or pattern and preserves findings and decisions. A reviewed, approved implementation can then be promoted into the UI Kit. Keep review evidence distinct from the catalog's current component definition.

Related Design Inspector context: [Product Intent](https://docs.google.com/document/d/1xYDYorGIZ52xghH9VNHZ_Z6Vt30XQ8VqsC0YE44Gf-U/edit) and [Live Review vs. Review Artifact](https://docs.google.com/document/d/1p01fMHGw6n1cCmUXFUIBC1ASm37sMk7h0MwPFwGqsYY/edit).
