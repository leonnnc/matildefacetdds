/* ==========================================================================
   matildefacetdds.com — Forms
   Appointment wizard, contact form and records request.
   All submissions are written to Firestore (appointments / messages).
   ========================================================================== */
(function () {
  "use strict";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var t = function (k, v) { return window.SITE ? window.SITE.t(k, v) : k; };

  /* ------------------------------------------------------------------ helpers */
  function fieldWrap(input) { return input && input.closest(".field"); }

  function setError(input, msgKey) {
    var w = fieldWrap(input);
    if (!w) return;
    w.classList.add("invalid");
    var err = w.querySelector(".err");
    if (err && msgKey) err.textContent = t(msgKey);
  }
  function clearError(input) {
    var w = fieldWrap(input);
    if (w) w.classList.remove("invalid");
  }
  function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(String(v || "").trim()); }
  function isPhone(v) { return String(v || "").replace(/[^\d]/g, "").length >= 7; }

  function validateField(input) {
    if (!input) return true;
    clearError(input);
    var val = input.type === "checkbox" ? input.checked : (input.value || "").trim();
    if (input.hasAttribute("required")) {
      if (input.type === "checkbox" && !val) { setError(input, "form.errConsent"); return false; }
      if (input.type !== "checkbox" && !val) { setError(input, "form.errRequired"); return false; }
    }
    if (input.type === "email" && val && !isEmail(val)) { setError(input, "form.errEmail"); return false; }
    if (input.type === "tel" && val && !isPhone(val)) { setError(input, "form.errPhone"); return false; }
    return true;
  }

  function validateForm(form) {
    var ok = true;
    $$("input, select, textarea", form).forEach(function (f) {
      if (f.closest(".hidden")) return;
      if (!validateField(f)) ok = false;
    });
    if (!ok) {
      var first = $(".field.invalid input, .field.invalid select, .field.invalid textarea", form);
      if (first) { first.focus(); first.scrollIntoView({ block: "center", behavior: "smooth" }); }
    }
    return ok;
  }

  function showAlert(node, type, text) {
    if (!node) return;
    node.className = "form-alert show " + type;
    node.innerHTML = text;
  }
  function hideAlert(node) { if (node) node.className = "form-alert"; }

  function busy(btn, isBusy, labelIdle) {
    if (!btn) return;
    btn.disabled = !!isBusy;
    btn.dataset.idle = btn.dataset.idle || btn.innerHTML;
    btn.innerHTML = isBusy ? t("form.sending") : (labelIdle || btn.dataset.idle);
  }

  function stored(key, val) { try { localStorage.setItem(key, val); } catch (e) {} }
  function recall(key) { try { return localStorage.getItem(key) || ""; } catch (e) { return ""; } }

  /* ------------------------------------------------------- appointment wizard */
  function initWizard() {
    var root = $("#wizard");
    if (!root) return;

    var panels = $$(".step-panel", root);
    var stepper = $$(".wizard-steps li", root);
    var btnNext = $("#wizNext"), btnBack = $("#wizBack");
    var form = $("#appointmentForm");
    var alertBox = $("#wizAlert");
    var submitted = false;
    var step = 0;
    var state = { reason: "", reasonLabel: "", date: "", time: "" };

    /* ---- render choices from content ---- */
    var reasons = (window.SITE.content.appointment && window.SITE.content.appointment.reasons) || [];
    var choiceWrap = $("#reasonChoices");
    if (choiceWrap) {
      choiceWrap.innerHTML = reasons.map(function (r) {
        return '<label class="choice"><input type="radio" name="reason" value="' + window.SITE.esc(r.value) + '">' +
          '<span class="ico">' + window.SITE.icon(r.icon) + "</span>" +
          "<span><strong>" + window.SITE.esc(window.SITE.L(r, "label")) + "</strong>" +
          "<span>" + window.SITE.esc(window.SITE.L(r, "hint")) + "</span></span></label>";
      }).join("");
    }

    var times = (window.SITE.content.appointment && window.SITE.content.appointment.times) || [];
    var slotWrap = $("#timeSlots");
    if (slotWrap) {
      slotWrap.innerHTML = times.map(function (tm) {
        return '<button type="button" class="slot" data-time="' + window.SITE.esc(tm) + '">' + window.SITE.esc(tm) + "</button>";
      }).join("");
    }

    var dateInput = $("#apDate");
    if (dateInput) {
      var minIso = nextBusinessDay(new Date());
      dateInput.min = minIso;
      if (!dateInput.value) { dateInput.value = minIso; state.date = formatDate(minIso); }
    }

    var notice = $("#wizNotice");
    if (notice) notice.textContent = window.SITE.L(window.SITE.content.appointment, "notice");

    /* ---- navigation ---- */
    function paint() {
      panels.forEach(function (p, i) { p.classList.toggle("active", i === step); });
      stepper.forEach(function (s, i) {
        s.classList.toggle("active", i === step);
        s.classList.toggle("done", i < step);
      });
      if (btnBack) btnBack.style.visibility = step === 0 ? "hidden" : "visible";
      if (btnNext) {
        btnNext.innerHTML = step === panels.length - 1
          ? t("form.send")
          : t("form.next") + window.SITE.icon("arrowRight");
      }
      var live = $("#wizLive");
      if (live) live.textContent = t("wiz.stepper", { n: step + 1 });
      hideAlert(alertBox);
    }

    function validateStep() {
      if (step === 0) {
        var picked = $('input[name="reason"]:checked', root);
        if (!picked) { showAlert(alertBox, "err", t("form.errRequired")); return false; }
        return true;
      }
      if (step === 1) {
        if (!dateInput || !dateInput.value) { showAlert(alertBox, "err", t("form.errRequired")); return false; }
        if (!state.time) { showAlert(alertBox, "err", t("form.errRequired")); return false; }
        return true;
      }
      if (step === 2) {
        var ok = true;
        ["#apFirst", "#apLast", "#apEmail", "#apPhone"].forEach(function (sel) {
          var f = $(sel);
          if (f && !validateField(f)) ok = false;
        });
        var consent = $("#apConsent");
        if (consent && !consent.checked) { setError(consent, "form.errConsent"); ok = false; }
        if (!ok) showAlert(alertBox, "err", t("form.errRequired"));
        return ok;
      }
      return true;
    }

    function summarize() {
      var box = $("#wizSummary");
      if (!box) return;
      var rows = [
        [t("wiz.summaryReason"), state.reasonLabel],
        [t("wiz.summaryDate"), state.date],
        [t("wiz.summaryTime"), state.time],
        [t("wiz.summaryName"), ($("#apFirst").value + " " + $("#apLast").value).trim()],
        [t("wiz.summaryContact"), $("#apEmail").value + " · " + $("#apPhone").value],
        [t("wiz.summaryNew"), $("#apNewPatient").checked ? t("wiz.newsPatientYes") : t("wiz.newPatientNo")]
      ];
      box.innerHTML = rows.map(function (r) {
        return '<div class="summary-row"><span>' + window.SITE.esc(r[0]) + "</span><span>" +
          window.SITE.esc(r[1] || "—") + "</span></div>";
      }).join("");
    }

    if (btnNext) {
      btnNext.addEventListener("click", async function () {
        if (!validateStep()) return;
        if (step < panels.length - 1) {
          if (step === 1) summarize();
          step++;
          paint();
          if (step === 3) summarize();
          root.scrollIntoView({ block: "start", behavior: "smooth" });
          return;
        }
        await submit();
      });
    }

    if (btnBack) {
      btnBack.addEventListener("click", function () {
        if (step > 0) { step--; paint(); }
      });
    }

    root.addEventListener("change", function (ev) {
      var r = ev.target.closest('input[name="reason"]');
      if (r) {
        $$(".choice", root).forEach(function (c) { c.classList.toggle("selected", c.contains(r)); });
        var idx = reasons.map(function (x) { return x.value; }).indexOf(r.value);
        state.reason = r.value;
        state.reasonLabel = idx > -1 ? window.SITE.L(reasons[idx], "label") : r.value;

        /* Keep the "first visit" checkbox in sync with the chosen reason */
        var np = $("#apNewPatient");
        if (np) {
          np.checked = (r.value === "new-patient");
          var extra = $("#newPatientExtra");
          if (extra) extra.classList.toggle("hidden", !np.checked);
        }
      }
      var d = ev.target.closest("#apDate");
      if (d) state.date = d.value ? formatDate(d.value) : "";
      var np = ev.target.closest("#apNewPatient");
      if (np) {
        var extra = $("#newPatientExtra");
        if (extra) extra.classList.toggle("hidden", !np.checked);
      }
    });

    root.addEventListener("click", function (ev) {
      var slot = ev.target.closest(".slot");
      if (!slot) return;
      $$(".slot", root).forEach(function (s) { s.classList.remove("selected"); });
      slot.classList.add("selected");
      state.time = slot.getAttribute("data-time");
      hideAlert(alertBox);
    });

    /* The office closes on weekends — offer the next weekday by default */
    function nextBusinessDay(d) {
      var t = new Date(d.getTime());
      t.setDate(t.getDate() + 1);
      while (t.getDay() === 0 || t.getDay() === 6) t.setDate(t.getDate() + 1);
      return new Date(t.getTime() - t.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    }

    function formatDate(iso) {
      try {
        var d = new Date(iso + "T12:00:00");
        return d.toLocaleDateString(window.SITE.lang === "es" ? "es-US" : "en-US",
          { weekday: "long", year: "numeric", month: "long", day: "numeric" });
      } catch (e) { return iso; }
    }

    /* ---- submit ---- */
    async function submit() {
      if (submitted) return;
      var payload = {
        type: "appointment",
        reason: state.reason,
        reasonLabel: state.reasonLabel,
        preferredDate: ($("#apDate") || {}).value || "",
        preferredTime: state.time,
        firstName: $("#apFirst").value.trim(),
        lastName: $("#apLast").value.trim(),
        email: $("#apEmail").value.trim(),
        phone: $("#apPhone").value.trim(),
        newPatient: $("#apNewPatient").checked,
        insurance: ($("#apInsurance") || {}).value || "",
        preferredContact: ($("#apContactMethod") || {}).value || "",
        notes: ($("#apNotes") || {}).value.trim(),
        status: "new",
        lang: window.SITE.lang
      };
      busy(btnNext, true);
      try {
        if (window.FB && window.FB.enabled) {
          await window.FB.add("appointments", payload);
          localStorage.removeItem("fd_apt_draft");
        } else {
          stored("fd_apt_last", JSON.stringify(payload));
          console.warn("[matildefacetdds.com] Demo mode — appointment not persisted:", payload);
        }
        submitted = true;
        showSuccess(payload);
      } catch (err) {
        console.error(err);
        showAlert(alertBox, "err", t("form.errorGeneric"));
      } finally {
        busy(btnNext, false);
      }
    }

    function showSuccess(payload) {
      var wrap = $("#wizardSuccess");
      var body = $("#wizardBody");
      var foot = $(".wizard-foot", root);
      var steps = $(".wizard-steps", root);
      if (wrap) {
        var demo = !(window.FB && window.FB.enabled);
        wrap.innerHTML =
          '<div class="center" style="padding:1rem 0">' +
          '<div class="ico" style="margin:0 auto 1rem;width:64px;height:64px;border-radius:18px;background:var(--primary-soft);color:var(--primary);display:grid;place-items:center">' +
          window.SITE.icon("checkCircle") + "</div>" +
          "<h3>" + t("form.okTitle") + "</h3>" +
          "<p>" + t("form.okAppointment") + "</p>" +
          '<div class="summary" style="text-align:left;max-width:460px;margin:1.2rem auto 0">' +
          '<div class="summary-row"><span>' + t("wiz.summaryReason") + "</span><span>" + window.SITE.esc(payload.reasonLabel) + "</span></div>" +
          '<div class="summary-row"><span>' + t("wiz.summaryDate") + "</span><span>" + window.SITE.esc(payload.preferredDate) + "</span></div>" +
          '<div class="summary-row"><span>' + t("wiz.summaryTime") + "</span><span>" + window.SITE.esc(payload.preferredTime) + "</span></div>" +
          "</div>" +
          (demo ? '<div class="form-alert info show" style="max-width:460px;margin:1.2rem auto 0;text-align:left">' + t("form.noFirebase") + "</div>" : "") +
          "</div>";
        wrap.style.display = "block";
      }
      if (body) body.style.display = "none";
      if (foot) foot.style.display = "none";
      if (steps) steps.style.display = "none";
      root.scrollIntoView({ block: "center", behavior: "smooth" });
    }

    paint();
    document.addEventListener("site-rendered", function () {
      /* re-render localised labels after language change */
      if (choiceWrap) {
        $$(".choice", choiceWrap).forEach(function (c, i) {
          var r = reasons[i]; if (!r) return;
          c.querySelector("strong").textContent = window.SITE.L(r, "label");
          c.querySelector("span span").textContent = window.SITE.L(r, "hint");
        });
      }
      if (notice) notice.textContent = window.SITE.L(window.SITE.content.appointment, "notice");
      if (step === 3) summarize();
      paint();
    });
  }

  /* ---------------------------------------------------------- simple forms */
  function initSimpleForm(selector, collection, okKey, builder) {
    var form = $(selector);
    if (!form) return;
    var alertBox = form.querySelector(".form-alert") || $("#" + form.id + "Alert");
    var submitBtn = form.querySelector('[type="submit"]');

    form.addEventListener("submit", async function (ev) {
      ev.preventDefault();
      hideAlert(alertBox);
      if (!validateForm(form)) return;

      var data = builder ? builder(form) : {};
      data.lang = window.SITE.lang;

      /* honeypot */
      var hp = form.querySelector('[name="_hp"]');
      if (hp && hp.value) return;

      busy(submitBtn, true);
      try {
        if (window.FB && window.FB.enabled) {
          await window.FB.add(collection, data);
          form.reset();
          showAlert(alertBox, "ok", "<strong>" + t("form.okTitle") + "</strong><br>" + t(okKey));
        } else {
          console.warn("[matildefacetdds.com] Demo mode — not persisted:", data);
          form.reset();
          showAlert(alertBox, "info", "<strong>" + t("form.okTitle") + "</strong><br>" + t("form.noFirebase"));
        }
      } catch (err) {
        console.error(err);
        showAlert(alertBox, "err", t("form.errorGeneric"));
      } finally {
        busy(submitBtn, false);
      }
    });

    form.addEventListener("input", function (ev) { clearError(ev.target); });
    form.addEventListener("change", function (ev) { clearError(ev.target); });
  }

  /* Read a form field by name (form.elements avoids clashing with form.name) */
  function val(form, name) {
    var el = form.elements && form.elements[name];
    return el ? String(el.value || "").trim() : "";
  }

  function initContact() {
    initSimpleForm("#contactForm", "messages", "form.okContact", function (f) {
      return {
        type: "contact",
        name: val(f, "name"),
        email: val(f, "email"),
        phone: val(f, "phone"),
        subject: val(f, "subject"),
        message: val(f, "message"),
        status: "new"
      };
    });
  }

  function initRecords() {
    initSimpleForm("#recordsForm", "messages", "form.okContact", function (f) {
      return {
        type: "records",
        name: val(f, "rname"),
        email: val(f, "remail"),
        phone: val(f, "rphone"),
        direction: val(f, "direction"),
        officeName: val(f, "officeName"),
        officeContact: val(f, "officeContact"),
        dob: val(f, "rdob"),
        message: val(f, "rmessage"),
        status: "new"
      };
    });

    var direction = $("#recordsForm select[name='direction']");
    if (direction) {
      direction.addEventListener("change", function () {
        var box = $("#officeBox");
        if (box) box.classList.toggle("hidden", !direction.value);
      });
    }
  }

  /* ------------------------------------------------------------------- init */
  function init() {
    initWizard();
    initContact();
    initRecords();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
