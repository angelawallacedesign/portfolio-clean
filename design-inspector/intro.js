const intro = document.querySelector('.inspector-intro');

if (intro) {
  // Reuse the approved blueprint markup at its source, along with its linked CSS.
  fetch(new URL('../modules/designing-with-ai-hero/pass-5/component.html', import.meta.url))
    .then(response => { if (!response.ok) throw new Error('Blueprint unavailable'); return response.text(); })
    .then(markup => {
      const source = new DOMParser().parseFromString(markup, 'text/html');
      const field = source.querySelector('.designing-ai-hero__technical-field');
      if (!field) return;
      // Keep the independently versioned hero CSS isolated from the featured
      // Pass 4 hero below. The original Pass 5 stylesheet remains the source.
      const shadow = intro.querySelector('[data-intro-background]').attachShadow({ mode: 'open' });
      const stylesheet = document.createElement('link');
      stylesheet.rel = 'stylesheet';
      stylesheet.href = new URL('../modules/designing-with-ai-hero/pass-5/designing-ai-hero.css', import.meta.url).href;
      const motionStylesheet = document.createElement('link');
      motionStylesheet.rel = 'stylesheet';
      motionStylesheet.href = new URL('./intro-background-motion.css', import.meta.url).href;
      const background = document.createElement('div');
      background.className = 'designing-ai-hero';
      const bars = document.createElement('div');
      bars.className = 'intro-bars';

      // Reuse the original SVG geometry for a few quiet traveling highlights.
      const svg = field.querySelector('svg');
      const energy = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      energy.setAttribute('class', 'intro-line-energy');
      const routes = [
        field.querySelector('.designing-ai-hero__diagram--left > path'),
        field.querySelector('.designing-ai-hero__diagram--right > path'),
        field.querySelector('.designing-ai-hero__diagram--corners > path'),
      ];
      routes.filter(Boolean).forEach(route => {
        const trace = route.cloneNode(false);
        trace.removeAttribute('class');
        trace.setAttribute('pathLength', '1');
        energy.append(trace);
      });
      svg?.append(energy);
      background.append(bars, field);
      shadow.append(stylesheet, motionStylesheet, background);

      // Pause decorative work when it cannot be seen.
      let inView = true;
      const updateMotion = () => background.classList.toggle('is-paused', !inView || document.hidden);
      new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        updateMotion();
      }).observe(intro);
      document.addEventListener('visibilitychange', updateMotion);
      updateMotion();
    })
    .catch(error => console.warn('Intro background:', error.message));

  document.querySelector('a[href="#live-component-preview"]')?.addEventListener('click', () => {
    document.querySelector('[data-preview-state="default"]')?.focus({ preventScroll: true });
  });
}
