document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.getElementById("primary-menu");
  const year = document.querySelector("[data-current-year]");

  if (year) year.textContent = String(new Date().getFullYear());

  if (!toggle || !menu) return;

  function setMenu(open) {
    menu.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  toggle.addEventListener("click", () => {
    setMenu(!menu.classList.contains("open"));
  });

  menu.addEventListener("click", event => {
    if (event.target.closest("a")) setMenu(false);
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") setMenu(false);
  });
});

// Autoplay the in-store bakery video only when the visitor has not asked for
// reduced motion. The markup ships with controls and no autoplay attribute, so
// without JS the poster shows and playback stays under the visitor's control.
document.addEventListener("DOMContentLoaded", () => {
  const video = document.querySelector("video[data-autoplay-unless-reduced]");
  if (!video) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  function apply() {
    if (reduced.matches) {
      video.loop = false;
      video.pause();
    } else if (video.paused && !video.dataset.userPaused) {
      video.play().catch(() => {});
    }
  }

  video.addEventListener("pause", () => {
    video.dataset.userPaused = "true";
  });
  video.addEventListener("play", () => {
    delete video.dataset.userPaused;
  });

  apply();
  reduced.addEventListener("change", apply);
});
