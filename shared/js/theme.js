const STORAGE_KEY = "awd-theme";
const THEMES = ["default", "dark", "night"];

function normalizeTheme(theme) {
  return THEMES.includes(theme) ? theme : "default";
}

function applyTheme(theme) {
  const nextTheme = normalizeTheme(theme);

  if (nextTheme === "default") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.dataset.theme = nextTheme;
  }

  document
    .querySelectorAll("[data-theme-option]")
    .forEach((control) => {
      const isActive = control.dataset.themeOption === nextTheme;
      control.classList.toggle("is-active", isActive);
      control.setAttribute("aria-pressed", String(isActive));
    });

  localStorage.setItem(STORAGE_KEY, nextTheme);
}

export function initThemeControls() {
  const savedTheme = normalizeTheme(localStorage.getItem(STORAGE_KEY));
  applyTheme(savedTheme);

  document.addEventListener("click", (event) => {
    const control = event.target.closest("[data-theme-option]");
    if (!control) return;

    event.preventDefault();
    applyTheme(control.dataset.themeOption);
  });
}
