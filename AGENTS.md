# AGENTS.md

This file is mandatory reading for every assistant, agent, or future chat working with the Ashraellen website repository.

## Core site rule

The public website must be built as clean, static HTML.

Do not create patch-like solutions, temporary fixes, hidden runtime corrections, or JavaScript that repairs page structure after load.

The source HTML must already contain the real page content, real navigation links, real image paths, real language links, metadata, and canonical URLs.

## HTML rules

- Use semantic, readable HTML.
- Main page content must be present directly in the HTML.
- Navigation links must be written directly as normal links with real destinations.
- Image paths must be written directly as normal image sources.
- Do not use placeholder anchors for real navigation.
- Do not use JavaScript to replace link destinations, image sources, canonical links, hreflang links, titles, text, or book/page content.
- Do not add base-path patch scripts, link-rewriting blocks, or similar runtime correction logic.
- Do not hide missing page structure behind scripts.
- If a page exists in several languages, the language versions must have the same structural completeness.

## CSS rules

For any new page type, create a dedicated CSS file in assets/ and reuse it across all language versions of that page type.

Examples:

- A books index page type should use one shared books CSS file.
- A series page type should use one shared series CSS file.
- A new experimental page type should receive its own shared CSS file before multiple language pages are created.

Avoid large inline style blocks for new page types. Inline styles may remain only in older pages until they are deliberately refactored.

## JavaScript rules

JavaScript must not be used as a patch for static page structure.

Allowed only when explicitly needed and approved:

- analytics scripts;
- JSON-LD structured data;
- small optional interaction where the full content already exists in HTML, such as collapsing or expanding a visible text block.

Even when small interaction is used, all important content, links, images, titles, metadata, and SEO-relevant text must be available without JavaScript.

## SEO and robots

Pages must be understandable to crawlers from the raw HTML alone.

Every public page should contain, directly in HTML:

- one canonical URL;
- correct hreflang links when language versions exist;
- title and description;
- visible main heading;
- real internal links;
- meaningful alt text for images;
- JSON-LD where appropriate.

## No patch policy

Do not solve structural problems by adding a script, a hidden fallback, a temporary redirect, or a dynamic correction.

Fix the source HTML, CSS, and file structure directly.

If a page is broken, incomplete, duplicated, or inconsistent across languages, report the issue and correct the actual file rather than masking the problem.

## Working method

Before editing website pages:

1. Read this file.
2. Inspect the current file before modifying it.
3. Preserve existing content, metadata, language, and visual intent unless the task says otherwise.
4. Make the smallest clean structural change that solves the problem.
5. After editing, verify the changed file.
6. Do not claim that the live site is fixed unless the live deployed page has been checked.

## Project tone

Ashraellen.com is not a generic template site. Preserve its literary-philosophical tone, multilingual structure, and public research framing.

Do not turn pages into marketing copy, blog filler, spiritual teaching pages, therapy pages, motivational pages, or generic portfolio pages unless explicitly requested.
