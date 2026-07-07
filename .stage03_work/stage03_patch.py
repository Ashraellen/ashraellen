from __future__ import annotations

import html as htmllib
import json
import re
from pathlib import Path

ROOT = Path('.')
WORK = ROOT / '.stage03_work'
LANGS = ['en', 'pl', 'be', 'uk', 'de', 'fr', 'es', 'pt']
ALL_LANGS = ['en', 'ru', 'pl', 'be', 'uk', 'de', 'fr', 'es', 'pt']
LOCALES = {
    'en': 'en_US', 'pl': 'pl_PL', 'be': 'be_BY', 'uk': 'uk_UA',
    'de': 'de_DE', 'fr': 'fr_FR', 'es': 'es_ES', 'pt': 'pt_PT',
}
LANGUAGE_NAMES = {
    'en': 'English', 'pl': 'Polski', 'be': 'Беларуская', 'uk': 'Українська',
    'de': 'Deutsch', 'fr': 'Français', 'es': 'Español', 'pt': 'Português',
}
BOOKS_LABELS = {
    'en': 'Books', 'pl': 'Książki', 'be': 'Кнігі', 'uk': 'Книги',
    'de': 'Bücher', 'fr': 'Livres', 'es': 'Libros', 'pt': 'Livros',
}
IMAGE = 'https://www.ashraellen.com/assets/backgrounds/monolith-bg.webp'
PERSON_ID = 'https://www.ashraellen.com/#person'
WEBSITE_ID = 'https://www.ashraellen.com/#website'


def text(value: str) -> str:
    return htmllib.unescape(re.sub(r'<[^>]+>', '', value)).strip()


def esc(value: str) -> str:
    return htmllib.escape(value, quote=False)


def load_json(path: Path):
    return json.loads(path.read_text(encoding='utf-8'))


def replace_fragment(page: str, paragraphs: list[str] | None, expected: int) -> str:
    pattern = re.compile(r'(<div class="fragment">)(.*?)(</div></details>)', re.S)
    match = pattern.search(page)
    if not match:
        raise AssertionError('fragment container missing')
    if paragraphs is None:
        existing = re.findall(r'<p(?:\s[^>]*)?>(.*?)</p>', match.group(2), re.S)
        if len(existing) != expected:
            raise AssertionError(f'expected {expected} existing fragment paragraphs, got {len(existing)}')
        inner = ''.join(f'<p data-p="{i}">{body}</p>' for i, body in enumerate(existing, 1))
    else:
        if len(paragraphs) != expected:
            raise AssertionError(f'expected {expected} translated paragraphs, got {len(paragraphs)}')
        inner = ''.join(f'<p data-p="{i}">{esc(body)}</p>' for i, body in enumerate(paragraphs, 1))
    return page[:match.start()] + match.group(1) + inner + match.group(3) + page[match.end():]


def standard_section(heading: str, note: str, paragraphs: list[str]) -> str:
    body = ''.join(f'<p>{esc(p)}</p>' for p in paragraphs)
    return (
        '<section class="list"><div class="list-header">'
        f'<h2>{esc(heading)}</h2><p class="note">{esc(note)}</p></div>'
        f'<div class="copy">{body}</div></section>'
    )


def themes_section(cfg: dict) -> str:
    cards = ''.join(
        f'<article class="card"><h3>{esc(name)}</h3><p>{esc(body)}</p></article>'
        for name, body in cfg['themes']
    )
    return (
        '<section class="list"><div class="list-header">'
        f'<h2>{esc(cfg["themes_h"])}</h2><p class="note">{esc(cfg["themes_note"])}</p></div>'
        f'<div class="grid">{cards}</div></section>'
    )


def signal_section(cfg: dict) -> str:
    return (
        '<section class="list"><div class="list-header">'
        f'<h2>{esc(cfg["signal_h"])}</h2><p class="note">{esc(cfg["signal_note"])}</p></div>'
        f'<p class="quote">{esc(cfg["signal_q"])}</p>'
        f'<p class="copy">{esc(cfg["signal_p"])}</p></section>'
    )


