/* =====================================================================
   Maison Amoré — Interaktion
   Inhalt:
   0. Hilfsfunktionen & Speicher (localStorage)
   1. Header / Scroll-Fortschritt / mobiles Menü / aktive Navigation
   2. Scroll-Reveal & Zähler
   3. FAQ-Akkordeon
   4. Budget-Rechner
   5. Timeline-Generator
   6. Stil-Finder (Quiz)
   7. Sitzplan-Planer
   8. Sanftes Scrollen
   ===================================================================== */
(function () {
  "use strict";

  const $  = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const euro = (n) => Math.round(n).toLocaleString("de-DE") + " €";
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const reduceMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* =================================================== 0. Speicher */
  // Tools merken sich die letzten Eingaben — beim nächsten Besuch fühlt es
  // sich persönlich an. Läuft komplett im Browser, ohne Server.
  const store = {
    get(key, fallback) {
      try {
        const v = localStorage.getItem("ma_" + key);
        return v == null ? fallback : JSON.parse(v);
      } catch (e) { return fallback; }
    },
    set(key, val) {
      try { localStorage.setItem("ma_" + key, JSON.stringify(val)); } catch (e) {}
    }
  };

  /* =================================================== 1. Header & Co. */
  const header = $("#header");
  const progress = $("#scrollProgress");
  const onScroll = () => {
    const y = window.scrollY;
    if (header) header.classList.toggle("scrolled", y > 40);
    if (progress) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = "scaleX(" + (h > 0 ? clamp(y / h, 0, 1) : 0) + ")";
    }
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const toggle = $("#navToggle");
  const links = $("#navLinks");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = document.body.classList.toggle("menu-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
    });
    links.addEventListener("click", (e) => {
      if (e.target.tagName === "A") {
        document.body.classList.remove("menu-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Menü öffnen");
      }
    });
    // Escape schließt das mobile Menü
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && document.body.classList.contains("menu-open")) {
        document.body.classList.remove("menu-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  // Aktiven Navigationspunkt hervorheben, je nachdem welcher Abschnitt sichtbar ist
  (function activeNav() {
    const navAnchors = $$('#navLinks a[href^="#"]');
    if (!navAnchors.length || !("IntersectionObserver" in window)) return;
    const map = {};
    navAnchors.forEach((a) => {
      const id = a.getAttribute("href").slice(1);
      const sec = document.getElementById(id);
      if (sec) map[id] = a;
    });
    const nav = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navAnchors.forEach((a) => a.classList.remove("is-current"));
          const a = map[entry.target.id];
          if (a) a.classList.add("is-current");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    Object.keys(map).forEach((id) => {
      const sec = document.getElementById(id);
      if (sec) nav.observe(sec);
    });
  })();

  /* =================================================== 2. Reveal & Zähler */
  const reveals = $$("[data-reveal]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add("in"); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }

  const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || "";
    if (reduceMotion) { el.textContent = target.toLocaleString("de-DE") + suffix; return; }
    const start = performance.now(), dur = 1600;
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString("de-DE") + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const counters = $$("[data-count]");
  if ("IntersectionObserver" in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { animateCount(entry.target); cio.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => cio.observe(el));
  } else {
    counters.forEach((el) => { el.textContent = el.dataset.count + (el.dataset.suffix || ""); });
  }

  /* =================================================== 3. FAQ */
  (function faq() {
    const items = $$(".acc-item");
    const setHeight = (item, open) => {
      const answer = item.querySelector(".acc-a");
      if (!answer) return;
      answer.style.maxHeight = open ? answer.scrollHeight + "px" : null;
    };
    items.forEach((item) => {
      const btn = item.querySelector(".acc-q");
      if (!btn) return;
      btn.setAttribute("aria-expanded", "false");
      btn.addEventListener("click", () => {
        const isOpen = item.classList.contains("open");
        items.forEach((other) => {
          if (other !== item && other.classList.contains("open")) {
            other.classList.remove("open");
            other.querySelector(".acc-q").setAttribute("aria-expanded", "false");
            setHeight(other, false);
          }
        });
        item.classList.toggle("open", !isOpen);
        btn.setAttribute("aria-expanded", String(!isOpen));
        setHeight(item, !isOpen);
      });
    });
    // Höhe des offenen Items bei Größenänderung korrigieren
    window.addEventListener("resize", () => {
      const open = $(".acc-item.open");
      if (open) setHeight(open, true);
    }, { passive: true });
  })();

  /* =================================================== 4. Budget-Rechner */
  (function budgetCalc() {
    const guests = $("#budgetGuests");
    if (!guests) return;
    const guestsVal = $("#budgetGuestsVal");
    const totalEl = $("#budgetTotal");
    const perGuestEl = $("#budgetPerGuest");
    const barsEl = $("#budgetBars");
    const tipEl = $("#budgetTip");

    // gespeicherte Werte laden
    const saved = store.get("budget", null);
    let level = saved && typeof saved.level === "number" ? saved.level : 1; // 0 schlicht, 1 klassisch, 2 luxuriös
    let region = saved && typeof saved.region === "number" ? saved.region : 1;
    if (saved && saved.guests) guests.value = clamp(saved.guests, +guests.min, +guests.max);

    // aktive Buttons gemäß gespeicherter Auswahl setzen
    $$("#budgetLevel .seg-btn").forEach((b) => {
      const on = +b.dataset.level === level;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", String(on));
    });
    $$("#budgetRegion .seg-btn").forEach((b) => {
      const on = parseFloat(b.dataset.region) === region;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", String(on));
    });

    // [Basis, proGast] je Posten und Niveau
    const model = [
      { label: "Location & Miete",      base: [2200, 4200, 8000], pg: [10, 20, 38] },
      { label: "Catering & Getränke",   base: [600, 1000, 1600],  pg: [85, 125, 185] },
      { label: "Foto & Video",          base: [1400, 2400, 4200], pg: [0, 2, 5] },
      { label: "Floristik & Deko",      base: [700, 1600, 3400],  pg: [6, 12, 24] },
      { label: "Musik / DJ / Band",     base: [800, 1600, 3600],  pg: [0, 1, 3] },
      { label: "Outfits & Beauty",      base: [1200, 2400, 4800], pg: [0, 0, 2] },
      { label: "Trauung & Redner",      base: [350, 650, 1300],   pg: [0, 0, 1] },
      { label: "Papeterie & Sonstiges", base: [400, 800, 1600],   pg: [7, 12, 20] }
    ];

    const tips = [
      "Tipp: An einem Freitag oder unter der Woche heiraten spart bei Location und Dienstleistern oft 15–25 %.",
      "Tipp: Die Gästezahl ist der größte Hebel. Jeder Gast kostet vor allem im Catering — eine kleinere Feier wirkt schnell.",
      "Tipp: Plant 5–10 % Puffer für Unvorhergesehenes ein. Maison Amoré warnt euch früh vor versteckten Kosten."
    ];

    function compute() {
      const g = clamp(parseInt(guests.value, 10) || 0, 1, 999);
      let total = 0;
      const rows = model.map((m) => {
        const val = (m.base[level] + m.pg[level] * g) * region;
        total += val;
        return { label: m.label, val };
      });
      return { g, total, rows };
    }

    function paintRange() {
      const min = +guests.min, max = +guests.max;
      const pct = ((clamp(+guests.value, min, max) - min) / (max - min)) * 100;
      guests.style.background =
        "linear-gradient(90deg, var(--gold) 0%, var(--gold-deep) " + pct + "%, var(--line) " + pct + "%)";
    }

    function render() {
      const { g, total, rows } = compute();
      guestsVal.textContent = g;
      paintRange();
      animateNumber(totalEl, total, (v) => euro(v));
      perGuestEl.textContent = euro(g ? total / g : 0);

      const max = Math.max.apply(null, rows.map((r) => r.val)) || 1;
      barsEl.innerHTML = rows
        .slice()
        .sort((a, b) => b.val - a.val)
        .map((r) => {
          const pct = (r.val / max * 100).toFixed(1);
          return `
          <div class="bar-row">
            <span class="bar-label">${r.label}</span>
            <span class="bar-track"><span class="bar-fill" style="width:0" data-w="${pct}"></span></span>
            <span class="bar-val">${euro(r.val)}</span>
          </div>`;
        }).join("");

      // Balken nach dem Einfügen wachsen lassen (zwei Frames = saubere Transition)
      const grow = () => $$(".bar-fill", barsEl).forEach((f) => { f.style.width = f.dataset.w + "%"; });
      if (reduceMotion) grow();
      else requestAnimationFrame(() => requestAnimationFrame(grow));

      if (tipEl) tipEl.textContent = tips[level];

      store.set("budget", { guests: g, level, region });
    }

    // sanftes Hochzählen für die Gesamtsumme
    let numRAF;
    function animateNumber(el, to, fmt) {
      if (reduceMotion) { el.textContent = fmt(to); el.dataset.cur = to; return; }
      const from = parseFloat(el.dataset.cur || "0");
      const start = performance.now(), dur = 500;
      cancelAnimationFrame(numRAF);
      const step = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(from + (to - from) * eased);
        if (p < 1) numRAF = requestAnimationFrame(step);
        else el.dataset.cur = to;
      };
      numRAF = requestAnimationFrame(step);
    }

    guests.addEventListener("input", render);
    $("#budgetLevel").addEventListener("click", (e) => {
      const b = e.target.closest("[data-level]"); if (!b) return;
      level = parseInt(b.dataset.level, 10);
      $$("#budgetLevel .seg-btn").forEach((x) => {
        const on = x === b;
        x.classList.toggle("is-active", on);
        x.setAttribute("aria-pressed", String(on));
      });
      render();
    });
    $("#budgetRegion").addEventListener("click", (e) => {
      const b = e.target.closest("[data-region]"); if (!b) return;
      region = parseFloat(b.dataset.region);
      $$("#budgetRegion .seg-btn").forEach((x) => {
        const on = x === b;
        x.classList.toggle("is-active", on);
        x.setAttribute("aria-pressed", String(on));
      });
      render();
    });

    render();
  })();

  /* =================================================== 5. Timeline-Generator */
  (function timeline() {
    const input = $("#weddingDate");
    if (!input) return;
    const countEl = $("#timelineCountdown");
    const listEl = $("#timelineList");

    const todayISO = new Date().toISOString().slice(0, 10);
    input.min = todayISO;

    // Vorbelegung: gespeichertes Datum oder nächster Samstag in ~14 Monaten
    const savedDate = store.get("weddingDate", null);
    if (savedDate && savedDate >= todayISO) {
      input.value = savedDate;
    } else {
      const seed = new Date();
      seed.setMonth(seed.getMonth() + 14);
      seed.setDate(seed.getDate() + ((6 - seed.getDay() + 7) % 7));
      input.value = seed.toISOString().slice(0, 10);
    }

    // Meilensteine: Monate vor der Hochzeit, Titel, Beschreibung
    const milestones = [
      { m: 14, t: "Budget & Vision festlegen", d: "Gemeinsamen Rahmen klären, Gästezahl grob schätzen, Wunschstil bestimmen." },
      { m: 12, t: "Location & Datum sichern", d: "Top-Locations anfragen, besichtigen und den Termin verbindlich buchen." },
      { m: 10, t: "Kern-Dienstleister buchen", d: "Fotograf, Catering und Musik sind früh ausgebucht — jetzt sichern." },
      { m: 8,  t: "Save-the-Dates versenden", d: "Gästeliste finalisieren und erste Info an alle Gäste verschicken." },
      { m: 6,  t: "Outfits & Trauung", d: "Brautkleid und Anzug aussuchen, Trauredner und Zeremonie planen." },
      { m: 4,  t: "Einladungen & Deko", d: "Einladungen verschicken, Floristik, Papeterie und Deko-Konzept festzurren." },
      { m: 2,  t: "Feinschliff & Sitzplan", d: "Rückmeldungen sammeln, Sitzplan erstellen, Ablaufplan mit allen abstimmen." },
      { m: 1,  t: "Letzte Details", d: "Probetermine, Tischkarten drucken, Zahlungen und Restposten erledigen." },
      { m: 0,  t: "Der große Tag", d: "Zurücklehnen und genießen — Maison Amoré koordiniert alles im Hintergrund." }
    ];

    const DAY = 86400000;
    const fmtMonth = (date) => date.toLocaleDateString("de-DE", { month: "long", year: "numeric" });

    function render() {
      const wedding = new Date(input.value + "T00:00:00");
      if (isNaN(wedding)) return;
      store.set("weddingDate", input.value);

      const today = new Date(); today.setHours(0, 0, 0, 0);
      const days = Math.round((wedding - today) / DAY);
      const openCount = milestones.filter((ms) => {
        const due = new Date(wedding); due.setMonth(due.getMonth() - ms.m);
        return ms.m !== 0 && due >= today;
      }).length;

      if (days > 0) {
        const months = Math.floor(days / 30.44);
        countEl.innerHTML =
          `<b>${days.toLocaleString("de-DE")}</b>` +
          `<span>Tage bis zum „Ja“ &nbsp;·&nbsp; rund ${months} Monate &nbsp;·&nbsp; ${openCount} Etappen vor euch</span>`;
      } else if (days === 0) {
        countEl.innerHTML = `<b>Heute!</b><span>Heute ist euer großer Tag — von Herzen alles Liebe. ♥</span>`;
      } else {
        countEl.innerHTML = `<b>♥</b><span>Dieser Tag liegt in der Vergangenheit — wir hoffen, er war wunderschön.</span>`;
      }

      listEl.innerHTML = milestones.map((ms) => {
        const due = new Date(wedding); due.setMonth(due.getMonth() - ms.m);
        const overdue = due < today && ms.m !== 0;
        const isDay = ms.m === 0;
        const when = isDay ? "Hochzeitstag" : (ms.m >= 12 ? "ab " : "ca. ") + ms.m + " Monate vorher";
        return `
          <li class="tl-item ${overdue ? "is-overdue" : ""} ${isDay ? "is-day" : ""}">
            <span class="tl-dot"></span>
            <div class="tl-body">
              <span class="tl-when">${when} &nbsp;·&nbsp; ${fmtMonth(due)}${overdue ? ' <em class="tl-flag">jetzt angehen</em>' : ""}</span>
              <h4>${ms.t}</h4>
              <p>${ms.d}</p>
            </div>
          </li>`;
      }).join("");
    }

    input.addEventListener("change", render);
    input.addEventListener("input", render);
    render();
  })();

  /* =================================================== 6. Stil-Finder */
  (function quiz() {
    const quizEl = $("#quiz");
    if (!quizEl) return;
    const steps = $$(".quiz-step", quizEl);
    const bar = $("#quizProgressBar");
    const stage = $("#quizStage");
    const result = $("#quizResult");
    const backBtn = $("#quizBack");
    const total = steps.length;
    let current = 0;
    let answers = []; // gewählter Stil je Frage

    const styles = {
      boho: {
        title: "Boho & Frei",
        text: "Ihr liebt das Ungezwungene: Pampasgras, Lichterketten, barfuß über die Wiese. Eure Hochzeit fühlt sich an wie ein wunderschönes Festival mit den Menschen, die ihr liebt.",
        meta: ["Location: Garten, Wiese, Olivenhain", "Farben: Terrakotta · Beige · Rost", "Deko: Trockenblumen, Makramee, Kerzen"]
      },
      klassisch: {
        title: "Klassisch & Elegant",
        text: "Bei euch darf es festlich sein: hohe Decken, Kerzenleuchter, ein großer Auftritt. Zeitlose Eleganz, die in zwanzig Jahren auf den Fotos noch genauso schön ist.",
        meta: ["Location: Schloss, Gut, Grandhotel", "Farben: Creme · Gold · Bordeaux", "Deko: Üppige Blumen, Silber, Leinen"]
      },
      modern: {
        title: "Modern & Minimalistisch",
        text: "Weniger ist mehr: klare Linien, viel Licht, jedes Detail bewusst gewählt. Eure Hochzeit wirkt kuratiert wie ein Magazin-Cover — reduziert und unverkennbar ihr.",
        meta: ["Location: Loft, Galerie, Architektur-Venue", "Farben: Weiß · Schwarz · Greenery", "Deko: Grafisch, monochrom, Statement-Stücke"]
      },
      rustikal: {
        title: "Rustikal & Herzlich",
        text: "Holz, Kerzenlicht, lange Tafeln: Bei euch steht das Zusammensein im Mittelpunkt. Bodenständig, warm und herzlich — ein großes Fest, das sich anfühlt wie nach Hause kommen.",
        meta: ["Location: Scheune, Weingut, Berghütte", "Farben: Eukalyptus · Naturholz · Warmweiß", "Deko: Holztische, Greenery, Glühbirnen"]
      }
    };
    // Reihenfolge entscheidet Gleichstände (oben gewinnt)
    const priority = ["klassisch", "boho", "rustikal", "modern"];

    function updateProgress() {
      // Fortschritt = beantwortete bzw. aktuelle Frage von gesamt
      const done = result.hidden ? current : total;
      bar.style.width = (done / total * 100) + "%";
    }

    function show(i) {
      steps.forEach((s, idx) => s.classList.toggle("is-active", idx === i));
      if (backBtn) backBtn.hidden = i === 0;
      updateProgress();
      const active = steps[i];
      if (active) {
        const first = active.querySelector(".quiz-opt");
        if (first && !reduceMotion) first.focus({ preventScroll: true });
      }
    }

    function finish() {
      const scores = {};
      answers.forEach((st) => { scores[st] = (scores[st] || 0) + 1; });
      let best = -1, winner = priority[0];
      priority.forEach((st) => {
        const sc = scores[st] || 0;
        if (sc > best) { best = sc; winner = st; }
      });
      const s = styles[winner];
      const match = Math.round((best / total) * 100);
      $("#quizResultTitle").textContent = s.title;
      $("#quizResultText").textContent = s.text;
      $("#quizResultMeta").innerHTML = s.meta.map((m) => `<span>${m}</span>`).join("");
      const matchEl = $("#quizMatch");
      if (matchEl) matchEl.textContent = match + "% Übereinstimmung";
      if (backBtn) backBtn.hidden = true;
      stage.hidden = true;
      result.hidden = false;
      updateProgress();
      store.set("quizStyle", winner);
    }

    $$(".quiz-opt", quizEl).forEach((opt) => {
      opt.addEventListener("click", () => {
        answers[current] = opt.dataset.style;
        current++;
        if (current >= total) finish();
        else show(current);
      });
    });

    if (backBtn) {
      backBtn.addEventListener("click", () => {
        if (current > 0) { current--; show(current); }
      });
    }

    $("#quizRestart").addEventListener("click", () => {
      answers = []; current = 0;
      result.hidden = true; stage.hidden = false;
      show(0);
    });

    show(0);
  })();

  /* =================================================== 7. Sitzplan-Planer (rund, Drag & Drop) */
  (function seating() {
    const pool = $("#seatPool");
    if (!pool) return;
    const floor = $("#seatTables");
    const statusEl = $("#seatStatus");
    const remainingEl = $("#seatRemaining");
    const hintEl = $("#seatHint");
    const conflictEl = $("#seatConflicts");
    const usedEl = $("#seatTablesUsed");
    const seatedEl = $("#seatSeatedCount");

    const guests = [
      { id: "g1",  name: "Oma Erika",        grp: "Familie Braut" },
      { id: "g2",  name: "Opa Klaus",        grp: "Familie Braut" },
      { id: "g3",  name: "Mama Susanne",     grp: "Familie Braut" },
      { id: "g4",  name: "Papa Bernd",       grp: "Familie Braut" },
      { id: "g5",  name: "Cousine Mia",      grp: "Familie Braut" },
      { id: "g6",  name: "Tante Rita",       grp: "Familie Bräutigam" },
      { id: "g7",  name: "Onkel Dieter",     grp: "Familie Bräutigam" },
      { id: "g8",  name: "Stiefvater Frank", grp: "Familie Bräutigam" },
      { id: "g9",  name: "Lisa (Trauzeugin)",grp: "Freunde" },
      { id: "g10", name: "Max",              grp: "Freunde" },
      { id: "g11", name: "Jana",             grp: "Freunde" },
      { id: "g12", name: "DJ-Freund Ali",    grp: "Freunde" },
      { id: "g13", name: "Kollege Tom",      grp: "Arbeit" },
      { id: "g14", name: "Kollegin Nina",    grp: "Arbeit" }
    ];
    // Konflikte: sollten NICHT am selben Tisch sitzen
    const conflicts = [ ["g4", "g8"], ["g1", "g8"], ["g2", "g8"] ];
    // Paare, die zusammen sitzen MÜSSEN
    const togetherPairs = [ ["g10", "g11"] ];
    const groupColor = {
      "Familie Braut": "#b08d57",
      "Familie Bräutigam": "#5e2733",
      "Freunde": "#3f7a4f",
      "Arbeit": "#4a6f9b"
    };

    const freshTables = () => ([
      { id: "t1", name: "Familie", cap: 6 },
      { id: "t2", name: "Freunde", cap: 6 },
      { id: "t3", name: "Bunt gemischt", cap: 6 }
    ]);
    let tables = freshTables();
    let tableSeq = 3;
    let seatMap = {};      // guestId -> tableId
    let selected = null;   // ausgewählter Gast (Tap-Fallback)

    const byId = (id) => guests.find((g) => g.id === id);
    const tableCount = (tId) => Object.values(seatMap).filter((v) => v === tId).length;
    const initials = (name) => {
      const w = name.replace(/[()]/g, "").split(/[\s-]+/).filter(Boolean);
      const a = w[0] ? w[0][0] : "?";
      const b = w.length > 1 ? w[w.length - 1][0] : "";
      return (a + b).toUpperCase();
    };
    function partnersOf(id) {
      const out = [];
      togetherPairs.forEach(([a, b]) => { if (a === id) out.push(b); if (b === id) out.push(a); });
      return out;
    }
    function conflictAt(tableId, guestId) {
      const here = Object.keys(seatMap).filter((g) => seatMap[g] === tableId && g !== guestId);
      return conflicts.some(([a, b]) =>
        (a === guestId && here.includes(b)) || (b === guestId && here.includes(a)));
    }
    function countConflicts() {
      let n = 0;
      guests.forEach((g) => { if (seatMap[g.id] && conflictAt(seatMap[g.id], g.id)) n++; });
      return n / 2;
    }
    function setStatus(msg, type) {
      statusEl.textContent = msg || "";
      statusEl.className = "seat-status" + (type ? " is-" + type : "");
    }

    function render() {
      const open = guests.filter((g) => !seatMap[g.id]);
      remainingEl.textContent = open.length;

      pool.innerHTML = open.length
        ? open.map((g) => {
            const mate = partnersOf(g.id).map(byId).filter(Boolean).map((p) => p.name);
            const note = mate.length ? `<span class="chip-note">↔ mit ${mate.join(", ")}</span>` : "";
            return `
              <button type="button" class="chip ${selected === g.id ? "is-selected" : ""}" data-guest="${g.id}" draggable="false">
                <span class="chip-ava" style="background:${groupColor[g.grp] || "#888"}">${initials(g.name)}</span>
                <span class="chip-text"><span class="chip-name">${g.name}</span><span class="chip-grp">${g.grp}</span>${note}</span>
              </button>`;
          }).join("")
        : `<p class="seat-empty">Alle Gäste sitzen. 🎉</p>`;

      floor.innerHTML = tables.map((t) => {
        const seated = guests.filter((g) => seatMap[g.id] === t.id);
        let slots = "";
        for (let i = 0; i < t.cap; i++) {
          const ang = (i / t.cap) * 2 * Math.PI - Math.PI / 2; // Start oben
          const R = 46;
          const x = (50 + R * Math.cos(ang)).toFixed(2);
          const y = (50 + R * Math.sin(ang)).toFixed(2);
          const g = seated[i];
          if (g) {
            const bad = conflictAt(t.id, g.id);
            slots += `<button type="button" class="pseat ${bad ? "is-conflict" : ""}" data-remove="${g.id}" style="left:${x}%;top:${y}%" title="${g.name} — entfernen"><span class="pseat-ini" style="background:${groupColor[g.grp] || "#888"}">${initials(g.name)}</span></button>`;
          } else {
            slots += `<span class="pseat is-empty" style="left:${x}%;top:${y}%"></span>`;
          }
        }
        const free = t.cap - seated.length;
        return `
          <div class="rtable ${free === 0 ? "is-full" : ""}" data-table="${t.id}">
            ${slots}
            <div class="rtable-disc">
              <span class="rtable-name">${t.name}</span>
              <span class="rtable-cap">${seated.length}/${t.cap}</span>
            </div>
          </div>`;
      }).join("");

      if (usedEl) usedEl.textContent = tables.filter((t) => tableCount(t.id) > 0).length;
      if (seatedEl) seatedEl.textContent = guests.length - open.length;
      if (conflictEl) {
        const c = countConflicts();
        conflictEl.textContent = c === 0 ? "0 Konflikte" : (c + (c === 1 ? " Konflikt" : " Konflikte"));
        conflictEl.classList.toggle("is-bad", c > 0);
      }
    }

    function placeGuest(id, tId) {
      const t = tables.find((x) => x.id === tId);
      if (!t) return;
      const already = seatMap[id] === tId;
      if (!already && tableCount(tId) >= t.cap) { setStatus("„" + t.name + "“ ist voll.", "warn"); render(); return; }
      const willConflict = conflictAt(tId, id);
      seatMap[id] = tId;
      const name = byId(id).name;

      let movedMate = null;
      partnersOf(id).filter((m) => !seatMap[m]).forEach((m) => {
        if (tableCount(tId) < t.cap) { seatMap[m] = tId; movedMate = byId(m).name; }
      });

      if (willConflict) setStatus("⚠ Heikel: " + name + " sollte hier besser nicht sitzen — wir haben es markiert.", "warn");
      else if (movedMate) setStatus(name + " & " + movedMate + " sitzen zusammen an „" + t.name + "“.", "ok");
      else setStatus(name + " sitzt an „" + t.name + "“.", "ok");

      selected = null;
      hintEl.textContent = "Weiter geht's — nächsten Gast ziehen oder antippen.";
      render();
    }

    function unseat(id) {
      if (seatMap[id]) { const name = byId(id).name; delete seatMap[id]; setStatus(name + " zurück in die Gästeliste.", ""); }
      render();
    }

    /* ---- Tap-Fallback: Gast wählen, dann Tisch antippen ---- */
    let suppressClick = false;
    pool.addEventListener("click", (e) => {
      if (suppressClick) return;
      const chip = e.target.closest("[data-guest]"); if (!chip) return;
      const id = chip.dataset.guest;
      selected = selected === id ? null : id;
      hintEl.textContent = selected
        ? byId(selected).name + " gewählt — jetzt einen Tisch antippen (oder ziehen)."
        : "Gast greifen und auf einen Tisch ziehen — oder antippen, dann Tisch wählen.";
      setStatus("");
      render();
    });
    floor.addEventListener("click", (e) => {
      if (suppressClick) return;
      const rm = e.target.closest("[data-remove]");
      if (rm) { unseat(rm.dataset.remove); return; }
      const t = e.target.closest("[data-table]");
      if (t) {
        if (selected) placeGuest(selected, t.dataset.table);
        else setStatus("Erst einen Gast antippen oder per Drag ziehen.", "warn");
      }
    });

    /* ---- Drag & Drop via Pointer Events (Maus + Touch) ---- */
    let drag = null, ghost = null, lastTarget = null;
    const startGhost = (id) => {
      const g = byId(id);
      ghost = document.createElement("div");
      ghost.className = "seat-ghost";
      ghost.innerHTML = `<span class="pseat-ini" style="background:${groupColor[g.grp] || "#888"}">${initials(g.name)}</span><span>${g.name}</span>`;
      document.body.appendChild(ghost);
      document.body.classList.add("seat-dragging");
    };
    const moveGhost = (x, y) => { if (ghost) { ghost.style.left = x + "px"; ghost.style.top = y + "px"; } };
    const clearHighlight = () => {
      if (lastTarget) { lastTarget.classList.remove("is-target"); lastTarget = null; }
      pool.classList.remove("is-drop");
    };
    const endGhost = () => {
      if (ghost) { ghost.remove(); ghost = null; }
      document.body.classList.remove("seat-dragging");
      clearHighlight();
    };
    const targetAt = (x, y) => {
      const el = document.elementFromPoint(x, y);
      if (!el) return null;
      const t = el.closest("[data-table]");
      if (t) return { type: "table", id: t.dataset.table, el: t };
      if (el.closest("#seatPool") || el.closest(".seat-side")) return { type: "pool" };
      return null;
    };
    const highlight = (tgt) => {
      clearHighlight();
      if (tgt && tgt.type === "table") { tgt.el.classList.add("is-target"); lastTarget = tgt.el; }
      else if (tgt && tgt.type === "pool") pool.classList.add("is-drop");
    };
    const onMove = (e) => {
      if (!drag) return;
      const x = e.clientX, y = e.clientY;
      if (!drag.moved) {
        if (Math.hypot(x - drag.x, y - drag.y) < 6) return;
        drag.moved = true;
        startGhost(drag.id);
      }
      e.preventDefault();
      moveGhost(x, y);
      highlight(targetAt(x, y));
    };
    const onUp = (e) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      if (drag && drag.moved) {
        const tgt = targetAt(e.clientX, e.clientY);
        if (tgt && tgt.type === "table") placeGuest(drag.id, tgt.id);
        else if (tgt && tgt.type === "pool") unseat(drag.id);
        else render();
        endGhost();
        suppressClick = true;
        setTimeout(() => { suppressClick = false; }, 80);
      }
      drag = null;
    };
    const onDown = (e) => {
      const chip = e.target.closest("[data-guest],[data-remove]");
      if (!chip) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      drag = { id: chip.dataset.guest || chip.dataset.remove, x: e.clientX, y: e.clientY, moved: false };
      window.addEventListener("pointermove", onMove, { passive: false });
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    };
    if (window.PointerEvent) {
      pool.addEventListener("pointerdown", onDown);
      floor.addEventListener("pointerdown", onDown);
    }

    /* ---- KI ordnet automatisch (Paare zusammen, konfliktfrei) ---- */
    $("#seatAuto").addEventListener("click", () => {
      seatMap = {}; selected = null;
      const parent = {};
      guests.forEach((g) => { parent[g.id] = g.id; });
      const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x])));
      togetherPairs.forEach(([a, b]) => { parent[find(a)] = find(b); });
      const unitMap = {};
      guests.forEach((g) => { const r = find(g.id); (unitMap[r] = unitMap[r] || []).push(g); });
      const units = Object.values(unitMap).sort((a, b) => a[0].grp.localeCompare(b[0].grp));
      const unitConflicts = (tId, members) => members.some((g) => conflictAt(tId, g.id));

      units.forEach((members) => {
        const size = members.length;
        let target = tables.find((t) => (t.cap - tableCount(t.id)) >= size && !unitConflicts(t.id, members));
        if (!target) target = tables.find((t) => (t.cap - tableCount(t.id)) >= size);
        if (target) members.forEach((g) => { seatMap[g.id] = target.id; });
        else members.forEach((g) => { const t = tables.find((x) => tableCount(x.id) < x.cap); if (t) seatMap[g.id] = t.id; });
      });

      const openLeft = guests.filter((g) => !seatMap[g.id]).length;
      const c = countConflicts();
      if (openLeft) setStatus("KI-Vorschlag erstellt — " + openLeft + " Gäste brauchen noch einen Platz. Legt mit „+ Tisch“ einfach weitere an.", "warn");
      else if (c > 0) setStatus("Fast perfekt: alle sitzen, " + c + (c === 1 ? " Konstellation" : " Konstellationen") + " ließ sich nicht ganz vermeiden — markiert.", "warn");
      else setStatus("✦ Fertig: Alle konfliktfrei platziert — Paare zusammen, Familien beieinander, heikle Paare getrennt.", "ok");
      hintEl.textContent = "Zieht einzelne Gäste um, bis es sich perfekt anfühlt.";
      if (!reduceMotion) { floor.classList.add("just-arranged"); setTimeout(() => floor.classList.remove("just-arranged"), 700); }
      render();
    });

    /* ---- Tisch hinzufügen / Zurücksetzen ---- */
    $("#seatAddTable").addEventListener("click", () => {
      tableSeq++;
      tables.push({ id: "t" + tableSeq, name: "Tisch " + tableSeq, cap: 6 });
      setStatus("Neuer runder Tisch hinzugefügt.", "ok");
      render();
    });
    $("#seatReset").addEventListener("click", () => {
      seatMap = {}; selected = null; tables = freshTables(); tableSeq = 3;
      setStatus("Zurückgesetzt.", "");
      hintEl.textContent = "Gast greifen und auf einen Tisch ziehen — oder antippen, dann Tisch wählen.";
      render();
    });

    render();
  })();

  /* =================================================== 8. Sanftes Scrollen */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length > 1) {
        const el = $(id);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
        }
      }
    });
  });
})();
