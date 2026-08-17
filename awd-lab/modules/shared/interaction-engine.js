import { clamp, createDisposables, easeSigned } from "./visualization-utils.js";

export function revealSequential(elements, options = {}) {
  const {
    className = "is-visible",
    stagger = 80,
    delay = 0
  } = options;

  const timers = elements.map((element, index) =>
    window.setTimeout(() => {
      element.classList.add(className);
    }, delay + index * stagger)
  );

  return () => timers.forEach((timer) => window.clearTimeout(timer));
}

export function bindHoverState(elements, options = {}) {
  const {
    className = "is-hovered",
    onEnter,
    onLeave
  } = options;

  const disposables = createDisposables();

  elements.forEach((element) => {
    disposables.listen(element, "mouseenter", (event) => {
      element.classList.add(className);
      onEnter?.(element, event);
    });

    disposables.listen(element, "mouseleave", (event) => {
      element.classList.remove(className);
      onLeave?.(element, event);
    });
  });

  return disposables.cleanup;
}

export function createActiveState(elements, options = {}) {
  const { className = "is-active", onChange } = options;
  let activeElement = null;

  function setActive(nextElement) {
    if (activeElement === nextElement) return;
    activeElement?.classList.remove(className);
    activeElement = nextElement;
    activeElement?.classList.add(className);
    onChange?.(activeElement);
  }

  return {
    get activeElement() {
      return activeElement;
    },
    setActive,
    clear() {
      setActive(null);
    },
    destroy() {
      activeElement?.classList.remove(className);
      activeElement = null;
    }
  };
}

export function initSurfaceMotion({ surface, nodeField, nodes = [], maxRotation = 38 }) {
  const disposables = createDisposables();
  const root = surface.closest("[data-sn-root]");
  const activeState = createActiveState(nodes, {
    className: "is-active",
    onChange: (activeNode) => {
      root?.classList.toggle("is-responding", Boolean(activeNode));
    }
  });
  let isInteracting = false;

  function nodeVerticalRotation(normY) {
    const centeredY = normY * 2;
    const direction = Math.sign(centeredY);
    const deadZone = 0.2;
    const distance = clamp((Math.abs(centeredY) - deadZone) / (1 - deadZone), 0, 1);

    return direction * Math.sqrt(distance) * -18;
  }

  function projectPointer(clientX, clientY, rect, options = {}) {
    if (!rect.width || !rect.height) return;

    const {
      xMultiplier = 1,
      yMultiplier = 1,
      scale = 1.05,
      resolveY
    } = options;

    const rawX = (clientX - rect.left) / rect.width;
    const rawY = (clientY - rect.top) / rect.height;
    const normX = clamp(rawX, 0, 1) - 0.5;
    const normY = clamp(rawY, 0, 1) - 0.5;

    const x = easeSigned(normX) * maxRotation * xMultiplier;
    const y = resolveY
      ? resolveY(normY)
      : easeSigned(normY) * -maxRotation * yMultiplier;

    surface.style.setProperty("--light-x", normX);
    surface.style.setProperty("--light-y", normY);
    surface.style.transform = `
      rotateY(${x}deg)
      rotateX(${y}deg)
      scale(${scale})
    `;
  }

  function resetSurface() {
    activeState.clear();
    root?.classList.remove("is-responding");
    surface.style.setProperty("--light-x", 0);
    surface.style.setProperty("--light-y", 0);
    surface.style.transform = "rotateY(0deg) rotateX(0deg) scale(1)";
  }

  disposables.listen(surface, "pointermove", (event) => {
    if (event.pointerType === "mouse" || isInteracting) {
      root?.classList.add("is-responding");
      projectPointer(
        event.clientX,
        event.clientY,
        surface.getBoundingClientRect(),
        {
          xMultiplier: 2.6,
          yMultiplier: 2.6
        }
      );
    }
  });

  disposables.listen(surface, "pointerdown", () => {
    isInteracting = true;
  });

  disposables.listen(surface, "pointerup", () => {
    isInteracting = false;
  });

  disposables.listen(surface, "pointerleave", () => {
    isInteracting = false;
    resetSurface();
  });

  disposables.listen(window, "pointercancel", () => {
    isInteracting = false;
    resetSurface();
  });

  nodes.forEach((node) => {
    disposables.listen(node, "mouseenter", () => {
      const nodeRect = node.getBoundingClientRect();
      const fieldRect = nodeField?.getBoundingClientRect() ?? surface.getBoundingClientRect();

      activeState.setActive(node);
      projectPointer(
        nodeRect.left + nodeRect.width / 2,
        nodeRect.top + nodeRect.height / 2,
        fieldRect,
        {
          xMultiplier: 1.8,
          scale: 1.06,
          resolveY: nodeVerticalRotation
        }
      );
    });

    disposables.listen(node, "mouseleave", () => {
      resetSurface();
    });
  });

  return {
    destroy() {
      activeState.destroy();
      root?.classList.remove("is-responding");
      disposables.cleanup();
    }
  };
}
