/* ============================================================
   FAAST Physical Therapy — app.js
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
    neck:    { title: "Neck & whiplash", body: "Stiffness, tension headaches, and post-accident whiplash. We restore range of motion and retrain the muscles that keep your head balanced — so it stops stealing your sleep and your focus." },
    shoulder:{ title: "Shoulder & rotator cuff", body: "Rotator cuff strains, frozen shoulder, and impingement that make reaching overhead a gamble. Hands-on mobilization and a progressive loading plan bring full, pain-free motion back." },
    elbow:   { title: "Elbow, wrist & hand", body: "Tennis and golfer's elbow, carpal tunnel, and sprains. We quiet the inflammation, correct the mechanics that caused it, and rebuild grip and wrist strength." },
    back:    { title: "Lower back & sciatica", body: "The number-one reason people walk in. Disc issues, sciatica, muscle strains, and stiffness that won't quit — assessed hands-on and treated with a clear plan to get you bending, lifting, and sleeping comfortably again." },
    hip:     { title: "Hip & pelvis", body: "Bursitis, post-surgical recovery, and the gait problems that travel down your leg. We rebuild stability and movement so each step stops sending pain elsewhere." },
    knee:    { title: "Knee & leg", body: "ACL and meniscus rehab, post-op recovery, and arthritis. A structured progression restores strength and confidence — whether you're returning to sport or just to the stairs." },
    ankle:   { title: "Ankle & foot", body: "Sprains, plantar fasciitis, and Achilles trouble. We rebuild balance and the support chain above the ankle so it stops rolling and stops hurting with every step." }
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
  }

  zones.forEach(function (z) {
    z.addEventListener("click", function () { selectZone(z.dataset.zone); });
  });
  items.forEach(function (i) {
    i.addEventListener("click", function () { selectZone(i.dataset.zone); });
  });

  /* ---------- Location sync (hero bar ↔ book toggle ↔ Cal.com ↔ callback) ---------- */
  // CAL_USERNAME must be replaced with the practice's Cal.com username at deploy.
  // Links are "username/event-slug" (no full URL) — Cal's embed.js builds the iframe.
  var CAL = {
    hillside: "CAL_USERNAME/hillside",
    carle:    "CAL_USERNAME/carle-place"
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
  // Clearing the box first means switching locations replaces — not stacks — embeds.
  function renderCal(loc) {
    var box = document.getElementById("calEmbed");
    if (!box || !CAL[loc]) return;
    if (CAL_TITLES[loc]) box.setAttribute("aria-label", CAL_TITLES[loc]);
    if (!window.Cal) return;
    box.innerHTML = "";
    try { window.Cal("inline", { elementOrSelector: "#calEmbed", calLink: CAL[loc] }); }
    catch (e) { /* Cal loader not ready or invalid link — fail quietly so the page stays interactive. */ }
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
  var initialLoc = (heroOptions.filter(function (o) { return o.classList.contains("is-active"); })[0] || {}).dataset.loc || "hillside";
  selectLocation(initialLoc);

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
