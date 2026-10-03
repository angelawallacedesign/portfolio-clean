import { reviewRecord } from "./design-inspector-data.js";
import { renderSelection, renderWorkspace } from "./design-inspector-renderers.js";

const RESPONSIVE_QUERY = "(max-width: 68rem)";
const FOCUSABLE = "button:not([disabled]), a[href], summary, [tabindex]:not([tabindex='-1'])";

function initializeTabs(root) {
  const tabs = [...root.querySelectorAll("[data-di-tab]")];
  const activate = (tab, focus = false) => {
    tabs.forEach((candidate) => {
      const active = candidate === tab;
      candidate.classList.toggle("is-active", active);
      candidate.setAttribute("aria-selected", String(active));
      candidate.tabIndex = active ? 0 : -1;
      root.querySelector(`[data-di-tabpanel="${candidate.dataset.diTab}"]`).hidden = !active;
    });
    if (focus) tab.focus();
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activate(tab));
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      let next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
      activate(tabs[next], true);
    });
  });
}

function initializeDates(root) {
  root.querySelector("[data-di-date-navigation]").addEventListener("click", (event) => {
    const button = event.target.closest(".di-v2-month > button");
    if (!button) return;
    const panel = root.ownerDocument.getElementById(button.getAttribute("aria-controls"));
    const expanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!expanded));
    panel.hidden = expanded;
  });
}

function initializeCallouts(root, state) {
  root.addEventListener("click", (event) => {
    const control = event.target.closest("[data-di-callout]");
    if (!control) return;
    state.selectedCalloutId = control.dataset.diCallout;
    renderSelection(root, state.selectedCalloutId);
    const pairedCard = root.querySelector(`.di-v2-callout-card[data-di-callout="${state.selectedCalloutId}"]`);
    if (control.classList.contains("di-v2-callout") && pairedCard) pairedCard.scrollIntoView({ block: "nearest", behavior: "smooth" });
  });
}

