import { motion, initializeMotionPreviews } from "./motion.js";
import { components } from "./components.js";
import { initializeIcons } from "../shared/js/createIcon.js";

const rows = document.querySelector("#kit-rows");
const search = document.querySelector("#kit-search");
const kind = document.querySelector("#kit-kind");
const count = document.querySelector("#kit-count");

const previews = {
  primary: '<a class="primary-btn intro" href="../index.html#work">Featured work</a><button class="primary-btn small" type="button">Contact</button>',
  "text-link": '<a class="text-link" href="../index.html#about">LinkedIn Profile ↗</a>',
  cta: '<a class="cta-btn xl" href="../work/">View all projects <span aria-hidden="true">↗</span></a>',
  heading: '<h2 class="section-heading medium"><span class="heading-main">About</span> <span class="heading-accent">me</span></h2>',
  card: '<div class="cards"><article class="card"><h3>DESIGN</h3><ul><li>Visual Design</li><li>Product Design</li><li>Interface Design</li></ul></article></div>',
  icon: '<span class="icon" data-icon="arrow" aria-label="Arrow"></span>',
  control: '<a class="control control--fixed is-bottom-right" href="#top" aria-label="Back to top"><span class="icon" data-icon="arrow" aria-hidden="true"></span></a>',
  theme: '<div class="theme-switcher" aria-label="Color theme"><button class="theme-switcher__button is-active" type="button" aria-pressed="true">AWD</button><button class="theme-switcher__button" type="button" aria-pressed="false">Dark</button><button class="theme-switcher__button" type="button" aria-pressed="false">Night</button></div>',
};

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function link(label, href) {
  const node = element("a", "", label);
  node.href = href;
  return node;
}

function render() {
  const query = search.value.trim().toLowerCase();
  const selectedKind = kind.value;
  const visible = components.filter((item) =>
    (selectedKind === "all" || item.kind === selectedKind) &&
    [item.name, item.id, item.selector, item.source, item.variants].some((value) => value.toLowerCase().includes(query))
  );

  rows.replaceChildren();
  for (const item of visible) {
    const row = element("tr");
    row.id = item.id;

    const identity = element("td");
    identity.append(element("span", "kit-kind", item.kind), element("strong", "kit-name", item.name), element("code", "kit-id", item.id));
    const anchor = link("Link to row", `#${item.id}`);
    anchor.className = "kit-row-link";
    identity.append(anchor);

    const example = element("td");
    if (item.preview === "pattern") {
      example.append(element("p", "kit-pattern-note", "Full-page composition"), link("View on index page ↗", item.live));
    } else {
      const stage = element("div", `kit-preview kit-preview--${item.preview}`);
      stage.innerHTML = previews[item.preview];
      example.append(stage);
    }
    const source = element("p", "kit-source");
    source.append(element("code", "", item.selector), document.createTextNode(` · ${item.source}`));
    example.append(source);
    if (item.preview === "theme") example.append(element("p", "kit-source", "Currently hidden on the portfolio site."));

    const variants = element("td", "kit-variants", item.variants);
    const mapping = element("td");
    if (item.figma) mapping.append(link("Open Figma component ↗", item.figma));
    else mapping.append(element("span", "kit-unmapped", "Unmapped"));
    const review = element("td", "kit-review", item.review);
    row.append(identity, example, variants, mapping, review);
    rows.append(row);
  }
  initializeIcons();
  count.textContent = `${visible.length} of ${components.length} entries`;
}

search.addEventListener("input", render);
kind.addEventListener("change", render);
render();
if (location.hash) {
  requestAnimationFrame(() => document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView());
}

// A separate section preserves the component inventory, filtering and mappings.
for (const item of motion) {
  const row = element("tr");
  row.id = item.id;
  const identity = element("td");
  identity.append(element("span", "kit-kind", "Motion behavior"), element("strong", "kit-name", item.name), element("code", "kit-id", item.id), element("p", "", item.description), link("Link to row", `#${item.id}`));
  const example = element("td");
  const stage = element("div", "kit-preview kit-preview--motion");
  stage.innerHTML = item.preview;
  const source = element("p", "kit-source");
  source.append(element("code", "", item.selector), document.createTextNode(" · "), link(item.source.slice(3), item.source));
  if (item.css) source.append(document.createTextNode(" · "), link(item.css.slice(3), item.css));
  example.append(stage, source);
  const specs = element("td");
  const list = element("dl", "kit-motion-specs");
  for (const [label, value] of item.specs) list.append(element("dt", "", label), element("dd", "", value));
  specs.append(list);
  row.append(identity, example, specs);
  document.querySelector("#kit-motion-rows").append(row);
}
initializeMotionPreviews();
