const state = {
  asset: null,
  selectedRegion: "water",
  intensity: 50,
  durationSeconds: 2,
  seamlessLoop: true,
  preserveTransparency: true,
  status: "empty",
};

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const elements = {
  dialog: document.querySelector("#asset-dialog"),
  assetForm: document.querySelector("#asset-form"),
  openAssetPicker: document.querySelector("#open-asset-picker"),
  emptyState: document.querySelector("#empty-state"),
  previewFrame: document.querySelector("#preview-frame"),
  assetPreview: document.querySelector("#asset-preview"),
  sourcePath: document.querySelector("#source-path"),
  regionControls: document.querySelector("#region-controls"),
  intensity: document.querySelector("#intensity"),
  seamlessLoop: document.querySelector("#seamless-loop"),
  preserveTransparency: document.querySelector("#preserve-transparency"),
  primaryAction: document.querySelector("#primary-action"),
  progressFill: document.querySelector("#progress-fill"),
  statuses: [...document.querySelectorAll("#status-list li")],
  assetBadge: document.querySelector("#asset-badge"),
  processingIndicator: document.querySelector("#processing-indicator"),
  statusAnnouncement: document.querySelector("#status-announcement"),
};

const statusOrder = ["original", "processing", "review", "approved"];
let processingTimer;
let approvalTimer;

function setConfigurationDisabled(disabled) {
  elements.regionControls.disabled = disabled;
  elements.intensity.disabled = disabled;
  elements.seamlessLoop.disabled = disabled;
  elements.preserveTransparency.disabled = disabled;
}

function progressForStatus(status) {
  return {
    empty: 0,
    original: 0,
    processing: 67,
    review: 67,
    approving: 100,
    approved: 100,
  }[status];
}

function renderStatus() {
  const visualStatus = state.status === "approving" ? "approved" : state.status;
  const currentIndex = statusOrder.indexOf(visualStatus);

  elements.progressFill.style.width = `${progressForStatus(state.status)}%`;
  elements.statuses.forEach((item, index) => {
    item.classList.toggle("is-complete", currentIndex >= 0 && index < currentIndex);
    item.classList.toggle("is-active", index === currentIndex);
    if (state.status === "empty") {
      item.classList.remove("is-complete", "is-active");
    }
  });
}

function renderPrimaryAction() {
  const button = elements.primaryAction;
  button.className = "button primary-action";

  if (state.status === "empty") {
    button.textContent = "Generate Preview";
    button.disabled = true;
    return;
  }

  if (state.status === "original") {
    button.textContent = "Generate Preview";
    button.disabled = false;
    return;
  }

  if (state.status === "processing") {
    button.textContent = "Processing…";
    button.disabled = true;
    return;
  }

  if (state.status === "review") {
    button.textContent = "Approve";
    button.classList.add("is-approve");
    button.disabled = false;
    return;
  }

  if (state.status === "approving") {
    button.textContent = "Approving…";
    button.classList.add("is-approve");
    button.disabled = true;
    return;
  }

  button.textContent = "Approved";
  button.classList.add("is-approved");
  button.disabled = true;
}

function announce(message) {
  elements.statusAnnouncement.textContent = message;
}

function render() {
  const hasAsset = Boolean(state.asset);
  const locked = !hasAsset || ["processing", "approving", "approved"].includes(state.status);

  elements.emptyState.hidden = hasAsset;
  elements.assetPreview.hidden = !hasAsset;
  elements.previewFrame.classList.toggle("has-asset", hasAsset);
  elements.assetPreview.dataset.region = state.selectedRegion;
  elements.assetPreview.classList.toggle("is-motion", ["review", "approving", "approved"].includes(state.status));
  elements.processingIndicator.hidden = state.status !== "processing";

  if (hasAsset) {
    elements.sourcePath.textContent = "approved/carnival-tropicale/image-asset.jpg";
  } else {
    elements.sourcePath.textContent = "—";
  }

  if (state.status === "review") {
    elements.assetBadge.textContent = "Motion applied";
    elements.assetBadge.dataset.state = "review";
  } else if (["approving", "approved"].includes(state.status)) {
    elements.assetBadge.textContent = "Approved";
    elements.assetBadge.dataset.state = "approved";
  } else {
    elements.assetBadge.textContent = "Static master";
    elements.assetBadge.dataset.state = "original";
  }

  setConfigurationDisabled(locked);
  renderPrimaryAction();
  renderStatus();
}

function selectAsset() {
  state.asset = "carnival-tropicale";
  state.status = "original";
  render();
  announce("Approved source asset selected. Original static master is ready to configure.");
}

function beginGeneration() {
  if (state.status !== "original") return;

  state.status = "processing";
  render();
  announce("Processing motion preview.");

  window.clearTimeout(processingTimer);
  processingTimer = window.setTimeout(() => {
    state.status = "review";
    render();
    announce("Motion preview ready for review. Human approval is required to continue.");
  }, reducedMotion.matches ? 50 : 2200);
}

function approveGeneration() {
  if (state.status !== "review") return;

  state.status = "approving";
  render();
  announce("Approving motion preview.");

  window.clearTimeout(approvalTimer);
  approvalTimer = window.setTimeout(() => {
    state.status = "approved";
    render();
    announce("Motion preview approved. Workflow complete.");
  }, reducedMotion.matches ? 50 : 1900);
}

elements.openAssetPicker.addEventListener("click", () => {
  elements.dialog.showModal();
});

elements.assetForm.addEventListener("submit", (event) => {
  const submitter = event.submitter;
  if (submitter?.value === "default") {
    event.preventDefault();
    selectAsset();
    elements.dialog.close("selected");
    elements.primaryAction.focus();
  }
});

elements.primaryAction.addEventListener("click", () => {
  if (state.status === "original") {
    beginGeneration();
  } else if (state.status === "review") {
    approveGeneration();
  }
});

document.querySelectorAll('input[name="region"]').forEach((input) => {
  input.addEventListener("change", (event) => {
    state.selectedRegion = event.target.value;
    render();
  });
});

elements.intensity.addEventListener("input", (event) => {
  state.intensity = Number(event.target.value);
});

elements.seamlessLoop.addEventListener("change", (event) => {
  state.seamlessLoop = event.target.checked;
});

elements.preserveTransparency.addEventListener("change", (event) => {
  state.preserveTransparency = event.target.checked;
});

render();
