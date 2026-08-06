/* ============================================================
   FAAST Physical Therapy - app.js
   No dependencies. Progressive enhancement only.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Footer year ---------- */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- Mobile menu ---------- */
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("mobileMenu");
  function setMenu(open) {
    if (!toggle || !menu) return;
    toggle.setAttribute("aria-expanded", String(open));
    menu.classList.toggle("is-open", open);
    menu.hidden = !open;
  }
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
    // auto-close when widening past the mobile breakpoint
    var wideMQ = window.matchMedia("(min-width: 821px)");
    if (wideMQ.addEventListener) wideMQ.addEventListener("change", function (e) { if (e.matches) setMenu(false); });
    else wideMQ.addListener(function (e) { if (e.matches) setMenu(false); });
  }

  /* ---------- Nav label condensation (≤1140 → short labels) ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-link"));
  var mq = window.matchMedia("(max-width: 1140px)");
  function applyNavLabels() {
    navLinks.forEach(function (link) {
      var short = link.getAttribute("data-short");
      var full = link.getAttribute("data-full") || link.textContent.trim();
      if (!short || short === full) return;
      link.textContent = mq.matches ? short : full;
      if (!link.getAttribute("aria-label")) link.setAttribute("aria-label", full);
    });
  }
  applyNavLabels();
  if (mq.addEventListener) mq.addEventListener("change", applyNavLabels);
  else mq.addListener(applyNavLabels);

  /* ---------- Pain map ---------- */
  var CONDITIONS = {
    neck:    { title: "Neck & whiplash", slug: "neck-pain-whiplash", body: "Stiffness, tension headaches, and post-accident whiplash. We restore range of motion and retrain the muscles that keep your head balanced - so it stops stealing your sleep and your focus." },
    shoulder:{ title: "Shoulder & rotator cuff", slug: "shoulder-rotator-cuff", body: "Rotator cuff strains, frozen shoulder, and impingement that make reaching overhead a gamble. Hands-on mobilization and a progressive loading plan bring full, pain-free motion back." },
    elbow:   { title: "Elbow, wrist & hand", slug: "elbow-wrist-hand", body: "Tennis and golfer's elbow, carpal tunnel, and sprains. We quiet the inflammation, correct the mechanics that caused it, and rebuild grip and wrist strength." },
    back:    { title: "Lower back & sciatica", slug: "lower-back-pain-sciatica", body: "The number-one reason people walk in. Disc issues, sciatica, muscle strains, and stiffness that won't quit - assessed hands-on and treated with a clear plan to get you bending, lifting, and sleeping comfortably again." },
    hip:     { title: "Hip & pelvis", slug: "hip-and-pelvis", body: "Bursitis, post-surgical recovery, and the gait problems that travel down your leg. We rebuild stability and movement so each step stops sending pain elsewhere." },
    knee:    { title: "Knee & leg", slug: "knee-and-leg", body: "ACL and meniscus rehab, post-op recovery, and arthritis. A structured progression restores strength and confidence - whether you're returning to sport or just to the stairs." },
    ankle:   { title: "Ankle & foot", slug: "ankle-and-foot", body: "Sprains, plantar fasciitis, and Achilles trouble. We rebuild balance and the support chain above the ankle so it stops rolling and stops hurting with every step." }
  };

  var zones = Array.prototype.slice.call(document.querySelectorAll(".zone"));
  var items = Array.prototype.slice.call(document.querySelectorAll(".treat-item"));
  var panelTitle = document.getElementById("panelTitle");
  var panelBody = document.getElementById("panelBody");

  function selectZone(key) {
    if (!CONDITIONS[key]) return;
    zones.forEach(function (z) { z.classList.toggle("is-active", z.dataset.zone === key); });
    items.forEach(function (i) { i.classList.toggle("is-active", i.dataset.zone === key); });
    if (panelTitle) panelTitle.textContent = CONDITIONS[key].title;
    if (panelBody) panelBody.textContent = CONDITIONS[key].body;
    var more = document.getElementById("panelMore");
    if (more) {
      more.setAttribute("href", "/services/" + CONDITIONS[key].slug + "/");
      var moreLabel = more.querySelector(".panel-more__label");
      if (moreLabel) moreLabel.textContent = "Learn more about " + CONDITIONS[key].title;
    }
  }

  zones.forEach(function (z) {
    z.addEventListener("click", function () { selectZone(z.dataset.zone); });
  });
  items.forEach(function (i) {
    i.addEventListener("click", function () { selectZone(i.dataset.zone); });
  });

  /* ---------- Location sync (hero bar ↔ book toggle ↔ Cal.com ↔ callback) ---------- */
  // Real Cal.com booking links (username "drasim", per-location event slugs).
  // Links are "username/event-slug" (no full URL) - Cal's embed.js builds the iframe.
  // Note the slugs differ by location: Carle Place uses "evaluation", Hillside uses "eval".
  var CAL = {
    hillside: "drasim/new-patient-eval-hillside",
    carle:    "drasim/new-patient-evaluation-carle-place"
  };
  var CAL_TITLES = {
    hillside: "Book an appointment at Hillside Avenue (Floral Park)",
    carle:    "Book an appointment at Carle Place"
  };

  var cbLoc = document.getElementById("cb-loc");
  var heroOptions = Array.prototype.slice.call(document.querySelectorAll("#heroBookingBar .loc-option"));
  var bookOptions = Array.prototype.slice.call(document.querySelectorAll("#bookToggle .loc-option"));
  var heroBookBtn = document.getElementById("heroBookBtn");

  function setOptionGroup(group, loc) {
    group.forEach(function (b) {
      var on = b.dataset.loc === loc;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-checked", String(on));
    });
  }

  // Render the Cal.com booking calendar for a location into #calEmbed.
  // embed.js (loader in <head>) exposes window.Cal; calls queue until it loads.
  // Clearing the box first means switching locations replaces - not stacks - embeds.
  function renderCal(loc) {
    var box = document.getElementById("calEmbed");
    if (!box || !CAL[loc]) return;
    if (CAL_TITLES[loc]) box.setAttribute("aria-label", CAL_TITLES[loc]);
    if (!window.Cal) return;
    box.innerHTML = "";
    try { window.Cal("inline", { elementOrSelector: "#calEmbed", calLink: CAL[loc] }); }
    catch (e) { /* Cal loader not ready or invalid link - fail quietly so the page stays interactive. */ }
  }

  function selectLocation(loc) {
    setOptionGroup(heroOptions, loc);
    setOptionGroup(bookOptions, loc);
    if (cbLoc) cbLoc.value = loc;
    renderCal(loc);
  }

  function wireOptions(group) {
    group.forEach(function (b) {
      b.addEventListener("click", function () { selectLocation(b.dataset.loc); });
    });
  }
  wireOptions(heroOptions);
  wireOptions(bookOptions);

  if (heroBookBtn) {
    heroBookBtn.addEventListener("click", function () {
      var active = heroOptions.filter(function (o) { return o.classList.contains("is-active"); })[0];
      if (active) selectLocation(active.dataset.loc);
      var book = document.getElementById("book");
      if (book) book.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  // initialize Cal.com embed to the active location
  var initialLoc = (function () {
    var h = heroOptions.filter(function (o) { return o.classList.contains("is-active"); })[0];
    var b = bookOptions.filter(function (o) { return o.classList.contains("is-active"); })[0];
    return (h && h.dataset.loc) || (b && b.dataset.loc) || "hillside";
  })();
  selectLocation(initialLoc);

  /* ---------- Callback form success modal ---------- */
  var callbackForm = document.querySelector('form[name="callback"]');
  var callbackModal = document.getElementById("callbackModal");
  if (callbackForm && callbackModal) {
    var callbackPhoneInput = callbackForm.querySelector('input[name="phone"]');
    function formatPhone(value) {
      var digits = value.replace(/\D/g, "");
      if (digits.length === 11 && digits.charAt(0) === "1") digits = digits.slice(1);
      digits = digits.slice(0, 10);
      if (digits.length > 6) return "(" + digits.slice(0, 3) + ") " + digits.slice(3, 6) + "-" + digits.slice(6);
      if (digits.length > 3) return "(" + digits.slice(0, 3) + ") " + digits.slice(3);
      return digits ? "(" + digits : "";
    }
    if (callbackPhoneInput) {
      callbackPhoneInput.addEventListener("input", function () {
        callbackPhoneInput.value = formatPhone(callbackPhoneInput.value);
      });
    }
    var closeCallbackModal = function () {
      callbackModal.hidden = true;
      document.body.classList.remove("modal-open");
    };
    callbackModal.querySelectorAll(".callback-modal__close, .callback-modal__done").forEach(function (button) {
      button.addEventListener("click", closeCallbackModal);
    });
    callbackModal.addEventListener("click", function (event) {
      if (event.target === callbackModal) closeCallbackModal();
    });
    callbackForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var callbackMessage = callbackForm.querySelector('input[name="callback_message"]');
      var callbackName = callbackForm.querySelector('input[name="client_name"]');
      var callbackPhone = callbackForm.querySelector('input[name="phone"]');
      if (callbackMessage && callbackName && callbackPhone) {
        callbackPhone.value = formatPhone(callbackPhone.value);
        callbackMessage.value = callbackName.value.trim() + " requested a callback with this number: " + callbackPhone.value.trim();
      }
      var submit = callbackForm.querySelector(".cb-submit");
      if (submit) { submit.disabled = true; submit.textContent = "Sending..."; }
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(new FormData(callbackForm)).toString()
      }).then(function (response) {
        if (!response.ok) throw new Error("Callback request failed");
        callbackForm.reset();
        callbackModal.hidden = false;
        document.body.classList.add("modal-open");
      }).catch(function () {
        alert("We couldn't send your request. Please call us at (516) 789-6322.");
      }).finally(function () {
        if (submit) { submit.disabled = false; submit.textContent = "Request a callback"; }
      });
    });
  }

  /* ---------- FAQ: close others on open (accordion-lite, optional a11y nicety) ---------- */
  var faqItems = Array.prototype.slice.call(document.querySelectorAll(".faq-item"));
  faqItems.forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (item.open) {
        faqItems.forEach(function (other) {
          if (other !== item) other.open = false;
        });
      }
    });
  });
})();
