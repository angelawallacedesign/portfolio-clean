import { renderProjectCard } from "./components.js";

const listRoot = document.getElementById("project-list");
const listPanel = document.querySelector('[data-work-panel="list"]');
const chartPanel = document.querySelector('[data-work-panel="chart"]');
const filterButtons = [...document.querySelectorAll("[data-work-filter]")];
const viewButtons = [...document.querySelectorAll("[data-work-view]")];
const localNav = document.querySelector("[data-work-local-nav]");
const stickySentinel = document.querySelector("[data-work-sticky-sentinel]");
const resultStatus = document.querySelector("[data-work-results-status]");

let projects = [];
let activeFilter = "all";
let activeView = "list";

function setFilter(nextFilter) {
  activeFilter = nextFilter;

  filterButtons.forEach((button) => {
    const isActive = button.dataset.workFilter === activeFilter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  const projectCards = [...listRoot.querySelectorAll("[data-project-category]")];
  let visibleCount = 0;

  projectCards.forEach((card) => {
    const isVisible = activeFilter === "all" || card.dataset.projectCategory === activeFilter;
    card.hidden = !isVisible;
    if (isVisible) visibleCount += 1;
  });

  if (resultStatus) {
    const label = filterButtons.find((button) => button.dataset.workFilter === activeFilter)?.textContent.trim();
    resultStatus.textContent = `${visibleCount} ${label === "All" ? "projects" : `${label} projects`} shown.`;
  }
}

function setView(nextView) {
  activeView = nextView;
  const showList = activeView === "list";

  listPanel.dataset.visible = String(showList);
  chartPanel.dataset.visible = String(!showList);

  viewButtons.forEach((button) => {
    const isActive = button.dataset.workView === activeView;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  if (!showList) {
    requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
  }
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (activeView !== "list") setView("list");
    setFilter(button.dataset.workFilter);
  });
});

viewButtons.forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.workView));
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
