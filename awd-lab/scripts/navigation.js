const navKeys = ["react", "chart", "surface", "about"];
const frameColors = ["rgb(195, 195, 195)", "rgb(20, 20, 20)", "rgb(195, 195, 195)", "rgb(250, 77, 126)"];

if (document.body.classList.contains("ai-lab")) {
  const sections = [...document.querySelectorAll("#content-rail > .section")];
  const frame = document.getElementById("frame");

  document.querySelectorAll("[data-nav]").forEach((link) => {
    link.addEventListener("click", () => {
      const index = navKeys.indexOf(link.dataset.nav);
      if (index < 0 || !sections[index]) return;
      sections[index].scrollIntoView({ behavior: "smooth", block: "start" });
      document.querySelectorAll("[data-nav]").forEach((item) => {
        item.classList.toggle("is-active", item === link);
      });
      if (frame) frame.style.borderColor = frameColors[index];
    });
  });
}

// =========================
// TOGGLE SWITCH (List / Chart)
// =========================

const toggleItems = document.querySelectorAll('.toggle-switch li');
const wrappers = document.querySelectorAll('.toggle-wrapper');

toggleItems.forEach((item, index) => {
  item.addEventListener('click', (e) => {
    e.preventDefault();

    // update active class
    toggleItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');

    // toggle visibility
    wrappers.forEach((wrapper, i) => {
      wrapper.dataset.visible = i === index ? 'true' : 'false';
    });
  });
});