const IS_INTRO = document.body.dataset.page === "intro";

// --- INTRO MODE --- //

if (IS_INTRO) {
  const navLinks = [...document.querySelectorAll(".global-nav [data-nav]")];
  const sections = navLinks
    .map((link) => ({ link, section: document.getElementById(link.dataset.nav) }))
    .filter(({ section }) => section);

  const setActiveLink = (activeLink) => {
    navLinks.forEach((link) => {
      const isActive = link === activeLink;
      link.classList.toggle("is-active", isActive);
      if (isActive) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  };

  const updateActiveLink = () => {
    const marker = Math.min(window.innerHeight * 0.42, 360);
    let active = null;

    sections.forEach((item) => {
      if (item.section.getBoundingClientRect().top <= marker) active = item.link;
    });

    setActiveLink(active);
  };

  navLinks.forEach((link) => {
    link.addEventListener("click", () => setActiveLink(link));
  });

  window.addEventListener("scroll", updateActiveLink, { passive: true });
  window.addEventListener("resize", updateActiveLink);
  updateActiveLink();
  
} else {
  const currentPath = window.location.pathname;
  document.querySelectorAll("[data-nav]").forEach((link) => {
    if (!link.href) return;
    const linkPath = new URL(link.href, window.location.origin).pathname;
    if (linkPath === currentPath) link.classList.add("is-active");
  });
}
