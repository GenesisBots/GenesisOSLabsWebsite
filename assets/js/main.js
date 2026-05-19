console.log("GenesisOS Labs site loaded.");

const OFFICIAL_LOGO = "assets/img/GenesisOSLabs G Logo v1 05132026.png";

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
  container.querySelectorAll(".brand-logo, .brand-logo-legal").forEach((img) => {
    img.src = logoSrc;
    img.alt = "GenesisOS Labs Logo";
    img.loading = "lazy";
  });
}

function getFooterTemplate() {
  const logoSrc = getOfficialLogoSrc();
  return `
<footer class="global-footer" data-global-footer>
  <div class="global-footer__inner">
    <div class="footer-brand">
      <img src="${logoSrc}"
           alt="GenesisOS Labs Logo"
           class="brand-logo"
           loading="lazy">
    </div>
    <section class="global-footer__column" aria-labelledby="footer-products">
      <h2 id="footer-products">Products</h2>
      <ul>
        <li><a href="/genesisOS.html">GenesisOS</a></li>
        <li><a href="/healthcare.html">Healthcare</a></li>
        <li><a href="/gbots.html">GBots</a></li>
        <li><a href="/coliseum.html">Coliseum</a></li>
        <li><a href="/gcrm.html">GCRM</a></li>
        <li><a href="/pricing.html">Pricing</a></li>
      </ul>
    </section>
    <section class="global-footer__column" aria-labelledby="footer-developers">
      <h2 id="footer-developers">Developers</h2>
      <ul>
        <li><a href="https://github.com/GenesisBots" target="_blank" rel="noopener noreferrer">GitHub</a></li>
      </ul>
    </section>
    <section class="global-footer__column" aria-labelledby="footer-company">
      <h2 id="footer-company">Company</h2>
      <ul>
        <li><a href="mailto:support@GenesisOSLabs.com">Contact</a></li>
      </ul>
    </section>
    <section class="global-footer__column" aria-labelledby="footer-social">
      <h2 id="footer-social">Follow us</h2>
      <ul>
        <li><a href="https://x.com/GenesisOSLabs" target="_blank" rel="noopener noreferrer">X</a></li>
        <li><a href="https://www.facebook.com/profile.php?id=61590064982617" target="_blank" rel="noopener noreferrer">Facebook</a></li>
        <li><a href="https://www.instagram.com/genesisoslabs/" target="_blank" rel="noopener noreferrer">Instagram</a></li>
        <li><a href="https://www.linkedin.com/company/104893537" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
      </ul>
    </section>
    <section class="global-footer__column" aria-labelledby="footer-legal">
      <h2 id="footer-legal">Legal</h2>
      <ul>
        <li><a href="/terms/index.html">Terms &amp; Conditions</a></li>
        <li><a href="/privacy/index.html">Privacy Policy</a></li>
        <li><a href="/accessibility/index.html">Accessibility</a></li>
      </ul>
    </section>
  </div>
  <div class="footer-legal global-footer__legal">
    <img src="${logoSrc}"
         alt="GenesisOS Labs Logo"
         class="brand-logo-legal"
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

document.addEventListener("DOMContentLoaded", () => {
  applyOfficialBrandLogos(document.querySelector("header"));

  fetch("/components/GlobalFooter.html")
    .then((response) => (response.ok ? response.text() : Promise.reject(new Error("Footer component unavailable"))))
    .then((markup) => mountGlobalFooter(markup))
    .catch(() => mountGlobalFooter(getFooterTemplate()));

  const currentFile = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll("nav .links a[href]");

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("http")) return;
    if (href === currentFile || href.endsWith(`/${currentFile}`)) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });

  const leadForms = document.querySelectorAll("form[data-lead-form]");
  leadForms.forEach((form) => {
    form.addEventListener("submit", () => {
      const submitBtn = form.querySelector("button[type='submit']");
      if (!submitBtn) return;
      const status = form.querySelector(".form-status");

      submitBtn.disabled = true;
      const originalLabel = submitBtn.getAttribute("data-submit-label") || submitBtn.textContent || "Submit";
      submitBtn.textContent = "Submitting...";
      status.textContent = "Submitting your request...";

      window.setTimeout(() => {
        if (submitBtn.disabled) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalLabel;
          status.textContent = "Network is slow. Please try submitting again.";
        }
      }, 15000);
    });
  });
});
