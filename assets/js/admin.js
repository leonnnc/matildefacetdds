/* ==========================================================================
   matildefacetdds.com — Admin panel
   Hidden, authenticated back-office: site content, images, appointments,
   patients, follow-ups and messages.
   ========================================================================== */
(function () {
  "use strict";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var LS_CONFIG = "fd_site_config_preview";

  var A = {
    user: null,
    demo: false,
    config: null,     /* last saved */
    draft: null,      /* working copy */
    tab: "brand",
    appointments: [],
    patients: [],
    followups: [],
    messages: []
  };

  /* ================================================================== utils */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function getPath(obj, path) {
    return String(path).split(".").reduce(function (o, k) {
      return (o == null) ? undefined : o[k];
    }, obj);
  }
  function setPath(obj, path, value) {
    var parts = String(path).split(".");
    var cur = obj;
    for (var i = 0; i < parts.length - 1; i++) {
      var k = parts[i];
      if (cur[k] == null) cur[k] = /^\d+$/.test(parts[i + 1]) ? [] : {};
      cur = cur[k];
    }
    cur[parts[parts.length - 1]] = value;
  }
  function toast(node, msg, isErr) {
    if (!node) return;
    node.textContent = msg;
    node.className = "status" + (isErr ? " err" : "");
    if (!isErr) window.setTimeout(function () { if (node.textContent === msg) node.textContent = ""; }, 3200);
  }
  function ts(v) {
    if (!v) return null;
    if (typeof v.toDate === "function") return v.toDate();
    if (typeof v.seconds === "number") return new Date(v.seconds * 1000);
    var d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }
  function fmt(v) {
    var d = ts(v);
    if (!d) return "—";
    return d.toLocaleString("es", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }
  function fmtDay(v) {
    if (!v) return "—";
    var d = new Date(v + "T12:00:00");
    if (isNaN(d.getTime())) return v;
    return d.toLocaleDateString("es", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
  }
  function initials(s) { return String(s || "?").trim().charAt(0).toUpperCase() || "?"; }

  /* ============================================================ data layer */
  function demoKey(col) { return "fd_demo_" + col; }

  var store = {
    async list(col) {
      if (window.FB && window.FB.enabled) {
        try { return await window.FB.list(col); }
        catch (e) { console.warn("list " + col, e); return []; }
      }
      try { return JSON.parse(localStorage.getItem(demoKey(col)) || "[]"); } catch (e) { return []; }
    },
    async add(col, data) {
      if (window.FB && window.FB.enabled) return window.FB.add(col, data);
      var all = await store.list(col);
      var rec = Object.assign({}, data, { id: "d" + Date.now(), createdAt: { seconds: Math.floor(Date.now() / 1000) } });
      all.unshift(rec);
      localStorage.setItem(demoKey(col), JSON.stringify(all));
      return rec;
    },
    async update(col, id, data) {
      if (window.FB && window.FB.enabled) return window.FB.update(col, id, data);
      var all = await store.list(col);
      for (var i = 0; i < all.length; i++) if (all[i].id === id) all[i] = Object.assign({}, all[i], data);
      localStorage.setItem(demoKey(col), JSON.stringify(all));
      return true;
    },
    async remove(col, id) {
      if (window.FB && window.FB.enabled) return window.FB.remove(col, id);
      var all = await store.list(col);
      all = all.filter(function (r) { return r.id !== id; });
      localStorage.setItem(demoKey(col), JSON.stringify(all));
      return true;
    }
  };

  async function loadConfig() {
    if (window.FB && window.FB.enabled) {
      var remote = await window.FB.getSiteConfig();
      return remote || clone(window.DEFAULT_CONTENT);
    }
    try {
      var local = JSON.parse(localStorage.getItem(LS_CONFIG) || "null");
      if (local) return deepMerge(clone(window.DEFAULT_CONTENT), local);
    } catch (e) {}
    return clone(window.DEFAULT_CONTENT);
  }

  async function saveConfig(data) {
    if (window.FB && window.FB.enabled) return window.FB.saveSiteConfig(data);
    localStorage.setItem(LS_CONFIG, JSON.stringify(data));
    return true;
  }

  function deepMerge(base, patch) {
    if (Array.isArray(patch)) return patch;
    if (patch === null || typeof patch !== "object") return patch === undefined ? base : patch;
    var out = (base && typeof base === "object" && !Array.isArray(base)) ? Object.assign({}, base) : {};
    Object.keys(patch).forEach(function (k) { out[k] = deepMerge(base ? base[k] : undefined, patch[k]); });
    return out;
  }

  /* ================================================================ boot */
  function boot() {
    var loginForm = $("#loginForm");
    var alertBox = $("#loginAlert");

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else init();

    function init() {
      document.addEventListener("fb-ready", function () {
        A.demo = !(window.FB && window.FB.enabled);
        if ($("#demoBanner")) $("#demoBanner").style.display = A.demo ? "flex" : "none";

        if (!A.demo) {
          window.FB.onAuth(function (user) {
            A.user = user;
            if (user) showApp();
            else showLogin();
          });
        } else {
          showLogin();
        }
      });

      loginForm.addEventListener("submit", async function (ev) {
        ev.preventDefault();
        var email = $("#admEmail").value.trim();
        var pass = $("#admPass").value;
        var btn = $("#loginBtn");

        if (!email || !pass) {
          alertBox.className = "form-alert show err";
          alertBox.textContent = "Introduce tu correo y contraseña.";
          return;
        }
        if (A.demo) {
          A.user = { email: email };
          showApp();
          return;
        }
        btn.disabled = true;
        btn.textContent = "Entrando…";
        try {
          await window.FB.login(email, pass);
          /* onAuthStateChanged takes it from here */
        } catch (err) {
          console.error(err);
          alertBox.className = "form-alert show err";
          alertBox.textContent = "No se pudo iniciar sesión. Revisa el correo y la contraseña, o crea el usuario en Firebase Authentication.";
        } finally {
          btn.disabled = false;
          btn.textContent = "Entrar";
        }
      });

      $("#btnLogout").addEventListener("click", async function (ev) {
        ev.preventDefault();
        if (window.FB && window.FB.enabled) await window.FB.logout();
        A.user = null;
        showLogin();
      });

      $("#admBurger").addEventListener("click", function () { $("#admSide").classList.toggle("open"); });
      $("#admModalClose").addEventListener("click", closeModal);
      $("#admModal").addEventListener("click", function (ev) { if (ev.target === $("#admModal")) closeModal(); });
      document.addEventListener("keydown", function (ev) { if (ev.key === "Escape") closeModal(); });

      $$("#admNav button").forEach(function (b) {
        b.addEventListener("click", function () { go(b.getAttribute("data-panel")); });
      });
      document.addEventListener("click", function (ev) {
        var g = ev.target.closest && ev.target.closest("[data-goto]");
        if (g) go(g.getAttribute("data-goto"));
      });

      bindCollections();
      bindContent();
      bindAdvanced();
    }
  }

  function showLogin() {
    $("#loginView").style.display = "grid";
    $("#admApp").classList.remove("show");
  }

  async function showApp() {
    $("#loginView").style.display = "none";
    $("#admApp").classList.add("show");
    var email = (A.user && A.user.email) || "demo@local";
    $("#admUserEmail").textContent = email;
    $("#admAvatar").textContent = initials(email);

    A.config = await loadConfig();
    A.draft = clone(A.config);
    renderContentTabs();
    renderTab(A.tab);
    renderJson();

    await refreshAll();
  }

  async function refreshAll() {
    A.appointments = await store.list("appointments");
    A.patients = await store.list("patients");
    A.followups = await store.list("followups");
    A.messages = await store.list("messages");
    renderDashboard();
    renderAppointments();
    renderPatients();
    renderFollowups();
    renderMessages();
    updateBadges();
  }

  function updateBadges() {
    var news = A.appointments.filter(function (a) { return (a.status || "new") === "new"; }).length;
    var pend = A.followups.filter(function (f) { return (f.status || "pending") === "pending"; }).length;
    var msg = A.messages.filter(function (m) { return (m.status || "new") === "new"; }).length;
    setBadge("#badgeAppt", news);
    setBadge("#badgeFollow", pend);
    setBadge("#badgeMsg", msg);
  }
  function setBadge(sel, n) {
    var el = $(sel);
    if (!el) return;
    el.textContent = n;
    el.style.display = n ? "inline-block" : "none";
  }

  var PANEL_TITLES = {
    dashboard: "Panel", appointments: "Citas", patients: "Pacientes",
    followups: "Seguimiento", messages: "Mensajes", content: "Contenido del sitio", advanced: "Avanzado"
  };
  function go(panel) {
    $$("#admNav button").forEach(function (b) { b.classList.toggle("active", b.getAttribute("data-panel") === panel); });
    $$(".adm-panel").forEach(function (p) { p.classList.toggle("active", p.id === "panel-" + panel); });
    $("#admTitle").textContent = PANEL_TITLES[panel] || "Panel";
    $("#admSide").classList.remove("open");
    if (panel === "content") renderTab(A.tab);
    if (panel === "advanced") renderJson();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* =============================================================== modal */
  function openModal(html) {
    $("#admModalBody").innerHTML = html;
    $("#admModal").classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    $("#admModal").classList.remove("open");
    document.body.style.overflow = "";
  }

  /* =========================================================== dashboard */
  function renderDashboard() {
    var stats = [
      { icon: "calendar", n: A.appointments.length, l: "Solicitudes de cita" },
      { icon: "clock", n: A.appointments.filter(function (a) { return (a.status || "new") === "new"; }).length, l: "Citas por confirmar" },
      { icon: "users", n: A.patients.length, l: "Pacientes registrados" },
      { icon: "mail", n: A.messages.filter(function (m) { return (m.status || "new") === "new"; }).length, l: "Mensajes sin leer" },
      { icon: "checkCircle", n: A.followups.filter(function (f) { return (f.status || "pending") === "pending"; }).length, l: "Seguimientos pendientes" }
    ];
    $("#admStats").innerHTML = stats.map(function (s) {
      return '<div class="stat"><span class="ico">' + icon(s.icon) + '</span><div><div class="n">' + s.n + '</div><div class="l">' + s.l + "</div></div></div>";
    }).join("");

    var recent = A.appointments.slice(0, 6);
    $("#admRecent").innerHTML = recent.length
      ? tableWrap(apptTable(recent, true))
      : emptyBox("Aún no hay solicitudes de cita.");

    var pend = A.followups.filter(function (f) { return (f.status || "pending") === "pending"; });
    $("#admActivity").innerHTML =
      '<div class="dl">' +
      dlRow("Citas nuevas", String(A.appointments.filter(function (a) { return (a.status || "new") === "new"; }).length)) +
      dlRow("Seguimientos pendientes", String(pend.length)) +
      dlRow("Mensajes sin leer", String(A.messages.filter(function (m) { return (m.status || "new") === "new"; }).length)) +
      dlRow("Estado de la base de datos", A.demo ? "Modo demostración" : "Conectada a Firebase") +
      "</div>";
  }

  function dlRow(k, v) { return '<div class="dl-row"><span>' + esc(k) + "</span><span>" + esc(v) + "</span></div>"; }
  function emptyBox(msg, ic) {
    return '<div class="empty">' + icon(ic || "search") + esc(msg) + "</div>";
  }
  function tableWrap(inner) { return '<div class="table-wrap">' + inner + "</div>"; }
  function icon(n) { return (window.ICONS && window.ICONS[n]) || ""; }
  function statusPill(s) {
    var map = { new: "Nueva", confirmed: "Confirmada", done: "Atendida", cancelled: "Cancelada", read: "Leído", replied: "Respondido", pending: "Pendiente" };
    var key = s || "new";
    return '<span class="pill ' + key + '">' + esc(map[key] || key) + "</span>";
  }

  /* ======================================================== appointments */
  function apptTable(rows, compact) {
    var head = "<thead><tr><th>Fecha de solicitud</th><th>Paciente</th><th>Motivo</th>" +
      (compact ? "" : "<th>Preferencia</th>") +
      "<th>Estado</th><th>Acciones</th></tr></thead>";
    var body = rows.map(function (a) {
      return "<tr>" +
        "<td>" + esc(fmt(a.createdAt)) + "</td>" +
        "<td><strong>" + esc(((a.firstName || "") + " " + (a.lastName || "")).trim() || a.name || "—") + "</strong><br>" +
        '<span style="color:var(--muted);font-size:.82rem">' + esc(a.email || "") + "<br>" + esc(a.phone || "") + "</span></td>" +
        "<td>" + esc(a.reasonLabel || a.reason || "—") + "</td>" +
        (compact ? "" : "<td>" + esc(fmtDay(a.preferredDate)) + "<br><span style=\"color:var(--muted);font-size:.82rem\">" + esc(a.preferredTime || "") + "</span></td>") +
        "<td>" + statusPill(a.status) + "</td>" +
        '<td><div class="actions">' +
        '<button type="button" data-appt-view="' + esc(a.id) + '" title="Ver">' + icon("search") + "</button>" +
        '<button type="button" data-appt-status="' + esc(a.id) + '" title="Cambiar estado">' + icon("edit") + "</button>" +
        '<button type="button" class="danger" data-appt-del="' + esc(a.id) + '" title="Eliminar">' + icon("trash") + "</button>" +
        "</div></td></tr>";
    }).join("");
    return '<table class="adm-table">' + head + "<tbody>" + (body || "") + "</tbody></table>";
  }

  function renderAppointments() {
    var q = ($("#apptSearch").value || "").toLowerCase();
    var st = $("#apptFilter").value;
    var rows = A.appointments.filter(function (a) {
      var hay = [a.firstName, a.lastName, a.name, a.email, a.phone, a.reasonLabel].join(" ").toLowerCase();
      if (q && hay.indexOf(q) === -1) return false;
      if (st && (a.status || "new") !== st) return false;
      return true;
    });
    $("#apptWrap").innerHTML = rows.length ? tableWrap(apptTable(rows)) : emptyBox("No hay citas que coincidan.", "calendar");
  }

  function apptModal(id) {
    var a = A.appointments.filter(function (x) { return x.id === id; })[0];
    if (!a) return;
    var rows = [
      ["Solicitada", fmt(a.createdAt)],
      ["Paciente", ((a.firstName || "") + " " + (a.lastName || "")).trim()],
      ["Correo", a.email], ["Teléfono", a.phone],
      ["Motivo", a.reasonLabel || a.reason],
      ["Fecha preferida", fmtDay(a.preferredDate)],
      ["Hora preferida", a.preferredTime],
      ["Paciente nuevo", a.newPatient ? "Sí" : "No"],
      ["Seguro dental", a.insurance || "—"],
      ["Cómo contactar", a.preferredContact || "—"],
      ["Notas", a.notes || "—"],
      ["Idioma", a.lang === "es" ? "Español" : "Inglés"]
    ].map(function (r) { return dlRow(r[0], r[1] || "—"); }).join("");

    openModal(
      "<h3>Solicitud de cita</h3>" +
      '<div class="dl">' + rows + "</div>" +
      '<div class="field"><label>Estado</label><select id="mApptStatus">' +
      ["new", "confirmed", "done", "cancelled"].map(function (s) {
        return '<option value="' + s + '"' + ((a.status || "new") === s ? " selected" : "") + ">" +
          ({ new: "Nueva", confirmed: "Confirmada", done: "Atendida", cancelled: "Cancelada" })[s] + "</option>";
      }).join("") + "</select></div>" +
      '<div class="field"><label>Nota interna</label><textarea id="mApptNote">' + esc(a.notesInternal || "") + "</textarea></div>" +
      '<div class="adm-foot"><button class="btn btn-primary btn-sm" id="mApptSave">Guardar</button>' +
      '<a class="btn btn-outline btn-sm" href="mailto:' + esc(a.email || "") + '">Responder por correo</a>' +
      '<a class="btn btn-outline btn-sm" href="tel:' + esc(String(a.phone || "").replace(/[^\d+]/g, "")) + '">Llamar</a></div>'
    );

    $("#mApptSave").addEventListener("click", async function () {
      await store.update("appointments", id, {
        status: $("#mApptStatus").value,
        notesInternal: $("#mApptNote").value
      });
      closeModal();
      await refreshAll();
    });
  }

  function bindCollections() {
    /* appointments */
    ["#apptSearch"].forEach(function (s) { $(s).addEventListener("input", renderAppointments); });
    $("#apptFilter").addEventListener("change", renderAppointments);
    $("#apptWrap").addEventListener("click", async function (ev) {
      var v = ev.target.closest("[data-appt-view]"), d = ev.target.closest("[data-appt-del]"), s = ev.target.closest("[data-appt-status]");
      if (v) return apptModal(v.getAttribute("data-appt-view"));
      if (s) return apptModal(s.getAttribute("data-appt-status"));
      if (d) {
        if (!window.confirm("¿Eliminar esta solicitud de cita?")) return;
        await store.remove("appointments", d.getAttribute("data-appt-del"));
        await refreshAll();
      }
    });
    $("#apptExport").addEventListener("click", function () {
      exportCsv("citas.csv", A.appointments, ["createdAt", "firstName", "lastName", "email", "phone", "reasonLabel", "preferredDate", "preferredTime", "newPatient", "insurance", "preferredContact", "notes", "status"]);
    });

    /* patients */
    $("#patSearch").addEventListener("input", renderPatients);
    $("#patNew").addEventListener("click", function () { patientModal(null); });
    $("#patExport").addEventListener("click", function () {
      exportCsv("pacientes.csv", A.patients, ["createdAt", "name", "email", "phone", "dob", "address", "insurance", "notes", "lastVisit"]);
    });
    $("#patWrap").addEventListener("click", function (ev) {
      var e = ev.target.closest("[data-pat-edit]"), d = ev.target.closest("[data-pat-del]"), f = ev.target.closest("[data-pat-follow]");
      if (e) return patientModal(e.getAttribute("data-pat-edit"));
      if (f) return followModal(null, f.getAttribute("data-pat-follow"));
      if (d) {
        if (!window.confirm("¿Eliminar este paciente y sus seguimientos?")) return;
        (async function () {
          await store.remove("patients", d.getAttribute("data-pat-del"));
          var rel = A.followups.filter(function (x) { return x.patientId === d.getAttribute("data-pat-del"); });
          for (var i = 0; i < rel.length; i++) await store.remove("followups", rel[i].id);
          await refreshAll();
        })();
      }
    });

    /* followups */
    $("#folSearch").addEventListener("input", renderFollowups);
    $("#folFilter").addEventListener("change", renderFollowups);
    $("#folNew").addEventListener("click", function () { followModal(null, null); });
    $("#folWrap").addEventListener("click", async function (ev) {
      var t = ev.target.closest("[data-fol-toggle]"), d = ev.target.closest("[data-fol-del]"), e = ev.target.closest("[data-fol-edit]");
      if (t) {
        var id = t.getAttribute("data-fol-toggle");
        var cur = A.followups.filter(function (x) { return x.id === id; })[0];
        await store.update("followups", id, { status: (cur.status || "pending") === "pending" ? "done" : "pending" });
        return refreshAll();
      }
      if (e) return followModal(e.getAttribute("data-fol-edit"), null);
      if (d) {
        if (!window.confirm("¿Eliminar este seguimiento?")) return;
        await store.remove("followups", d.getAttribute("data-fol-del"));
        await refreshAll();
      }
    });

    /* messages */
    $("#msgSearch").addEventListener("input", renderMessages);
    $("#msgFilter").addEventListener("change", renderMessages);
    $("#msgWrap").addEventListener("click", async function (ev) {
      var v = ev.target.closest("[data-msg-view]"), d = ev.target.closest("[data-msg-del]"), r = ev.target.closest("[data-msg-read]");
      if (v) return msgModal(v.getAttribute("data-msg-view"));
      if (r) { await store.update("messages", r.getAttribute("data-msg-read"), { status: "read" }); return refreshAll(); }
      if (d) {
        if (!window.confirm("¿Eliminar este mensaje?")) return;
        await store.remove("messages", d.getAttribute("data-msg-del"));
        await refreshAll();
      }
    });
  }

  /* ============================================================ patients */
  function renderPatients() {
    var q = ($("#patSearch").value || "").toLowerCase();
    var rows = A.patients.filter(function (p) {
      return !q || [p.name, p.email, p.phone].join(" ").toLowerCase().indexOf(q) > -1;
    });
    if (!rows.length) { $("#patWrap").innerHTML = emptyBox("Aún no hay pacientes registrados.", "users"); return; }
    var body = rows.map(function (p) {
      var fups = A.followups.filter(function (f) { return f.patientId === p.id; });
      var pend = fups.filter(function (f) { return (f.status || "pending") === "pending"; }).length;
      return "<tr>" +
        "<td><strong>" + esc(p.name || "—") + "</strong><br><span style=\"color:var(--muted);font-size:.82rem\">" + esc(p.email || "") + "<br>" + esc(p.phone || "") + "</span></td>" +
        "<td>" + esc(p.dob ? fmtDay(p.dob) : "—") + "</td>" +
        "<td>" + esc(p.insurance || "—") + "</td>" +
        "<td>" + (fups.length ? fups.length + " (" + pend + " pend.)" : "—") + "</td>" +
        '<td><div class="actions">' +
        '<button type="button" data-pat-follow="' + esc(p.id) + '" title="Añadir seguimiento">' + icon("plus") + "</button>" +
        '<button type="button" data-pat-edit="' + esc(p.id) + '" title="Editar">' + icon("edit") + "</button>" +
        '<button type="button" class="danger" data-pat-del="' + esc(p.id) + '" title="Eliminar">' + icon("trash") + "</button>" +
        "</div></td></tr>";
    }).join("");
    $("#patWrap").innerHTML = tableWrap("<table class=\"adm-table\"><thead><tr><th>Paciente</th><th>Nacimiento</th><th>Seguro</th><th>Seguimientos</th><th>Acciones</th></tr></thead><tbody>" + body + "</tbody></table>");
  }

  function patientModal(id) {
    var p = id ? A.patients.filter(function (x) { return x.id === id; })[0] || {} : {};
    openModal(
      "<h3>" + (id ? "Editar paciente" : "Nuevo paciente") + "</h3>" +
      '<div class="ed-grid two" style="margin-top:1rem">' +
      fld("pName", "Nombre completo", p.name) +
      fld("pPhone", "Teléfono", p.phone) +
      fld("pEmail", "Correo electrónico", p.email) +
      fld("pDob", "Fecha de nacimiento", p.dob, "date") +
      fld("pAddress", "Dirección", p.address) +
      fld("pInsurance", "Seguro dental", p.insurance) +
      "</div>" +
      '<div class="ed-field"><label>Notas clínicas / administrativas</label><textarea id="pNotes">' + esc(p.notes || "") + "</textarea></div>" +
      '<div class="adm-foot"><button class="btn btn-primary btn-sm" id="pSave">Guardar paciente</button>' +
      '<button class="btn btn-outline btn-sm" data-close>Cancelar</button></div>'
    );
    bindCloseButtons();
    $("#pSave").addEventListener("click", async function () {
      var data = {
        name: $("#pName").value.trim(), phone: $("#pPhone").value.trim(), email: $("#pEmail").value.trim(),
        dob: $("#pDob").value, address: $("#pAddress").value.trim(), insurance: $("#pInsurance").value.trim(),
        notes: $("#pNotes").value.trim()
      };
      if (!data.name) { window.alert("El nombre es obligatorio."); return; }
      if (id) await store.update("patients", id, data);
      else await store.add("patients", data);
      closeModal();
      await refreshAll();
    });
  }

  function fld(id, label, value, type) {
    return '<div class="ed-field"><label for="' + id + '">' + esc(label) + "</label>" +
      '<input type="' + (type || "text") + '" id="' + id + '" value="' + esc(value || "") + '"></div>';
  }

  /* =========================================================== followups */
  function renderFollowups() {
    var q = ($("#folSearch").value || "").toLowerCase();
    var f = $("#folFilter").value;
    var rows = A.followups.filter(function (x) {
      var hay = [x.patientName, x.note, x.channel].join(" ").toLowerCase();
      if (q && hay.indexOf(q) === -1) return false;
      if (f && (x.status || "pending") !== f) return false;
      return true;
    });
    if (!rows.length) { $("#folWrap").innerHTML = emptyBox("No hay seguimientos.", "checkCircle"); return; }
    var body = rows.map(function (x) {
      return "<tr>" +
        "<td><strong>" + esc(x.patientName || "—") + "</strong></td>" +
        "<td>" + esc(x.channel || "—") + "</td>" +
        "<td>" + esc(x.note || "—") + "</td>" +
        "<td>" + esc(x.dueDate ? fmtDay(x.dueDate) : "—") + "</td>" +
        "<td>" + statusPill(x.status) + "</td>" +
        '<td><div class="actions">' +
        '<button type="button" data-fol-toggle="' + esc(x.id) + '" title="Marcar">' + icon("check") + "</button>" +
        '<button type="button" data-fol-edit="' + esc(x.id) + '" title="Editar">' + icon("edit") + "</button>" +
        '<button type="button" class="danger" data-fol-del="' + esc(x.id) + '" title="Eliminar">' + icon("trash") + "</button>" +
        "</div></td></tr>";
    }).join("");
    $("#folWrap").innerHTML = tableWrap("<table class=\"adm-table\"><thead><tr><th>Paciente</th><th>Canal</th><th>Nota</th><th>Para</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>" + body + "</tbody></table>");
  }

  function followModal(id, patientId) {
    var f = id ? A.followups.filter(function (x) { return x.id === id; })[0] || {} : {};
    var opts = A.patients.map(function (p) {
      var sel = (p.id === (f.patientId || patientId)) ? " selected" : "";
      return '<option value="' + esc(p.id) + '"' + sel + ">" + esc(p.name) + "</option>";
    }).join("");
    openModal(
      "<h3>" + (id ? "Editar seguimiento" : "Nuevo seguimiento") + "</h3>" +
      '<div class="ed-grid two" style="margin-top:1rem">' +
      '<div class="ed-field"><label>Paciente</label><select id="fPatient">' + (opts || '<option value="">— sin pacientes —</option>') + "</select></div>" +
      '<div class="ed-field"><label>Canal</label><select id="fChannel">' +
      ["Llamada", "Correo", "WhatsApp", "SMS", "En persona"].map(function (c) { return '<option value="' + c + '"' + (f.channel === c ? " selected" : "") + ">" + c + "</option>"; }).join("") +
      "</select></div>" +
      '<div class="ed-field"><label>Fecha objetivo</label><input type="date" id="fDue" value="' + esc(f.dueDate || "") + '"></div>' +
      '<div class="ed-field"><label>Estado</label><select id="fStatus">' +
      '<option value="pending"' + ((f.status || "pending") === "pending" ? " selected" : "") + ">Pendiente</option>" +
      '<option value="done"' + (f.status === "done" ? " selected" : "") + ">Completado</option>" +
      "</select></div>" +
      "</div>" +
      '<div class="ed-field"><label>Nota</label><textarea id="fNote">' + esc(f.note || "") + "</textarea></div>" +
      '<div class="adm-foot"><button class="btn btn-primary btn-sm" id="fSave">Guardar seguimiento</button>' +
      '<button class="btn btn-outline btn-sm" data-close>Cancelar</button></div>'
    );
    bindCloseButtons();
    $("#fSave").addEventListener("click", async function () {
      var pid = $("#fPatient").value;
      var pat = A.patients.filter(function (x) { return x.id === pid; })[0];
      var data = {
        patientId: pid,
        patientName: pat ? pat.name : "",
        channel: $("#fChannel").value,
        dueDate: $("#fDue").value,
        status: $("#fStatus").value,
        note: $("#fNote").value.trim()
      };
      if (!data.patientId) { window.alert("Primero crea al menos un paciente."); return; }
      if (id) await store.update("followups", id, data);
      else await store.add("followups", data);
      closeModal();
      await refreshAll();
    });
  }

  /* ============================================================ messages */
  function renderMessages() {
    var q = ($("#msgSearch").value || "").toLowerCase();
    var ty = $("#msgFilter").value;
    var rows = A.messages.filter(function (m) {
      var hay = [m.name, m.email, m.phone, m.subject, m.message].join(" ").toLowerCase();
      if (q && hay.indexOf(q) === -1) return false;
      if (ty && (m.type || "contact") !== ty) return false;
      return true;
    });
    if (!rows.length) { $("#msgWrap").innerHTML = emptyBox("No hay mensajes.", "mail"); return; }
    var body = rows.map(function (m) {
      return "<tr>" +
        "<td>" + esc(fmt(m.createdAt)) + "</td>" +
        "<td><strong>" + esc(m.name || "—") + "</strong><br><span style=\"color:var(--muted);font-size:.82rem\">" + esc(m.email || "") + "<br>" + esc(m.phone || "") + "</span></td>" +
        "<td>" + esc(m.type === "records" ? "Historial dental" : "Contacto") + "</td>" +
        "<td>" + esc(m.subject || m.direction || "—") + "</td>" +
        "<td>" + statusPill((m.type === "records" ? "new" : m.status)) + "</td>" +
        '<td><div class="actions">' +
        '<button type="button" data-msg-view="' + esc(m.id) + '" title="Ver">' + icon("search") + "</button>" +
        '<button type="button" data-msg-read="' + esc(m.id) + '" title="Marcar como leído">' + icon("check") + "</button>" +
        '<button type="button" class="danger" data-msg-del="' + esc(m.id) + '" title="Eliminar">' + icon("trash") + "</button>" +
        "</div></td></tr>";
    }).join("");
    $("#msgWrap").innerHTML = tableWrap("<table class=\"adm-table\"><thead><tr><th>Recibido</th><th>Remitente</th><th>Tipo</th><th>Asunto</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>" + body + "</tbody></table>");
  }

  function msgModal(id) {
    var m = A.messages.filter(function (x) { return x.id === id; })[0];
    if (!m) return;
    var rows = [
      ["Recibido", fmt(m.createdAt)], ["Tipo", m.type === "records" ? "Solicitud de historial" : "Mensaje de contacto"],
      ["Nombre", m.name], ["Correo", m.email], ["Teléfono", m.phone],
      ["Asunto", m.subject], ["Dirección", m.direction === "in" ? "Entrante a matildefacetdds.com" : m.direction === "out" ? "Saliente a otro consultorio" : "—"],
      ["Consultorio", m.officeName], ["Contacto del consultorio", m.officeContact],
      ["Nacimiento", m.dob ? fmtDay(m.dob) : "—"], ["Idioma", m.lang === "es" ? "Español" : "Inglés"]
    ].map(function (r) { return dlRow(r[0], r[1] || "—"); }).join("");

    openModal("<h3>" + esc(m.subject || "Mensaje") + "</h3>" +
      '<div class="dl">' + rows + "</div>" +
      '<div class="ed-field"><label>Mensaje</label><div class="summary" style="margin-top:.3rem">' + esc(m.message || "—") + "</div></div>" +
      '<div class="adm-foot"><button class="btn btn-primary btn-sm" id="mMsgRead">Marcar como respondido</button>' +
      '<a class="btn btn-outline btn-sm" href="mailto:' + esc(m.email || "") + '">Responder por correo</a></div>');
    $("#mMsgRead").addEventListener("click", async function () {
      await store.update("messages", id, { status: "replied" });
      closeModal();
      await refreshAll();
    });
  }

  function bindCloseButtons() {
    $$("[data-close]").forEach(function (b) { b.addEventListener("click", closeModal); });
  }

  /* ================================================================ CSV */
  function exportCsv(filename, rows, cols) {
    if (!rows.length) { window.alert("No hay datos para exportar."); return; }
    function cell(v) {
      if (v == null) return "";
      if (typeof v === "object") v = v.seconds ? new Date(v.seconds * 1000).toISOString() : JSON.stringify(v);
      return '"' + String(v).replace(/"/g, '""') + '"';
    }
    var csv = cols.join(",") + "\n" +
      rows.map(function (r) { return cols.map(function (c) { return cell(r[c]); }).join(","); }).join("\n");
    var blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  /* ========================================================= content tabs */
  var SCHEMA = [
    { id: "brand", label: "Marca", path: "brand" },
    { id: "theme", label: "Colores", path: "theme" },
    { id: "contact", label: "Contacto", path: "contact" },
    { id: "hours", label: "Horarios", path: "hours" },
    { id: "appointment", label: "Formulario de citas", path: "appointment" },
    { id: "hero", label: "Carrusel", path: "hero.slides" },
    { id: "services", label: "Servicios", path: "services" },
    { id: "about", label: "Sobre la doctora", path: "about" },
    { id: "why", label: "Ventajas", path: "why" },
    { id: "stats", label: "Cifras", path: "stats" },
    { id: "testimonials", label: "Reseñas", path: "testimonials" },
    { id: "faq", label: "Preguntas", path: "faq" },
    { id: "documents", label: "Formularios", path: "documents" },
    { id: "links", label: "Enlaces", path: "links" },
    { id: "social", label: "Redes sociales", path: "social" },
    { id: "seo", label: "SEO", path: "seo" }
  ];

  /* field definitions per tab */
  var FIELDS = {
    brand: [
      { k: "name", l: "Nombre del consultorio", t: "text" },
      { k: "short", l: "Nombre corto", t: "text" },
      { k: "doctor", l: "Nombre de la doctora", t: "text" },
      { k: "tagline", l: "Lema (bajo el logo)", t: "bi" },
      { k: "logo", l: "Logo de la portada (PNG/SVG con fondo transparente)", t: "image" }
    ],
    theme: [
      { k: "primary", l: "Color principal", t: "color" },
      { k: "primaryDark", l: "Color principal oscuro", t: "color" },
      { k: "primarySoft", l: "Fondo suave", t: "color" },
      { k: "accent", l: "Color de acento", t: "color" },
      { k: "ink", l: "Color del texto", t: "color" }
    ],
    contact: [
      { k: "phone", l: "Teléfono (visible)", t: "text" },
      { k: "phoneRaw", l: "Teléfono para marcar (ej. +13015935477)", t: "text" },
      { k: "fax", l: "Fax", t: "text" },
      { k: "emergency", l: "Teléfono de emergencias (visible)", t: "text" },
      { k: "emergencyRaw", l: "Emergencias para marcar", t: "text" },
      { k: "email", l: "Correo electrónico", t: "text" },
      { k: "whatsapp", l: "WhatsApp (solo números con código de país)", t: "text" },
      { k: "addressLine1", l: "Dirección", t: "text" },
      { k: "addressLine2", l: "Suite / línea 2", t: "text" },
      { k: "city", l: "Ciudad", t: "text" },
      { k: "state", l: "Estado", t: "text" },
      { k: "zip", l: "Código postal", t: "text" },
      { k: "mapsQuery", l: "Búsqueda del mapa", t: "text" },
      { k: "mapsLink", l: "Enlace a Google Maps", t: "text" }
    ],
    hours: [
      { k: "day", l: "Día", t: "bi" },
      { k: "time", l: "Horario", t: "bi" }
    ],
    "appointment.reasons": [
      { k: "value", l: "Valor interno (sin espacios)", t: "text" },
      { k: "icon", l: "Icono", t: "icon" },
      { k: "label", l: "Etiqueta", t: "bi" },
      { k: "hint", l: "Descripción corta", t: "bi" }
    ],
    "hero.slides": [
      { k: "image", l: "Imagen de fondo", t: "image" },
      { k: "title", l: "Título", t: "bi" },
      { k: "text", l: "Texto", t: "biArea" }
    ],
    services: [
      { k: "icon", l: "Icono", t: "icon" },
      { k: "group", l: "Categoría", t: "bi" },
      { k: "title", l: "Nombre del tratamiento", t: "bi" },
      { k: "desc", l: "Descripción breve", t: "biArea" },
      { k: "detail", l: "Descripción detallada (ventana)", t: "biArea" }
    ],
    about: [
      { k: "image", l: "Fotografía", t: "image" },
      { k: "eyebrow", l: "Etiqueta superior", t: "bi" },
      { k: "title", l: "Título", t: "bi" },
      { k: "subtitle", l: "Subtítulo", t: "bi" },
      { k: "p1", l: "Párrafo 1", t: "biArea" },
      { k: "p2", l: "Párrafo 2", t: "biArea" },
      { k: "p3", l: "Párrafo 3", t: "biArea" }
    ],
    why: [
      { k: "icon", l: "Icono", t: "icon" },
      { k: "title", l: "Título", t: "bi" },
      { k: "text", l: "Texto", t: "biArea" }
    ],
    stats: [
      { k: "num", l: "Dato destacado", t: "text" },
      { k: "label", l: "Descripción", t: "bi" }
    ],
    faq: [
      { k: "q", l: "Pregunta", t: "bi" },
      { k: "a", l: "Respuesta", t: "biArea" }
    ],
    documents: [
      { k: "icon", l: "Icono", t: "icon" },
      { k: "title", l: "Título", t: "bi" },
      { k: "desc", l: "Descripción", t: "biArea" },
      { k: "href", l: "Enlace", t: "text" }
    ],
    links: [
      { k: "title", l: "Título", t: "bi" },
      { k: "url", l: "URL", t: "text" }
    ],
    social: [
      { k: "icon", l: "Icono (facebook / instagram / google / whatsapp)", t: "text" },
      { k: "label", l: "Etiqueta", t: "text" },
      { k: "url", l: "URL", t: "text" }
    ]
  };

  var SINGLE = { brand: 1, theme: 1, contact: 1, about: 1, seo: 1 };
  var NESTED = {
    testimonials: {
      fields: [{ k: "enabled", l: "Mostrar reseñas en el sitio", t: "bool" }, { k: "note", l: "Aviso bajo las reseñas", t: "bi" }],
      listKey: "items",
      listFields: [
        { k: "name", l: "Nombre", t: "text" },
        { k: "meta", l: "Detalle (ej. Paciente desde 2019)", t: "bi" },
        { k: "text", l: "Reseña", t: "biArea" },
        { k: "rating", l: "Estrellas (1-5)", t: "number" }
      ]
    }
  };

  /* ====================================================== content editor */
  function iconOptions(current) {
    var keys = Object.keys(window.ICONS || {});
    return keys.map(function (k) {
      return '<option value="' + k + '"' + (k === current ? " selected" : "") + ">" + k + "</option>";
    }).join("");
  }

  function inputHtml(path, value, type) {
    if (type === "color") {
      var v = /^#[0-9a-f]{6}$/i.test(String(value)) ? value : "#000000";
      return '<div class="ed-color"><input type="color" data-cpath="' + esc(path) + '" value="' + esc(v) + '">' +
        '<input type="text" data-cpath="' + esc(path) + '" value="' + esc(value || "") + '"></div>';
    }
    return '<input type="' + (type === "number" ? "number" : "text") + '" data-cpath="' + esc(path) +
      '" value="' + esc(value == null ? "" : value) + '">';
  }

  function fieldHtml(fd, objPath) {
    var base = fd.path || (objPath ? objPath + "." + fd.k : fd.k);
    var html = '<div class="ed-field"><label>' + esc(fd.l) + "</label>";

    switch (fd.t) {
      case "bi":
        html += '<div class="ed-bilingual">' +
          '<div><span class="lang-tag">EN</span>' + inputHtml(base + "_en", getPath(A.draft, base + "_en"), "text") + "</div>" +
          '<div><span class="lang-tag">ES</span>' + inputHtml(base + "_es", getPath(A.draft, base + "_es"), "text") + "</div>" +
          "</div>";
        break;
      case "biArea":
        html += '<div class="ed-bilingual">' +
          '<div><span class="lang-tag">EN</span><textarea data-cpath="' + esc(base + "_en") + '">' + esc(getPath(A.draft, base + "_en") || "") + "</textarea></div>" +
          '<div><span class="lang-tag">ES</span><textarea data-cpath="' + esc(base + "_es") + '">' + esc(getPath(A.draft, base + "_es") || "") + "</textarea></div>" +
          "</div>";
        break;
      case "area":
        html += '<textarea data-cpath="' + esc(base) + '">' + esc(getPath(A.draft, base) || "") + "</textarea>";
        break;
      case "bool":
        html = '<div class="ed-field"><label class="check" style="display:flex;gap:.6rem;align-items:center">' +
          '<input type="checkbox" data-cpath="' + esc(base) + '"' + (getPath(A.draft, base) ? " checked" : "") + "> " +
          "<span>" + esc(fd.l) + "</span></label></div>";
        break;
      case "icon":
        html += '<select data-cpath="' + esc(base) + '">' + iconOptions(getPath(A.draft, base)) + "</select>";
        break;
      case "image":
        var val = getPath(A.draft, base) || "";
        html += '<div class="ed-image">' +
          '<img class="thumb" src="' + esc(val || "assets/img/favicon.svg") + '" alt="">' +
          inputHtml(base, val, "text") +
          '<button type="button" class="btn btn-soft btn-sm" data-upload="' + esc(base) + '">Subir</button>' +
          "</div>";
        break;
      default:
        html += inputHtml(base, getPath(A.draft, base), fd.t);
    }
    return html + "</div>";
  }

  function fieldsHtml(fields, objPath) {
    return fields.map(function (f) { return fieldHtml(f, objPath); }).join("");
  }

  function listHtml(listPath, fields, labelFn) {
    var arr = getPath(A.draft, listPath) || [];
    var items = arr.map(function (item, i) {
      var objPath = listPath + "." + i;
      return '<div class="ed-item">' +
        '<div class="ed-item-head"><strong>' + esc(labelFn ? labelFn(item, i) : "Elemento " + (i + 1)) + "</strong>" +
        '<div class="actions">' +
        '<button type="button" data-act="up" data-list="' + esc(listPath) + '" data-i="' + i + '" title="Subir">' + icon("chevronLeft") + "</button>" +
        '<button type="button" data-act="down" data-list="' + esc(listPath) + '" data-i="' + i + '" title="Bajar">' + icon("chevronRight") + "</button>" +
        '<button type="button" class="danger" data-act="del" data-list="' + esc(listPath) + '" data-i="' + i + '" title="Eliminar">' + icon("trash") + "</button>" +
        "</div></div>" +
        '<div class="ed-grid two">' + fieldsHtml(fields, objPath) + "</div>" +
        "</div>";
    }).join("");

    return items + '<button type="button" class="btn btn-soft btn-sm" data-act="add" data-list="' + esc(listPath) + '">+ Añadir elemento</button>';
  }

  var LIST_LABEL = {
    "hero.slides": function (it, i) { return (it.title_es || it.title_en || "Diapositiva " + (i + 1)); },
    services: function (it, i) { return (it.title_es || it.title_en || "Servicio " + (i + 1)); },
    why: function (it, i) { return (it.title_es || it.title_en || "Ventaja " + (i + 1)); },
    hours: function (it, i) { return (it.day_es || it.day_en || "Horario " + (i + 1)); },
    faq: function (it, i) { return (it.q_es || it.q_en || "Pregunta " + (i + 1)); },
    documents: function (it, i) { return (it.title_es || it.title_en || "Formulario " + (i + 1)); },
    links: function (it, i) { return (it.title_es || it.title_en || "Enlace " + (i + 1)); },
    social: function (it, i) { return (it.label || it.icon || "Red " + (i + 1)); },
    "testimonials.items": function (it, i) { return (it.name || "Reseña " + (i + 1)); },
    "appointment.reasons": function (it, i) { return (it.label_es || it.label_en || "Motivo " + (i + 1)); }
  };

  /* Extra fields shown alongside a list section */
  var EXTRA = {
    hours: [{ k: "hoursNote", l: "Nota bajo los horarios (visible en todo el sitio)", t: "bi", path: "hoursNote" }]
  };

  function renderContentTabs() {
    $("#contentTabs").innerHTML = SCHEMA.map(function (s) {
      return '<button type="button" data-tab="' + s.id + '"' + (s.id === A.tab ? ' class="active"' : "") + ">" + esc(s.label) + "</button>";
    }).join("");
  }

  function renderTab(id) {
    A.tab = id;
    $$("#contentTabs button").forEach(function (b) { b.classList.toggle("active", b.getAttribute("data-tab") === id); });

    var body = $("#contentBody");
    if (!A.draft) { body.innerHTML = '<p class="sub">Cargando…</p>'; return; }

    if (id === "seo") {
      body.innerHTML = '<div class="adm-grid two">' +
        fieldsHtml([
          { k: "title", l: "Título de la página (pestaña del navegador)", t: "bi" },
          { k: "desc", l: "Descripción para buscadores", t: "biArea" }
        ], "seo") + "</div>" +
        '<div class="adm-banner info" style="margin-top:1rem">' + icon("globe") +
        "<div>Estos textos aparecen en Google y al compartir el enlace en redes sociales. Incluye la ciudad y el servicio principal.</div></div>";
      return;
    }

    if (id === "appointment") {
      body.innerHTML =
        '<div class="adm-grid two">' + fieldsHtml([
          { k: "notice", l: "Aviso mostrado al final del formulario", t: "bi" }
        ], "appointment") + "</div>" +
        '<h3 style="margin:1.4rem 0 .3rem;font-size:1rem">Motivos de consulta</h3>' +
        '<p class="sub">Las opciones que el paciente elige en el primer paso.</p>' +
        listHtml("appointment.reasons", FIELDS["appointment.reasons"] || [], LIST_LABEL["appointment.reasons"]) +
        '<h3 style="margin:1.6rem 0 .3rem;font-size:1rem">Horas disponibles</h3>' +
        '<p class="sub">Escribe una hora por línea. Se muestran como botones en el formulario.</p>' +
        '<div class="ed-field"><textarea data-lines="appointment.times">' +
        esc(((getPath(A.draft, "appointment.times")) || []).join("\n")) + "</textarea></div>";
      return;
    }

    if (SINGLE[id]) {
      body.innerHTML = '<div class="adm-grid two">' + fieldsHtml(FIELDS[id] || [], SCHEMA.filter(function (s) { return s.id === id; })[0].path) + "</div>";
      return;
    }

    if (NESTED[id]) {
      var n = NESTED[id];
      var sec = SCHEMA.filter(function (s) { return s.id === id; })[0];
      body.innerHTML =
        '<div class="adm-grid two">' + fieldsHtml(n.fields, sec.path) + "</div>" +
        '<h3 style="margin:1.2rem 0 .3rem;font-size:1rem">Reseñas</h3>' +
        '<p class="sub">Añade reseñas reales de tus pacientes. No inventes testimonios.</p>' +
        listHtml(sec.path + "." + n.listKey, n.listFields, LIST_LABEL["testimonials.items"]);
      return;
    }

    var s2 = SCHEMA.filter(function (s) { return s.id === id; })[0];
    var extra = EXTRA[id] || [];
    body.innerHTML =
      (extra.length ? '<div class="adm-grid two">' + fieldsHtml(extra, "") + "</div>" : "") +
      listHtml(s2.path, FIELDS[id] || [], LIST_LABEL[s2.path]);
  }

  function blankItem(fields) {
    var o = {};
    fields.forEach(function (f) {
      if (f.t === "bi" || f.t === "biArea") { o[f.k + "_en"] = ""; o[f.k + "_es"] = ""; }
      else if (f.t === "number") o[f.k] = 5;
      else if (f.t === "bool") o[f.k] = true;
      else o[f.k] = "";
    });
    return o;
  }

  function listFieldsFor(listPath) {
    if (listPath === "testimonials.items") return NESTED.testimonials.listFields;
    var s = SCHEMA.filter(function (x) { return x.path === listPath; })[0];
    return s ? FIELDS[s.id] : [];
  }

  function onDraftEdit(ev) {
    var linesEl = ev.target.closest("[data-lines]");
    if (linesEl) {
      var lp = linesEl.getAttribute("data-lines");
      var parsed = linesEl.value.split("\n").map(function (s) { return s.trim(); }).filter(Boolean);
      setPath(A.draft, lp, parsed);
      toast($("#contentStatus"), "");
      return;
    }

    var el = ev.target.closest("[data-cpath]");
    if (!el) return;
    var path = el.getAttribute("data-cpath");
    var val;
    if (el.type === "checkbox") val = el.checked;
    else if (el.type === "number") val = el.value === "" ? "" : Number(el.value);
    else val = el.value;
    setPath(A.draft, path, val);
    if (el.type === "color") {
      var sib = el.parentElement.querySelector('input[type="text"][data-cpath="' + path + '"]');
      if (sib) sib.value = val;
    }
    toast($("#contentStatus"), "");
  }

  async function onContentClick(ev) {
    var up = ev.target.closest('[data-upload]');
    if (up) { return uploadImage(up.getAttribute("data-upload")); }

    var btn = ev.target.closest("[data-act]");
    if (!btn) return;
    var act = btn.getAttribute("data-act");
    var listPath = btn.getAttribute("data-list");
    var i = parseInt(btn.getAttribute("data-i"), 10);
    var arr = getPath(A.draft, listPath) || [];

    if (act === "add") {
      arr.push(blankItem(listFieldsFor(listPath)));
    } else if (act === "del") {
      if (!window.confirm("¿Eliminar este elemento?")) return;
      arr.splice(i, 1);
    } else if (act === "up" && i > 0) {
      var tmp = arr[i - 1]; arr[i - 1] = arr[i]; arr[i] = tmp;
    } else if (act === "down" && i < arr.length - 1) {
      var tmp2 = arr[i + 1]; arr[i + 1] = arr[i]; arr[i] = tmp2;
    }
    setPath(A.draft, listPath, arr);
    renderTab(A.tab);
  }

  function uploadImage(path) {
    if (!(window.FB && window.FB.enabled)) {
      /* Demo mode: embed as data URL (size-limited) */
      var inp = document.createElement("input");
      inp.type = "file";
      inp.accept = "image/*";
      inp.addEventListener("change", function () {
        var f = inp.files && inp.files[0];
        if (!f) return;
        if (f.size > 400 * 1024) {
          window.alert("En modo demostración la imagen debe pesar menos de 400 KB. Con Firebase conectado no hay ese límite.");
          return;
        }
        var fr = new FileReader();
        fr.onload = function () { setPath(A.draft, path, fr.result); renderTab(A.tab); };
        fr.readAsDataURL(f);
      });
      inp.click();
      return;
    }
    var file = document.createElement("input");
    file.type = "file";
    file.accept = "image/*";
    file.addEventListener("change", async function () {
      var f = file.files && file.files[0];
      if (!f) return;
      var st = $("#contentStatus");
      toast(st, "Subiendo imagen…");
      try {
        var url = await window.FB.uploadImage(f, "site");
        setPath(A.draft, path, url);
        renderTab(A.tab);
        toast(st, "Imagen subida. No olvides guardar.");
      } catch (err) {
        console.error(err);
        toast(st, "No se pudo subir la imagen.", true);
      }
    });
    file.click();
  }

  function bindContent() {
    $("#contentTabs").addEventListener("click", function (ev) {
      var b = ev.target.closest("[data-tab]");
      if (b) renderTab(b.getAttribute("data-tab"));
    });
    var body = $("#contentBody");
    body.addEventListener("input", onDraftEdit);
    body.addEventListener("change", onDraftEdit);
    body.addEventListener("click", onContentClick);

    $("#btnSaveContent").addEventListener("click", async function () {
      var st = $("#contentStatus");
      var btn = this;
      btn.disabled = true;
      try {
        await saveConfig(A.draft);
        A.config = clone(A.draft);
        renderJson();
        toast(st, "Cambios guardados correctamente.");
      } catch (err) {
        console.error(err);
        toast(st, "No se pudieron guardar los cambios.", true);
      } finally { btn.disabled = false; }
    });

    $("#btnReloadContent").addEventListener("click", function () {
      if (!window.confirm("¿Descartar los cambios no guardados?")) return;
      A.draft = clone(A.config);
      renderTab(A.tab);
      toast($("#contentStatus"), "Cambios descartados.");
    });
  }

  /* ============================================================ advanced */
  function renderJson() {
    var area = $("#jsonArea");
    if (area && A.draft) area.value = JSON.stringify(A.draft, null, 2);
  }

  function bindAdvanced() {
    $("#btnSaveJson").addEventListener("click", async function () {
      var st = $("#jsonStatus");
      try {
        var parsed = JSON.parse($("#jsonArea").value);
        A.draft = parsed;
        await saveConfig(A.draft);
        A.config = clone(A.draft);
        renderTab(A.tab);
        toast(st, "JSON guardado.");
      } catch (err) {
        console.error(err);
        toast(st, "JSON inválido: " + err.message, true);
      }
    });

    $("#btnFormatJson").addEventListener("click", function () {
      var st = $("#jsonStatus");
      try {
        $("#jsonArea").value = JSON.stringify(JSON.parse($("#jsonArea").value), null, 2);
        toast(st, "Formateado.");
      } catch (err) { toast(st, "JSON inválido.", true); }
    });

    $("#btnLoadJson").addEventListener("click", function () {
      A.draft = clone(A.config);
      renderJson();
      renderTab(A.tab);
      toast($("#jsonStatus"), "Recargado desde la base de datos.");
    });

    $("#btnExportJson").addEventListener("click", function () {
      var blob = new Blob([JSON.stringify(A.draft, null, 2)], { type: "application/json" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "facet-dental-contenido.json";
      a.click();
      URL.revokeObjectURL(a.href);
    });

    $("#btnResetContent").addEventListener("click", async function () {
      if (!window.confirm("Esto reemplazará TODO el contenido del sitio por los valores de fábrica. ¿Continuar?")) return;
      A.draft = clone(window.DEFAULT_CONTENT);
      await saveConfig(A.draft);
      A.config = clone(A.draft);
      renderTab(A.tab);
      renderJson();
      toast($("#jsonStatus"), "Contenido restaurado.");
    });
  }

  /* ==================================================================== go */
  boot();
})();
