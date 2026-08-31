import { renderProjectCard } from "./components.js";

const interfaceProjectIds = [
  "norwegian-iconcierge",
  "AMResorts-multi-platform-app",
  "allin-interactive-material-design-skin",
  "interactive-tv-interface",
  "allin-social-media-feature"
];

const listRoot = document.getElementById("project-list");
const configuredProjectIds = listRoot?.dataset.projectIds
  ?.split(",")
  .map((id) => id.trim())
  .filter(Boolean);
const projectIds = configuredProjectIds?.length
  ? configuredProjectIds
  : interfaceProjectIds;

fetch("../../js/data.json")
  .then((response) => {
    if (!response.ok) throw new Error("Unable to load projects.");
    return response.json();
  })
  .then((projects) => {
    const projectsById = new Map(projects.map((project) => [project.id, project]));
    const selectedProjects = projectIds
      .map((id) => projectsById.get(id))
      .filter(Boolean);

    listRoot.innerHTML = selectedProjects
      .map((project) => renderProjectCard(project, {
        basePath: "../../",
        variant: "archive-list",
        buttonLabel: "View Project"
      }))
      .join("");

    import("./lightbox.js");
  })
  .catch((error) => {
    console.error(error);
    listRoot?.setAttribute("data-load-error", "true");
  });
