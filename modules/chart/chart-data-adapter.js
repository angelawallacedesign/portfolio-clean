import { normalizeScatterplotData } from "./scatterplot-data.js";

// The Work page fetches this same JSON file. Resolve against this module, not the host page.
export const productionProjectsUrl = new URL("../../js/data.json", import.meta.url);

export async function loadProductionProjects({ signal, url = productionProjectsUrl } = {}) {
  const response = await fetch(url, { signal, cache: "no-store" });
  if (!response.ok) throw new Error(`Unable to load production projects: ${response.status}`);
  return response.json();
}

export function adaptProjects(projects) {
  if (!Array.isArray(projects)) throw new TypeError("Chart projects must be an array.");
  const ids = new Set();
  return normalizeScatterplotData(projects.map((project, index) => {
    if (!project || typeof project.id !== "string" || !project.id || ids.has(project.id)) {
      throw new TypeError(`Project ${index} needs a unique id.`);
    }
    ids.add(project.id);
    const year = Number(project.year);
    const complexity = Number(project.complexity);
    if (!Number.isFinite(year) || !Number.isInteger(complexity) || complexity < 1 || complexity > 5) {
      throw new TypeError(`Project ${project.id} needs a year and complexity from 1 to 5.`);
    }
    const title = project.heading?.title ?? project.title;
    if (!title) throw new TypeError(`Project ${project.id} needs a title.`);
    return {
      ...project,
      title,
      year,
      complexity,
      opacity: Number.isFinite(Number(project.opacity)) ? Number(project.opacity) : 1,
      category: project.category ?? project.meta?.type ?? "Project",
      description: project.meta?.notes ?? project.description ?? ""
    };
  }));
}
