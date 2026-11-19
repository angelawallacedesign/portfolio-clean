import { renderProjectCard } from "./components.js";

const listRoot = document.getElementById("project-list");
const listPanel = document.querySelector('[data-work-panel="list"]');
const chartMount = document.getElementById("work-chart-mount");
const chartButton = document.querySelector('[data-work-view="chart"]');
const filterButtons = [...document.querySelectorAll("[data-work-filter]")];
const viewButtons = [...document.querySelectorAll("[data-work-view]")];
const localNav = document.querySelector("[data-work-local-nav]");
const stickySentinel = document.querySelector("[data-work-sticky-sentinel]");
const resultStatus = document.querySelector("[data-work-results-status]");

let projects = [];
const requestedFilter = new URLSearchParams(window.location.search).get("filter");
let activeFilter = filterButtons.some((button) => button.dataset.workFilter === requestedFilter)
  ? requestedFilter
  : "all";
let activeView = "list";
let chartInstance = null;
let chartResourcesPromise = null;
let chartRequested = false;
let activationId = 0;

function loadChartResources() {
  if (chartResourcesPromise) return chartResourcesPromise;
  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = new URL("../modules/chart/chart.css", import.meta.url).href;
  const styleReady = new Promise((resolve, reject) => {
    stylesheet.addEventListener("load", resolve, { once: true });
    stylesheet.addEventListener("error", () => {
      stylesheet.remove();
      reject(new Error("Unable to load chart styles."));
    }, { once: true });
  });
  document.head.append(stylesheet);
  chartResourcesPromise = Promise.all([
    import("../modules/chart/index.js"),
    styleReady
  ]).then(([module]) => module).catch((error) => {
    chartResourcesPromise = null;
    throw error;
  });
  return chartResourcesPromise;
}

async function openChart() {
  if (chartRequested) return;
  chartRequested = true;
  const requestId = ++activationId;
  setView("chart");
  try {
    const { createChart } = await loadChartResources();
    if (requestId !== activationId) return;
    chartInstance ??= createChart({
      container: chartMount,
      onClose: () => {
        chartRequested = false;
        ++activationId;
        setView("list");
        chartButton.focus();
      }
    });
    await chartInstance.open();
    if (requestId !== activationId && chartInstance.isOpen) await chartInstance.close();
  } catch (error) {
    if (requestId !== activationId) return;
    console.error("Unable to open chart:", error);
    chartRequested = false;
    ++activationId;
    setView("list");
    chartButton.focus();
    if (resultStatus) resultStatus.textContent = "Chart unavailable. List view restored.";
  }
}

function closeChart() {
  chartRequested = false;
  ++activationId;
  if (chartInstance?.isOpen) chartInstance.close();
  else setView("list");
}

function setFilter(nextFilter) {
  activeFilter = nextFilter;

  filterButtons.forEach((button) => {
    const isActive = button.dataset.workFilter === activeFilter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  const projectCards = [...listRoot.querySelectorAll("[data-project-category]")];
  const includedProjectIds = new Set(
    filterButtons.find((button) => button.dataset.workFilter === activeFilter)?.dataset.projectIds?.split(",") || []
  );
  let visibleCount = 0;

  projectCards.forEach((card) => {
    const isVisible = activeFilter === "all" || card.dataset.projectCategory === activeFilter || includedProjectIds.has(card.dataset.projectId);
    card.hidden = !isVisible;
    if (isVisible) visibleCount += 1;
  });

  if (resultStatus) {
    const label = filterButtons.find((button) => button.dataset.workFilter === activeFilter)?.textContent.trim();
    resultStatus.textContent = `${visibleCount} ${label === "All" ? "projects" : `${label} projects`} shown.`;
  }

  document.querySelectorAll("[data-drawer-work-filter]").forEach((link) => {
    const isActive = link.dataset.drawerWorkFilter === activeFilter;
    if (isActive) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}

function setView(nextView) {
  activeView = nextView;
  listPanel.dataset.visible = "true";

  viewButtons.forEach((button) => {
    const isActive = button.dataset.workView === activeView;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (activeView !== "list") closeChart();
    setFilter(button.dataset.workFilter);
  });
});

viewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.workView === "chart") openChart();
    else closeChart();
  });
});

window.addEventListener("pagehide", () => {
  chartRequested = false;
  ++activationId;
  chartInstance?.destroy();
  chartInstance = null;
});

function setupStickyNavigation() {
  const globalHeader = document.querySelector(".global-header");
  if (!globalHeader || !localNav || !stickySentinel) return;

  let stickyObserver;

  const observeSentinel = () => {
    const headerOffset = Math.round(globalHeader.getBoundingClientRect().height);
    document.documentElement.style.setProperty("--work-global-header-offset", `${headerOffset}px`);

    stickyObserver?.disconnect();
    stickyObserver = new IntersectionObserver(([entry]) => {
      const isStuck = !entry.isIntersecting && entry.boundingClientRect.top < headerOffset;
      localNav.classList.toggle("is-stuck", isStuck);
    }, {
      rootMargin: `-${headerOffset + 1}px 0px 0px 0px`,
      threshold: 0
    });
    stickyObserver.observe(stickySentinel);
  };

  const headerResizeObserver = new ResizeObserver(observeSentinel);
  headerResizeObserver.observe(globalHeader);
  observeSentinel();
}

fetch(new URL("./data.json", import.meta.url))
  .then((response) => {
    if (!response.ok) throw new Error(`Unable to load projects: ${response.status}`);
    return response.json();
  })
  .then((loadedProjects) => {
    projects = loadedProjects;
    listRoot.innerHTML = projects
      .map((project) => renderProjectCard(project, {
        basePath: "../",
        variant: "srvd-work-list",
        buttonLabel: "View Project"
      }))
      .join("");

    setFilter(activeFilter);
  })
  .catch((error) => {
    console.error(error);
    listRoot.setAttribute("data-load-error", "true");
  });

setView(activeView);
setupStickyNavigation();
