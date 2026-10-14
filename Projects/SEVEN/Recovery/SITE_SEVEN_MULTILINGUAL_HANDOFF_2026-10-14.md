# SEVEN — site multilingual literary transcreation: recovery and successor handoff
Date: 2026-10-14
Project: Ashraellen.com / GitHub `Ashraellen/ashraellen`
Source conversation: SiteMemorySystem continuation (GREED, PRIDE, SEVEN, localized Books catalogs)
Purpose: preserve operational facts and decisions before MMS creates a successor. **Do not create a successor from this file automatically.**

## Immediate state

The dedicated literary website pages are present on all 10 site languages: Russian source (`ru`) and translations `en`, `be`, `pl`, `uk`, `pt`, `es`, `fr`, `de`, `fi`. Each language has:
- `/<lang>/books/seven/greed/index.html`
- `/<lang>/books/seven/pride/index.html`
- `/<lang>/books/seven/index.html`
- SEVEN card on `/<lang>/books/index.html`

40 HTML files total (10 × 4). Work was performed directly through GitHub actions in the repo, not local mockups. Literary excerpts and initial content were written using the corresponding Russian originals as source. All page URLs follow `https://www.ashraellen.com/<lang>/books/seven/...`.

## Stable literary and editorial commitments

- **True literary transcreation**, not an abridged translation or a generic summary. Preserve all 41 paragraph units of GREED chapter 1 §1.3 (Noel/Nina/Andrei/Ilia) and all 23 paragraph units of PRIDE's `Зал славы` (museum children, guide, speech, mop-worker). Important pacing, humor, dignity, and ambiguities matter.
- Russian GREED manuscript exists in provisional draft and **is unfinished**. PRIDE's imagined world, conflict, and a literary fragment exist, but **a complete PRIDE manuscript does not yet exist**. LUST (third book) is at concept stage; its image has deliberately **not been made**.
- GREED and PRIDE are independent literary works inside a seven-book cycle; the research program is related but **not a proven thesis**. Research methodological package v03 remains unfrozen and without the intended independent evaluation.
- Do not collapse literature into research; avoid asserting validation, publication, complete manuscripts, or a completed LUST cover.
- `pt` **must be European Portuguese / Portugal**: `pt_PT`, not Brazilian. User insisted explicitly.
- Names: de GREED = **Gier**, PRIDE = **Hochmut**, LUST = **Wollust**; fi GREED = **Ahneus**, PRIDE = **Ylpeys**, LUST = **Himo**; fr GREED = **Avidité**, PRIDE = **Orgueil**, LUST = **Luxure**; es GREED = **Codicia**, PRIDE = **Soberbia**. Other existing names should be preserved as written on their pages.
- SEO: canonical URL for each language; matching og:locale; JSON-LD `WebPage` or `CollectionPage` with localized `inLanguage`. The original book's `Book.inLanguage` is `ru`, because its actual manuscript is Russian.
- Shared CSS (do not unnecessarily modify): `assets/seven-greed-book-one.css`, `assets/seven-pride-book-two.css`, `assets/seven-literary-series.css`. Cover assets reused.

## Completion audit, performed during chat

Every one of the 10 language versions was fetched from GitHub and checked:
- Series page: **8 opening and closing sections**, **3 book cards**, **7 thematic question cards**.
- GREED: **8 sections**, **41 original excerpt paragraph slots**, **6 thematic tiles**.
- PRIDE: **8 sections**, **23 excerpt paragraphs**, **6 thematic tiles**.
- Book catalog: **4 sections**, includes link/card to localized SEVEN.
- GREED and PRIDE localized pages both link to localized series page (2 series hrefs per book after navigation repair).
- Locale/canonical samples reviewed on all series pages; locale present for all 10 catalogs.
- JSON-LD parsing validated on all translated GREED and PRIDE book pages after navigation changes, as well as on pages in per-language work.
- No `hidden`, `display:none`, `visibility:hidden` selectors in page HTML and no hide-rules in the SEVEN series CSS. The GREED and PRIDE CSS files each have three expected `display:none` uses to toggle native `<details>` summary marker/open-vs-closed labels. **This is not a concealed content patch.**
- The **only intentional visible placeholder** is LUST's transparent notice that its cover has not yet been designed. Preserve unless genuine artwork is commissioned.
- No changes were needed on the final audit; artistic text and CSS were not edited in that audit.

**Important qualification:** this audit established **repository structure and code/links presence**, not HTTP response correctness, CSS appearance at multiple breakpoints, or visual rendering of the deployed website. The user said they would check the website themselves. Never misrepresent this as deployed browser testing.

## Navigation repair performed AFTER all language pages were completed

