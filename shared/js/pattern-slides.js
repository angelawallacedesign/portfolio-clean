function createButton(label, direction) {
  const button = document.createElement("button");
  button.className = `pattern-slides__control pattern-slides__control--${direction}`;
  button.type = "button";
  button.dataset.slideDirection = direction;
  button.setAttribute("aria-label", label);
  button.textContent = direction === "prev" ? "‹" : "›";
  return button;
}

function createPagination(count) {
  const pagination = document.createElement("div");
  pagination.className = "pattern-slides__pagination";
  pagination.setAttribute("aria-label", "Slide navigation");

  for (let index = 0; index < count; index += 1) {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "pattern-slides__dot";
    dot.dataset.slideIndex = String(index);
    dot.setAttribute("aria-label", `Go to slide ${index + 1}`);
    pagination.append(dot);
  }

  return pagination;
}

export function initPatternSlides(root = document) {
  root.querySelectorAll(".pattern-slides").forEach((slideshow) => {
    if (slideshow.dataset.enhanced === "true") return;

    const slides = [...slideshow.querySelectorAll(".slide")];
    if (slides.length <= 1) return;

    slideshow.dataset.enhanced = "true";
    slideshow.classList.add("is-enhanced");
    slideshow.setAttribute("role", "region");
    slideshow.setAttribute("aria-roledescription", "carousel");

    const viewport = document.createElement("div");
    viewport.className = "pattern-slides__viewport";

    const track = document.createElement("div");
    track.className = "pattern-slides__track";

    slides.forEach((slide, index) => {
      slide.classList.add("pattern-slides__item");
      slide.dataset.slide = String(index);
      track.append(slide);
    });

    viewport.append(track);
    slideshow.append(viewport);

    const controls = document.createElement("div");
    controls.className = "pattern-slides__controls";
    controls.append(
      createButton("Previous slide", "prev"),
      createPagination(slides.length),
      createButton("Next slide", "next")
    );
    const playback = slideshow.hasAttribute("data-playback");
    const playButton = playback ? document.createElement("button") : null;
    const playIcon = new URL("../../assets/icons/slideshow-play.svg", import.meta.url);
    const pauseIcon = new URL("../../assets/icons/slideshow-pause.svg", import.meta.url);
    const playbackIcon = playback ? document.createElement("img") : null;
    if (playButton) {
      playButton.type = "button";
      playButton.className = "pattern-slides__play";
      playButton.setAttribute("aria-label", "Play slideshow");
      playButton.setAttribute("aria-pressed", "false");
      playbackIcon.src = playIcon.href;
      playbackIcon.alt = "";
      playbackIcon.setAttribute("aria-hidden", "true");
      playButton.append(playbackIcon);
      controls.querySelectorAll("[data-slide-direction]").forEach((button) => button.remove());
      controls.append(playButton);
    }
    slideshow.append(controls);

    let currentIndex = 0;
    let playbackTimer = null;

    function stopPlayback() {
      if (!playButton) return;
      window.clearInterval(playbackTimer);
      playbackTimer = null;
      playbackIcon.src = playIcon.href;
      playButton.setAttribute("aria-label", "Play slideshow");
      playButton.setAttribute("aria-pressed", "false");
    }

    function setSlide(nextIndex) {
      currentIndex = (nextIndex + slides.length) % slides.length;
      track.style.transform = `translate3d(-${currentIndex * 100}%, 0, 0)`;

      slides.forEach((slide, index) => {
        const isActive = index === currentIndex;
        slide.classList.toggle("is-active", isActive);
        slide.setAttribute("aria-hidden", String(!isActive));
        slide.querySelectorAll("a, button").forEach((focusable) => {
          focusable.tabIndex = isActive ? 0 : -1;
        });
      });

      controls.querySelectorAll("[data-slide-index]").forEach((dot) => {
        const isActive = Number(dot.dataset.slideIndex) === currentIndex;
        dot.classList.toggle("is-active", isActive);
        dot.setAttribute("aria-current", isActive ? "true" : "false");
      });
    }

    controls.addEventListener("click", (event) => {
      const direction = event.target.closest("[data-slide-direction]");
      const dot = event.target.closest("[data-slide-index]");

      if (direction) {
        setSlide(currentIndex + (direction.dataset.slideDirection === "next" ? 1 : -1));
      }

      if (dot) {
        setSlide(Number(dot.dataset.slideIndex));
      }
      if (playButton && event.target.closest(".pattern-slides__play")) {
        if (playbackTimer) {
          stopPlayback();
        } else {
          setSlide(currentIndex + 1);
          playbackTimer = window.setInterval(() => setSlide(currentIndex + 1), 4000);
          playbackIcon.src = pauseIcon.href;
          playButton.setAttribute("aria-label", "Pause slideshow");
          playButton.setAttribute("aria-pressed", "true");
        }
      }
    });

    slideshow.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        setSlide(currentIndex + (event.key === "ArrowRight" ? 1 : -1));
      }
    });
    if (playButton) {
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) stopPlayback();
      });
    }

    setSlide(0);
  });
}
