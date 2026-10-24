const preview = document.querySelector('[data-live-preview]');

if (preview) {
  const button = preview.querySelector('[data-preview-button]');
  const code = preview.querySelector('[data-preview-code]');
  const values = preview.querySelector('[data-preview-values]');
  const status = preview.querySelector('[data-preview-status]');
  const tabs = [...preview.querySelectorAll('[data-preview-tab]')];
  const states = [...preview.querySelectorAll('[data-preview-state]')];
  const figma = preview.querySelector('[data-preview-figma]');
  const figmaBase = 'https://www.figma.com/design/HxeLi68wxFByOWStEVOGam/AWD-Design-System-2?node-id=';
  // Existing AWD component variants, verified in the design system file.
  const variants = { default: '7193-278', hover: '7193-277', focus: '7193-276', small: '7194-286' };
  let state = 'default';
  let tab = 'html';
  let sourceText = '';
  const authoredRules = new Map();

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
    const interactive = !button.disabled && (state === 'hover' || state === 'focus' || button.matches(':hover, :focus-visible'));
    return [
      [interactive ? '--theme-surface' : '--color-primary', color(style.backgroundColor), true],
      [interactive ? '--theme-text' : '--color-text-contrast', color(style.color), true],
      ['--color-accent', color(style.getPropertyValue('--color-accent').trim()), true],
      ['border-radius', style.borderRadius, false],
      ['padding', style.padding, false],
    ];
  }

  function renderSource() {
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
  }

  function renderValues() {
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
    renderSource();
  }

  function selectState(next) {
    state = next;
    button.removeAttribute('style');
    button.classList.toggle('small', state === 'small');
    button.disabled = state === 'disabled';
    // Apply the actual shared pseudo-class declarations for a persistent preview.
    // This keeps the simulation in sync when the production button CSS changes.
    const selector = state === 'hover' ? '.primary-btn:hover:not(:disabled)' : state === 'focus' ? '.primary-btn:focus-visible' : null;
    const rule = selector && ruleFor(selector);
    if (rule) for (const property of rule.style) button.style.setProperty(property, rule.style.getPropertyValue(property));
    states.forEach(control => control.setAttribute('aria-pressed', String(control.dataset.previewState === state)));
    preview.querySelectorAll('.live-preview__pagination span').forEach((line, index) => line.classList.toggle('is-active', index === states.findIndex(control => control.dataset.previewState === state)));
    figma.href = figmaBase + (variants[state] || variants.default);
    preview.querySelector('[data-preview-component-name]').textContent = state === 'small' ? 'Button / Primary Small' : 'Button / Primary';
    preview.querySelector('[data-preview-caption]').textContent = state === 'disabled' ? 'Native disabled state · Figma link: base component' : 'Live HTML · Shared CSS · Real behavior';
    status.textContent = `${state[0].toUpperCase() + state.slice(1)} button state selected.`;
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
    preview.querySelector('[data-preview-caption]').textContent = 'Primary action activated. This is a working button.';
  });
  ['pointerenter', 'pointerleave', 'focus', 'blur'].forEach(event => button.addEventListener(event, () => requestAnimationFrame(renderValues)));
  button.addEventListener('transitionend', renderValues);
  window.addEventListener('resize', renderValues);
  selectState('default');

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
