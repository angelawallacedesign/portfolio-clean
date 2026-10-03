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
  const uploadButton = root.querySelector("[data-di-upload-html]");
  const fileInput = root.querySelector("[data-di-html-file]");
  const artifactWrap = root.querySelector("[data-di-artifact-wrap]");
  const emptyState = root.querySelector("[data-di-artifact-empty]");
  const title = root.querySelector("[data-di-title]");
  if (!uploadButton || !fileInput || !artifactWrap || !emptyState) return;

  uploadButton.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", async () => {
    const [file] = fileInput.files || [];
    if (!file) return;

    const isHtml = file.type === "text/html" || /\.html?$/i.test(file.name);
    if (!isHtml) {
      fileInput.value = "";
      return;
    }

    const source = await file.text();
    const frame = root.ownerDocument.createElement("iframe");
    frame.className = "di-v2-artifact-frame";
    frame.title = `Local artifact: ${file.name}`;
    frame.setAttribute("sandbox", "allow-scripts allow-forms allow-modals allow-popups allow-downloads");
    frame.srcdoc = source;

    emptyState.replaceWith(frame);
    artifactWrap.classList.remove("di-v2-artifact-wrap--empty");
    artifactWrap.classList.add("di-v2-artifact-wrap--loaded");
    if (title) title.textContent = file.name.replace(/\.html?$/i, "");
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
