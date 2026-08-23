console.log(
    '%c[Pattern Inspector] module file evaluated',
    'background:#111;color:#72b7ff;padding:4px 8px;font-weight:bold;'
);

var categoryLabels = {
  token: "Token",
  state: "State",
  a11y: "Accessibility",
  class: "Class",
};

function annotation(id, label, placement, token, state, a11y, className) {
  return {
    id: id,
    label: label,
    placement: placement,
    details: {
      token: token,
      state: state,
      a11y: a11y,
      class: className,
    },
  };
}

var patterns = [
  {
    id: "cta-banner",
    name: "CTA Banner",
    markup:
      '<article class="cta-banner" aria-labelledby="pattern-inspector-cta-title" data-annotation-anchor="background">' +
        '<div class="annotation-target cta-banner__target" data-annotation-anchor="eyebrow">' +
          '<p class="cta-banner__eyebrow">Eyebrow Optional</p>' +
        '</div>' +
        '<div class="annotation-target cta-banner__target cta-banner__target--title" data-annotation-anchor="headline">' +
          '<h2 class="cta-banner__title" id="pattern-inspector-cta-title">Here is a headline that<br>spans two lines</h2>' +
        '</div>' +
        '<div class="annotation-target cta-banner__target" data-annotation-anchor="description">' +
          '<p class="cta-banner__description">Here is a description with two lines max in a sentence case<br>text transform.</p>' +
        '</div>' +
        '<div class="cta-banner__actions">' +
          '<div class="annotation-target cta-banner__action-target cta-banner__action-target--button" data-annotation-anchor="button">' +
            '<button class="cta-banner__button" type="button">CTA Button</button>' +
          '</div>' +
          '<div class="annotation-target cta-banner__action-target cta-banner__action-target--link" data-annotation-anchor="link">' +
            '<a class="cta-banner__link" href="#pattern-inspector-cta-title">Text Link</a>' +
          '</div>' +
        '</div>' +
      '</article>',
    annotations: [
      annotation("background", "Background Color", "inside-top-right", "--color-surface-raised", "Default surface", "Contrast preserves legibility", ".cta-banner"),
      annotation("headline", "Headline", "cta-title", "--color-text-primary", "Required content", "Programmatic heading", ".cta-banner__title"),
      annotation("description", "Description", "edge-left", "--color-text-muted", "Supporting content", "Readable supporting text", ".cta-banner__description"),
      annotation("button", "CTA Button", "edge-left", "--color-surface-inverse", "Primary action", "Native button semantics", ".cta-banner__button"),
      annotation("link", "Text Link", "edge-right", "--color-text-primary", "Secondary action", "Descriptive link text", ".cta-banner__link"),
      annotation("eyebrow", "Eyebrow", "edge-left", "--color-text-muted", "Optional content", "Precedes the heading", ".cta-banner__eyebrow"),
    ],
  },
  {
    id: "status-card",
    name: "Status Card",
    markup:
      '<article class="inspection-pattern status-card" aria-labelledby="pattern-inspector-status-card-title">' +
        '<div class="annotation-target status-card__target" data-annotation-anchor="status">' +
          '<p class="status-card__eyebrow">Plan status</p>' +
        '</div>' +
        '<div class="annotation-target status-card__target" data-annotation-anchor="title">' +
          '<h2 class="status-card__title" id="pattern-inspector-status-card-title">Coverage active</h2>' +
        '</div>' +
        '<div class="annotation-target status-card__target" data-annotation-anchor="metadata">' +
          '<p class="status-card__meta">Renewal confirmed</p>' +
        '</div>' +
        '<div class="annotation-target status-card__target status-card__target--action" data-annotation-anchor="action">' +
          '<button class="status-card__button" type="button">Manage plan</button>' +
        '</div>' +
      '</article>',
    annotations: [
      annotation("status", "Status Label", "edge-left", "--color-text-muted", "Current plan context", "Visible text precedes color", ".status-card__eyebrow"),
      annotation("title", "Status Title", "edge-right", "--color-text-primary", "Active coverage state", "Structured heading", ".status-card__title"),
      annotation("metadata", "Metadata", "edge-left", "--color-text-muted", "Renewal confirmation", "State remains readable in text", ".status-card__meta"),
      annotation("action", "Manage Action", "edge-right", "--color-surface-inverse", "Available next action", "Native button semantics", ".status-card__button"),
    ],
  },
  {
    id: "button-group",
    name: "Button Group",
    markup:
      '<article class="inspection-pattern button-group" aria-label="Button group pattern">' +
        '<div class="button-group__actions">' +
          '<div class="annotation-target" data-annotation-anchor="primary">' +
            '<button class="pattern-button pattern-button--primary" type="button">Primary</button>' +
          '</div>' +
          '<div class="annotation-target" data-annotation-anchor="secondary">' +
            '<button class="pattern-button pattern-button--quiet" type="button">Secondary</button>' +
          '</div>' +
        '</div>' +
        '<div class="annotation-target button-group__copy-target" data-annotation-anchor="copy">' +
          '<p class="button-group__copy">Primary action stays explicit; secondary detail path stays quieter.</p>' +
        '</div>' +
      '</article>',
    annotations: [
      annotation("primary", "Primary Action", "edge-left", "--color-surface-inverse", "Primary decision", "Explicit native button label", ".pattern-button--primary"),
      annotation("secondary", "Secondary Action", "edge-right", "--color-surface-raised", "Quieter detail path", "Distinct native button label", ".pattern-button--quiet"),
      annotation("copy", "Supporting Copy", "edge-left", "--color-text-secondary", "Action guidance", "Meaning remains available as text", ".button-group__copy"),
    ],
  },
  {
    id: "form-states",
    name: "Form States",
    markup:
      '<form class="inspection-pattern form-states" aria-label="Mini form component states">' +
        '<div class="annotation-target form-states__target" data-annotation-anchor="default">' +
          '<label class="form-field"><span>Default</span><input type="text" placeholder="Member ID"></label>' +
        '</div>' +
        '<div class="annotation-target form-states__target" data-annotation-anchor="filled">' +
          '<label class="form-field form-field--filled"><span>Filled</span><input type="text" value="Angela Wallace"></label>' +
        '</div>' +
        '<div class="annotation-target form-states__target" data-annotation-anchor="error">' +
          '<label class="form-field form-field--error"><span>Error</span><input type="text" value="Missing access code" aria-invalid="true"></label>' +
        '</div>' +
        '<div class="annotation-target form-states__target" data-annotation-anchor="inactive">' +
          '<label class="form-field form-field--inactive"><span>Inactive</span><input type="text" value="Locked by system" disabled></label>' +
        '</div>' +
      '</form>',
    annotations: [
      annotation("default", "Default Field", "edge-left", "--color-border-subtle", "Empty input", "Visible label and placeholder", ".form-field"),
      annotation("filled", "Filled Field", "edge-right", "--color-border-strong", "Completed input", "Visible label and value", ".form-field--filled"),
      annotation("error", "Error Field", "edge-left", "--color-accent-action-soft", "Invalid input", "aria-invalid plus visible label", ".form-field--error"),
      annotation("inactive", "Inactive Field", "edge-right", "--color-text-muted", "Disabled input", "Native disabled semantics", ".form-field--inactive"),
    ],
  },
];

