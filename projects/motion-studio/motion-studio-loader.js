export async function mountMotionStudio(options = {}) {
  const slot =
    options.slot ||
    document.querySelector('[data-module-slot="motion-studio"]');

  if (!slot) return null;

  const baseUrl = new URL(
    options.baseUrl || "../../prototypes/motion-studio/",
    document.baseURI
  );

  const htmlUrl = new URL("index.html", baseUrl);
  const scriptUrl = new URL("script.js", baseUrl);

  try {
    const response = await fetch(htmlUrl);

    if (!response.ok) {
      throw new Error(
        `Motion Studio HTML request failed with ${response.status}`
      );
    }

    const source = await response.text();
    const documentSource = new DOMParser().parseFromString(
      source,
      "text/html"
    );

    const fragment = document.createDocumentFragment();

    [...documentSource.body.children].forEach((node) => {
      const clone = node.cloneNode(true);

      clone.querySelectorAll("[src]").forEach((element) => {
        const src = element.getAttribute("src");

        if (src) {
          element.setAttribute("src", new URL(src, baseUrl).href);
        }
      });

      fragment.appendChild(clone);
    });

    slot.replaceChildren(fragment);

    await import(scriptUrl.href);

    delete slot.dataset.moduleError;
    return slot;
  } catch (error) {
    slot.dataset.moduleError = "motion-studio";
    console.warn("Motion Studio was not mounted.", error);
    return null;
  }
}