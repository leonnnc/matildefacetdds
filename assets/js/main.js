/* ==========================================================================
   matildefacetdds.com — Interactions
   Sticky header, mobile nav, hero carousel, scroll reveal, treatment modal.
   ========================================================================== */
(function () {
  "use strict";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ------------------------------------------------------------ sticky header */
  var header = $(".site-header");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 40);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* -------------------------------------------------------------- mobile nav */
  var burger = $(".burger");
  if (burger) {
    burger.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      burger.setAttribute("aria-expanded", String(open));
    });
    $$(".nav a").forEach(function (a) {
      a.addEventListener("click", function () {
        document.body.classList.remove("nav-open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ------------------------------------------------------------ hero carousel */
  var hero = {
    index: 0,
    timer: null,
    interval: 6500,
    slides: [],
    dots: []
  };

  function heroGo(i, user) {
    if (!hero.slides.length) return;
    hero.index = (i + hero.slides.length) % hero.slides.length;
    hero.slides.forEach(function (s, k) { s.classList.toggle("active", k === hero.index); });
    hero.dots.forEach(function (d, k) { d.classList.toggle("active", k === hero.index); });

    var data = (window.SITE && window.SITE.content.hero && window.SITE.content.hero.slides) || [];
    var s = data[hero.index] || {};
    var titleEl = $("#heroTitle"), textEl = $("#heroText"), content = $(".hero-content");
    if (titleEl && textEl) {
      if (content) content.style.opacity = "0";
      window.setTimeout(function () {
        titleEl.textContent = window.SITE.L(s, "title");
        textEl.textContent = window.SITE.L(s, "text");
        if (content) content.style.opacity = "1";
      }, 220);
    }
    if (user) heroRestart();
  }

  function heroRestart() {
    window.clearInterval(hero.timer);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    hero.timer = window.setInterval(function () { heroGo(hero.index + 1); }, hero.interval);
  }

  function heroInit() {
    hero.slides = $$(".hero-slide");
    hero.dots = $$("#heroDots button");
    if (!hero.slides.length) return;
    hero.index = 0;

    hero.dots.forEach(function (d, i) {
      d.addEventListener("click", function () { heroGo(i, true); });
    });
    var prev = $("#heroPrev"), next = $("#heroNext");
    if (prev) prev.addEventListener("click", function () { heroGo(hero.index - 1, true); });
    if (next) next.addEventListener("click", function () { heroGo(hero.index + 1, true); });

    var heroEl = $(".hero");
    if (heroEl) {
      heroEl.addEventListener("mouseenter", function () { window.clearInterval(hero.timer); });
      heroEl.addEventListener("mouseleave", heroRestart);
    }
    document.addEventListener("keydown", function (e) {
      if (!$(".hero")) return;
      if (e.key === "ArrowLeft") heroGo(hero.index - 1, true);
      if (e.key === "ArrowRight") heroGo(hero.index + 1, true);
    });

    /* swipe */
    var x0 = null;
    if (heroEl) {
      heroEl.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
      heroEl.addEventListener("touchend", function (e) {
        if (x0 === null) return;
        var dx = e.changedTouches[0].clientX - x0;
        if (Math.abs(dx) > 45) heroGo(hero.index + (dx < 0 ? 1 : -1), true);
        x0 = null;
      }, { passive: true });
    }
    heroRestart();
  }

  document.addEventListener("hero-rendered", heroInit);
  document.addEventListener("site-rendered", function () {
    if (document.readyState !== "loading") {
      if (!hero.slides.length || hero.slides.length !== $$(".hero-slide").length) heroInit();
    }
  });

  /* ----------------------------------------------------------- scroll reveal */
  var io = null;
  function revealInit() {
    var nodes = $$("[data-reveal]").filter(function (n) { return !n.classList.contains("in"); });
    if (!nodes.length) return;
    if (!("IntersectionObserver" in window)) {
      nodes.forEach(function (n) { n.classList.add("in"); });
      return;
    }
    if (!io) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            var d = parseInt(en.target.getAttribute("data-reveal-delay") || "0", 10);
            window.setTimeout(function () { en.target.classList.add("in"); }, d);
            io.unobserve(en.target);
          }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    }
    nodes.forEach(function (n) { io.observe(n); });
  }
  document.addEventListener("site-rendered", revealInit);

  /* -------------------------------------------------------- treatment modal */
  var modal = null;
  function modalInit() {
    modal = $("#serviceModal");
    if (!modal) return;

    document.addEventListener("click", function (ev) {
      var card = ev.target.closest && ev.target.closest("[data-service-index]");
      if (card) { openService(card.getAttribute("data-service-index")); return; }
      if (ev.target.closest && ev.target.closest("[data-modal-close]")) closeModal();
    });
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape") closeModal();
      if ((ev.key === "Enter" || ev.key === " ") && document.activeElement &&
          document.activeElement.hasAttribute("data-service-index")) {
        ev.preventDefault();
        openService(document.activeElement.getAttribute("data-service-index"));
      }
    });
  }

  function openService(i) {
    var svc = (window.SITE.content.services || [])[i];
    if (!svc || !modal) return;
    var title = modal.querySelector("[data-modal-title]");
    var group = modal.querySelector("[data-modal-group]");
    var body = modal.querySelector("[data-modal-body]");
    var ico = modal.querySelector("[data-modal-icon]");
    if (title) title.textContent = window.SITE.L(svc, "title");
    if (group) group.textContent = window.SITE.L(svc, "group");
    if (body) body.textContent = window.SITE.L(svc, "detail") || window.SITE.L(svc, "desc");
    if (ico) ico.innerHTML = window.SITE.icon(svc.icon);
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
    var closeBtn = modal.querySelector("[data-modal-close]");
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    if (!modal || !modal.classList.contains("open")) return;
    modal.classList.remove("open");
    document.body.style.overflow = "";
  }

  /* --------------------------------------------------------- smooth anchors */
  document.addEventListener("click", function (ev) {
    var a = ev.target.closest && ev.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute("href");
    if (!id || id === "#") return;
    var target = document.querySelector(id);
    if (!target) return;
    ev.preventDefault();
    var top = target.getBoundingClientRect().top + window.scrollY - 90;
    window.scrollTo({ top: top, behavior: "smooth" });
    history.replaceState(null, "", id);
  });

  /* ------------------------------------------------------------------- init */
  document.addEventListener("fb-ready", function () { revealInit(); });
  document.addEventListener("content-loaded", function () { modalInit(); revealInit(); });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      modalInit();
      revealInit();
      updateYear();
    });
  } else {
    modalInit();
    revealInit();
    updateYear();
  }

  function updateYear() {
    $$("[data-year]").forEach(function (n) { n.textContent = new Date().getFullYear(); });
  }

  window.UI = { openService: openService, closeModal: closeModal };
})();
