console.log("GenesisOS Labs site loaded.");

const OFFICIAL_LOGO = "assets/img/GenesisOSLabs G Logo v1 05132026.png";
const MAX_TASKS = 3;

const DEMO_SELECTORS = [
  "[data-demo-target]",
  "#demo-request",
  "#genesis-lead",
  "#gcrm-lead",
  "#gbot-request-form",
  "#marketplace-contact",
  "#healthcare-demo",
  "#real-estate-demo",
  "#estimate-form",
  "#demo-form"
].join(", ");

function qs(sel, root) {
  return (root || document).querySelector(sel);
}

function qsa(sel, root) {
  return Array.from((root || document).querySelectorAll(sel));
}

function getAssetPrefix() {
  const parts = window.location.pathname.replace(/\\/g, "/").split("/").filter(Boolean);
  if (!parts.length) return "";
  const last = parts[parts.length - 1];
  const dirDepth = last.includes(".") ? parts.length - 1 : parts.length;
  return dirDepth <= 0 ? "" : "../".repeat(dirDepth);
}

function getOfficialLogoSrc() {
  return `${getAssetPrefix()}${OFFICIAL_LOGO}`;
}

function applyOfficialBrandLogos(container) {
  if (!container) return;
  const logoSrc = getOfficialLogoSrc();
  container.querySelectorAll(".brand-logo, .brand-logo-legal, .brand-lockup__logo").forEach((img) => {
    img.src = logoSrc;
    img.alt = "GenesisOS Labs Logo";
    if (!img.hasAttribute("loading")) img.loading = "lazy";
  });
}

function getFooterTemplate() {
  const logoSrc = getOfficialLogoSrc();
  return `
<footer class="page-footer" data-footer>
  <div class="page-footer__inner">
    <div class="footer-brand">
      <img
        class="brand-logo"
        src="${logoSrc}"
        width="28"
        height="28"
        alt="GenesisOS Labs Logo"
        loading="lazy">
      <span class="brand-lockup__title">GenesisOS Labs</span>
    </div>
    <section aria-labelledby="footer-products">
      <h2 id="footer-products">Products</h2>
      <ul>
        <li><a href="/AerysDesktop.html">Aerys Desktop</a></li>
        <li><a href="/GCoin.html">GCoin</a></li>
        <li><a href="/Education.html">Education</a></li>
      </ul>
    </section>
    <section aria-labelledby="footer-company">
      <h2 id="footer-company">Company</h2>
      <ul>
        <li><a href="mailto:support@GenesisOSLabs.com">Contact</a></li>
        <li><a href="/index.html">Home</a></li>
      </ul>
    </section>
    <section aria-labelledby="footer-legal">
      <h2 id="footer-legal">Legal</h2>
      <ul>
        <li><a href="/terms/index.html">Terms &amp; Conditions</a></li>
        <li><a href="/privacy/index.html">Privacy Policy</a></li>
        <li><a href="/accessibility/index.html">Accessibility</a></li>
      </ul>
    </section>
    <section aria-labelledby="footer-social">
      <h2 id="footer-social">Follow us</h2>
      <ul>
        <li><a href="https://x.com/GenesisOSLabs" target="_blank" rel="noopener noreferrer">X</a></li>
        <li><a href="https://www.linkedin.com/company/104893537" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
        <li><a href="https://www.instagram.com/genesisoslabs/" target="_blank" rel="noopener noreferrer">Instagram</a></li>
        <li><a href="https://www.facebook.com/profile.php?id=61590064982617" target="_blank" rel="noopener noreferrer">Facebook</a></li>
      </ul>
    </section>
  </div>
  <div class="page-footer__legal">
    <img
      class="brand-logo-legal"
      src="${logoSrc}"
      width="22"
      height="22"
      alt=""
      loading="lazy">
    <span>© 2026 GenesisOS Labs LLC. All rights reserved.</span>
  </div>
</footer>
`;
}

function mountGlobalFooter(markup) {
  const existingFooters = document.querySelectorAll(".footer, .global-footer");
  existingFooters.forEach((footer) => footer.remove());

  const body = document.body;
  if (!body) return;

  const root = document.createElement("div");
  root.id = "global-footer-root";
  root.setAttribute("aria-live", "off");
  root.innerHTML = markup;
  body.appendChild(root);
  applyOfficialBrandLogos(root);
}

function closeNavDropdown(dropdown) {
  if (!dropdown) return;
  dropdown.classList.remove("is-open");
  const btn = qs(".nav-dropdown__toggle", dropdown);
  if (btn) btn.setAttribute("aria-expanded", "false");
}

function openNavDropdown(dropdown) {
  if (!dropdown) return;
  dropdown.classList.add("is-open");
  const btn = qs(".nav-dropdown__toggle", dropdown);
  if (btn) btn.setAttribute("aria-expanded", "true");
}

