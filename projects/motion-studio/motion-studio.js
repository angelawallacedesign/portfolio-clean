const nav = document.querySelector('#navList');

if (nav) {
  const links = [...nav.querySelectorAll('a[href^="#"]')];
  const sections = links
    .map((link) => ({ link, target: document.querySelector(link.hash) }))
    .filter(({ target }) => target);

  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    links.forEach((link) => link.classList.remove('is-active'));
    sections.find(({ target }) => target === visible.target)?.link.classList.add('is-active');
  }, { rootMargin: '-20% 0px -55%', threshold: [0, 0.2, 0.5] });

  sections.forEach(({ target }) => observer.observe(target));
}