function initializePanels(root, state) {
  const media = root.ownerDocument.defaultView.matchMedia(RESPONSIVE_QUERY);
  const panels = { left: root.querySelector("[data-di-left-panel]"), right: root.querySelector("[data-di-right-panel]") };
  const desktopControls = { left: root.querySelector('[data-di-panel-control="left"]'), right: root.querySelector('[data-di-panel-control="right"]') };
  const reopenControls = { left: root.querySelector('[data-di-reopen="left"]'), right: root.querySelector('[data-di-reopen="right"]') };
  const mobileControls = { left: root.querySelector('[data-di-mobile-control="left"]'), right: root.querySelector('[data-di-mobile-control="right"]') };
  const backdrop = root.querySelector("[data-di-backdrop]");
  let opener = null;

  const render = () => {
    root.dataset.diResponsive = String(media.matches);
    root.dataset.diLeft = state.leftOpen ? "open" : "closed";
    root.dataset.diRight = state.rightOpen ? "open" : "closed";
    root.dataset.diDrawer = state.drawer || "none";
    Object.entries(panels).forEach(([side, panel]) => {
      const visible = media.matches ? state.drawer === side : side === "left" ? state.leftOpen : state.rightOpen;
      panel.hidden = !visible;
      panel.toggleAttribute("inert", !visible);
      panel.setAttribute("aria-hidden", String(!visible));
      desktopControls[side].setAttribute("aria-expanded", String(visible));
      desktopControls[side].querySelector("[data-di-control-label]").textContent = visible ? "Hide" : "Show";
      reopenControls[side].hidden = media.matches || (side === "left" ? state.leftOpen : state.rightOpen);
    });
    backdrop.hidden = !media.matches || !state.drawer;
  };
  const closeDrawer = () => { state.drawer = null; render(); opener?.focus(); opener = null; };
  Object.entries(desktopControls).forEach(([side, button]) => button.addEventListener("click", () => {
    if (media.matches) return closeDrawer();
    if (side === "left") state.leftOpen = !state.leftOpen; else state.rightOpen = !state.rightOpen;
    render();
  }));
  Object.entries(reopenControls).forEach(([side, button]) => button.addEventListener("click", () => {
    if (side === "left") state.leftOpen = true; else state.rightOpen = true;
    render();
    desktopControls[side].focus();
  }));
  Object.entries(mobileControls).forEach(([side, button]) => button.addEventListener("click", () => {
    opener = button; state.drawer = side; render();
    requestAnimationFrame(() => panels[side].querySelector(FOCUSABLE)?.focus());
  }));
  backdrop.addEventListener("click", closeDrawer);
  root.addEventListener("keydown", (event) => {
    if (!state.drawer) return;
    if (event.key === "Escape") { event.preventDefault(); closeDrawer(); return; }
    if (event.key !== "Tab") return;
    const focusable = [...panels[state.drawer].querySelectorAll(FOCUSABLE)].filter((item) => !item.closest("[hidden]"));
    if (!focusable.length) return;
    const first = focusable[0], last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  media.addEventListener?.("change", () => { state.drawer = null; render(); });
  render();
}

function initializeArtifactLoader(root) {
  const urlInput = root.querySelector("[data-di-local-url]");
  const loadButton = root.querySelector("[data-di-load-local]");
  const artifactWrap = root.querySelector("[data-di-artifact-wrap]");
  const emptyState = root.querySelector("[data-di-artifact-empty]");
  const message = root.querySelector("[data-di-local-message]");
  const title = root.querySelector("[data-di-title]");
  const viewportControls = root.querySelector("[data-di-viewport-controls]");
  const reviewToggle = root.querySelector("[data-di-review-toggle]");
  const reviewStatus = root.querySelector("[data-di-review-status]");
  if (!urlInput || !loadButton || !artifactWrap || !emptyState) return;

  const normalizeLocalUrl = (value) => {
    const raw = value.trim();
    if (!raw) return null;
    const candidate = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `http://${raw}`;
    try {
      const url = new URL(candidate);
      const isLocalHost = url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname === "::1";
      const isHttp = url.protocol === "http:" || url.protocol === "https:";
      return isLocalHost && isHttp ? url : null;
    } catch {
      return null;
    }
  };

  const createViewportControls = (surface, panShield) => {
    const controls = viewportControls;
    if (!controls) return;
    controls.replaceChildren();
    controls.hidden = false;

    const modes = [
      ["desktop", "Desktop", '<svg viewBox="0 0 28 20" aria-hidden="true"><rect x="2" y="2" width="24" height="16" rx="1.5"></rect></svg>'],
      ["tablet", "Tablet", '<svg viewBox="0 0 20 24" aria-hidden="true"><rect x="4" y="2" width="12" height="20" rx="1.5"></rect></svg>'],
      ["mobile", "Mobile", '<svg viewBox="0 0 16 24" aria-hidden="true"><rect x="4" y="2" width="8" height="20" rx="1.5"></rect></svg>'],
      ["responsive", "Responsive", '<svg viewBox="0 0 28 20" aria-hidden="true"><path d="M2 5V2h5M21 2h5v3M26 15v3h-5M7 18H2v-3"></path><rect x="8" y="6" width="12" height="8"></rect></svg>'],
    ];

    let mode = "responsive";
    let panX = 0;
    let panY = 0;
    let dragState = null;

    const applyPan = () => {
      if (mode !== "desktop") return;
      const minX = Math.min(0, artifactWrap.clientWidth - surface.offsetWidth);
      const minY = Math.min(0, artifactWrap.clientHeight - surface.offsetHeight);
      panX = Math.max(minX, Math.min(0, panX));
      panY = Math.max(minY, Math.min(0, panY));
      surface.style.transform = `translate3d(${panX}px, ${panY}px, 0)`;
    };

    const setMode = (nextMode) => {
      mode = nextMode;
      artifactWrap.dataset.diViewport = nextMode;
      panX = 0;
      panY = 0;
      surface.style.transform = "translate3d(0, 0, 0)";
      controls.querySelectorAll("button").forEach((button) => {
        const active = button.dataset.diViewportMode === nextMode;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });
      panShield.hidden = nextMode !== "desktop";
      if (nextMode === "desktop") requestAnimationFrame(applyPan);
    };

    modes.forEach(([value, label, icon]) => {
      const button = root.ownerDocument.createElement("button");
      button.type = "button";
      button.dataset.diViewportMode = value;
      button.dataset.tooltip = label;
      button.setAttribute("aria-label", label);
      button.setAttribute("aria-pressed", String(value === "responsive"));
      button.classList.toggle("is-active", value === "responsive");
      button.innerHTML = icon;
      button.addEventListener("click", () => setMode(value));
      controls.append(button);
    });

    panShield.addEventListener("pointerdown", (event) => {
      if (mode !== "desktop") return;
      dragState = { id: event.pointerId, x: event.clientX, y: event.clientY, panX, panY };
      panShield.setPointerCapture(event.pointerId);
      surface.classList.add("is-grabbing");
      event.preventDefault();
    });
    panShield.addEventListener("pointermove", (event) => {
      if (!dragState || dragState.id !== event.pointerId) return;
      panX = dragState.panX + event.clientX - dragState.x;
      panY = dragState.panY + event.clientY - dragState.y;
      applyPan();
    });
    const finishPan = (event) => {
      if (!dragState || dragState.id !== event.pointerId) return;
      dragState = null;
      surface.classList.remove("is-grabbing");
    };
    panShield.addEventListener("pointerup", finishPan);
    panShield.addEventListener("pointercancel", finishPan);
    root.ownerDocument.defaultView.addEventListener("resize", applyPan);

    setMode("responsive");
  };

  const loadLocalEnvironment = () => {
    const url = normalizeLocalUrl(urlInput.value);
    if (!url) {
      if (message) message.textContent = "Use a local address such as http://localhost:5173/.";
      urlInput.setAttribute("aria-invalid", "true");
      urlInput.focus();
      return;
    }

    urlInput.removeAttribute("aria-invalid");
    const frame = root.ownerDocument.createElement("iframe");
    frame.className = "di-v2-artifact-frame";
    frame.title = `Local development environment: ${url.host}`;
    frame.src = url.href;

    const surface = root.ownerDocument.createElement("div");
    surface.className = "di-v2-artifact-surface";
    surface.append(frame);

    const panShield = root.ownerDocument.createElement("div");
    panShield.className = "di-v2-artifact-pan-shield";
    panShield.setAttribute("aria-hidden", "true");
    panShield.hidden = true;
    surface.append(panShield);

    emptyState.replaceWith(surface);
    artifactWrap.classList.remove("di-v2-artifact-wrap--empty");
    artifactWrap.classList.add("di-v2-artifact-wrap--loaded");

    const fallbackTitle = (() => {
      const parts = url.pathname.split("/").filter(Boolean);
      const slug = parts.at(-1);
      if (!slug) return url.host;
      return slug.replace(/[-_]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
    })();
    if (title) title.textContent = fallbackTitle;
    frame.addEventListener("load", () => {
      try {
        const pageTitle = frame.contentDocument?.title?.trim();
        if (pageTitle && title) title.textContent = pageTitle;
      } catch {
        // A different local port is a different browser origin. Keep the readable path fallback.
      }
    });

    createViewportControls(surface, panShield);
    if (reviewToggle) reviewToggle.disabled = false;
  };

  let reviewActive = false;
  const renderReviewState = () => {
    if (!reviewToggle || !reviewStatus) return;
    reviewToggle.textContent = reviewActive ? "Stop Review" : "Start Review";
    reviewToggle.classList.toggle("is-active", reviewActive);
    reviewToggle.setAttribute("aria-pressed", String(reviewActive));
    reviewStatus.hidden = !reviewActive;
    root.dataset.diReviewActive = String(reviewActive);
  };
  reviewToggle?.addEventListener("click", () => {
    if (reviewToggle.disabled) return;
    reviewActive = !reviewActive;
    renderReviewState();
  });
  renderReviewState();

  loadButton.addEventListener("click", loadLocalEnvironment);
  urlInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    loadLocalEnvironment();
  });
}

export function initializeDesignInspectorV2(root, options = {}) {
  if (!root || root.dataset.diInitialized === "true") return root;
  const record = options.record || reviewRecord;
  const state = { selectedCalloutId: record.callouts[0].id, leftOpen: true, rightOpen: true, drawer: null };
  renderWorkspace(root, record);
  initializeTabs(root);
  initializeDates(root);
  initializeCallouts(root, state);
  initializeArtifactLoader(root);
  initializePanels(root, state);
  root.dataset.diInitialized = "true";
  root.designInspectorV2 = Object.freeze({ state });
  return root;
}

export async function mountDesignInspectorV2(options = {}) {
  const slot = options.slot;
  if (!slot?.replaceChildren) return null;
  try {
    const response = await fetch(new URL(options.templateUrl || "./design-inspector.html", import.meta.url));
    if (!response.ok) throw new Error(`Template request failed with ${response.status}`);
    const template = document.createElement("template");
    template.innerHTML = (await response.text()).trim();
    if (template.content.querySelectorAll("[data-design-inspector-v2]").length !== 1) throw new Error("Template must contain one Design Inspector root");
    slot.replaceChildren(template.content.cloneNode(true));
    return initializeDesignInspectorV2(slot.querySelector("[data-design-inspector-v2]"), options);
  } catch (error) {
    slot.dataset.moduleError = "design-inspector-v2";
    console.warn("Design Inspector v2 was not mounted.", error);
    return null;
  }
}