function prefersHoverNav() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function initNavDropdowns(nav) {
  const dropdowns = qsa("[data-nav-dropdown]", nav);
  if (!dropdowns.length) return;

  dropdowns.forEach((dropdown) => {
    const btn = qs(".nav-dropdown__toggle", dropdown);
    if (!btn) return;

    // Desktop: open/close on hover of the whole Products region (tab + menu)
    dropdown.addEventListener("mouseenter", () => {
      if (!prefersHoverNav()) return;
      dropdowns.forEach((other) => {
        if (other !== dropdown) closeNavDropdown(other);
      });
      openNavDropdown(dropdown);
    });

    dropdown.addEventListener("mouseleave", () => {
      if (!prefersHoverNav()) return;
      closeNavDropdown(dropdown);
    });

    // Mobile / touch: tap to toggle. Desktop click is not required to open.
    btn.addEventListener("click", (event) => {
      if (prefersHoverNav()) {
        event.preventDefault();
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      const willOpen = !dropdown.classList.contains("is-open");
      dropdowns.forEach((other) => {
        if (other !== dropdown) closeNavDropdown(other);
      });
      if (willOpen) openNavDropdown(dropdown);
      else closeNavDropdown(dropdown);
    });
  });

  document.addEventListener("click", (event) => {
    dropdowns.forEach((dropdown) => {
      if (!dropdown.contains(event.target)) closeNavDropdown(dropdown);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    dropdowns.forEach((dropdown) => closeNavDropdown(dropdown));
  });
}

function initNav() {
  const nav = qs(".site-nav") || qs("header nav");
  if (!nav) return;

  let toggle = qs("[data-nav-toggle]", nav);
  if (!toggle) {
    toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "nav-toggle";
    toggle.setAttribute("data-nav-toggle", "");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-controls", "primary-nav");
    toggle.textContent = "Menu";
    const links = qs(".nav-links, .links", nav);
    if (links) {
      if (!links.id) links.id = "primary-nav";
      nav.insertBefore(toggle, links);
    }
  }

  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    if (!open) {
      qsa("[data-nav-dropdown]", nav).forEach((dropdown) => closeNavDropdown(dropdown));
    }
  });

  initNavDropdowns(nav);

  qsa(".nav-links a, .links a", nav).forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      qsa("[data-nav-dropdown]", nav).forEach((dropdown) => closeNavDropdown(dropdown));
    });
  });
}

function markCurrentNav() {
  const currentFile = window.location.pathname.split("/").pop() || "index.html";
  const productPages = new Set(["CRM.html", "GGamingOS.html", "GStudentOS.html", "Products.html", "Gaming.html"]);

  qsa("nav .links a[href], nav .nav-links a[href]").forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("http") || href.startsWith("mailto:")) return;
    const file = href.split("/").pop();
    const isMatch =
      file === currentFile ||
      href === currentFile ||
      (currentFile === "Gaming.html" && file === "GGamingOS.html");
    if (isMatch) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });

  if (productPages.has(currentFile)) {
    qsa(".nav-dropdown__toggle").forEach((btn) => {
      btn.setAttribute("aria-current", "page");
    });
  }
}

function syncSelectedTasks(form) {
  const boxes = qsa("[data-task]", form);
  const selected = boxes.filter((b) => b.checked).map((b) => b.value);
  const hidden = qs("#selected-tasks", form) || qs("[name='selected_tasks']", form);
  if (hidden) hidden.value = selected.join(" | ");
  return selected;
}

function syncChipState(form) {
  qsa(".task-chip", form).forEach((chip) => {
    const input = chip.querySelector("input");
    chip.classList.toggle("is-checked", !!(input && input.checked));
  });
  qsa(".deploy-radio", form).forEach((chip) => {
    const input = chip.querySelector("input");
    chip.classList.toggle("is-checked", !!(input && input.checked));
  });
}

function initTaskLimits(form) {
  const boxes = qsa("[data-task]", form);
  if (!boxes.length) return;

  const error = qs("#task-error", form) || qs(".form-error", form);

  boxes.forEach((box) => {
    box.addEventListener("change", () => {
      const selected = boxes.filter((b) => b.checked);
      if (selected.length > MAX_TASKS) box.checked = false;
      syncSelectedTasks(form);
      syncChipState(form);
      if (error) error.classList.remove("is-visible");
    });
  });

  qsa('input[name="deployment"]', form).forEach((radio) => {
    radio.addEventListener("change", () => syncChipState(form));
  });

  syncChipState(form);
}