def patch_beton(page: str, cfg: dict) -> str:
    page = replace_fragment(page, None, 29)
    matches = list(re.finditer(r'<section class="list">.*?</section>', page, re.S))
    if len(matches) < 11:
        raise AssertionError(f'BETON section count too small: {len(matches)}')
    replacements = {
        5: themes_section(cfg),
        6: standard_section(cfg['for_h'], cfg['for_note'], cfg['for_p']),
        7: standard_section(cfg['place_h'], cfg['place_note'], cfg['place_p']),
        9: standard_section(cfg['bound_h'], cfg['bound_note'], cfg['bound_p']),
        10: signal_section(cfg),
    }
    for index in sorted(replacements, reverse=True):
        match = matches[index]
        page = page[:match.start()] + replacements[index] + page[match.end():]
    return page


def extract_attr(page: str, pattern: str, label: str) -> str:
    match = re.search(pattern, page, re.S | re.I)
    if not match:
        raise AssertionError(f'{label} missing')
    return htmllib.unescape(match.group(1)).strip()


def strip_metadata(page: str) -> str:
    page = re.sub(r'<title>.*?</title>', '', page, flags=re.S | re.I)
    page = re.sub(r'<link\s+rel="canonical"[^>]*>', '', page, flags=re.I)
    page = re.sub(r'<meta\s+name="(?:description|keywords|twitter:[^"]+)"[^>]*>', '', page, flags=re.I)
    page = re.sub(r'<meta\s+property="og:[^"]+"[^>]*>', '', page, flags=re.I)
    page = re.sub(r'<script\s+type="application/ld\+json">.*?</script>', '', page, flags=re.S | re.I)
    return page


