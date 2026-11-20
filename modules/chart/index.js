import { createScatterplot } from "./scatterplot.js";
import { adaptProjects, loadProductionProjects } from "./chart-data-adapter.js";
import { createScrollLock } from "./chart-scroll-lock.js";
import { positionPanelNearAnchor, waitForStableRect } from "./shared/visualization-utils.js";
import { calculateTriangleConnector, renderTriangleConnector, createSvgElement } from "./shared/svg-utils.js";

const FRAME_DURATION = 750;

export function createChart({ container, projects, onClose, onNavigate, projectBaseUrl = new URL("../../", import.meta.url) } = {}) {
  const host = typeof container === "string" ? document.querySelector(container) : container;
  if (!(host instanceof Element)) throw new TypeError("Chart needs a container element.");
  const lock = createScrollLock();
  let root = null;
  let scatterplot = null;
  let active = false;
  let destroyed = false;
  let controller = null;
  let currentProjects = [];
  let previousFocus = null;
  let selectedAnchor = null;
  let raf = 0;
  let timer = 0;
  let finishOpen = null;
  let cleanupCardLayout = null;
  let closingPromise = null;

  function clearMotion() {
    cancelAnimationFrame(raf);
    clearTimeout(timer);
    finishOpen?.();
    finishOpen = null;
    root?.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());
  }

  function closeCard() {
    cleanupCardLayout?.();
    cleanupCardLayout = null;
    selectedAnchor = null;
    root?.querySelector(".chart-module__card-layer")?.replaceChildren();
  }

  function showCard(project, anchor) {
    closeCard();
    selectedAnchor = anchor;
    const currentAnchor = () => anchor.isConnected ? anchor : scatterplot?.dots.get(project.id)?.element;
    const layer = root.querySelector(".chart-module__card-layer");
    const overlay = document.createElement("div");
    overlay.className = "chart-module__card-overlay";
    const close = document.createElement("button");
    close.type = "button";
    close.className = "chart-module__card-close";
    close.textContent = "×";
    close.setAttribute("aria-label", "Close project details");
    const card = document.createElement("div");
    card.className = "chart-module__card overlay__panel";
    card.setAttribute("role", "dialog");
    const grid = document.createElement("div");
    grid.className = "overlay__grid";
    const mediaColumn = document.createElement("div");
    mediaColumn.className = "overlay__col overlay__col--left";
    const mediaSlot = document.createElement("div");
    mediaSlot.className = "media-slot";
    mediaSlot.setAttribute("aria-label", "Overlay media");
    const imageUrl = project.meta?.imageUrl;
    if (imageUrl) {
      const img = document.createElement("img");
      img.src = new URL(imageUrl, projectBaseUrl).href;
      img.alt = project.meta?.caption ?? `${project.title} cover image`;
      mediaSlot.append(img);
    }
    mediaColumn.append(mediaSlot);
    const content = document.createElement("article");
    content.className = "overlay__col chart-module__card-content";
    const header = document.createElement("header");
    const title = document.createElement("h2");
    title.className = "section-heading";
    title.id = `chart-card-heading-${project.id}`;
    const main = document.createElement("span");
    main.className = "heading-main";
    main.textContent = project.heading?.main ?? project.title;
    title.append(main);
    if (project.heading?.accent) {
      const accent = document.createElement("span");
      accent.className = "heading-accent";
      accent.textContent = project.heading.accent;
      title.append(accent);
    }
    card.setAttribute("aria-labelledby", title.id);
    header.append(title);
    const details = document.createElement("dl");
    const roleLabel = document.createElement("dt");
    roleLabel.textContent = "ROLE";
    const role = document.createElement("dd");
    role.textContent = project.meta?.role ?? "";
    const solutionLabel = document.createElement("dt");
    solutionLabel.textContent = "SOLUTION";
    const solution = document.createElement("dd");
    solution.className = "scroll-notes";
    solution.textContent = project.meta?.notes ?? "";
    details.append(roleLabel, role, solutionLabel, solution);
    content.append(header, details);
    const destination = project.projectUrl ?? project.htmlInclude;
    if (destination) {
      const link = document.createElement("a");
      link.className = "primary-btn small";
      link.href = new URL(destination, projectBaseUrl).href;
      link.textContent = project.hasCaseStudy ? "View Case Study" : "View Project";
      link.addEventListener("click", (event) => {
        if (onNavigate) {
          event.preventDefault();
          onNavigate(project, link.href);
        }
      });
      content.append(link);
    }
    grid.append(mediaColumn, content);
    card.append(grid);
    const triangle = createSvgElement("svg", { class: "chart-module__triangle", "aria-hidden": "true" });
    overlay.append(close, card, triangle);
    layer.append(overlay);
    function positionCloseButton() {
      const chartClose = root?.querySelector(".chart-module__close");
      if (!chartClose) return;
      const source = chartClose.getBoundingClientRect();
      const target = close.getBoundingClientRect();
      close.style.left = `${source.left + source.width / 2 - target.width / 2}px`;
      close.style.top = `${source.top + source.height / 2 - target.height / 2}px`;
    }
    positionCloseButton();
    close.addEventListener("click", () => { const target = currentAnchor(); closeCard(); target?.focus(); });
    overlay.addEventListener("click", (event) => { if (event.target === overlay) closeCard(); });
    let disposed = false;
    let layoutFrame = 0;
    let finishTriangle = null;
    const observer = new ResizeObserver(() => scheduleLayout());
    function layout() {
      layoutFrame = 0;
      if (disposed) return;
      positionCloseButton();
      const node = currentAnchor();
      if (!node?.isConnected) return;
      selectedAnchor = node;
      positionPanelNearAnchor(node, { overlay, panel: card, insets: { top: 105, side: 100 } });
      const panelRect = card.getBoundingClientRect();
      if (!panelRect.width || !panelRect.height) return;
      const connector = calculateTriangleConnector({
        nodeRect: node.getBoundingClientRect(), panelRect,
        overlayRect: overlay.getBoundingClientRect()
      });
      renderTriangleConnector(triangle, connector, "var(--chart-triangle, #141414)");
    }
    function scheduleLayout() {
      if (!disposed && !layoutFrame) layoutFrame = requestAnimationFrame(layout);
    }
    cleanupCardLayout = () => {
      disposed = true;
      cancelAnimationFrame(layoutFrame);
      finishTriangle?.();
      observer.disconnect();
      window.removeEventListener("resize", scheduleLayout);
      root?.querySelector(".chart-module__stage")?.removeEventListener("scroll", scheduleLayout);
    };
    observer.observe(card);
    observer.observe(overlay);
    window.addEventListener("resize", scheduleLayout);
    root.querySelector(".chart-module__stage").addEventListener("scroll", scheduleLayout);
    (async () => {
      const image = card.querySelector("img");
      if (image && !image.complete) {
        await new Promise((resolve) => {
          image.addEventListener("load", resolve, { once: true });
          image.addEventListener("error", resolve, { once: true });
        });
      }
      if (disposed) return;
      await waitForStableRect(card);
      if (disposed) return;
      layout();
      // Establish the hidden style before starting both CSS transitions.
      getComputedStyle(triangle).opacity;
      await new Promise((resolve) => requestAnimationFrame(resolve));
      if (disposed) return;
      await new Promise((resolve) => {
        const running = new Set();
        let settled = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          triangle.removeEventListener("transitionrun", onRun);
          triangle.removeEventListener("transitionend", onDone);
          triangle.removeEventListener("transitioncancel", onDone);
          finishTriangle = null;
          resolve();
        };
        const onRun = (event) => {
          if (event.target === triangle) running.add(event.propertyName);
        };
        const onDone = (event) => {
          if (event.target !== triangle) return;
          running.delete(event.propertyName);
          if (!running.size) finish();
        };
        finishTriangle = finish;
        triangle.addEventListener("transitionrun", onRun);
        triangle.addEventListener("transitionend", onDone);
        triangle.addEventListener("transitioncancel", onDone);
        triangle.classList.add("is-visible");
        // A transition-free element (reduced motion or mobile) produces no run events.
        requestAnimationFrame(() => requestAnimationFrame(() => {
          if (!running.size) finish();
        }));
      });
      if (disposed) return;
      layout();
      card.classList.add("is-visible");
    })();
    close.focus();
  }

  function handleKeydown(event) {
    if (event.key !== "Escape") return;
    event.stopPropagation();
    if (selectedAnchor) { const anchor = selectedAnchor; closeCard(); anchor.focus(); }
    else close();
  }

  async function open() {
    if (destroyed) throw new Error("Chart has been destroyed.");
    if (closingPromise) await closingPromise;
    if (destroyed) throw new Error("Chart has been destroyed.");
    if (active) return;
    controller = new AbortController();
    const signal = controller.signal;
    try {
      const source = typeof projects === "function" ? await projects() : projects ?? await loadProductionProjects({ signal });
      if (signal.aborted) return;
      currentProjects = adaptProjects(source);
      lock.lock();
      previousFocus = document.activeElement;
      root = document.createElement("section");
      root.className = "chart-module";
      root.setAttribute("role", "dialog");
      root.setAttribute("aria-modal", "true");
      root.setAttribute("aria-label", "Project visualization chart");
      root.innerHTML = `<div class="chart-module__frame"></div><div class="chart-module__stage"><button type="button" class="chart-module__close" aria-label="Close chart">×</button><div class="chart-module__content"><div class="chart-module__plot"></div><div class="chart-module__bottom"><p>Projects by year and complexity. Select a point for details.</p><h1>Design work timeline</h1></div></div></div><div class="chart-module__card-layer"></div>`;
      host.append(root);
      scatterplot = createScatterplot({
        container: root.querySelector(".chart-module__plot"), data: currentProjects,
        options: { onNodeClick: (project, context) => showCard(project, context.element) }
      });
      root.querySelector(".chart-module__close").addEventListener("click", close);
      document.addEventListener("keydown", handleKeydown);
      active = true;
      raf = requestAnimationFrame(() => root?.classList.add("is-open"));
      root.querySelector(".chart-module__close").focus();
      await new Promise((resolve) => {
        finishOpen = resolve;
        timer = setTimeout(() => { finishOpen = null; resolve(); }, FRAME_DURATION);
      });
    } catch (error) {
      close();
      throw error;
    }
  }

  async function close({ immediate = false } = {}) {
    controller?.abort();
    controller = null;
    if (closingPromise) return closingPromise;
    if (!active) return;
    active = false;
    clearMotion();
    closeCard();
    document.removeEventListener("keydown", handleKeydown);
    const closingRoot = root;
    closingPromise = (async () => {
      if (!immediate && closingRoot?.classList.contains("is-open")) {
        await new Promise((resolve) => {
          let finished = false;
          const done = () => {
            if (finished) return;
            finished = true;
            closingRoot.removeEventListener("transitionend", onEnd);
            resolve();
          };
          const onEnd = (event) => {
            if (event.target === closingRoot && event.propertyName === "opacity") done();
          };
          closingRoot.addEventListener("transitionend", onEnd);
          closingRoot.classList.remove("is-open");
          requestAnimationFrame(() => requestAnimationFrame(() => {
            if (getComputedStyle(closingRoot).transitionDuration === "0s" || getComputedStyle(closingRoot).opacity === "0") done();
          }));
        });
      }
      scatterplot?.destroy();
      scatterplot = null;
      closingRoot?.remove();
      root = null;
      lock.unlock();
      previousFocus?.focus?.();
      onClose?.();
      closingPromise = null;
    })();
    return closingPromise;
  }

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    close({ immediate: true });
  }

  return { open, close, destroy, get isOpen() { return active; }, get element() { return root; }, get projects() { return [...currentProjects]; } };
}
