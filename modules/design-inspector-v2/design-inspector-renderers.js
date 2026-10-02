function node(document, tag, { className, text, attributes = {} } = {}) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
  return element;
}

function sourceInfo(document, record, update = false) {
  const wrapper = node(document, "div", { className: "di-v2-source" });
  [["UI Kit", record.uiKit], ["Repo", record.repo], ["Build", record.build]].forEach(([label, value]) => {
    const row = node(document, "div");
    row.append(node(document, "span", { text: label }));
    const content = node(document, label === "Build" ? "a" : "strong", { text: value, attributes: label === "Build" ? { href: "#current-build" } : {} });
    if (update && label === "Build") content.append(node(document, "small", { text: " (update available)" }));
    row.append(content);
    wrapper.append(row);
  });
  return wrapper;
}

export function renderDateNavigation(root, record) {
  const document = root.ownerDocument;
  const nav = root.querySelector("[data-di-date-navigation]");
  const months = [
    { label: "August 2026", open: false },
    { label: "September 2026", open: false },
    { label: "October 2026", open: true },
  ];
  const fragment = document.createDocumentFragment();
  months.forEach((month) => {
    const section = node(document, "section", { className: "di-v2-month" });
    const id = `di-month-${month.label.toLowerCase().replace(/\s/g, "-")}`;
    const button = node(document, "button", { attributes: { type: "button", "aria-expanded": month.open, "aria-controls": id } });
    button.append(node(document, "span", { className: "di-v2-chevron", text: "⌄", attributes: { "aria-hidden": "true" } }), node(document, "span", { text: month.label }));
    const panel = node(document, "div", { className: "di-v2-month__content", attributes: { id } });
    panel.hidden = !month.open;
    if (month.open) panel.append(sourceInfo(document, record), sourceInfo(document, record, true));
    section.append(button, panel);
    fragment.append(section);
  });
  nav.replaceChildren(fragment);
}

export function renderStage(root, record) {
  const document = root.ownerDocument;
  root.querySelector("[data-di-title]").textContent = record.name;
  root.querySelector("[data-di-breadcrumb]").textContent = record.breadcrumb;
  root.querySelector("[data-di-review-state]").textContent = record.reviewState;
  root.querySelector("[data-di-artifact]").src = record.image;
  const layer = root.querySelector("[data-di-stage-callouts]");
  const fragment = document.createDocumentFragment();
  record.callouts.forEach((callout) => {
    const marker = node(document, "button", {
      className: `di-v2-callout di-v2-callout--${callout.tone}`,
      text: callout.number,
      attributes: { type: "button", "aria-label": `Open callout ${callout.number}: ${callout.message}`, "aria-label": `Select callout ${callout.number}: ${callout.message}`, "aria-pressed": "false", "data-di-callout": callout.id },
    });
    marker.style.left = `${callout.x}%`;
    marker.style.top = `${callout.y}%`;
    fragment.append(marker);
  });
  layer.replaceChildren(fragment);
}

function renderReplies(document, callout) {
  const details = node(document, "details", { className: "di-v2-replies" });
  details.append(node(document, "summary", { text: `${callout.replies.length} ${callout.replies.length === 1 ? "reply" : "replies"}` }));
  callout.replies.forEach((reply) => {
    const article = node(document, "article");
    article.append(node(document, "p", { text: reply.message }), node(document, "small", { text: `${reply.author} · ${reply.timestamp}` }));
    details.append(article);
  });
  return details;
}

export function renderReview(root, record) {
  const document = root.ownerDocument;
  const list = root.querySelector("[data-di-callout-list]");
  const fragment = document.createDocumentFragment();
  record.callouts.forEach((callout) => {
    const item = node(document, "li");
    const button = node(document, "button", {
      className: "di-v2-callout-card",
      attributes: { type: "button", "aria-pressed": "false", "data-di-callout": callout.id },
    });
    button.append(node(document, "span", { className: `di-v2-callout di-v2-callout--${callout.tone}`, text: callout.number, attributes: { "aria-hidden": "true" } }));
    const bubble = node(document, "span", { className: "di-v2-bubble", text: callout.message });
    const meta = node(document, "span", { className: "di-v2-callout-meta", text: `${callout.author}                                      ${callout.timestamp}` });
    button.append(bubble, meta);
    item.append(button, renderReplies(document, callout));
    fragment.append(item);
  });
  list.replaceChildren(fragment);

  const history = root.querySelector("[data-di-history-list]");
  history.replaceChildren(...record.history.map((entry) => {
    const item = node(document, "li");
    item.append(node(document, "time", { text: entry.time }), node(document, "strong", { text: entry.title }), node(document, "p", { text: entry.detail }));
    return item;
  }));
}

export function renderSelection(root, calloutId) {
  root.querySelectorAll("[data-di-callout]").forEach((element) => {
    const selected = element.dataset.diCallout === calloutId;
    element.classList.toggle("is-selected", selected);
    element.setAttribute("aria-pressed", String(selected));
  });
}

export function renderWorkspace(root, record) {
  renderDateNavigation(root, record);
  renderStage(root, record);
  renderReview(root, record);
  renderSelection(root, record.callouts[0].id);
}
