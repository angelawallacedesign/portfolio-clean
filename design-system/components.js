// Versioned UI Kit manifest. IDs remain stable when names or selectors change.
// Add a Figma component URL after placing the same ID in its Description field.
export const components = [
  { id: "awd-button-primary", name: "Primary button", kind: "Component", selector: ".primary-btn", source: "css/components.css", variants: "Default, intro, small; hover, focus", preview: "primary", figma: "", review: "Not reviewed" },
  { id: "awd-link-text", name: "Text link", kind: "Component", selector: ".text-link", source: "css/components.css", variants: "Default, hover, focus", preview: "text-link", figma: "", review: "Not reviewed" },
  { id: "awd-button-cta", name: "CTA button", kind: "Component", selector: ".cta-btn.xl", source: "css/components.css", variants: "XL; hover, focus, active", preview: "cta", figma: "", review: "Not reviewed" },
  { id: "awd-heading-section", name: "Section heading", kind: "Component", selector: ".section-heading", source: "css/components.css", variants: "Display, large, medium; accent text", preview: "heading", figma: "", review: "Not reviewed" },
  { id: "awd-card-service", name: "Service card", kind: "Component", selector: ".cards .card", source: "css/components.css", variants: "Three-column group; responsive stack", preview: "card", figma: "", review: "Not reviewed" },
  { id: "awd-icon-arrow", name: "Arrow icon", kind: "Component", selector: ".icon[data-icon='arrow']", source: "shared/css/global-components.css", variants: "Rotation utilities, size utilities", preview: "icon", figma: "", review: "Not reviewed" },
  { id: "awd-control-back-to-top", name: "Back to top control", kind: "Component", selector: ".control.control--fixed", source: "shared/css/global-components.css", variants: "Fixed, bottom right", preview: "control", figma: "", review: "Not reviewed" },
  { id: "awd-theme-switcher", name: "Theme switcher", kind: "Component", selector: ".theme-switcher", source: "shared/css/global-components.css", variants: "AWD, dark, night; active, focus", preview: "theme", figma: "", review: "Not reviewed" },
  { id: "awd-pattern-global-navigation", name: "Global navigation", kind: "Pattern", selector: ".global-header", source: "index.html", variants: "Desktop header, mobile drawer", preview: "pattern", live: "../index.html#top", figma: "", review: "Pattern page planned" },
  { id: "awd-pattern-home-hero", name: "Home hero", kind: "Pattern", selector: ".intro-stage", source: "index.html", variants: "Responsive hero and actions", preview: "pattern", live: "../index.html#intro", figma: "", review: "Pattern page planned" },
  { id: "awd-pattern-impact-metrics", name: "Impact metrics", kind: "Pattern", selector: ".impact-metrics", source: "index.html", variants: "Four metrics, responsive layout", preview: "pattern", live: "../index.html#intro", figma: "", review: "Pattern page planned" },
  { id: "awd-pattern-logo-marquee", name: "Logo marquee", kind: "Pattern", selector: ".logo-marquee", source: "index.html", variants: "Motion, reduced motion, responsive", preview: "pattern", live: "../index.html", figma: "", review: "Pattern page planned" },
];
