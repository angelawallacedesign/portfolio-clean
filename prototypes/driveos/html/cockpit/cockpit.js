const CONTENT_URL = new URL("../data/prototype-content.json", import.meta.url);

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

async function initializeShell() {
  try {
    const response = await fetch(CONTENT_URL);

    if (!response.ok) {
      throw new Error(`Content request failed with ${response.status}`);
    }

    applyContent(await response.json());
    document.documentElement.dataset.content = "ready";
  } catch (error) {
    document.documentElement.dataset.content = "error";
    console.error("DriveOS Pass A content could not be loaded.", error);
  }
}

initializeShell();
