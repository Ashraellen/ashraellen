# Ashraellen — Site Starter (GitHub Pages)

This is a minimal static scaffold:
- Root: language auto-redirect + manual selection
- Per language: /<lang>/ (Entry: Research / Public)
- Two modes: /<lang>/research/ and /<lang>/public/
- Extra placeholders: Position, Texts, Notes

## Deploy on GitHub Pages
1. Create a GitHub repo (e.g. `ashraellen-site`).
2. Upload the contents of this folder to the repo root.
3. In GitHub: Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main` / root
4. Wait for the Pages URL.

## Custom domain
1. In Settings → Pages, set your custom domain (e.g. ashraellen.com)
2. Add DNS records at your DNS provider:
   - A records to GitHub Pages IPs OR CNAME to <user>.github.io
   GitHub will show exact values.

## Where to edit text
Edit the HTML files under each language folder.

## Notes
- The root index sets `noindex,nofollow` — remove when you're ready.
- Replace social links in /<lang>/public/index.html.