def metadata_block(lang: str, page: str, kind: str, slug: str) -> str:
    title = extract_attr(page, r'<title>(.*?)</title>', 'title')
    canonical = extract_attr(page, r'<link\s+rel="canonical"\s+href="([^"]+)"', 'canonical')
    desc_match = re.search(r'<meta\s+name="description"\s+content="([^"]*)"', page, re.I)
    if desc_match:
        description = htmllib.unescape(desc_match.group(1)).strip()
    else:
        description = text(extract_attr(page, r'<p class="lead">(.*?)</p>', 'lead'))
    h1 = text(extract_attr(page, r'<h1 class="h1">(.*?)</h1>', 'h1'))
    locale = LOCALES[lang]
    keywords = f'Ashraellen, MONOLITH, {h1}, dystopia, literature, artistic research'
    image_alt = f'{h1} — MONOLITH by Ashraellen'

    root = 'https://www.ashraellen.com/'
    lang_url = f'{root}{lang}/'
    books_url = f'{lang_url}books/'
    series_url = f'{books_url}monolith/'
    crumbs = [
        {'@type': 'ListItem', 'position': 1, 'name': 'Ashraellen', 'item': root},
        {'@type': 'ListItem', 'position': 2, 'name': LANGUAGE_NAMES[lang], 'item': lang_url},
        {'@type': 'ListItem', 'position': 3, 'name': BOOKS_LABELS[lang], 'item': books_url},
        {'@type': 'ListItem', 'position': 4, 'name': 'MONOLITH', 'item': series_url},
    ]
    entity_id = canonical + ('#series' if kind == 'series' else '#book')
    if kind != 'series':
        crumbs.append({'@type': 'ListItem', 'position': 5, 'name': h1, 'item': canonical})

    graph = [
        {
            '@type': 'Person', '@id': PERSON_ID, 'name': 'Ashraellen',
            'alternateName': 'Ashraellen', 'url': root,
            'knowsAbout': ['literary-philosophical research', 'artistic research', 'public philosophy', 'inner observation', 'language and meaning', 'digital autonomy', 'systems and consciousness', 'satire', 'MONOLITH'],
        },
        {
            '@type': 'WebSite', '@id': WEBSITE_ID, 'url': root, 'name': 'Ashraellen',
            'publisher': {'@id': PERSON_ID}, 'inLanguage': ALL_LANGS,
        },
        {
            '@type': 'CollectionPage', '@id': canonical + '#webpage', 'url': canonical,
            'name': title, 'headline': h1, 'description': description, 'inLanguage': lang,
            'isPartOf': {'@id': WEBSITE_ID}, 'about': {'@id': PERSON_ID},
            'creator': {'@id': PERSON_ID}, 'breadcrumb': {'@id': canonical + '#breadcrumb'},
            'mainEntity': {'@id': entity_id}, 'primaryImageOfPage': {'@id': IMAGE + '#image'},
        },
        {
            '@type': 'BreadcrumbList', '@id': canonical + '#breadcrumb',
            'itemListElement': crumbs,
        },
        {
            '@type': 'ImageObject', '@id': IMAGE + '#image', 'url': IMAGE,
            'contentUrl': IMAGE, 'width': 1200, 'height': 630, 'caption': image_alt,
        },
    ]
    if kind == 'series':
        graph.append({
            '@type': 'BookSeries', '@id': entity_id, 'name': 'MONOLITH',
            'description': description, 'url': canonical, 'inLanguage': lang,
            'creator': {'@id': PERSON_ID}, 'mainEntityOfPage': {'@id': canonical + '#webpage'},
            'hasPart': [{'@id': series_url + 'beton/#book'}, {'@id': series_url + 'sludge/#book'}],
        })
    else:
        cover = f'https://www.ashraellen.com/assets/covers/{slug}-ru.webp'
        graph.append({
            '@type': 'Book', '@id': entity_id, 'name': h1, 'headline': title, 'url': canonical,
            'description': description, 'inLanguage': lang, 'author': {'@id': PERSON_ID},
            'creator': {'@id': PERSON_ID}, 'image': cover,
            'isPartOf': {'@type': 'BookSeries', '@id': series_url + '#series', 'name': 'MONOLITH'},
            'mainEntityOfPage': {'@id': canonical + '#webpage'},
        })

    meta = [
        f'<title>{esc(title)}</title>', f'<link rel="canonical" href="{canonical}">',
        f'<meta name="description" content="{htmllib.escape(description, quote=True)}">',
        f'<meta name="keywords" content="{htmllib.escape(keywords, quote=True)}">',
        '<meta property="og:type" content="book">', '<meta property="og:site_name" content="Ashraellen">',
        f'<meta property="og:title" content="{htmllib.escape(title, quote=True)}">',
        f'<meta property="og:description" content="{htmllib.escape(description, quote=True)}">',
        f'<meta property="og:url" content="{canonical}">', f'<meta property="og:locale" content="{locale}">',
    ]
    for other in LANGS:
        if other != lang:
            meta.append(f'<meta property="og:locale:alternate" content="{LOCALES[other]}">')
    meta.extend([
        f'<meta property="og:image" content="{IMAGE}">', f'<meta property="og:image:secure_url" content="{IMAGE}">',
        '<meta property="og:image:type" content="image/webp">', '<meta property="og:image:width" content="1200">',
        '<meta property="og:image:height" content="630">',
        f'<meta property="og:image:alt" content="{htmllib.escape(image_alt, quote=True)}">',
        '<meta name="twitter:card" content="summary_large_image">',
        f'<meta name="twitter:title" content="{htmllib.escape(title, quote=True)}">',
        f'<meta name="twitter:description" content="{htmllib.escape(description, quote=True)}">',
        f'<meta name="twitter:image" content="{IMAGE}">',
        f'<meta name="twitter:image:alt" content="{htmllib.escape(image_alt, quote=True)}">',
        '<script type="application/ld+json">' + json.dumps({'@context': 'https://schema.org', '@graph': graph}, ensure_ascii=False, separators=(',', ':')) + '</script>',
    ])
    return ''.join(meta)


def patch_metadata(path: Path, kind: str, slug: str) -> None:
    page = path.read_text(encoding='utf-8')
    lang = path.parts[0]
    block = metadata_block(lang, page, kind, slug)
    page = strip_metadata(page)
    if '</head>' not in page:
        raise AssertionError(f'head missing in {path}')
    page = page.replace('</head>', block + '</head>', 1)
    path.write_text(page, encoding='utf-8')


