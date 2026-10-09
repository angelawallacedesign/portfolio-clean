const moduleUrl = new URL("./", import.meta.url);
const componentUrl = new URL("component.html", moduleUrl);
const stylesheetUrl = new URL("motion-studio-hero.css", moduleUrl);

let componentPromise;

function loadStylesheet() {
  const existing = [...document.querySelectorAll('link[rel~="stylesheet"]')]
    .find((link) => link.href === stylesheetUrl.href);

  if (existing) {
    existing.dataset.motionStudioHeroStyles = "";
    return;
  }

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = stylesheetUrl.href;
  link.dataset.motionStudioHeroStyles = "";
  document.head.appendChild(link);
}

function resolveComponentAssets(fragment) {
  fragment.querySelectorAll("[src]").forEach((element) => {
    const src = element.getAttribute("src");

    if (src) {
      element.setAttribute("src", new URL(src, componentUrl).href);
    }
  });

  return fragment;
}

async function loadComponent() {
  if (!componentPromise) {
    componentPromise = fetch(componentUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Motion Studio hero request failed with ${response.status}`);
        }

        return response.text();
      })
      .then((source) => {
        const template = document.createElement("template");
        template.innerHTML = source.trim();
        return resolveComponentAssets(template.content);
      });
  }

  return componentPromise;
}

export async function mountMotionStudioHero(root = document) {
  const selector = '[data-hero-slot="motion-studio-hero"]';
  const slots = [
    ...(root.matches?.(selector) ? [root] : []),
    ...root.querySelectorAll(selector),
  ].filter((slot) => !slot.dataset.motionStudioHeroState);

  if (!slots.length) return [];

  slots.forEach((slot) => {
    slot.dataset.motionStudioHeroState = "loading";
  });

  loadStylesheet();

  try {
    const component = await loadComponent();

    slots.forEach((slot) => {
      slot.replaceChildren(component.cloneNode(true));
      slot.dataset.motionStudioHeroState = "mounted";
      delete slot.dataset.motionStudioHeroError;
    });
  } catch (error) {
    slots.forEach((slot) => {
      delete slot.dataset.motionStudioHeroState;
      slot.dataset.motionStudioHeroError = "true";
    });
    console.warn("Motion Studio hero was not mounted.", error);
  }

  return slots;
}
