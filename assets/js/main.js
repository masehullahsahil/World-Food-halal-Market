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