def validate() -> dict:
    result = {'pages': 0, 'sludge_paragraphs': {}, 'beton_paragraphs': {}, 'metadata': {}}
    required_og = ['og:type', 'og:site_name', 'og:title', 'og:description', 'og:url', 'og:locale', 'og:image', 'og:image:secure_url', 'og:image:type', 'og:image:width', 'og:image:height', 'og:image:alt']
    required_tw = ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image', 'twitter:image:alt']
    for lang in LANGS:
        for slug in ['', 'beton', 'sludge']:
            path = ROOT / lang / 'books' / 'monolith' / (slug if slug else '') / 'index.html'
            page = path.read_text(encoding='utf-8')
            result['pages'] += 1
            expected = f'https://www.ashraellen.com/{lang}/books/monolith/' + (f'{slug}/' if slug else '')
            canon = re.findall(r'<link\s+rel="canonical"\s+href="([^"]+)"', page)
            assert canon == [expected], (path, canon, expected)
            alternates = re.findall(r'<link\s+rel="alternate"\s+hreflang="([^"]+)"', page)
            assert set(alternates) == set(LANGS + ['ru', 'x-default']), (path, alternates)
            for key in required_og:
                assert len(re.findall(fr'<meta\s+property="{re.escape(key)}"', page)) == 1, (path, key)
            for key in required_tw:
                assert len(re.findall(fr'<meta\s+name="{re.escape(key)}"', page)) == 1, (path, key)
            ld = re.findall(r'<script\s+type="application/ld\+json">(.*?)</script>', page, re.S)
            assert len(ld) == 1, (path, len(ld))
            data = json.loads(ld[0])
            types = {node.get('@type') for node in data['@graph']}
            assert {'Person', 'WebSite', 'CollectionPage', 'BreadcrumbList', 'ImageObject'} <= types, (path, types)
            assert ('BookSeries' if not slug else 'Book') in types, (path, types)
            breadcrumb = next(node for node in data['@graph'] if node.get('@type') == 'BreadcrumbList')
            assert len(breadcrumb['itemListElement']) == (4 if not slug else 5), path
            result['metadata'][str(path)] = 'PASS'
        sludge_path = ROOT / lang / 'books' / 'monolith' / 'sludge' / 'index.html'
        sludge_page = sludge_path.read_text(encoding='utf-8')
        sludge_ids = [int(x) for x in re.findall(r'<p data-p="(\d+)">', re.search(r'<div class="fragment">(.*?)</div></details>', sludge_page, re.S).group(1))]
        assert sludge_ids == list(range(1, 60)), (lang, sludge_ids)
        result['sludge_paragraphs'][lang] = 59
        beton_path = ROOT / lang / 'books' / 'monolith' / 'beton' / 'index.html'
        beton_page = beton_path.read_text(encoding='utf-8')
        beton_ids = [int(x) for x in re.findall(r'<p data-p="(\d+)">', re.search(r'<div class="fragment">(.*?)</div></details>', beton_page, re.S).group(1))]
        assert beton_ids == list(range(1, 30)), (lang, beton_ids)
        result['beton_paragraphs'][lang] = 29
    assert result['pages'] == 24
    return result


def main() -> None:
    beton_cfg = load_json(WORK / 'beton_sections.json')
    for lang in LANGS:
        sludge_path = ROOT / lang / 'books' / 'monolith' / 'sludge' / 'index.html'
        sludge_page = sludge_path.read_text(encoding='utf-8')
        sludge_page = replace_fragment(sludge_page, load_json(WORK / f'sludge_{lang}.json'), 59)
        sludge_path.write_text(sludge_page, encoding='utf-8')
        beton_path = ROOT / lang / 'books' / 'monolith' / 'beton' / 'index.html'
        beton_page = patch_beton(beton_path.read_text(encoding='utf-8'), beton_cfg[lang])
        beton_path.write_text(beton_page, encoding='utf-8')
    for lang in LANGS:
        patch_metadata(ROOT / lang / 'books' / 'monolith' / 'index.html', 'series', 'monolith')
        patch_metadata(ROOT / lang / 'books' / 'monolith' / 'beton' / 'index.html', 'book', 'beton')
        patch_metadata(ROOT / lang / 'books' / 'monolith' / 'sludge' / 'index.html', 'book', 'sludge')
    report = validate()
    report_dir = ROOT / 'Projects' / 'WEBSITE_BOOKS_SYNC' / 'STAGE_03_MONOLITH'
    report_dir.mkdir(parents=True, exist_ok=True)
    (report_dir / 'VALIDATION_SNAPSHOT.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


if __name__ == '__main__':
    main()
