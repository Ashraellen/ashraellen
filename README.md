# Ashraellen

Official multilingual website of Ashraellen.

Live website: https://www.ashraellen.com/

## Structure

The site is built as a static multilingual website and published through GitHub Pages.

Main language folders:

- `/ru/`
- `/en/`
- `/pl/`
- `/de/`
- `/es/`
- `/fr/`
- `/pt/`
- `/uk/`
- `/be/`

Main sections:

- `books` — books and literary projects
- `public` — public texts, talks, formulas and posts
- `research` — research materials, notes and project pages
- `monolith` — pages related to the MONOLITH trilogy

## Sitemap

`sitemap.xml` is generated automatically by GitHub Actions.

When `.html` pages are added or changed, the workflow updates the sitemap automatically.

The following files are excluded from the sitemap:

- `404.html`
- Google verification files
- service folders such as `assets`, `scripts`, `.github`

## APM / maintenance records

Project maintenance and repair notes are stored in `reports/apm/`.

Current records:

- `reports/apm/2026-06-30-static-metadata-repair.md` — static metadata repair, sitemap workflow cleanup, metadata audit, public identity cleanup, JSON-LD repair, deduplication, and OG image mapping from page backgrounds.

## Author

Ashraellen
