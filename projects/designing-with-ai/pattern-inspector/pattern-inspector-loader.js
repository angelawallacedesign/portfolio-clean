console.log(
    '%c[Pattern Inspector Loader] module file evaluated',
    'background:#111;color:#7cffb2;padding:4px 8px;font-weight:bold;'
);

export async function mountPatternInspector(options = {}) {
  const slot = options.slot || document.querySelector('[data-module-slot="pattern-inspector"]');

  if (!slot) {
    return null;
  }

  const baseUrl = new URL(options.baseUrl || "./", document.baseURI);
  const htmlUrl = new URL("pattern-inspector.html", baseUrl);
  const scriptUrl = new URL("pattern-inspector.js", baseUrl);
  let previousContent;

  try {
    const response = await fetch(htmlUrl);

    if (!response.ok) {
      throw new Error(`Pattern Inspector HTML request failed with ${response.status}`);
    }

    const template = document.createElement("template");
    template.innerHTML = (await response.text()).trim();

    if (template.content.querySelectorAll("[data-pattern-inspector]").length !== 1) {
      throw new Error("Pattern Inspector partial must contain exactly one module root");
    }

    previousContent = document.createDocumentFragment();

    while (slot.firstChild) {
      previousContent.appendChild(slot.firstChild);
    }

    slot.appendChild(template.content.cloneNode(true));

    const root = slot.querySelector("[data-pattern-inspector]");
    const module = await import(scriptUrl.href);

    if (!root || typeof module.initPatternInspector !== "function") {
      throw new Error("Pattern Inspector module could not be initialized");
    }

    module.initPatternInspector(root);
    delete slot.dataset.moduleError;
    return root;
  } catch (error) {
    if (previousContent) {
      slot.replaceChildren(previousContent);
    }

    slot.dataset.moduleError = "pattern-inspector";
    console.warn("Pattern Inspector was not mounted.", error);
    return null;
  }
}

