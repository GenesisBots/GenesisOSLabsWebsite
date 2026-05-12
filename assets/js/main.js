console.log("GenesisOS Labs site loaded.");

const footerTemplate = `
<footer class="global-footer" data-global-footer>
  <div class="global-footer__inner">
    <section class="global-footer__column" aria-labelledby="footer-products">
      <h2 id="footer-products">Products</h2>
      <ul>
        <li><a href="/genesisOS.html">GenesisOS</a></li>
        <li><a href="/healthcare.html">Healthcare</a></li>
        <li><a href="/gbots.html">GBots</a></li>
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
    <section class="global-footer__column" aria-labelledby="footer-legal">
      <h2 id="footer-legal">Legal</h2>
      <ul>
        <li><a href="/terms/index.html">Terms &amp; Conditions</a></li>
        <li><a href="/privacy/index.html">Privacy Policy</a></li>
        <li><a href="/accessibility/index.html">Accessibility</a></li>
      </ul>
    </section>
  </div>
  <p class="global-footer__legal">© 2026 GenesisOS Labs LLC. All rights reserved.</p>
</footer>
`;

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
}

document.addEventListener("DOMContentLoaded", () => {
  fetch("/components/GlobalFooter.html")
    .then((response) => (response.ok ? response.text() : Promise.reject(new Error("Footer component unavailable"))))
    .then((markup) => mountGlobalFooter(markup))
    .catch(() => mountGlobalFooter(footerTemplate));

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
