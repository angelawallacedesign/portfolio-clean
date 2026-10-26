const preview = document.querySelector('[data-live-preview]');

if (preview) {
  const button = preview.querySelector('[data-preview-button]');
  const code = preview.querySelector('[data-preview-code]');
  const values = preview.querySelector('[data-preview-values]');
  const status = preview.querySelector('[data-preview-status]');
  const tabs = [...preview.querySelectorAll('[data-preview-tab]')];
  const states = ['default', 'hover', 'focus', 'disabled', 'small']
  .map(name => preview.querySelector(`[data-preview-state="${name}"]`));
  states.forEach(control => control.parentElement.appendChild(control));
  const figma = preview.querySelector('[data-preview-figma]');
  // A targetless clock preserves the preview cadence without depending on UI
  // outside the prototype. Its pause/resume behavior matches the former fill.
  const stateClock = new Animation(new KeyframeEffect(null, [], { duration: 4000 }));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let pointerInside = false;
  let inView = false;
  const figmaBase = 'https://www.figma.com/design/HxeLi68wxFByOWStEVOGam/AWD-Design-System-2?node-id=';
  // Existing AWD component variants, verified in the design system file.
  const variants = { default: '7193-278', hover: '7193-277', focus: '7193-276', small: '7194-286' };
  let state = 'default';
  let tab = 'html';
  let sourceText = '';
  const authoredRules = new Map();
  const crossfades = new Map();

  // Try it out! 
 const tryItOut = document.createElement('div');
  tryItOut.className = 'try-it-out';
  tryItOut.setAttribute('aria-hidden', 'true');

  preview.closest('.live-preview-module').prepend(tryItOut);

  function crossfade(target, update, animate = true) {
    const current = crossfades.get(target);
    const previousOpacity = current ? Number(getComputedStyle(target).opacity) : 1;
    const previousText = target.textContent;
    const snapshot = animate ? target.cloneNode(true) : null;
    const bounds = animate ? target.getBoundingClientRect() : null;
    update();
    if (!animate || previousText === target.textContent) return;
    if (!previousText.trim() || reducedMotion.matches || document.hidden || !inView) {
      current?.cleanup();
      return;
    }
    // Preserve every currently visible layer on interruption instead of
    // removing the old fade and flashing the incoming content at full opacity.
    const layers = current?.release() || [];

    const parent = target.parentElement;
    const parentBounds = parent.getBoundingClientRect();
    // A temporary, inert snapshot fades above the new content without entering
    // layout. State, source, copy data, and links all update synchronously.
    snapshot.setAttribute('aria-hidden', 'true');
    snapshot.inert = true;
    for (const node of [snapshot, ...snapshot.querySelectorAll('*')]) {
      for (const attribute of [...node.attributes]) {
        if (attribute.name === 'id' || attribute.name.startsWith('data-preview-')) node.removeAttribute(attribute.name);
      }
    }
    Object.assign(snapshot.style, {
      position: 'absolute',
      left: `${bounds.left - parentBounds.left + parent.scrollLeft - parent.clientLeft}px`,
      top: `${bounds.top - parentBounds.top + parent.scrollTop - parent.clientTop}px`,
      width: `${bounds.width}px`,
      height: `${bounds.height}px`,
      margin: '0',
      pointerEvents: 'none',
      zIndex: '1',
    });
    parent.append(snapshot);
    layers.push({ node: snapshot, opacity: previousOpacity });
    const options = { duration: 1800, easing: 'ease-in-out' };
    // Keep one readable version visible for almost the entire handoff. A full
    // 1.8s blend stacks unrelated glyphs; a shallow fade with a brief midpoint
    // exchange avoids that blur and never blanks the content panels.
    const incoming = target.animate([
      { opacity: 0, offset: 0 },
      { opacity: 0, offset: 0.49 },
      { opacity: 0.75, offset: 0.51 },
      { opacity: 1, offset: 1 },
    ], options);
    const outgoing = layers.map(layer => layer.node.animate([
      { opacity: layer.opacity, offset: 0 },
      { opacity: layer.opacity * 0.75, offset: 0.49 },
      { opacity: 0, offset: 0.51 },
      { opacity: 0, offset: 1 },
    ], options));
    let released = false;
    const entry = {
      release() {
        const visible = [];
        for (const layer of layers) {
          const opacity = Number(getComputedStyle(layer.node).opacity);
          layer.node.style.opacity = String(opacity);
          if (opacity > 0.005) visible.push({ node: layer.node, opacity });
          else layer.node.remove();
        }
        released = true;
        incoming.cancel();
        outgoing.forEach(animation => animation.cancel());
        return visible;
      },
      cleanup() {
        if (released) return;
        incoming.cancel();
        outgoing.forEach(animation => animation.cancel());
        layers.forEach(layer => layer.node.remove());
        if (crossfades.get(target) === entry) crossfades.delete(target);
      },
    };
    crossfades.set(target, entry);
    Promise.allSettled([incoming.finished, ...outgoing.map(animation => animation.finished)]).then(entry.cleanup);
  }

  const sharedSheet = [...document.styleSheets].find(sheet => sheet.href && new URL(sheet.href).pathname.endsWith('/css/components.css'));
  const primaryRules = [...(sharedSheet?.cssRules || [])].filter(rule => rule.selectorText && /^\.primary-btn(?::|\s*\{|\.|$)/.test(rule.selectorText));
  const ruleFor = selector => primaryRules.find(rule => rule.selectorText === selector);

  function markup() {
    const clone = button.cloneNode(true);
    clone.removeAttribute('data-preview-button');
    clone.removeAttribute('style');
    return clone.outerHTML.replace('>View project ', '>\n  View project ').replace('</button>', '\n</button>');
  }

  function color(value) {
    const channels = value.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    return channels ? '#' + channels.slice(1).map(channel => Number(channel).toString(16).padStart(2, '0')).join('').toUpperCase() : value;
  }

  function measurements() {
    const style = getComputedStyle(button);
    const destination = new Map();
    // Inspect the existing CSS transitions' final values. The inspector should
    // crossfade to the destination tokens, not briefly display in-between colors
    // and replace them again when the visual button finishes its transition.
    for (const animation of button.getAnimations()) {
      const property = animation.transitionProperty;
      if (property !== 'background-color' && property !== 'color') continue;
      const frames = animation.effect.getKeyframes();
      const finalFrame = frames[frames.length - 1];
      destination.set(property, finalFrame[property === 'background-color' ? 'backgroundColor' : 'color']);
    }
    const interactive = !button.disabled && (state === 'hover' || state === 'focus' || button.matches(':hover, :focus-visible'));
    return [
      [interactive ? '--theme-surface' : '--color-primary', color(destination.get('background-color') || style.backgroundColor), true],
      [interactive ? '--theme-text' : '--color-text-contrast', color(destination.get('color') || style.color), true],
      ['--color-accent', color(style.getPropertyValue('--color-accent').trim()), true],
      ['border-radius', style.borderRadius, false],
      ['padding', style.padding, false],
    ];
  }

  function renderSource(animate = true) {
    if (tab === 'html') sourceText = markup();
    if (tab === 'css') {
      const selectors = ['.primary-btn'];
      if (state === 'small') selectors.push('.primary-btn.small');
      if (state === 'hover') selectors.push('.primary-btn:hover:not(:disabled)');
      if (state === 'focus') selectors.push('.primary-btn:focus-visible');
      if (state === 'disabled') selectors.push('.primary-btn:disabled');
      sourceText = '/* Shared source: /css/components.css */\n' + selectors.map(selector => authoredRules.get(selector) || ruleFor(selector)?.cssText).filter(Boolean).join('\n\n');
    }
    if (tab === 'tokens') sourceText = '/* Live values · shared/css/global-tokens.css\n   Geometry comes from the component CSS. */\n' + measurements().map(([name, value]) => `${name}: ${value};`).join('\n');
    crossfade(code, () => {
      code.replaceChildren();
      // Tokenize source as text nodes; source markup is never executed.
      for (const part of sourceText.split(/("[^"]*"|<\/?[\w-]+|>)/g)) {
        if (part.startsWith('"') || part.startsWith('<') || part === '>') {
          const span = document.createElement('span');
          span.className = part.startsWith('"') ? 'syntax-string' : 'syntax-tag';
          span.textContent = part;
          code.append(span);
        } else code.append(document.createTextNode(part));
      }
    }, animate);
  }

  function renderValues(animate = true) {
    crossfade(values, () => {
      values.replaceChildren();
      measurements().forEach(([name, value, isColor]) => {
        const row = document.createElement('div');
        const term = document.createElement('dt');
        const definition = document.createElement('dd');
        if (isColor) {
          const swatch = document.createElement('i');
          swatch.className = 'live-preview__swatch';
          swatch.style.backgroundColor = value;
          swatch.setAttribute('aria-hidden', 'true');
          term.append(swatch);
        }
        term.append(document.createTextNode(name));
        definition.textContent = value;
        row.append(term, definition);
        values.append(row);
      });
    }, animate);
    renderSource(animate);
  }

  function selectState(next, announce = true) {
    state = next;
    button.toggleAttribute('data-focus-preview', state === 'focus');
    button.removeAttribute('style');
    button.classList.toggle('small', state === 'small');
    button.disabled = state === 'disabled';
    // Apply the actual shared pseudo-class declarations for a persistent preview.
    // This keeps the simulation in sync when the production button CSS changes.
    const selector = state === 'hover' ? '.primary-btn:hover:not(:disabled)' : state === 'focus' ? '.primary-btn:focus-visible' : null;
    const rule = selector && ruleFor(selector);
    if (rule) for (const property of rule.style) button.style.setProperty(property, rule.style.getPropertyValue(property));
    states.forEach(control => control.setAttribute('aria-pressed', String(control.dataset.previewState === state)));
    stateClock.currentTime = 0;
    updateLoop();
    figma.href = figmaBase + (variants[state] || variants.default);
    const componentName = preview.querySelector('[data-preview-component-name]');
    const caption = preview.querySelector('[data-preview-caption]');
    crossfade(componentName, () => { componentName.textContent = state === 'small' ? 'Button / Primary Small' : 'Button / Primary'; });
    crossfade(caption, () => { caption.textContent = state === 'disabled' ? 'Native disabled state · Figma link: base component' : '* Live Demo · Shared CSS · Real behavior'; });
    if (announce) status.textContent = `${state[0].toUpperCase() + state.slice(1)} button state selected.`;
    renderValues();
  }

  function selectTab(control) {
    tab = control.dataset.previewTab;
    tabs.forEach(item => {
      item.setAttribute('aria-selected', String(item === control));
      item.tabIndex = item === control ? 0 : -1;
    });
    preview.querySelector('[role="tabpanel"]').setAttribute('aria-labelledby', control.id);
    renderSource();
  }

  states.forEach(control => control.addEventListener('click', () => selectState(control.dataset.previewState)));
  tabs.forEach((control, index) => {
    control.addEventListener('click', () => selectTab(control));
    control.addEventListener('keydown', event => {
      const destination = { ArrowRight: (index + 1) % tabs.length, ArrowLeft: (index + tabs.length - 1) % tabs.length, Home: 0, End: tabs.length - 1 }[event.key];
      if (destination === undefined) return;
      event.preventDefault();
      selectTab(tabs[destination]);
      tabs[destination].focus();
    });
  });
  preview.querySelector('[data-preview-copy]').addEventListener('click', async event => {
    const control = event.currentTarget;
    try {
      await navigator.clipboard.writeText(sourceText);
      control.textContent = 'Copied!';
      status.textContent = `${tab.toUpperCase()} source copied.`;
      window.setTimeout(() => { control.textContent = '⧉ Copy'; }, 1800);
    } catch {
      status.textContent = 'Copy unavailable. Select and copy the source below.';
      preview.querySelector('[role="tabpanel"]').focus();
    }
  });
  button.addEventListener('click', () => {
    status.textContent = 'Working component: primary action activated.';
    const caption = preview.querySelector('[data-preview-caption]');
    crossfade(caption, () => { caption.textContent = 'Primary action activated. This is a working button.'; });
  });
  ['pointerenter', 'pointerleave', 'focus', 'blur'].forEach(event => button.addEventListener(event, () => requestAnimationFrame(() => renderValues())));
  // Endpoint measurements already match the settled values, so this normally
  // leaves the visible content and its current crossfade unchanged.
  button.addEventListener('transitionend', () => renderValues());
  window.addEventListener('resize', () => {
    [...crossfades.values()].forEach(entry => entry.cleanup());
    renderValues(false);
  });
  function updateLoop() {
    const paused = reducedMotion.matches || pointerInside || preview.matches(':focus-within') || document.hidden || !inView;
    if (paused) stateClock.pause();
    else stateClock.play();
    if (reducedMotion.matches || document.hidden || !inView) [...crossfades.values()].forEach(entry => entry.cleanup());
  }

  stateClock.addEventListener('finish', () => {
    const index = states.findIndex(control => control.dataset.previewState === state);
    selectState(states[(index + 1) % states.length].dataset.previewState, false);
  });
  preview.addEventListener('pointerenter', () => { pointerInside = true; updateLoop(); });
  preview.addEventListener('pointerleave', () => { pointerInside = false; updateLoop(); });
  preview.addEventListener('focusin', updateLoop);
  preview.addEventListener('focusout', () => queueMicrotask(updateLoop));
  document.addEventListener('visibilitychange', updateLoop);
  reducedMotion.addEventListener('change', () => { selectState(state, false); updateLoop(); });
  new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; updateLoop(); }).observe(preview);
  selectState('default', false);
  updateLoop();

  // Preserve the authored formatting rather than CSSOM's expanded shorthands.
  fetch(new URL('../../css/components.css', import.meta.url))
    .then(response => { if (!response.ok) throw new Error('Shared source unavailable'); return response.text(); })
    .then(source => {
      for (const match of source.matchAll(/(?:^|\n)(\.primary-btn(?:\.[\w-]+)?(?::[^\n{]+)?)\s*\{([^}]+)\}/g)) {
        authoredRules.set(match[1].trim(), `${match[1].trim()} {${match[2]}}`);
      }
      renderSource();
    })
    .catch(() => { /* CSSOM remains available if the optional source fetch fails. */ });
}
