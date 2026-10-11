import { createIcon } from "../shared/js/createIcon.js";

const MOBILE_QUERY = "(max-width: 768px)";
const drawerRoot = document.querySelector("[data-navigation-drawer]");
const trigger = document.querySelector("[data-navigation-drawer-trigger]");

if (drawerRoot && trigger) {
  const panel = drawerRoot.querySelector("[data-navigation-drawer-panel]");
  const closeButton = drawerRoot.querySelector("[data-navigation-drawer-close]");
  const backdrop = drawerRoot.querySelector("[data-navigation-drawer-backdrop]");
  const workToggle = drawerRoot.querySelector("[data-navigation-drawer-work-toggle]");
  const workLinks = drawerRoot.querySelector("[data-navigation-drawer-work-links]");
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobileQuery = window.matchMedia(MOBILE_QUERY);
  let closeTimer;
  let lastFocusedElement;

  [
    [trigger, "menu"],
    [closeButton, "close"],
    [workToggle, "chevron"],
  ].forEach(([control, iconName]) => {
    const iconSlot = control?.querySelector("[data-navigation-drawer-icon]");
    const icon = createIcon(iconName, 24);
    if (iconSlot && icon) iconSlot.appendChild(icon);
  });

  const getFocusableElements = () => [
    ...panel.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ),
  ].filter((element) => !element.hidden && element.getClientRects().length > 0);

  const finishClose = () => {
    drawerRoot.hidden = true;
    drawerRoot.setAttribute("aria-hidden", "true");
  };

  const closeDrawer = ({ restoreFocus = true } = {}) => {
    if (drawerRoot.hidden) return;

    window.clearTimeout(closeTimer);
    drawerRoot.classList.remove("is-open");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-label", "Open navigation menu");
    document.body.classList.remove("has-navigation-drawer-open");

    if (motionQuery.matches) finishClose();
    else closeTimer = window.setTimeout(finishClose, 260);

    if (restoreFocus && lastFocusedElement?.isConnected) {
      lastFocusedElement.focus();
    }
  };

  const openDrawer = () => {
    window.clearTimeout(closeTimer);
    lastFocusedElement = document.activeElement;
    drawerRoot.hidden = false;
    drawerRoot.setAttribute("aria-hidden", "false");
    document.body.classList.add("has-navigation-drawer-open");
    trigger.setAttribute("aria-expanded", "true");
    trigger.setAttribute("aria-label", "Close navigation menu");

    requestAnimationFrame(() => {
      drawerRoot.classList.add("is-open");
      closeButton.focus();
    });
  };

  const toggleWorkLinks = () => {
    const isExpanded = workToggle.getAttribute("aria-expanded") === "true";
    workToggle.setAttribute("aria-expanded", String(!isExpanded));
    workToggle.setAttribute(
      "aria-label",
      `${isExpanded ? "Expand" : "Collapse"} Work categories`
    );
    workLinks.hidden = isExpanded;
  };

  trigger.addEventListener("click", () => {
    if (drawerRoot.hidden) openDrawer();
    else closeDrawer();
  });
  closeButton.addEventListener("click", () => closeDrawer());
  backdrop.addEventListener("click", () => closeDrawer());
  workToggle.addEventListener("click", toggleWorkLinks);

  drawerRoot.addEventListener("click", (event) => {
    if (event.target.closest("a[href]")) closeDrawer({ restoreFocus: false });
  });

  drawerRoot.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeDrawer();
      return;
    }

    if (event.key !== "Tab") return;
    const focusableElements = getFocusableElements();
    if (!focusableElements.length) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements.at(-1);
    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  });

  mobileQuery.addEventListener("change", (event) => {
    if (!event.matches) closeDrawer({ restoreFocus: false });
  });
}
