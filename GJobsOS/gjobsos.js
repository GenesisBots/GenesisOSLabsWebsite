/* ==================================================
   GJobsOS Landing Page — Page Script
   - Smooth scroll for hero CTA -> #demo-form
   - Required field validation
   - Submission state + success confirmation
   - Graceful handling of missing video asset
   ================================================== */

(function () {
  "use strict";

  console.log(
    "%c GJobsOS LP Loaded Successfully ",
    "background:linear-gradient(90deg,#0167BF,#777777);color:#ffffff;font-weight:700;padding:4px 8px;border-radius:4px;"
  );

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    setupSmoothScroll();
    setupForm();
    setupVideoFallback();
  }

  /* ------------------------------------------------
     SMOOTH SCROLL
     - Buttons with [data-scroll-target]
     - In-page anchor links (#foo)
  ------------------------------------------------ */
  function setupSmoothScroll() {
    var triggers = document.querySelectorAll("[data-scroll-target]");
    triggers.forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        var selector = btn.getAttribute("data-scroll-target");
        if (!selector) return;
        var target = document.querySelector(selector);
        if (!target) return;
        e.preventDefault();
        smoothScrollTo(target);
      });
    });

    var anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach(function (a) {
      var href = a.getAttribute("href");
      if (!href || href === "#") return;
      a.addEventListener("click", function (e) {
        var target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        smoothScrollTo(target);
      });
    });
  }

  function smoothScrollTo(target) {
    if (!target) return;
    try {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (err) {
      target.scrollIntoView();
    }
    var focusable = target.querySelector("input, select, textarea, button");
    if (focusable) {
      window.setTimeout(function () {
        try { focusable.focus({ preventScroll: true }); } catch (err) { focusable.focus(); }
      }, 600);
    }
  }

  /* ------------------------------------------------
     FORM VALIDATION + SUBMIT STATE
  ------------------------------------------------ */
  function setupForm() {
    var form = document.querySelector("form[data-gjobs-form]");
    if (!form) return;

    var fieldsWrap = form.querySelector(".gjobs-form-fields") || wrapFields(form);
    var status = form.querySelector(".gjobs-form-status");
    var submitBtn = form.querySelector('button[type="submit"]');
    var originalLabel = submitBtn ? (submitBtn.getAttribute("data-submit-label") || submitBtn.textContent) : "";

    ensureSuccessPanel(form);

    form.querySelectorAll("input, select, textarea").forEach(function (field) {
      field.addEventListener("input", function () { clearInvalid(field); });
      field.addEventListener("change", function () { clearInvalid(field); });
    });

    form.addEventListener("submit", function (e) {
      var invalid = validateRequired(form);
      if (invalid.length) {
        e.preventDefault();
        setStatus(status, "Please complete the required fields.", "is-error");
        try { invalid[0].focus(); } catch (err) {}
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Submitting...";
      }
      setStatus(status, "Submitting your request...", "");

      var watchdog = window.setTimeout(function () {
        if (submitBtn && submitBtn.disabled) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalLabel || "Book My Demo";
          setStatus(status, "Network is slow. Please try submitting again.", "is-error");
        }
      }, 15000);

      submitViaFetch(form, fieldsWrap, status, submitBtn, originalLabel, watchdog, e);
    });
  }

  function wrapFields(form) {
    var wrap = document.createElement("div");
    wrap.className = "gjobs-form-fields";
    var nodes = Array.prototype.slice.call(form.childNodes);
    nodes.forEach(function (n) { wrap.appendChild(n); });
    form.appendChild(wrap);
    return wrap;
  }

  function ensureSuccessPanel(form) {
    if (form.querySelector(".gjobs-form-success")) return;
    var panel = document.createElement("div");
    panel.className = "gjobs-form-success";
    panel.setAttribute("role", "status");
    panel.innerHTML =
      '<h3>Form submitted successfully.</h3>' +
      '<p>Thanks &mdash; we will reach out shortly to schedule your GJobsOS demo.</p>';
    form.appendChild(panel);
  }

  function validateRequired(form) {
    var invalid = [];
    form.querySelectorAll("[required]").forEach(function (field) {
      var ok = !!field.value && String(field.value).trim().length > 0;
      if (ok && field.type === "email") {
        ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
      }
      if (!ok) {
        field.classList.add("is-invalid");
        invalid.push(field);
      } else {
        field.classList.remove("is-invalid");
      }
    });
    return invalid;
  }

  function clearInvalid(field) {
    field.classList.remove("is-invalid");
  }

  function setStatus(el, msg, modifier) {
    if (!el) return;
    el.textContent = msg || "";
    el.classList.remove("is-error", "is-success");
    if (modifier) el.classList.add(modifier);
  }

  function submitViaFetch(form, fieldsWrap, status, submitBtn, originalLabel, watchdog, evt) {
    var action = form.getAttribute("action");
    if (!action) return;
    evt.preventDefault();

    var data = new FormData(form);
    fetch(action, {
      method: "POST",
      body: data,
      headers: { "Accept": "application/json" }
    })
      .then(function (res) {
        window.clearTimeout(watchdog);
        if (res.ok) {
          showSuccess(form, fieldsWrap, status);
        } else {
          res.json().then(function (json) {
            var msg = (json && json.errors && json.errors.length)
              ? json.errors.map(function (er) { return er.message; }).join(", ")
              : "Submission failed. Please try again.";
            failSubmit(submitBtn, originalLabel, status, msg);
          }).catch(function () {
            failSubmit(submitBtn, originalLabel, status, "Submission failed. Please try again.");
          });
        }
      })
      .catch(function () {
        window.clearTimeout(watchdog);
        failSubmit(submitBtn, originalLabel, status, "Network error. Please try again.");
      });
  }

  function showSuccess(form, fieldsWrap, status) {
    form.classList.add("is-submitted");
    setStatus(status, "", "is-success");
    try { form.reset(); } catch (err) {}
    var panel = form.querySelector(".gjobs-form-success");
    if (panel) {
      try { panel.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (err) {}
    }
  }

  function failSubmit(submitBtn, originalLabel, status, msg) {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel || "Book My Demo";
    }
    setStatus(status, msg, "is-error");
  }

  /* ------------------------------------------------
     VIDEO ERROR HANDLING
     - Keep console clean if file is missing
  ------------------------------------------------ */
  function setupVideoFallback() {
    var video = document.querySelector("video.demo-video");
    if (!video) return;
    video.addEventListener("error", function () {}, true);
    var sources = video.querySelectorAll("source");
    sources.forEach(function (s) {
      s.addEventListener("error", function () {}, true);
    });
  }
})();
