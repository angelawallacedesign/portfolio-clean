const PROTOTYPE_VERSIONS = [
  {
    id: "pass-c-redesign",
    label: "Pass C — Redesign",
    href: "../html/"
  },
  {
    id: "pass-c-initial",
    label: "Pass C — Initial",
    href: "../html_pass-C_v1/"
  }
];

function createVersionNavigation(root, index) {
  const currentId = root.dataset.prototypeVersion;
  const currentVersion = PROTOTYPE_VERSIONS.find((version) => version.id === currentId);

  if (!currentVersion) {
    console.error(`Unknown DriveOS prototype version: ${currentId}`);
    return;
  }

  const triggerId = `prototype-version-trigger-${index}`;
  const menuId = `prototype-version-menu-${index}`;
  const trigger = document.createElement("button");
  const menu = document.createElement("ul");

  trigger.className = "prototype-version-trigger";
  trigger.type = "button";
  trigger.id = triggerId;
  trigger.setAttribute("aria-expanded", "false");
  trigger.setAttribute("aria-haspopup", "menu");
  trigger.setAttribute("aria-controls", menuId);
  trigger.innerHTML = `<span>${currentVersion.label}</span><span class="prototype-version-chevron" aria-hidden="true"></span>`;

  menu.className = "prototype-version-menu";
  menu.id = menuId;
  menu.setAttribute("role", "menu");
  menu.setAttribute("aria-labelledby", triggerId);
  menu.hidden = true;

  PROTOTYPE_VERSIONS.forEach((version) => {
    const item = document.createElement("li");
    const link = document.createElement("a");

    item.setAttribute("role", "none");
    link.href = version.href;
    link.textContent = version.label;
    link.setAttribute("role", "menuitem");
    link.tabIndex = -1;

    if (version.id === currentId) {
      link.className = "is-current";
      link.setAttribute("aria-current", "page");
    }

    item.append(link);
    menu.append(item);
  });

  root.replaceChildren(trigger, menu);

  const menuItems = [...menu.querySelectorAll('[role="menuitem"]')];

  function closeMenu({ restoreFocus = false } = {}) {
    menu.hidden = true;
    trigger.setAttribute("aria-expanded", "false");

    if (restoreFocus) {
      trigger.focus();
    }
  }

  function openMenu({ focus = "current" } = {}) {
    menu.hidden = false;
    trigger.setAttribute("aria-expanded", "true");

    const target = focus === "last"
      ? menuItems.at(-1)
      : menu.querySelector('[aria-current="page"]') || menuItems[0];

    target?.focus();
  }

  trigger.addEventListener("click", () => {
    if (menu.hidden) {
      openMenu();
    } else {
      closeMenu();
    }
  });

  trigger.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      openMenu();
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      openMenu({ focus: "last" });
    }
  });

  menu.addEventListener("keydown", (event) => {
    const currentIndex = menuItems.indexOf(document.activeElement);
    let nextIndex = currentIndex;

    if (event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % menuItems.length;
    } else if (event.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + menuItems.length) % menuItems.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = menuItems.length - 1;
    } else if (event.key === "Escape") {
      event.preventDefault();
      closeMenu({ restoreFocus: true });
      return;
    } else if (event.key === "Tab") {
      closeMenu();
      return;
    } else {
      return;
    }

    event.preventDefault();
    menuItems[nextIndex]?.focus();
  });

  document.addEventListener("pointerdown", (event) => {
    if (!root.contains(event.target)) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !menu.hidden) {
      event.preventDefault();
      closeMenu({ restoreFocus: true });
    }
  });
}

document.querySelectorAll("[data-prototype-version]").forEach(createVersionNavigation);
