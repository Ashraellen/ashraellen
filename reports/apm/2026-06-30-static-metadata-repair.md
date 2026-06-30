# Static Metadata Repair and OG Background Mapping

Date: 2026-06-30
Repository: `Ashraellen/ashraellen`
Website: `https://www.ashraellen.com/`

This document records the static metadata repair work completed for the Ashraellen multilingual website.

The purpose of this work was to stop uncontrolled site-wide metadata generation, repair page-level SEO and social metadata, keep sitemap automation, and preserve the site as a static HTML project without adding new client-side JavaScript for metadata handling.

## Final status

The latest metadata audit reached:

```text
Pages checked: 550
Pages with issues: 0
Total issues: 0
```

The Google verification HTML file is intentionally excluded from the metadata audit because it is a verification file, not a public SEO page.

Remaining review notes are not errors. They record pages that still use shared OG/Twitter images or the approved fallback image where no page-specific background image exists.

## Core decisions

### 1. Static HTML only for metadata repair

No new client-side JavaScript was added to pages for this metadata repair.

All repair logic is performed through repository scripts and GitHub Actions. The output remains ordinary static HTML with static `<title>`, `<meta>`, `<link rel="canonical">`, Open Graph, Twitter Card, and JSON-LD blocks.

JSON-LD is present as `type="application/ld+json"`. It is structured data for search engines and is not executable client-side JavaScript.

### 2. Sitemap automation was preserved

The old workflow was not removed entirely because sitemap automation is necessary.

The workflow now keeps sitemap generation while running metadata audit and static metadata repair scripts before generating reports.

### 3. Ashraellen is the primary public identity

`Ashraellen` is the primary public identity across ordinary page titles, descriptions, Open Graph metadata, Twitter metadata, and public-facing metadata.

`Nikolai Kostyshev` is the real author name and is allowed where contextually appropriate, such as biography, contact, professional dossier, author identity blocks, and Person JSON-LD as `alternateName`.

The problem was not the presence of the real name, but uncontrolled repetition across ordinary content pages.

### 4. Fallback OG image is approved

The shared image `assets/og/ashraellen-og-home-default-1200x630.jpg` is approved as a fallback.

It may remain on pages where no page-specific background or project-specific image exists.

## Root cause fixed

The previous workflow used several automatic metadata generators that rewrote page metadata across the site:

```text
scripts/apply-canonical.js
scripts/apply-static-links.js
scripts/apply-jsonld.js
scripts/apply-og.js
scripts/generate-sitemap.js
scripts/submit-indexnow.js
```

The problematic parts were the metadata generators, especially:

```text
scripts/apply-jsonld.js
scripts/apply-og.js
```

They inserted generic metadata, generic JSON-LD, repeated author identity, repeated default OG image, and sometimes unsuitable schema types.

The workflow was changed so that sitemap automation remains, while uncontrolled metadata rewriting is no longer the core behavior.

## Scripts added or updated

### `scripts/audit-page-metadata.js`

Purpose: audit all public HTML pages and produce `reports/page-metadata-audit.md`.

Checks include:

```text
MISSING_TITLE
MISSING_DESCRIPTION
MISSING_KEYWORDS
MISSING_CANONICAL
MISSING_JSON_LD
MULTIPLE_JSON_LD
MISSING_OG_TITLE
MISSING_OG_DESCRIPTION
MISSING_OG_IMAGE
MISSING_TWITTER_CARD
MISSING_TWITTER_IMAGE
DESCRIPTION_TOO_SHORT
DESCRIPTION_TOO_LONG
REAL_NAME_ON_ORDINARY_CONTENT_PAGE
DUPLICATE_TITLE
DUPLICATE_DESCRIPTION
DUPLICATE_KEYWORDS
DUPLICATE_CANONICAL
DUPLICATE_OG_TITLE
DUPLICATE_OG_DESCRIPTION
```

It also records review notes for shared/fallback OG and Twitter images.

Google verification files are skipped intentionally.

### `scripts/export-page-keyword-workbench.js`

Purpose: generate a working map for page-specific keyword review.

Outputs:

```text
reports/page-keyword-workbench.md
reports/page-keyword-workbench.json
```

The workbench extracts title, description, headings, slug terms, excerpts, and candidate keyword seeds for each page.

### `scripts/add-missing-keywords.js`

Purpose: add missing static `<meta name="keywords">` tags where absent.

This removed the original mass issue where all pages were missing keyword metadata.

### `scripts/clean-public-identity-head.py`

