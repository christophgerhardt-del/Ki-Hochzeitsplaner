/* =====================================================================
   Maison Amoré — Interaktion
   Inhalt:
   1. Header / Scroll-Fortschritt / mobiles Menü
   2. Scroll-Reveal & Zähler
   3. FAQ-Akkordeon
   4. Budget-Rechner
   5. Timeline-Generator
   6. Stil-Finder (Quiz)
   7. Sitzplan-Planer
   ===================================================================== */
(function () {
  "use strict";

  const $  = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const euro = (n) => Math.round(n).toLocaleString("de-DE") + " €";

  /* =================================================== 1. Header & Co. */
  const header = $("#header");
  const progress = $("#scrollProgress");
  const onScroll = () => {
    const y = window.scrollY;
    if (header) header.classList.toggle("scrolled", y > 40);
    if (progress) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = "scaleX(" + (h > 0 ? y / h : 0) + ")";
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
      }
    });
  }

  /* =================================================== 2. Reveal & Zähler */
  const reveals = $$("[data-reveal]");
  if ("IntersectionObserver" in window) {
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
  $$(".acc-q").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.parentElement;
      const answer = btn.nextElementSibling;
      const isOpen = item.classList.contains("open");
      $$(".acc-item.open").forEach((other) => {
        if (other !== item) { other.classList.remove("open"); other.querySelector(".acc-a").style.maxHeight = null; }
      });
      item.classList.toggle("open", !isOpen);
      answer.style.maxHeight = isOpen ? null : answer.scrollHeight + "px";
    });
  });

  /* =================================================== 4. Budget-Rechner */
  (function budgetCalc() {
    const guests = $("#budgetGuests");
    if (!guests) return;
    const guestsVal = $("#budgetGuestsVal");
    const totalEl = $("#budgetTotal");
    const perGuestEl = $("#budgetPerGuest");
    const barsEl = $("#budgetBars");
    let level = 1;     // 0 schlicht, 1 klassisch, 2 luxuriös
    let region = 1;    // Multiplikator

    // [Basis, proGast] je Posten und Niveau
    const model = [
      { label: "Location & Miete",        base: [2200, 4200, 8000], pg: [10, 20, 38] },
      { label: "Catering & Getränke",     base: [600, 1000, 1600],  pg: [85, 125, 185] },
      { label: "Foto & Video",            base: [1400, 2400, 4200], pg: [0, 2, 5] },
      { label: "Floristik & Deko",        base: [700, 1600, 3400],  pg: [6, 12, 24] },
      { label: "Musik / DJ / Band",       base: [800, 1600, 3600],  pg: [0, 1, 3] },
      { label: "Outfits & Beauty",        base: [1200, 2400, 4800], pg: [0, 0, 2] },
      { label: "Trauung & Redner",        base: [350, 650, 1300],   pg: [0, 0, 1] },
      { label: "Papeterie & Sonstiges",   base: [400, 800, 1600],   pg: [7, 12, 20] }
    ];

    function compute() {
      const g = parseInt(guests.value, 10);
      let total = 0;
      const rows = model.map((m) => {
        const val = (m.base[level] + m.pg[level] * g) * region;
        total += val;
        return { label: m.label, val };
      });
      return { g, total, rows };
    }

    function render() {
      const { g, total, rows } = compute();
      guestsVal.textContent = g;
      animateNumber(totalEl, total, (v) => euro(v));
      perGuestEl.textContent = euro(total / g);
      const max = Math.max.apply(null, rows.map((r) => r.val));
      barsEl.innerHTML = rows
        .sort((a, b) => b.val - a.val)
        .map((r) => `
          <div class="bar-row">
            <span class="bar-label">${r.label}</span>
            <span class="bar-track"><span class="bar-fill" style="width:${(r.val / max * 100).toFixed(1)}%"></span></span>
            <span class="bar-val">${euro(r.val)}</span>
          </div>`).join("");
      // Balken nach dem Einfügen animieren
      requestAnimationFrame(() => $$(".bar-fill", barsEl).forEach((f) => f.classList.add("grown")));
    }

    // sanftes Hochzählen für die Gesamtsumme
    let numRAF;
    function animateNumber(el, to, fmt) {
      const from = parseFloat(el.dataset.cur || "0");
      const start = performance.now(), dur = 500;
      cancelAnimationFrame(numRAF);
      const step = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const cur = from + (to - from) * eased;
        el.textContent = fmt(cur);
        if (p < 1) numRAF = requestAnimationFrame(step);
        else el.dataset.cur = to;
      };
      numRAF = requestAnimationFrame(step);
    }

    guests.addEventListener("input", render);
    $("#budgetLevel").addEventListener("click", (e) => {
      const b = e.target.closest("[data-level]"); if (!b) return;
      level = parseInt(b.dataset.level, 10);
      $$("#budgetLevel .seg-btn").forEach((x) => x.classList.toggle("is-active", x === b));
      render();
    });
    $("#budgetRegion").addEventListener("click", (e) => {
      const b = e.target.closest("[data-region]"); if (!b) return;
      region = parseFloat(b.dataset.region);
      $$("#budgetRegion .seg-btn").forEach((x) => x.classList.toggle("is-active", x === b));
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

    // Vorbelegung: nächster Samstag in ~14 Monaten
    const seed = new Date();
    seed.setMonth(seed.getMonth() + 14);
    seed.setDate(seed.getDate() + ((6 - seed.getDay() + 7) % 7));
    input.value = seed.toISOString().slice(0, 10);
    input.min = new Date().toISOString().slice(0, 10);

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
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const days = Math.round((wedding - today) / DAY);

      if (days >= 0) {
        const months = Math.floor(days / 30.44);
        countEl.innerHTML = `<b>${days.toLocaleString("de-DE")}</b><span>Tage bis zum „Ja“ &nbsp;·&nbsp; rund ${months} Monate</span>`;
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
    const quiz = $("#quiz");
    if (!quiz) return;
    const steps = $$(".quiz-step", quiz);
    const bar = $("#quizProgressBar");
    const stage = $("#quizStage");
    const result = $("#quizResult");
    const total = steps.length;
    let current = 0;
    let scores = {};

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

    function show(i) {
      steps.forEach((s, idx) => s.classList.toggle("is-active", idx === i));
      bar.style.width = (i / total * 100) + "%";
    }

    function finish() {
      const winner = Object.keys(scores).sort((a, b) => scores[b] - scores[a])[0] || "klassisch";
      const s = styles[winner];
      $("#quizResultTitle").textContent = s.title;
      $("#quizResultText").textContent = s.text;
      $("#quizResultMeta").innerHTML = s.meta.map((m) => `<span>${m}</span>`).join("");
      bar.style.width = "100%";
      stage.hidden = true;
      result.hidden = false;
    }

    $$(".quiz-opt", quiz).forEach((opt) => {
      opt.addEventListener("click", () => {
        const st = opt.dataset.style;
        scores[st] = (scores[st] || 0) + 1;
        current++;
        if (current >= total) finish();
        else show(current);
      });
    });

    $("#quizRestart").addEventListener("click", () => {
      scores = {}; current = 0;
      result.hidden = true; stage.hidden = false;
      show(0);
    });

    show(0);
  })();

  /* =================================================== 7. Sitzplan-Planer */
  (function seating() {
    const pool = $("#seatPool");
    if (!pool) return;
    const floor = $("#seatTables");
    const statusEl = $("#seatStatus");
    const remainingEl = $("#seatRemaining");
    const hintEl = $("#seatHint");

    // Gäste mit Gruppe; Konflikte = Paare, die nicht an denselben Tisch sollen
    const guests = [
      { id: "g1",  name: "Oma Erika",     grp: "Familie Braut" },
      { id: "g2",  name: "Opa Klaus",     grp: "Familie Braut" },
      { id: "g3",  name: "Mama Susanne",  grp: "Familie Braut" },
      { id: "g4",  name: "Papa Bernd",    grp: "Familie Braut" },
      { id: "g5",  name: "Tante Rita",    grp: "Familie Bräutigam" },
      { id: "g6",  name: "Onkel Dieter",  grp: "Familie Bräutigam" },
      { id: "g7",  name: "Lisa (BFF)",    grp: "Freunde" },
      { id: "g8",  name: "Max & Jana",    grp: "Freunde" },
      { id: "g9",  name: "Kollege Tom",   grp: "Arbeit" },
      { id: "g10", name: "Cousine Mia",   grp: "Familie Braut" },
      { id: "g11", name: "Sven (Ex-Mann)",grp: "Familie Bräutigam" },
      { id: "g12", name: "DJ-Freund Ali", grp: "Freunde" }
    ];
    // Konflikt: geschiedene Großeltern & Ex-Partner nicht mit bestimmten Personen
    const conflicts = [ ["g2", "g11"], ["g4", "g11"], ["g5", "g11"] ];

    const tables = [
      { id: "t1", name: "Tisch 1 · Familie", cap: 4 },
      { id: "t2", name: "Tisch 2 · Familie", cap: 4 },
      { id: "t3", name: "Tisch 3 · Freunde", cap: 4 }
    ];

    let seatMap = {};      // guestId -> tableId
    let selected = null;   // ausgewählter Gast

    function conflictAt(tableId, guestId) {
      const here = Object.keys(seatMap).filter((g) => seatMap[g] === tableId);
      return conflicts.some(([a, b]) =>
        (a === guestId && here.includes(b)) || (b === guestId && here.includes(a)));
    }

    function render() {
      // Pool
      const open = guests.filter((g) => !seatMap[g.id]);
      remainingEl.textContent = open.length;
      pool.innerHTML = open.map((g) => `
        <button type="button" class="chip ${selected === g.id ? "is-selected" : ""}" data-guest="${g.id}">
          <span class="chip-name">${g.name}</span><span class="chip-grp">${g.grp}</span>
        </button>`).join("") || `<p class="seat-empty">Alle Gäste sitzen. 🎉</p>`;

      // Tische
      floor.innerHTML = tables.map((t) => {
        const seated = guests.filter((g) => seatMap[g.id] === t.id);
        const seats = seated.map((g) => {
          const bad = conflictAt(t.id, g.id);
          return `<button type="button" class="seat ${bad ? "is-conflict" : ""}" data-remove="${g.id}" title="Entfernen">${g.name}${bad ? " ⚠" : ""}</button>`;
        }).join("");
        const free = t.cap - seated.length;
        const placing = selected && free > 0;
        return `
          <div class="table ${placing ? "is-target" : ""} ${free === 0 ? "is-full" : ""}" data-table="${t.id}">
            <div class="table-top">
              <span class="table-name">${t.name}</span>
              <span class="table-cap">${seated.length}/${t.cap}</span>
            </div>
            <div class="table-seats">${seats || '<span class="table-empty">frei</span>'}</div>
          </div>`;
      }).join("");
    }

    function setStatus(msg, type) {
      statusEl.textContent = msg || "";
      statusEl.className = "seat-status" + (type ? " is-" + type : "");
    }

    // Gast wählen
    pool.addEventListener("click", (e) => {
      const chip = e.target.closest("[data-guest]"); if (!chip) return;
      const id = chip.dataset.guest;
      selected = selected === id ? null : id;
      hintEl.textContent = selected
        ? guests.find((g) => g.id === selected).name + " gewählt — jetzt einen Tisch antippen."
        : "Gast antippen, dann einen Tisch wählen.";
      setStatus("");
      render();
    });

    // Tisch wählen -> setzen | Sitz antippen -> entfernen
    floor.addEventListener("click", (e) => {
      const remove = e.target.closest("[data-remove]");
      if (remove) {
        delete seatMap[remove.dataset.remove];
        setStatus("Gast wieder freigestellt.", "");
        render();
        return;
      }
      const table = e.target.closest("[data-table]");
      if (!table) return;
      if (!selected) { setStatus("Erst links einen Gast antippen.", "warn"); return; }
      const tId = table.dataset.table;
      const t = tables.find((x) => x.id === tId);
      const seatedCount = Object.values(seatMap).filter((v) => v === tId).length;
      if (seatedCount >= t.cap) { setStatus(t.name + " ist schon voll.", "warn"); return; }

      const willConflict = conflictAt(tId, selected);
      seatMap[selected] = tId;
      const name = guests.find((g) => g.id === selected).name;
      if (willConflict) {
        setStatus("⚠ Heikel: " + name + " sollte hier besser nicht sitzen — wir haben es markiert.", "warn");
      } else {
        setStatus(name + " sitzt an „" + t.name + "“.", "ok");
      }
      selected = null;
      hintEl.textContent = "Gast antippen, dann einen Tisch wählen.";
      render();
    });

    // KI ordnet automatisch — konfliktfrei, gruppenweise
    $("#seatAuto").addEventListener("click", () => {
      seatMap = {}; selected = null;
      // nach Gruppe sortieren, damit Familien zusammen sitzen
      const ordered = guests.slice().sort((a, b) => a.grp.localeCompare(b.grp));
      ordered.forEach((g) => {
        // ersten Tisch suchen, der Platz hat UND keinen Konflikt erzeugt
        let placed = false;
        for (const t of tables) {
          const cnt = Object.values(seatMap).filter((v) => v === t.id).length;
          if (cnt < t.cap && !conflictAt(t.id, g.id)) { seatMap[g.id] = t.id; placed = true; break; }
        }
        // falls nirgends konfliktfrei: trotzdem ersten freien Platz nehmen
        if (!placed) {
          for (const t of tables) {
            const cnt = Object.values(seatMap).filter((v) => v === t.id).length;
            if (cnt < t.cap) { seatMap[g.id] = t.id; break; }
          }
        }
      });
      const openLeft = guests.filter((g) => !seatMap[g.id]).length;
      setStatus(openLeft
        ? "KI-Vorschlag erstellt — " + openLeft + " Gäste passen nicht mehr an die 3 Demo-Tische (mehr Tische = alle sitzen)."
        : "✦ Fertig: Alle Gäste konfliktfrei platziert — Familien zusammen, heikle Paare getrennt.", "ok");
      hintEl.textContent = "Tipp: Einzelne Gäste antippen zum Entfernen, dann neu setzen.";
      floor.classList.add("just-arranged");
      setTimeout(() => floor.classList.remove("just-arranged"), 700);
      render();
    });

    $("#seatReset").addEventListener("click", () => {
      seatMap = {}; selected = null;
      setStatus("Zurückgesetzt.", "");
      hintEl.textContent = "Gast antippen, dann einen Tisch wählen.";
      render();
    });

    render();
  })();

  /* =================================================== Sanftes Scrollen */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length > 1) {
        const el = $(id);
        if (el) { e.preventDefault(); el.scrollIntoView({ behavior: "smooth", block: "start" }); }
      }
    });
  });
})();
