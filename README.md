# Maison Amoré — KI-Hochzeitsplanung

Eine hochwertige, statische Landingpage für eine KI-gestützte Hochzeitsplanung
im Stil einer exklusiven Beratungsagentur. Die KI übernimmt alle Aufgaben eines
klassischen Hochzeitsplaners — von der **Location-Suche** über **Budget**,
**Gästemanagement**, **Dienstleister** und **Ablaufplan** bis zum **Sitzplan**.

## Vorschau

Single-Page-Website, vollständig responsiv, ohne Build-Schritt lauffähig.

- `index.html` — Seitenstruktur & Inhalte
- `css/styles.css` — Design-System (Farben, Typografie, Layout)
- `js/main.js` — Scroll-Reveal, Zähler-Animation, mobiles Menü, FAQ-Akkordeon

## Lokal starten

Da es eine reine statische Seite ist, genügt ein einfacher Webserver:

```bash
# Python
python3 -m http.server 8080
# danach im Browser: http://localhost:8080
```

Oder die Datei `index.html` direkt im Browser öffnen.

## Auf GitHub Pages veröffentlichen

1. Repository-Einstellungen → **Pages**
2. Quelle: Branch wählen, Ordner `/ki-hochzeitsplanung` (bzw. Root, falls als
   eigenes Repo verschoben)
3. Speichern — die Seite ist wenige Minuten später online.

## Design

- **Typografie:** Cormorant Garamond (Display-Serif) + Jost (Sans)
- **Palette:** warmes Creme, Tinte-Schwarz, Champagner-Gold, dezentes Bordeaux
- **Stil:** großzügiges Weißraum, feine Goldlinien, sanfte Reveal-Animationen

## Inhalt

Abschnitte: Hero · Philosophie · Leistungen (9 Kacheln) · Ablauf in 4 Schritten ·
Location-Feature · Sitzplan-Feature · Kennzahlen · Stimmen · Pakete · FAQ ·
Call-to-Action · Footer.

> Bildmaterial wird via Unsplash eingebunden und benötigt eine Internetverbindung.
> Texte und Preise sind Beispielinhalte und frei anpassbar.
