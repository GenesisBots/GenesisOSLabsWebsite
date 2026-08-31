const OFFICIAL_LOGO = "assets/img/logo.png";

const DEMO_SELECTORS = [
  "[data-demo-target]",
  "#demo-request",
  "#genesis-lead",
  "#gcrm-lead",
  "#audit-request",
  "#marketplace-contact",
  "#demo-form",
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

function prefersHoverNav() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
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

function initNavDropdowns(nav) {
  const dropdowns = qsa("[data-nav-dropdown]", nav);
  if (!dropdowns.length) return;

  dropdowns.forEach((dropdown) => {
    const btn = qs(".nav-dropdown__toggle", dropdown);
    if (!btn) return;

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

    btn.addEventListener("click", (event) => {
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
    const toggle = qs("[data-nav-toggle]", nav);
    if (nav.classList.contains("is-open") && toggle) {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.focus();
    }
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

function navKeyFromLocation() {
  const parts = window.location.pathname.replace(/\\/g, "/").split("/").filter(Boolean);
  const last = parts[parts.length - 1] || "index.html";
  const file = last.includes(".") ? last : (last.toLowerCase() === "privacy" || last.toLowerCase() === "terms" || last.toLowerCase() === "accessibility" ? last.toLowerCase() : "index.html");
  const map = {
    "index.html": "home",
    "AerysDesktop.html": "aerys",
    "GCoin.html": "gcoin",
    "Education.html": "education",
    "About.html": "about",
    "CRM.html": "crm",
    "GGamingOS.html": "ggamingos",
    "GStudentOS.html": "gstudentos",
    "EnterpriseTokenization.html": "tokenization",
    "GenesisOS.html": "genesisos",
  };
  return map[file] || "";
}

function markCurrentNav() {
  const key = navKeyFromLocation();
  if (!key) return;
  const productKeys = new Set(["crm", "ggamingos", "gstudentos", "tokenization", "genesisos"]);

  qsa("[data-nav]").forEach((el) => {
    const match = el.getAttribute("data-nav") === key;
    if (match) {
      el.setAttribute("aria-current", "page");
      el.classList.add("active");
    } else if (el.getAttribute("aria-current") === "page" && el.getAttribute("data-nav") !== "products") {
      el.removeAttribute("aria-current");
      el.classList.remove("active");
    }
  });

  if (productKeys.has(key)) {
    qsa(".nav-dropdown__toggle").forEach((btn) => {
      btn.setAttribute("aria-current", "page");
    });
  }
}

function trackLead(label) {
  if (typeof window.gtag === "function") {
    window.gtag("event", "generate_lead", {
      event_category: "form",
      event_label: label || "demo_request",
    });
  }
}

function injectHoneypot(form) {
  if (form.querySelector("[data-honeypot]")) return;
  const wrap = document.createElement("div");
  wrap.className = "hp-field";
  wrap.setAttribute("aria-hidden", "true");
  wrap.innerHTML =
    '<label>Company website<input type="text" name="website" tabindex="-1" autocomplete="off" data-honeypot aria-hidden="true"></label>';
  form.insertBefore(wrap, form.firstChild);
}

function ensureSuccessPanel(form) {
  if (form.querySelector(".lead-form-success")) return;
  const panel = document.createElement("div");
  panel.className = "lead-form-success";
  panel.setAttribute("role", "status");
  panel.innerHTML =
    "<h3>Request received.</h3><p>Thanks — we will follow up shortly at the email you provided.</p>";
  form.appendChild(panel);
}

function setFormStatus(form, message, modifier) {
  const status = form.querySelector(".form-status, .gjobs-form-status");
  if (!status) return;
  status.textContent = message || "";
  status.classList.remove("is-error", "is-success");
  if (modifier) status.classList.add(modifier);
}

function initLeadForms() {
  qsa("form[data-lead-form], form[data-gjobs-form]").forEach((form) => {
    injectHoneypot(form);
    ensureSuccessPanel(form);

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const honeypot = form.querySelector("[data-honeypot]");
      if (honeypot && honeypot.value.trim()) {
        form.classList.add("is-submitted");
        return;
      }

      if (!form.checkValidity()) {
        form.reportValidity();
        setFormStatus(form, "Please complete the required fields.", "is-error");
        return;
      }

      const submitBtn = form.querySelector("button[type='submit']");
      const originalLabel = submitBtn
        ? submitBtn.getAttribute("data-submit-label") || submitBtn.textContent || "Submit"
        : "Submit";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Submitting...";
      }
      setFormStatus(form, "Submitting your request...", "");

      const action = form.getAttribute("action");
      if (!action) return;

      const watchdog = window.setTimeout(() => {
        if (submitBtn && submitBtn.disabled) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalLabel;
          setFormStatus(form, "Network is slow. Please try submitting again.", "is-error");
        }
      }, 15000);

      const data = new FormData(form);
      fetch(action, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      })
        .then((res) => {
          window.clearTimeout(watchdog);
          if (res.ok) {
            const subject = form.querySelector("input[name='_subject']");
            trackLead(form.getAttribute("data-lead-event") || (subject && subject.value) || "demo_request");
            form.classList.add("is-submitted");
            setFormStatus(form, "", "is-success");
            try {
              form.reset();
            } catch (err) {
              /* ignore */
            }
            const panel = form.querySelector(".lead-form-success");
            if (panel) {
              try {
                panel.scrollIntoView({ behavior: "smooth", block: "center" });
              } catch (err) {
                panel.scrollIntoView();
              }
            }
            return;
          }
          return res
            .json()
            .then((json) => {
              const msg =
                json && json.errors && json.errors.length
                  ? json.errors.map((er) => er.message).join(", ")
                  : "Submission failed. Please try again.";
              throw new Error(msg);
            })
            .catch((err) => {
              throw err instanceof Error && err.message ? err : new Error("Submission failed. Please try again.");
            });
        })
        .catch((err) => {
          window.clearTimeout(watchdog);
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalLabel;
          }
          setFormStatus(form, err && err.message ? err.message : "Network error. Please try again.", "is-error");
        });
    });
  });
}

