export function initIntroNavVisibility() {
  const introSection = document.querySelector(".intro-section");
  if (!introSection) return;

  function updateNavVisibility() {
    const introBottom = introSection.getBoundingClientRect().bottom;
    document.body.classList.toggle("show-section-nav", introBottom <= 0);
  }

  window.addEventListener("scroll", updateNavVisibility, { passive: true });
  updateNavVisibility();
}

export function initProfileImageBehavior() {
  const profileImage = document.querySelector(".profile");
  const aboutSection = document.querySelector("#about");
  const aboutTrigger = document.querySelector(".profile-trigger, .profile-image-trigger");
  const mobileQuery = window.matchMedia("(max-width: 480px)");

  if (!profileImage || !aboutSection) return;

  let observer = null;

  function setup() {
    observer?.disconnect();
    observer = null;

    const target = mobileQuery.matches && aboutTrigger ? aboutTrigger : aboutSection;

    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        profileImage.classList.toggle("is-visible", entry.isIntersecting);
      });
    }, mobileQuery.matches ? {
      root: null,
      threshold: 0,
      rootMargin: "0px 0px -18% 0px"
    } : {
      root: null,
      threshold: 0.2
    });

    observer.observe(target);
  }

  setup();

  if (mobileQuery.addEventListener) {
    mobileQuery.addEventListener("change", setup);
  } else {
    mobileQuery.addListener(setup);
  }
}

export function initAnchorActiveState() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  const anchorMap = [...anchorLinks]
    .map((link) => {
      const selector = link.getAttribute("href");
      if (!selector || selector === "#") return null;

      let target = null;
      try {
        target = document.querySelector(selector);
      } catch {
        target = null;
      }

      return target ? { link, target } : null;
    })
    .filter(Boolean);

  if (!anchorMap.length) return;

  const anchorObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const match = anchorMap.find((item) => item.target === entry.target);
      if (!match || !entry.isIntersecting) return;

      anchorLinks.forEach((link) => link.classList.remove("is-active"));
      match.link.classList.add("is-active");
    });
  }, {
    root: null,
    threshold: 0.4
  });

  anchorMap.forEach((item) => anchorObserver.observe(item.target));
}
