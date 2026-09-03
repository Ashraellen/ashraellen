# Ashraellen

Official public website and multilingual authorial archive of **Ashraellen**.

Live website:

https://www.ashraellen.com/

This repository contains the production source of the public site: literary work, research, public texts, professional materials, project pages and multilingual authorial presentation.

## What the site is

Ashraellen.com is not a single-project landing page. It is the public web layer of a wider authorial and research ecosystem.

The site brings together, among other things:

- books and literary projects;
- public texts, talks, formulas and posts;
- research materials and research-position pages;
- professional / dossier materials;
- project and institutional pages;
- contact and public author information;
- multilingual editions of the same public structure.

Project memory, recovery state, decisions and production history are maintained separately in the private APM repository. This repository is the **public-site production source**, not the global project memory system.

## Publishing model

The site is built as a static multilingual website and published through GitHub Pages under the custom domain:

```text
ashraellen.com
```

Public pages should remain structurally complete in source HTML. Runtime scripts must not be used as hidden patches for missing navigation, content, metadata or language structure.

## Languages

Current language roots include:

- `/ru/`
- `/en/`
- `/fi/`
- `/pl/`
- `/de/`
- `/es/`
- `/fr/`
- `/pt/`
- `/uk/`
- `/be/`

Language sections may develop at different stages, but published language versions are expected to preserve the meaning, scope and authorial presence of the source rather than being reduced summaries.

## Main public contours

The repository contains multilingual structures including:

- `books` — books and literary projects;
- `public` — public texts and authorial materials;
- `research` — research, notes and project pages;
- `professional` — professional / dossier materials;
- `contact` — public contact pages;
- project-specific pages and institutional presentation materials.

The exact site map evolves over time; repository structure and the live site are authoritative over older documentation snapshots.

## Shared assets

`assets/` contains shared visual and style resources used across the site, including the canonical public **Mark of Presence** asset.

## Sitemap and technical infrastructure

`sitemap.xml` is maintained through repository automation.

Service and deployment infrastructure includes `.github/`, shared assets, scripts, verification files and GitHub Pages configuration. These are technical layers of the public site rather than separate public projects.

## Maintenance and project memory

Website production is coordinated with the private repository:

```text
Ashraellen/apm
```

The APM repository stores durable project memory, recovery state, decisions, transcripts and project-local coordination. Historical site-maintenance records may also exist in this repository under service/report paths, but they do not replace current project-local state in APM.

## Author

**Ashraellen**