function ensureStickyCtas() {
  if (qs("[data-sticky-cta]")) return;
  if (document.body.hasAttribute("data-skip-sticky-cta")) return;

  const demo = qs(DEMO_SELECTORS);
  if (!demo || !demo.id) return;

  const href = `#${demo.id}`;
  const sticky = document.createElement("div");
  sticky.className = "sticky-cta";
  sticky.setAttribute("data-sticky-cta", "");
  sticky.setAttribute("role", "region");
  sticky.setAttribute("aria-label", "Book a Demo");
  sticky.innerHTML = `<p>Ready to get started?</p><a class="btn btn--primary" href="${href}">Book a Demo</a>`;
  document.body.appendChild(sticky);
}

function initStickyAndScrollCtas() {
  qsa("[data-scroll-cta]").forEach((el) => el.remove());
  ensureStickyCtas();

  const sticky = qs("[data-sticky-cta]");
  if (!sticky) return;

  const hero = qs(".hero, .genesis-hero");
  const demo = qs(DEMO_SELECTORS);
  const finalCta = qs("#final-cta, .final-cta, .cta-section");

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
    const finalInView = finalRect && finalRect.top < window.innerHeight && finalRect.bottom > 0;
    const showSticky = pastHero && !demoInView && !finalInView;
    sticky.classList.toggle("is-visible", showSticky);
    document.body.classList.toggle("has-sticky-cta", showSticky);
  }

  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
}

function getFooterTemplate() {
  const prefix = getAssetPrefix();
  const logoSrc = `${prefix}${OFFICIAL_LOGO}`;
  return `<footer class="page-footer" data-footer>
  <div class="page-footer__inner">
    <div class="footer-brand">
      <img class="brand-logo" src="${logoSrc}" width="28" height="28" alt="GenesisOS Labs Logo" loading="lazy">
      <span class="brand-lockup__title">GenesisOS Labs</span>
    </div>
    <section aria-labelledby="footer-products">
      <h2 id="footer-products">Products</h2>
      <ul>
        <li><a href="${prefix}AerysDesktop.html">Aerys Desktop</a></li>
        <li><a href="${prefix}GCoin.html">GCoin</a></li>
        <li><a href="${prefix}CRM.html">CRM</a></li>
        <li><a href="${prefix}GGamingOS.html">GGamingOS</a></li>
        <li><a href="${prefix}GStudentOS.html">GStudentOS</a></li>
        <li><a href="${prefix}EnterpriseTokenization.html">Enterprise Tokenization</a></li>
        <li><a href="${prefix}Education.html">Education</a></li>
      </ul>
    </section>
    <section aria-labelledby="footer-company">
      <h2 id="footer-company">Company</h2>
      <ul>
        <li><a href="${prefix}About.html">About</a></li>
        <li><a href="mailto:support@GenesisOSLabs.com">Contact</a></li>
        <li><a href="${prefix}index.html">Home</a></li>
      </ul>
    </section>
    <section aria-labelledby="footer-legal">
      <h2 id="footer-legal">Legal</h2>
      <ul>
        <li><a href="${prefix}terms/">Terms &amp; Conditions</a></li>
        <li><a href="${prefix}privacy/">Privacy Policy</a></li>
        <li><a href="${prefix}accessibility/">Accessibility</a></li>
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
    <img class="brand-logo-legal" src="${logoSrc}" width="22" height="22" alt="" loading="lazy">
    <span>© 2026 GenesisOS Labs LLC. All rights reserved.</span>
  </div>
</footer>`;
}

function mountGlobalFooter(markup) {
  if (qs("footer.page-footer")) return;
  const root = document.createElement("div");
  root.id = "global-footer-root";
  root.innerHTML = markup;
  document.body.appendChild(root);
}

function initFooter() {
  if (qs("footer.page-footer")) return;
  const prefix = getAssetPrefix();
  fetch(`${prefix}components/site-footer.html`)
    .then((response) => (response.ok ? response.text() : Promise.reject(new Error("Footer unavailable"))))
    .then((markup) => mountGlobalFooter(markup.replaceAll("{{P}}", prefix)))
    .catch(() => mountGlobalFooter(getFooterTemplate()));
}

document.addEventListener("DOMContentLoaded", () => {
  markCurrentNav();
  initNav();
  initLeadForms();
  initStickyAndScrollCtas();
  initFooter();
});
