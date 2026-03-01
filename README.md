# JoyB Works Portfolio

Static portfolio for [joyb.works](https://joyb.works) on GitHub Pages.

## Commands

```bash
npm install
npm run build   # src/ → docs/ (minified, hashed)
npm run serve   # Local dev: dist/ at http://localhost:3000, watches src/
```

## Deploy

**Settings → Pages** → Deploy from branch `main`, folder `/docs`.

Commit and push. Pre-commit builds to `docs/` and stages it.

## Structure

- `src/sections/<name>/` — one folder per section with `name.html`, `name.css`, `name.js`. Order in `scripts/build.js` → `SECTION_ORDER`.
- `src/layout.html`, `base.css`, `global.js` — page shell and shared styles/script.
- `assets/images/`, `assets/logos/` — static assets (copied to output).
- `docs/` — production build. `dist/` — serve-mode build (gitignored).
