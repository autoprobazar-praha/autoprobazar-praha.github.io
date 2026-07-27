# AutoProBazar Praha

Bilingual (Czech / Ukrainian) static website for a Prague-based automotive
business combining a used car dealership (**AutoProBazar Praha**) and a
24/7 towing & evacuation service (**OdtahPRO**).

🔗 **Live site:** _add your GitHub Pages / custom domain URL here after deploy_

## Overview

- Static HTML/CSS/JS — no build step, no dependencies
- Default language: **Czech**, with instant toggle to **Ukrainian**
  (`data-cz` / `data-ua` attributes, switched client-side via `setLang()`)
- Dark theme, violet accent, Oswald + Inter typefaces
- Multi-page car catalog with photo galleries, specs, and WhatsApp contact flow

## Structure

```
index.html        — homepage (hero, services, about, contact)
katalog.html       — car catalog / listing page
auto-1.html … auto-6.html   — individual car detail pages
images/            — all car photos, favicon, OG/social preview image
favicon.ico        — site favicon
apple-touch-icon.png — iOS home-screen icon
hero-video-3.mp4   — homepage hero background video
```

## Deployment (GitHub Pages)

1. Push this repo to GitHub
2. Repo → **Settings → Pages** → Source: `main` branch, `/ (root)`
3. Site will be available at `https://<username>.github.io/<repo-name>/`
4. **After you have the final URL**, update it in every HTML file:
   - `<meta property="og:url">`
   - `<link rel="canonical">`
   - `<meta property="og:image">`

   (currently these use a placeholder domain — see `TODO` comments in each file)

## Analytics (optional)

Placeholder comments for Google Analytics 4 and Meta Pixel are already in
place in the `<head>` of every page (`<!-- GA4: ... -->`, `<!-- Meta Pixel: ... -->`).
Paste your tracking snippets there if/when you set up analytics.

## Contact

📞 +420 608 698 655 · Instagram [@klubey_](https://instagram.com/klubey_) ·
TikTok [@autoprobazar](https://www.tiktok.com/@autoprobazar)