function initInspector(inspector) {
  if (inspector.dataset.inspectorInitialized === "true") {
    return;
  }

  var tabs = Array.from(inspector.querySelectorAll("[data-inspector-category]"));
  var stage = inspector.querySelector("[data-pattern-stage]");
  var partsList = inspector.querySelector("[data-inspector-parts]");
  var patternName = inspector.querySelector("[data-pattern-name]");
  var patternPosition = inspector.querySelector("[data-pattern-position]");
  var previousButton = inspector.querySelector("[data-pattern-previous]");
  var nextButton = inspector.querySelector("[data-pattern-next]");
  var tabPanel = inspector.querySelector('[role="tabpanel"]');
  var detailLabel = inspector.querySelector(".pattern-inspector__detail-label");
  var detailValue = inspector.querySelector(".pattern-inspector__detail-value");
  var state = {
    patternIndex: 0,
    annotationId: patterns[0].annotations[0].id,
    category: "token",
  };

  function currentPattern() {
    return patterns[state.patternIndex];
  }

  function currentAnnotation() {
    return currentPattern().annotations.find(function (item) {
      return item.id === state.annotationId;
    });
  }

  function markerLetter(index) {
    return String.fromCharCode(65 + index);
  }

  function createPreviewAnnotations(pattern) {
    pattern.annotations.forEach(function (item, index) {
      var anchor = stage.querySelector('[data-annotation-anchor="' + item.id + '"]');
      var button;

      if (!anchor) {
        return;
      }

      button = inspector.ownerDocument.createElement("button");
      button.className = "pattern-annotation";
      button.type = "button";
      button.textContent = markerLetter(index);
      button.setAttribute("aria-label", "Inspect " + item.label.toLowerCase());
      button.setAttribute("aria-pressed", "false");
      button.dataset.inspectorAnnotation = item.id;
      button.dataset.annotationPlacement = item.placement;
      anchor.appendChild(button);
    });
  }

  function createInspectorParts(pattern) {
    partsList.replaceChildren();
    partsList.setAttribute("aria-label", pattern.name + " annotations");

    pattern.annotations.forEach(function (item, index) {
      var listItem = inspector.ownerDocument.createElement("li");
      var button = inspector.ownerDocument.createElement("button");
      var marker = inspector.ownerDocument.createElement("span");
      var label = inspector.ownerDocument.createElement("span");

      button.className = "pattern-inspector__part";
      button.type = "button";
      button.setAttribute("aria-controls", "pattern-inspector-detail");
      button.setAttribute("aria-pressed", "false");
      button.dataset.inspectorPart = item.id;

      marker.className = "pattern-inspector__marker";
      marker.setAttribute("aria-hidden", "true");
      marker.textContent = markerLetter(index);
      label.textContent = item.label;

      button.append(marker, label);
      listItem.appendChild(button);
      partsList.appendChild(listItem);
    });
  }

  function renderSelection() {
    var activeTab = tabs.find(function (tab) {
      return tab.dataset.inspectorCategory === state.category;
    });
    var activeAnnotation = currentAnnotation();

    tabs.forEach(function (tab) {
      var isActive = tab === activeTab;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
    });

    inspector.querySelectorAll("[data-inspector-part]").forEach(function (part) {
      var isActive = part.dataset.inspectorPart === state.annotationId;
      part.classList.toggle("is-active", isActive);
      part.setAttribute("aria-pressed", String(isActive));
    });

    stage.querySelectorAll("[data-inspector-annotation]").forEach(function (item) {
      var isActive = item.dataset.inspectorAnnotation === state.annotationId;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });

    tabPanel.setAttribute("aria-labelledby", activeTab.id);
    detailLabel.textContent = categoryLabels[state.category];
    detailValue.textContent = activeAnnotation.details[state.category];
  }

  function renderPattern() {
    var pattern = currentPattern();

    patternName.textContent = pattern.name;
    patternPosition.textContent = "Pattern " + (state.patternIndex + 1) + " of " + patterns.length;
    previousButton.disabled = state.patternIndex === 0;
    nextButton.disabled = state.patternIndex === patterns.length - 1;

    stage.innerHTML = pattern.markup;
    createPreviewAnnotations(pattern);
    createInspectorParts(pattern);
    renderSelection();
  }

  function selectPattern(index) {
    var pattern;

    if (index < 0 || index >= patterns.length) {
      return;
    }

    state.patternIndex = index;
    pattern = currentPattern();
    state.annotationId = pattern.annotations[0].id;
    state.category = "token";
    renderPattern();
  }

  tabs.forEach(function (tab, index) {
    tab.addEventListener("click", function () {
      state.category = tab.dataset.inspectorCategory;
      renderSelection();
    });

    tab.addEventListener("keydown", function (event) {
      var nextIndex = index;

      if (event.key === "ArrowRight") {
        nextIndex = (index + 1) % tabs.length;
      } else if (event.key === "ArrowLeft") {
        nextIndex = (index - 1 + tabs.length) % tabs.length;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = tabs.length - 1;
      } else {
        return;
      }

      event.preventDefault();
      state.category = tabs[nextIndex].dataset.inspectorCategory;
      renderSelection();
      tabs[nextIndex].focus();
    });
  });

  stage.addEventListener("click", function (event) {
    var annotationButton = event.target.closest("[data-inspector-annotation]");

    if (!annotationButton) {
      return;
    }

    state.annotationId = annotationButton.dataset.inspectorAnnotation;
    renderSelection();
  });

  partsList.addEventListener("click", function (event) {
    var partButton = event.target.closest("[data-inspector-part]");

    if (!partButton) {
      return;
    }

    state.annotationId = partButton.dataset.inspectorPart;
    renderSelection();
  });

  previousButton.addEventListener("click", function () {
    selectPattern(state.patternIndex - 1);
  });

  nextButton.addEventListener("click", function () {
    selectPattern(state.patternIndex + 1);
  });

  inspector.dataset.inspectorInitialized = "true";
  renderPattern();
}

export function initPatternInspector(root) {
  if (!root || typeof root.querySelector !== "function" || !root.matches("[data-pattern-inspector]")) {
    return null;
  }

  initInspector(root);
  return root;
}

