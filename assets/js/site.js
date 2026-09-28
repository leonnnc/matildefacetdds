/* ==========================================================================
   matildefacetdds.com — Site engine
   Language switching, theme application and dynamic rendering of every
   section from the live content (Firestore) with content.js as fallback.
   ========================================================================== */
window.SITE = (function () {
  "use strict";

  var LS_LANG = "fd_lang";
  var state = {
    lang: detectLang(),
    content: window.DEFAULT_CONTENT,
    source: "default"
  };

  /* ------------------------------------------------------------------ utils */
  function detectLang() {
    try {
      var saved = localStorage.getItem(LS_LANG);
      if (saved === "en" || saved === "es") return saved;
    } catch (e) {}
    var nav = (navigator.language || navigator.userLanguage || "en").toLowerCase();
    return nav.indexOf("es") === 0 ? "es" : "en";
  }

  function t(key, vars) {
    var dict = (window.I18N && window.I18N[state.lang]) || {};
    var fallback = (window.I18N && window.I18N.en) || {};
    var out = dict[key] || fallback[key] || key;
    if (vars) {
      Object.keys(vars).forEach(function (k) { out = out.replace("{" + k + "}", vars[k]); });
    }
    return out;
  }

  /* Localised field picker: L(obj, "title") -> obj.title_es / obj.title_en */
  function L(obj, base) {
    if (!obj) return "";
    return obj[base + "_" + state.lang] || obj[base + "_en"] || obj[base + "_es"] || "";
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function el(id) { return document.getElementById(id); }
  function icon(name) { return (window.ICONS && window.ICONS[name]) || ""; }

  function telHref(raw) { return "tel:" + String(raw || "").replace(/[^\d+]/g, ""); }

  /* ------------------------------------------------------- language + theme */
  function applyLangAttributes() {
    document.documentElement.setAttribute("lang", state.lang);
    document.querySelectorAll("[data-lang-btn]").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-lang-btn") === state.lang);
      b.setAttribute("aria-pressed", String(b.getAttribute("data-lang-btn") === state.lang));
    });
  }

  function applyI18n() {
    document.querySelectorAll("[data-i18n]").forEach(function (n) {
      n.textContent = t(n.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (n) {
      n.setAttribute("placeholder", t(n.getAttribute("data-i18n-ph")));
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (n) {
      n.setAttribute("aria-label", t(n.getAttribute("data-i18n-aria")));
    });
  }

  function applyTheme(theme) {
    if (!theme) return;
    var root = document.documentElement.style;
    if (theme.primary) root.setProperty("--primary", theme.primary);
    if (theme.primaryDark) root.setProperty("--primary-dark", theme.primaryDark);
    if (theme.primarySoft) root.setProperty("--primary-soft", theme.primarySoft);
    if (theme.accent) root.setProperty("--accent", theme.accent);
    if (theme.ink) root.setProperty("--ink", theme.ink);
  }

  /* -------------------------------------------------------------- rendering */
  function c() { return state.content || {}; }

  function renderHeader() {
    var b = c().brand || {};
    var nameEl = el("brandName");
    if (nameEl) nameEl.textContent = b.name || "matildefacetdds.com";
    var tagEl = el("brandTagline");
    if (tagEl) tagEl.textContent = L(b, "tagline");
    var logoImg = document.querySelector(".brand-logo img");
    if (logoImg && b.logo) logoImg.src = b.logo;
    var ctaPhone = el("headerPhone");
    if (ctaPhone) {
      var ct = c().contact || {};
      ctaPhone.href = telHref(ct.phoneRaw || ct.phone);
      var lbl = ctaPhone.querySelector("[data-phone-label]");
      if (lbl) lbl.textContent = ct.phone || "";
    }
  }

  function renderHero() {
    var wrap = el("heroSlides");
    if (!wrap) return;
    var slides = (c().hero && c().hero.slides) || [];
    wrap.innerHTML = slides.map(function (s, i) {
      return '<div class="hero-slide' + (i === 0 ? " active" : "") + '" role="group" ' +
        'aria-roledescription="slide" aria-label="' + (i + 1) + ' / ' + slides.length + '" ' +
        'style="background-image:url(' + esc(s.image) + ')"></div>';
    }).join("");

    var first = slides[0] || {};
    setText("heroTitle", L(first, "title"));
    setText("heroText", L(first, "text"));

    var dots = el("heroDots");
    if (dots) {
      dots.innerHTML = slides.map(function (_, i) {
        return '<button type="button" class="' + (i === 0 ? "active" : "") + '" data-slide="' + i +
          '" aria-label="' + t("hero.scroll") + " " + (i + 1) + '"></button>';
      }).join("");
    }
    document.dispatchEvent(new CustomEvent("hero-rendered"));
  }

  function renderStats() {
    var wrap = el("statGrid");
    if (!wrap) return;
    wrap.innerHTML = (c().stats || []).map(function (s) {
      return '<div class="trust-item"><div class="num">' + esc(s.num) + '</div>' +
        '<div class="lbl">' + esc(L(s, "label")) + "</div></div>";
    }).join("");
  }

  function renderServices() {
    var wrap = el("serviceGrid");
    if (!wrap) return;
    wrap.innerHTML = (c().services || []).map(function (s, i) {
      return '<article class="card" data-service-index="' + i + '" tabindex="0" role="button" ' +
        'aria-label="' + esc(L(s, "title")) + '">' +
        '<div class="ico">' + icon(s.icon) + "</div>" +
        '<div class="eyebrow" style="margin-bottom:.6rem">' + esc(L(s, "group")) + "</div>" +
        "<h3>" + esc(L(s, "title")) + "</h3>" +
        "<p>" + esc(L(s, "desc")) + "</p>" +
        '<span class="card-more">' + t("services.details") + icon("arrowRight") + "</span>" +
        "</article>";
    }).join("");
  }

  function renderWhy() {
    var wrap = el("whyGrid");
    if (!wrap) return;
    wrap.innerHTML = (c().why || []).map(function (s) {
      return '<article class="card"><div class="ico">' + icon(s.icon) + "</div>" +
        "<h3>" + esc(L(s, "title")) + "</h3><p>" + esc(L(s, "text")) + "</p></article>";
    }).join("");
  }

  function renderAbout() {
    var a = c().about || {};
    var img = el("aboutImage");
    if (img) { img.src = a.image || "assets/img/about.jpg"; img.alt = esc(L(a, "title")); }
    setText("aboutEyebrow", L(a, "eyebrow") || t("about.eyebrow"));
    setText("aboutTitle", L(a, "title"));
    setText("aboutSubtitle", L(a, "subtitle"));
    var body = el("aboutBody");
    if (body) {
      body.innerHTML = ["p1", "p2", "p3"].map(function (k) {
        var v = L(a, k);
        return v ? "<p>" + esc(v) + "</p>" : "";
      }).join("");
    }
  }

  function renderTestimonials() {
    var section = el("testimonialsSection");
    var tst = c().testimonials || {};
    if (section && tst.enabled === false) { section.style.display = "none"; return; }
    var wrap = el("testiTrack");
    if (!wrap) return;
    var stars = function (n) {
      var out = "";
      for (var i = 0; i < (n || 5); i++) out += icon("star");
      return out;
    };
    wrap.innerHTML = (tst.items || []).map(function (r) {
      return '<figure class="testi-card">' +
        '<div class="testi-stars" aria-label="' + (r.rating || 5) + '/5">' + stars(r.rating) + "</div>" +
        "<blockquote><p>" + esc(L(r, "text")) + "</p></blockquote>" +
        '<figcaption class="testi-who">' +
        '<div class="testi-avatar" aria-hidden="true">' + esc((r.name || "?").charAt(0).toUpperCase()) + "</div>" +
        "<div><strong>" + esc(r.name) + "</strong><span>" + esc(L(r, "meta")) + "</span></div>" +
        "</figcaption></figure>";
    }).join("");
    var note = el("testiNote");
    if (note) {
      var nt = L(tst, "note");
      note.textContent = nt || "";
      note.style.display = nt ? "block" : "none";
    }
  }

  function renderVisit() {
    var ct = c().contact || {};
    var hours = c().hours || [];

    setText("visitTitle", t("visit.title"));
    setText("visitSubtitle", t("visit.subtitle"));

    var hl = el("hoursList");
    if (hl) {
      hl.innerHTML = hours.map(function (h) {
        var time = L(h, "time") || h.time || "";
        return '<div class="hours-row"><span>' + esc(L(h, "day")) + "</span><span>" + esc(time) + "</span></div>";
      }).join("");
    }
    var hn = el("hoursNote");
    if (hn) hn.textContent = L(c(), "hoursNote") || "";

    var ci = el("contactInfo");
    if (ci) {
      ci.innerHTML =
        infoRow("pin", "address", ct.addressLine1 + ", " + ct.addressLine2 + "<br>" + ct.city + ", " + ct.state + " " + ct.zip, ct.mapsLink) +
        infoRow("phone", "phone", ct.phone, telHref(ct.phoneRaw || ct.phone)) +
        infoRow("mail", "email", ct.email, "mailto:" + ct.email) +
        (ct.fax ? infoRow("card", "fax", ct.fax) : "");
    }
    var em = el("emergencyBox");
    if (em) {
      em.innerHTML = '<strong>' + t("visit.emergency") + "</strong><p>" + t("visit.emergencyText") +
        ' <a href="' + telHref(ct.emergencyRaw || ct.emergency) + '">' + esc(ct.emergency) + "</a></p>";
    }

    var map = el("mapWrap");
    if (map && ct.mapsQuery) {
      map.innerHTML = '<iframe title="' + esc(t("visit.mapTitle")) + '" loading="lazy" referrerpolicy="no-referrer-when-downgrade" ' +
        'src="https://maps.google.com/maps?q=' + encodeURIComponent(ct.mapsQuery) + '&z=15&output=embed"></iframe>';
    }
    var dir = el("directionsBtn");
    if (dir && ct.mapsLink) dir.href = ct.mapsLink;
  }

  function infoRow(ic, labelKey, value, href) {
    var inner = href
      ? '<a href="' + esc(href) + '"' + (/^https?:/.test(href) ? ' target="_blank" rel="noopener"' : "") + ">" + value + "</a>"
      : "<div>" + value + "</div>";
    return '<div class="info-row"><span class="ico">' + icon(ic) + "</span><div>" +
      "<strong>" + t("visit." + labelKey) + "</strong>" + inner + "</div></div>";
  }

  function renderFaq() {
    var wrap = el("faqList");
    if (!wrap) return;
    wrap.innerHTML = (c().faq || []).map(function (f) {
      return "<details class=\"faq-item\"><summary><span>" + esc(L(f, "q")) + "</span>" +
        '<span class="chev">' + icon("chevronDown") + "</span></summary>" +
        '<div class="faq-body">' + esc(L(f, "a")) + "</div></details>";
    }).join("");
  }

  function renderDocs() {
    var wrap = el("docsGrid");
    if (!wrap) return;
    wrap.innerHTML = (c().documents || []).map(function (d) {
      return '<a class="card" href="' + esc(d.href || "#") + '"><div class="ico">' + icon(d.icon) + "</div>" +
        "<h3>" + esc(L(d, "title")) + "</h3><p>" + esc(L(d, "desc")) + "</p>" +
        '<span class="card-more">' + t("cta.learnMore") + icon("arrowRight") + "</span></a>";
    }).join("");
  }

  function renderFooter() {
    var b = c().brand || {}, ct = c().contact || {};
    setText("footerBrandName", b.name || "");
    setText("footerTagline", L(b, "tagline"));
    setText("footerYear", new Date().getFullYear());

    var fl = el("footerLinks");
    if (fl) {
      var pages = [
        { href: "index.html", k: "nav.home" },
        { href: "index.html#services", k: "nav.services" },
        { href: "index.html#about", k: "nav.about" },
        { href: "index.html#visit", k: "nav.visit" },
        { href: "index.html#faq", k: "nav.faq" },
        { href: "appointment.html", k: "nav.book" },
        { href: "contact.html", k: "nav.contact" }
      ];
      fl.innerHTML = pages.map(function (p) {
        return '<a href="' + p.href + '">' + icon("chevronRight") + "<span>" + t(p.k) + "</span></a>";
      }).join("");
    }

    var fh = el("footerHoursList");
    if (fh) {
      fh.innerHTML = (c().hours || []).slice(0, 2).map(function (h) {
        return '<div class="hours-row" style="border-color:rgba(255,255,255,.13)"><span>' + esc(L(h, "day")) +
          '</span><span style="color:rgba(255,255,255,.6)">' + esc(L(h, "time") || h.time || "") + "</span></div>";
      }).join("");
    }

    var fc = el("footerContact");
    if (fc) {
      fc.innerHTML =
        '<p style="margin:0 0 .5rem">' + esc(ct.addressLine1) + "<br>" + esc(ct.addressLine2) + "<br>" +
        esc(ct.city + ", " + ct.state + " " + ct.zip) + "</p>" +
        '<p style="margin:0 0 .35rem"><a href="' + telHref(ct.phoneRaw || ct.phone) + '">' + esc(ct.phone) + "</a></p>" +
        '<p style="margin:0"><a href="mailto:' + esc(ct.email) + '">' + esc(ct.email) + "</a></p>";
    }

    var soc = el("socials");
    if (soc) {
      var list = c().social || [];
      soc.innerHTML = list.map(function (s) {
        return '<a href="' + esc(s.url) + '" target="_blank" rel="noopener" aria-label="' + esc(s.label || s.icon) + '">' +
          icon(s.icon) + "</a>";
      }).join("");
      soc.style.display = list.length ? "flex" : "none";
    }
  }

  function renderFab() {
    var fab = el("fab");
    if (!fab) return;
    var ct = c().contact || {};
    if (ct.whatsapp) {
      fab.href = "https://wa.me/" + String(ct.whatsapp).replace(/[^\d]/g, "");
      fab.innerHTML = icon("whatsapp");
      fab.setAttribute("aria-label", "WhatsApp");
      fab.style.display = "grid";
    } else {
      fab.href = telHref(ct.phoneRaw || ct.phone);
      fab.innerHTML = icon("phone");
      fab.setAttribute("aria-label", t("cta.call"));
      fab.style.display = "grid";
    }
  }

  function renderSeo() {
    var seo = c().seo || {};
    var page = document.body.getAttribute("data-page") || "home";
    var title = L(seo, "title");
    var desc = L(seo, "desc");
    var pageTitleKey = { appointment: "appt.title", contact: "contact.pageTitle" }[page];
    if (pageTitleKey) document.title = t(pageTitleKey);
    else if (page === "home" && title) document.title = title;
    if (desc) {
      var m = document.querySelector('meta[name="description"]');
      if (m) m.setAttribute("content", desc);
    }
  }

  function setText(id, value) {
    var n = el(id);
    if (n && value != null) n.textContent = value;
  }

  /* ------------------------------------------------------------------ public */
  function renderAll() {
    applyLangAttributes();
    applyI18n();
    renderHeader();
    renderHero();
    renderStats();
    renderServices();
    renderWhy();
    renderAbout();
    renderTestimonials();
    renderVisit();
    renderFaq();
    renderDocs();
    renderFooter();
    renderFab();
    renderSeo();
    document.dispatchEvent(new CustomEvent("site-rendered", { detail: { lang: state.lang } }));
  }

  function setLang(lang) {
    if (lang !== "en" && lang !== "es") return;
    state.lang = lang;
    try { localStorage.setItem(LS_LANG, lang); } catch (e) {}
    renderAll();
  }

  async function loadContent() {
    /* Demo mode: allow previewing local edits made in the admin panel */
    if (!window.FB || !window.FB.enabled) {
      try {
        var local = JSON.parse(localStorage.getItem("fd_site_config_preview") || "null");
        if (local) { state.content = deepMerge(window.DEFAULT_CONTENT, local); state.source = "local"; return; }
      } catch (e) {}
      state.source = "default";
      return;
    }
    try {
      var remote = await window.FB.getSiteConfig();
      if (remote) {
        state.content = deepMerge(window.DEFAULT_CONTENT, remote);
        state.source = "firestore";
      }
    } catch (e) {
      console.warn("[matildefacetdds.com] Could not load Firestore content, using defaults.", e);
    }
  }

  function deepMerge(base, patch) {
    if (Array.isArray(patch)) return patch;           /* arrays replace wholesale */
    if (patch === null || typeof patch !== "object") return patch === undefined ? base : patch;
    var out = Array.isArray(base) ? base.slice() : Object.assign({}, base);
    Object.keys(patch).forEach(function (k) {
      out[k] = deepMerge(base && base[k] !== undefined ? base[k] : undefined, patch[k]);
    });
    return out;
  }

  function init() {
    renderAll();
    document.addEventListener("fb-ready", async function () {
      await loadContent();
      if (state.source === "firestore" || state.source === "local") {
        applyTheme(c().theme);
        renderAll();
      }
      document.dispatchEvent(new CustomEvent("content-loaded", { detail: { source: state.source } }));
    });

    document.addEventListener("click", function (ev) {
      var b = ev.target.closest && ev.target.closest("[data-lang-btn]");
      if (b) { setLang(b.getAttribute("data-lang-btn")); }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  return {
    t: t,
    L: L,
    esc: esc,
    get lang() { return state.lang; },
    get content() { return state.content; },
    get source() { return state.source; },
    setLang: setLang,
    render: renderAll,
    loadContent: loadContent,
    applyTheme: applyTheme,
    icon: icon,
    telHref: telHref
  };
})();