Eight languages (`en, be, pl, uk, es, fr, de, fi`) still linked book pages back to `/<lang>/books/` from the early, temporary stage when SEVEN pages did not yet exist. In the prior conversation, 16 files were updated: both GREED and PRIDE for each of those 8 languages. They now link to `/<lang>/books/seven/` and include a series action linking to SEVEN. The European Portuguese pages already had direct series links and were left unchanged. Russian pages also already linked correctly.

GREED nav fix commits:
- en `3d3fe7d71f40187b2b792ad7feea2ad1f92ad8bb`
- be `977d630e7840c66088b94f64a64733e04bb2953b`
- pl `5461fb5190539d27a08528c7043f1be77b481596`
- uk `093bc915f00efc0499eaf247ea06fbf64ed8d849`
- es `668808b85485fc7b8f26aa96d678b59b55dee8f8`
- fr `ff8a678c1f89d5cde3a650f07df23d462343e6d8`
- de `88602a86bb16fd5ab9d1142e720b51d47d840686`
- fi `d9145c336596116a7c51ab8b0d62d6c3de651b20`

PRIDE nav fix commits:
- en `181283416e088e6fb92220961356fadd0616c893`
- be `031bc01c37f4781008fb3e89bfaeb6f7d3f465be`
- pl `011a19338ab7048ad6f07f0b4b21dfa0a9725b97`
- uk `6723907759c6d38c26c9cab44632b0a20c4b7e15`
- es `cd8f3785619cbb76e5b739e8774e7284fc5589f2`
- fr `18b580269a50baaddb97a04ca7753a3636467ae9`
- de `2726cfd3f9f4c89c66a78fb646564b43280aa851`
- fi `9dbf2466768d482bbb88e7b96415276ee08c69df`

## Recent creation commits, for orientation

Spanish PRIDE `f2efe171443af1b26a6032451a5e2aaf9c7fa3fe`, Spanish series `01898024b2d36fbd169bcf408666d1437494d301`, Spanish catalog `7e3a16e2c6d4bb76d48985efe900ae29ae9024c6`.
French GREED `477d166f9dada73acbed5a690e03c4de1f8804dc`, French PRIDE `96fe6f4452235a97927c65d4981d49bc7e8962bd`, French series `473a27e686ccca393210ae210d83f4911ee63e5a`, French catalog `4d84e5e06a82a39c1b2925ab66d484282dd51c65`.
German GREED `89c06e0098ceca3b9fa2eae63b6b43428d5aa156`, German PRIDE `eeb8f7aa459ea465151ce24f8cb62fcf76d4abaf`, German series `2c594e3ee39d881ce563001545e884d26b647349`, German catalog `85003934f5ca8826cd6d14d303f767c3f3999c89`.
Finnish GREED `7025263adbc1c046e0211a2d0b604f68d0087782`, Finnish series `f24284f769e8c20d80c8978b12ef00c2a91bcd59`, Finnish catalog `08ca24954d6ce40664d2fca840203c94670fd5d2`. Finnish PRIDE was already present when attempted; fetched/verified blob `9327d125df6b750d0a817afc4f2cb3d65889ebe5` (do **not** claim it was newly created by the check).

## Next tasks and operating rules

1. The user is **personally reviewing the public site**. Wait for their findings. If they report layout/translation/link issues, reproduce and fix only the identified problems. No need to generate new pages now.
2. If asked for finishing QA: use a real browser/runtime or appropriate tool to check deployed pages at desktop/mobile sizes, images and fonts, collapsed excerpts, accessibility and actual links. Do not claim this was completed if inaccessible.
3. Consider separately a systematic link target check using GitHub tree/files or website HTTP, including older `/<lang>/projects/seven/` links: these research pages were confirmed in GitHub for `en,be,pl,uk,fr,de`; `pt,es,fi` SEVEN pages point to broader existing `/<lang>/research/`. Do not flatten distinct research vs literary projects.
4. After user confirmation, MMS may open successor according to its own workflow. **This conversation specifically requests preservation and readiness, not successor creation**.
5. To edit GitHub: `tools.mcp__GitHub__fetch_file({repository_full_name:"Ashraellen/ashraellen",path})`, then `tools.mcp__GitHub__update_file({repository_full_name:...,path,sha:oldBlobSha,content:newContent,message:...})`. Refetch afterward and check expected counts/content and JSON-LD.
6. The user often says «Продолжаем» expecting execution, not discussion. They prefer incremental safe commits, authenticity of transcreation, and verifiable results. Do not duplicate work or overwrite existing files blindly.

## Boundary / honesty

This is a full **operational recovery brief** recording work, decisions, validations, commit anchors, and pending checks. It is **not** a byte-for-byte verbatim export of the entire chat transcript. Original dialogue remains in this conversation; live repo files carry the definitive page text. This distinction matters for future MMS recovery.