function initLeadForms() {
  qsa("form[data-lead-form]").forEach((form) => {
    initTaskLimits(form);

    form.addEventListener("submit", (event) => {
      const boxes = qsa("[data-task]", form);
      if (boxes.length) {
        const selected = syncSelectedTasks(form);
        const error = qs("#task-error", form) || qs(".form-error", form);
        if (selected.length < 1 || selected.length > MAX_TASKS) {
          event.preventDefault();
          if (error) error.classList.add("is-visible");
          return;
        }
      }

      const submitBtn = form.querySelector("button[type='submit']");
      if (!submitBtn) return;
      const status = form.querySelector(".form-status");

      submitBtn.disabled = true;
      const originalLabel = submitBtn.getAttribute("data-submit-label") || submitBtn.textContent || "Submit";
      submitBtn.textContent = "Submitting...";
      if (status) status.textContent = "Submitting your request...";

      window.setTimeout(() => {
        if (submitBtn.disabled) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalLabel;
          if (status) status.textContent = "Network is slow. Please try submitting again.";
        }
      }, 15000);
    });
  });
}

function ensureStickyCtas() {
  if (qs("[data-sticky-cta]") || qs("[data-scroll-cta]")) return;
  if (document.body.hasAttribute("data-skip-sticky-cta")) return;

  const demo = qs(DEMO_SELECTORS);
  if (!demo || !demo.id) return;

  const href = `#${demo.id}`;

  const sticky = document.createElement("div");
  sticky.className = "sticky-cta";
  sticky.setAttribute("data-sticky-cta", "");
  sticky.setAttribute("role", "region");
  sticky.setAttribute("aria-label", "Book a demo");
  sticky.innerHTML = `<p>Ready to get started?</p><a class="btn btn--primary" href="${href}">Book a Demo</a>`;

  const scroll = document.createElement("a");
  scroll.className = "btn btn--primary scroll-cta";
  scroll.setAttribute("data-scroll-cta", "");
  scroll.href = href;
  scroll.textContent = "Book a Demo";

  document.body.appendChild(sticky);
  document.body.appendChild(scroll);
}

function initStickyAndScrollCtas() {
  ensureStickyCtas();

  const sticky = qs("[data-sticky-cta]");
  const scrollCta = qs("[data-scroll-cta]");
  if (!sticky && !scrollCta) return;

  const hero = qs(".hero, .genesis-hero, .gjobs-hero, .pricing-hero, .coliseum-hero");
  const demo = qs(DEMO_SELECTORS);
  const finalCta = qs("#final-cta, .final-cta, .cta-section, .coliseum-cta");

  function update() {
    const y = window.scrollY || window.pageYOffset;
    const heroBottom = hero ? hero.offsetTop + hero.offsetHeight : 400;
    const demoRect = demo ? demo.getBoundingClientRect() : null;
    const finalRect = finalCta ? finalCta.getBoundingClientRect() : null;

    const pastHero = y > heroBottom - 80;
    const demoInView =
      demoRect &&
      demoRect.top < window.innerHeight * 0.85 &&
      demoRect.bottom > window.innerHeight * 0.2;
    const finalInView =
      finalRect && finalRect.top < window.innerHeight && finalRect.bottom > 0;

    const showSticky = pastHero && !demoInView && !finalInView;
    const showScroll = pastHero && !demoInView && !finalInView && y > heroBottom + 320;

    if (sticky) {
      sticky.classList.toggle("is-visible", showSticky);
      document.body.classList.toggle("has-sticky-cta", showSticky);
    }
    if (scrollCta) {
      scrollCta.classList.toggle("is-visible", showScroll);
    }
  }

  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
}

function modernizeLegacyButtons() {
  qsa(".primary-btn, .btn-primary, .lead-btn").forEach((el) => {
    if (el.classList.contains("btn")) return;
    el.classList.add("btn", "btn--primary");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  applyOfficialBrandLogos(document.querySelector("header, .site-header"));
  applyOfficialBrandLogos(document.querySelector(".page-footer"));

  if (!document.body.hasAttribute("data-skip-global-footer")) {
    const prefix = getAssetPrefix();
    fetch(`${prefix}components/GlobalFooter.html`)
      .then((response) => (response.ok ? response.text() : Promise.reject(new Error("Footer unavailable"))))
      .then((markup) => mountGlobalFooter(markup))
      .catch(() => mountGlobalFooter(getFooterTemplate()));
  }

  markCurrentNav();
  modernizeLegacyButtons();

  if (document.body.classList.contains("aerys-page")) {
    /* Detected via .aerys-page (not data-aerys-page). Continue shared init:
       AerysDesktop uses data-lead-form; aerys-desktop.js is not loaded and
       only handles form[data-aerys-form]. */
  }

  initNav();
  initLeadForms();
  initStickyAndScrollCtas();
});
