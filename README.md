# Sunset Cover Studio

[![make.fun](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/coral-fox-12/sunset-cover-studio/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/coral-fox-12/sunset-cover-studio/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

Turn any photo into GTA-style cover art: multi-panel posters with bold
caption lettering and a Vice City sunset or neon grade, exported as a PNG to
share. Built for the [gta6-cover-art-01 bounty](https://make.fun/bounty/gta6-cover-art-01)
on [make.fun](https://make.fun).

If you like this entry, join make.fun with my referral link:
[https://make.fun/r/bz33p674](https://make.fun/r/bz33p674) (code `bz33p674`).

## Run it

```sh
# serve the app (any static server works) and open it in desktop Chrome
python3 -m http.server 8080 --directory app
# open http://localhost:8080/
```

Everything runs offline in the browser. Photos are read on your own machine
and never uploaded.

## What it does

- **Any photo** — load the two sample photos or upload your own, then crop
  and position each one by dragging it inside its panel and sliding the zoom.
- **Panels** — Duo (one tall panel plus two stacked), Trio (three strips) or
  Quad (2 × 2). Click a panel to select it; each panel holds its own photo.
- **Caption** — a bold condensed title and a script subtitle, editable text
  and size, top or bottom of the cover.
- **Grade** — Sunset, Neon, Vice, Dusk and Candy colour grades, plus film
  grain and a vignette.
- **Shuffle** — one click re-deals the layout, grade, caption and crops.
- **Export** — a PNG at 1080 × 1080, 1080 × 1350 or 1920 × 1080.

## Layout

- `main.ts` — the entry program: copies `app/` and `screenshots/` to the
  output directory and writes `dossier.json` with the kit's library.
- `app/` — the web app as static files (`index.html`, `styles.css`,
  `src/editor.js`, `src/render.js`, `src/grades.js`, sample photos).
- `screenshots/` — the app at work and covers it exported.
- `vendor/makefun-app.ts` — the kit's library, unchanged.

## Originality

All art, lettering and code here are original. No Rockstar Games logo,
artwork, character or font is used anywhere; the caption uses system fonts
only, and the sample photos are the kit's own free-to-use images.

## License

MIT. See [LICENSE](LICENSE).
