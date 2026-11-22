// Give the fixed header a shadow once the page scrolls, so it reads as a
// layer above the content instead of a flat band welded to the hero.
document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  if (!header) return;

  let ticking = false;
  function update() {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
    ticking = false;
  }

  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }, { passive: true });

  update();
});

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

// Weekly-specials email signup: posts the visitor's name and email as JSON
// to the store dashboard's subscriber endpoint, which validates, normalizes
// and stores the signup. That endpoint only accepts browser calls from this
// site's origin, so the form has to live here. Success swaps the form for a
// thank-you in place; an error is shown inline and the typed values stay put
// so the visitor can fix them and retry.
document.addEventListener("DOMContentLoaded", () => {
  const forms = document.querySelectorAll("[data-signup-form]");
  if (!forms.length) return;

  const ENDPOINT = "https://world-food-ai-agent-system.vercel.app/api/email/subscribers";
  // Mirror of the endpoint's own checks, so an obvious typo is caught before
  // the round trip; the server still has the final say.
  const EMAIL_PATTERN = /^[^\s@<>()[\]\\.,;:"']{1,64}@[^\s@<>()[\]\\.,;:"']{1,253}\.[^\s@<>()[\]\\.,;:"']{2,}$/;
  const MAX_EMAIL_LENGTH = 254;
  const MAX_NAME_LENGTH = 120;

  forms.forEach(form => {
    const band = form.closest(".signup-band");
    const success = band ? band.querySelector("[data-signup-success]") : null;
    const successText = success ? success.querySelector("[data-signup-success-text]") : null;
    const status = form.querySelector("[data-signup-status]");
    const button = form.querySelector("button[type='submit']");
    const nameInput = form.querySelector("input[name='name']");
    const emailInput = form.querySelector("input[name='email']");

    function showError(message) {
      if (!status) return;
      status.textContent = message;
      status.hidden = false;
    }

    form.addEventListener("submit", async event => {
      event.preventDefault();
      if (status) {
        status.textContent = "";
        status.hidden = true;
      }

      const name = nameInput ? nameInput.value.trim() : "";
      const email = emailInput ? emailInput.value.trim().toLowerCase() : "";

      if (!email) {
        showError("Please enter your email address.");
        if (emailInput) emailInput.focus();
        return;
      }
      if (email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email)) {
        showError("That email address does not look complete.");
        if (emailInput) emailInput.focus();
        return;
      }
      if (name.length > MAX_NAME_LENGTH) {
        showError("Name is too long.");
        if (nameInput) nameInput.focus();
        return;
      }

      if (button) {
        button.disabled = true;
        button.textContent = "Signing up…";
      }

      try {
        const response = await fetch(ENDPOINT, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email, name: name || null, source: "website" })
        });
        const data = await response.json().catch(() => null);
        if (!response.ok || !data || !data.subscribed) {
          throw new Error(data && data.error ? data.error : "Something went wrong — please try again.");
        }
        if (success) {
          if (data.alreadySubscribed && successText) {
            successText.textContent = "This address is already on the list — watch your inbox for fresh deals from World Food Halal Market.";
          }
          form.hidden = true;
          success.hidden = false;
        }
      } catch (error) {
        showError(error && error.name === "TypeError"
          ? "We could not reach the signup service — please check your connection and try again."
          : error.message);
        if (button) {
          button.disabled = false;
          button.textContent = "Sign up";
        }
      }
    });
  });
});