Purpose: clean ordinary content page metadata by replacing uncontrolled `Nikolai Kostyshev` occurrences inside `<head>` with `Ashraellen`.

Scope:

```text
books
research
public
```

Identity pages such as contact, about, biography, author, and professional pages are not treated as ordinary content pages.

### `scripts/repair-title-description-og.py`

Purpose: repair and deduplicate page titles, meta descriptions, OG titles, OG descriptions, Twitter titles, and Twitter descriptions.

This significantly reduced duplicated titles and descriptions across multilingual pages.

### `scripts/repair-structured-social-gaps.py`

Purpose: fill missing structured/social metadata gaps.

It repairs missing:

```text
JSON-LD
OG image
Twitter image
Twitter card
canonical
page title
description
keywords
OG title
OG description
```

It uses the approved fallback image when no better asset is available.

### `scripts/dedupe-page-metadata.py`

Purpose: final deduplication pass for remaining duplicated titles, descriptions, OG descriptions, and keyword sets.

It uses page path context to make otherwise similar pages unique.

### `scripts/apply-og-from-page-backgrounds.py`

Purpose: use page background images as OG/Twitter images where possible.

It detects:

```text
inline background-image declarations
inline background url(...) declarations
known class-based CSS backgrounds
```

Known mappings include:

```text
assets/hero.webp
assets/backgrounds/books-bg.webp
assets/backgrounds/monolith-bg.webp
assets/backgrounds/online-bg.jpg
assets/backgrounds/whinesis-bg.jpg
```

If no page background image is found, it keeps the approved fallback image.

It also writes:

```text
reports/page-backgrounds.md
```

## Workflow updated

The GitHub Actions workflow `.github/workflows/sitemap.yml` now runs this sequence:

```text
1. Add missing static keywords
2. Clean public identity in ordinary page metadata
3. Repair title description and OG metadata
4. Repair structured data and social gaps
5. Dedupe page metadata
6. Apply OG images from page backgrounds
7. Audit page metadata
8. Export page keyword workbench
9. Generate sitemap.xml
10. Submit sitemap URLs to IndexNow
11. Commit repaired HTML, sitemap.xml and reports if changed
```

The workflow commits:

```text
**/*.html
sitemap.xml
reports/page-metadata-audit.md
reports/page-keyword-workbench.md
reports/page-keyword-workbench.json
reports/page-backgrounds.md
```

## Reports produced

### `reports/page-metadata-audit.md`

Main audit report.

Current desired state:

```text
Pages with issues: 0
Total issues: 0
```

Review notes may remain for intentional fallback/shared images.

### `reports/page-keyword-workbench.md`

Human-readable keyword review workbench.

### `reports/page-keyword-workbench.json`

Machine-readable keyword review workbench.

### `reports/page-backgrounds.md`

Mapping report showing which OG/Twitter image was selected for each page and why.

## Progress summary

The site moved through these issue counts:

```text
1604 → 584 → 126 → 80 → 0
```

Main repairs completed:

```text
MISSING_KEYWORDS: 551 → 0
REAL_NAME_ON_ORDINARY_CONTENT_PAGE: 500 → 0
MISSING_JSON_LD: 23 → 0
MISSING_OG_IMAGE: 5 → 0
MISSING_TWITTER_CARD: 5 → 0
MISSING_TWITTER_IMAGE: 5 → 0
DUPLICATE_TITLE: resolved
DUPLICATE_DESCRIPTION: resolved
DUPLICATE_KEYWORDS: resolved
DUPLICATE_OG_TITLE: resolved
DUPLICATE_OG_DESCRIPTION: resolved
```

## OG image policy after repair

Page-specific background images are preferred for OG/Twitter images.

If a page has no image background, the approved fallback remains:

```text
https://www.ashraellen.com/assets/og/ashraellen-og-home-default-1200x630.jpg
```

This is intentional and should not be treated as a metadata error.

## Important caution for future work

Do not re-enable broad site-wide metadata generators that blindly overwrite page-level metadata.

Future metadata changes should either be:

```text
page-specific and intentional
or
performed by controlled repair scripts with audit reports
```

Sitemap generation should remain automated.

Do not add client-side JavaScript for SEO metadata generation.

## Recommended next stage

The metadata repair is complete.

Future work is quality improvement rather than emergency repair:

```text
1. Create better page-specific OG images for important pages.
2. Improve individual descriptions manually for high-value pages.
3. Replace remaining approved fallback images where a stronger project-specific visual exists.
4. Continue using the audit report after structural changes.
```
