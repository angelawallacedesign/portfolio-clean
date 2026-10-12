const CONTENT_URL = new URL("../data/prototype-content.json", import.meta.url);
const REGISTRATION_URL = new URL("../data/surface-registration.json", import.meta.url);

function readPath(source, path) {
  return path.split(".").reduce((value, key) => value?.[key], source);
}

function applyContent(content) {
  document.querySelectorAll("[data-copy]").forEach((element) => {
    const value = readPath(content, element.dataset.copy);

    if (typeof value === "string") {
      element.textContent = value;
    }
  });
}

function applyRegistration(registration) {
  Object.entries(registration.surfaces).forEach(([surfaceName, surface]) => {
    const element = document.getElementById(surface.elementId);

    if (!element) {
      throw new Error(`Registration target not found: ${surface.elementId}`);
    }

    element.dataset.surface = surfaceName;
    element.dataset.mask = surface.clipMask;
    element.dataset.registration = "temporary";
    element.style.setProperty("--local-canvas-width", surface.localCanvas.width);
    element.style.setProperty("--local-canvas-height", surface.localCanvas.height);
  });

  document.documentElement.dataset.registration = registration.status;
}

function initializeDebugControl(content) {
  const shell = document.querySelector(".viewport-shell");
  const control = document.getElementById("debug-surfaces-control");

  control.addEventListener("click", () => {
    const nextValue = shell.dataset.debugSurfaces !== "true";

    shell.dataset.debugSurfaces = String(nextValue);
    control.setAttribute("aria-pressed", String(nextValue));
    control.textContent = nextValue ? content.controls.hideDebug : content.controls.showDebug;
  });
}

async function initializeShell() {
  try {
    const [contentResponse, registrationResponse] = await Promise.all([
      fetch(CONTENT_URL),
      fetch(REGISTRATION_URL)
    ]);

    if (!contentResponse.ok || !registrationResponse.ok) {
      throw new Error("Pass B data request failed.");
    }

    const [content, registration] = await Promise.all([
      contentResponse.json(),
      registrationResponse.json()
    ]);

    applyContent(content);
    applyRegistration(registration);
    initializeDebugControl(content);
    document.documentElement.dataset.content = "ready";
  } catch (error) {
    document.documentElement.dataset.content = "error";
    console.error("DriveOS Pass B data could not be loaded.", error);
  }
}

initializeShell();
