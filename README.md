# AssetX — Landing Page

The landing page for **AssetX**, a B2B marketplace in Egypt. Companies that are renovating, upgrading or relocating sell their surplus and used business assets, and startups and SMEs buy them for less than new.

## Features
- Arabic (default, RTL) and English, with a language toggle
- Light and dark mode (follows the system setting, can be toggled)
- Fully responsive: mobile, tablet, desktop
- Subtle scroll-reveal animations and transitions; respects `prefers-reduced-motion`
- Contact through WhatsApp (prefilled message), email and Facebook

## Structure
```
index.html        page markup (Arabic source text)
css/styles.css    themes, RTL/LTR layout, responsive rules, motion
js/i18n.js        English translations
js/main.js        language, theme, menu, reveal, tabs, counters
assets/           AssetX logo, icon and favicon
```

## Run locally
Plain HTML/CSS/JS, so there is no build step. Open `index.html` directly, or serve the folder:

```bash
npx serve .
```

## Deploy
Works on any static host. On GitHub Pages: **Settings → Pages → Deploy from branch → `main` / root**.
