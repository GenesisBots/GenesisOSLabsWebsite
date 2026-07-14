(function () {
  "use strict";

  const MAX_TASKS = 3;

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function qsa(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }

  function initNav() {
    const nav = qs(".site-nav");
    const toggle = qs("[data-nav-toggle]");
    if (!nav || !toggle) return;

    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    qsa(".nav-links a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function syncSelectedTasks(form) {
    const boxes = qsa("[data-task]", form);
    const selected = boxes.filter((b) => b.checked).map((b) => b.value);
    const hidden = qs("#selected-tasks", form);
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
    const error = qs("#task-error", form);

    boxes.forEach((box) => {
      box.addEventListener("change", () => {
        const selected = boxes.filter((b) => b.checked);
        if (selected.length > MAX_TASKS) {
          box.checked = false;
        }
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

  function initAerysForm() {
    const form = qs("form[data-aerys-form]");
    if (!form) return;

    initTaskLimits(form);

    form.addEventListener("submit", (event) => {
      const selected = syncSelectedTasks(form);
      const error = qs("#task-error", form);
      const name = qs("#lead-name", form);
      const email = qs("#lead-email", form);
      const deployment = form.querySelector('input[name="deployment"]:checked');

      if (!name || !name.value.trim() || name.value.trim().length < 2) {
        event.preventDefault();
        if (name) name.focus();
        return;
      }
      if (!email || !email.value.trim() || !email.checkValidity()) {
        event.preventDefault();
        if (email) email.focus();
        return;
      }
      if (!deployment) {
        event.preventDefault();
        return;
      }
      if (selected.length < 1 || selected.length > MAX_TASKS) {
        event.preventDefault();
        if (error) error.classList.add("is-visible");
        const firstTask = qs("[data-task]", form);
        if (firstTask) firstTask.focus();
        return;
      }
      if (error) error.classList.remove("is-visible");

      const message = qs("#lead-message", form);
      if (message && !message.value.trim()) {
        message.value = "Selected tasks: " + selected.join("; ");
      } else if (message && message.value.trim() && selected.length) {
        const prefix = "Selected tasks: " + selected.join("; ") + "\n\n";
        if (!message.value.startsWith("Selected tasks:")) {
          message.value = prefix + message.value;
        }
      }
    });
  }

  function initStickyAndScrollCtas() {
    const sticky = qs("[data-sticky-cta]");
    const scrollCta = qs("[data-scroll-cta]");
    const hero = qs(".hero");
    const demo = qs("#demo-request");
    const finalCta = qs("#final-cta");

    if (!sticky && !scrollCta) return;

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
        finalRect &&
        finalRect.top < window.innerHeight &&
        finalRect.bottom > 0;

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

  function preserveAerysFooter() {
    /* Aerys page uses data-skip-global-footer; no global footer injection expected. */
  }

  document.addEventListener("DOMContentLoaded", () => {
    initNav();
    initAerysForm();
    initStickyAndScrollCtas();
    preserveAerysFooter();
  });
})();
