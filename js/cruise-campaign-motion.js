/* Campaign copy only: creative geometry and placement are owned by CSS. */
(() => {
  const demo = document.querySelector('.cruise-demo');
  if (!demo) return;
  const campaigns = {
    meridian: { brand: 'Meridian Cruises', headline: 'Escape to the Caribbean', destination: 'The Caribbean', offer: 'Sailings from $249', cta: 'Explore Cruises' },
    solara: { brand: 'Solara Voyages', headline: 'Find Your Winter Sun', destination: 'The Southern Caribbean', offer: 'Up to $150 Onboard Credit', cta: 'View Sailings' },
    northstar: { brand: 'Northstar Expeditions', headline: 'See Alaska Differently', destination: 'Alaska & the Inside Passage', offer: '7-Night Voyages', cta: 'Explore Alaska' }
  };
  const controls = demo.querySelector('.campaign-controls');
  controls.hidden = false;
  controls.addEventListener('click', (event) => {
    const button = event.target.closest('[data-brand-choice]');
    if (!button) return;
    const key = button.dataset.brandChoice;
    const campaign = campaigns[key];
    if (!campaign || demo.dataset.brand === key) return;
    demo.dataset.brand = key;
    demo.querySelectorAll('[data-campaign]').forEach((node) => {
      node.textContent = campaign[node.dataset.campaign];
    });
    controls.querySelectorAll('button').forEach((control) => {
      const selected = control === button;
      control.setAttribute('aria-pressed', String(selected));
      control.classList.toggle('is-active', selected);
    });
    demo.querySelector('#campaign-status').textContent = `${campaign.brand} campaign selected.`;
  });
})();
