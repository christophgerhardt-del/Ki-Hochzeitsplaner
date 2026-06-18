# Maison Amoré — KI-Hochzeitsplanung

Eine hochwertige, statische Landingpage für eine KI-gestützte Hochzeitsplanung
im Stil einer exklusiven Beratungsagentur — getextet aus der Perspektive eines
**frisch verlobten Paares**. Die KI übernimmt alle Aufgaben eines klassischen
Hochzeitsplaners: von der **Location-Suche** über **Budget**, **Gästemanagement**,
**Dienstleister** und **Ablaufplan** bis zum **Sitzplan**.

## Interaktive Funktionen

Alles läuft rein im Browser — keine Anmeldung, kein Backend, keine Datenspeicherung:

1. **Budget-Rechner** — Gästezahl, Stil und Region wählen → Live-Schätzung des
   Gesamtbudgets inkl. animierter Aufschlüsselung pro Kostenposten.
2. **Timeline-Generator** — Wunschdatum wählen → Countdown plus persönliche
   To-do-Zeitachse; bereits fällige Aufgaben werden markiert.
3. **Stil-Finder** — kurzes 3-Fragen-Quiz → euer Hochzeitsstil mit passenden
   Location-, Farb- und Deko-Empfehlungen.
4. **Sitzplan-Planer** — Gäste per Klick an Tische setzen, Konflikte (z. B.
   geschiedene Großeltern) werden erkannt und markiert; „KI ordnet automatisch“
   platziert alle konfliktfrei.

## Dateien

- `index.html` — Seitenstruktur & Inhalte
- `css/styles.css` — Design-System (Farben, Typografie, Layout, Komponenten)
- `js/main.js` — Scroll-Reveal, Zähler, Menü, FAQ sowie die vier interaktiven Tools
- `.nojekyll` — verhindert Jekyll-Verarbeitung auf GitHub Pages

## Lokal starten

```bash
python3 -m http.server 8080
# danach im Browser: http://localhost:8080
```

Oder `index.html` direkt im Browser öffnen.

## Auf GitHub Pages veröffentlichen

1. Dateien (mit `index.html` im **Root**) ins Repository laden.
2. **Settings → Pages** → *Deploy from a branch* → Branch **main**, Folder **/(root)**.
3. Speichern — die Seite ist wenige Minuten später online.

## Design

- **Typografie:** Cormorant Garamond (Display-Serif) + Jost (Sans)
- **Palette:** warmes Creme, Tinte-Schwarz, Champagner-Gold, dezentes Bordeaux
- **Stil:** großzügiger Weißraum, feine Goldlinien, sanfte Reveal-Animationen,
  Scroll-Fortschrittsbalken

## Inhalt

Hero · „Frisch verlobt“-Entlastung · **Budget-Rechner** · Leistungen (9 Kacheln) ·
**Timeline-Generator** · **Stil-Finder** · **Sitzplan-Planer** · Ablauf in 4
Schritten · Sitzplan-Feature · Kennzahlen · Stimmen · Pakete · FAQ · CTA · Footer.

> Bildmaterial wird via Unsplash eingebunden und benötigt eine Internetverbindung;
> ohne Netz greifen elegante CSS-Verläufe als Fallback. Texte und Preise sind
> Beispielinhalte und frei anpassbar.
