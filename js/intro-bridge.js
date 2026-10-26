const intro = document.querySelector('.bridge-intro');
const header = document.querySelector('.global-header');

if (intro && header) {
  document.querySelector('.global-nav a[href="index.html"]')?.setAttribute('aria-current', 'page');
  const updateHeader = () => {
    const overIntro = intro.getBoundingClientRect().bottom > header.offsetHeight;
    header.classList.toggle('is-over-intro', overIntro);
    header.classList.toggle('is-scrolled', window.scrollY > 24);
    if (overIntro) header.dataset.theme = 'dark';
    else header.removeAttribute('data-theme');
  };
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
  window.addEventListener('resize', updateHeader);

}
