from pathlib import Path
import json
import re

ROOT = Path.cwd()
BASE = 'https://www.ashraellen.com'
PUBLIC = 'Ashraellen'
DEFAULT_IMAGE = BASE + '/assets/og/ashraellen-og-home-default-1200x630.jpg'
SKIP_DIRS = {'.git', '.github', 'assets', 'scripts', 'node_modules', 'reports'}
SKIP_FILES = {'404.html'}


def html_files():
    for path in ROOT.rglob('*.html'):
        if path.name in SKIP_FILES:
            continue
        if any(part in SKIP_DIRS for part in path.parts):
            continue
        yield path, path.relative_to(ROOT).as_posix()


def clean(text):
    return re.sub(r'\s+', ' ', text or '').strip()


def esc(text):
    return clean(text).replace('&', '&amp;').replace('"', '&quot;').replace('<', '&lt;').replace('>', '&gt;')


def strip_tags(text):
    text = re.sub(r'<script[\s\S]*?</script>', ' ', text, flags=re.I)
    text = re.sub(r'<style[\s\S]*?</style>', ' ', text, flags=re.I)
    text = re.sub(r'<[^>]+>', ' ', text)
    return clean(text.replace('&nbsp;', ' ').replace('&amp;', '&'))


def head_match(text):
    return re.search(r'<head[^>]*>([\s\S]*?)</head>', text, flags=re.I)


def get_title(head, page):
    match = re.search(r'<title[^>]*>([\s\S]*?)</title>', head, flags=re.I)
    if match:
        return strip_tags(match.group(1))
    return PUBLIC + ' — ' + page.replace('/index.html', '').replace('.html', '').replace('/', ' / ')


def get_meta(head, attr, value):
    p1 = r'<meta\s+[^>]*' + attr + r'=["\']' + re.escape(value) + r'["\'][^>]*content=["\']([^"\']*)["\'][^>]*>'
    p2 = r'<meta\s+[^>]*content=["\']([^"\']*)["\'][^>]*' + attr + r'=["\']' + re.escape(value) + r'["\'][^>]*>'
    match = re.search(p1, head, flags=re.I) or re.search(p2, head, flags=re.I)
    return clean(match.group(1)) if match else ''


def get_canonical(head, page):
    match = re.search(r'<link\s+[^>]*rel=["\']canonical["\'][^>]*href=["\']([^"\']*)["\'][^>]*>', head, flags=re.I)
    if match:
        return clean(match.group(1))
    path = re.sub(r'/index\.html$', '/', page)
    path = re.sub(r'^index\.html$', '', path)
    return BASE + '/' + path


def has_jsonld(head):
    return re.search(r'<script\s+type=["\']application/ld\+json["\'][^>]*>', head, flags=re.I) is not None


def remove_meta(head, attr, value):
    pattern = r'\n?\s*<meta\s+[^>]*' + attr + r'=["\']' + re.escape(value) + r'["\'][^>]*>'
    return re.sub(pattern, '', head, flags=re.I)


def remove_canonical(head):
    return re.sub(r'\n?\s*<link\s+[^>]*rel=["\']canonical["\'][^>]*>', '', head, flags=re.I)


def remove_title(head):
    return re.sub(r'\n?\s*<title[^>]*>[\s\S]*?</title>', '', head, count=1, flags=re.I)


def body_text(text):
    match = re.search(r'<main[^>]*>([\s\S]*?)</main>', text, flags=re.I) or re.search(r'<body[^>]*>([\s\S]*?)</body>', text, flags=re.I)
    return strip_tags(match.group(1) if match else text)


def make_description(head, text, title):
    desc = get_meta(head, 'name', 'description') or get_meta(head, 'property', 'og:description')
    if desc:
        return desc
    body = body_text(text)
    if body:
        desc = body[:200]
    else:
        desc = title + ' is part of the Ashraellen public archive.'
    if len(desc) < 80:
        desc = clean(desc + ' This page belongs to the Ashraellen multilingual public archive of creative and research work.')
    if len(desc) > 220:
        cut = desc[:219]
        pos = max(cut.rfind('.'), cut.rfind(','), cut.rfind(' '))
        desc = clean(cut[:pos if pos > 80 else len(cut)]) + '…'
    return desc


def make_keywords(head, text, page, title, desc):
    kw = get_meta(head, 'name', 'keywords')
    if kw:
        return kw
    words = re.findall(r'[\w\-]{3,}', clean(' '.join([PUBLIC, page, title, desc, body_text(text)[:400])).lower(), flags=re.U)
    out = []
    seen = set()
    stop = {'the','and','for','with','this','that','page','site','from','into','ashraellen'}
    for word in words:
        if word in stop or word in seen:
            continue
        seen.add(word)
        out.append(word)
        if len(out) >= 12:
            break
    return ', '.join([PUBLIC] + out)


def insert_jsonld(head, title, desc, canonical):
    if has_jsonld(head):
        return head
    data = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        'name': title,
        'description': desc,
        'url': canonical,
        'isPartOf': {'@type': 'WebSite', 'name': PUBLIC, 'url': BASE + '/'},
        'author': {'@type': 'Person', 'name': PUBLIC}
    }
    payload = json.dumps(data, ensure_ascii=False, indent=2)
    block = '\n    <script type="application/ld+json">\n' + '\n'.join('    ' + line for line in payload.splitlines()) + '\n    </script>'
    return head.rstrip() + block + '\n'


def image_value(head):
    return get_meta(head, 'property', 'og:image') or get_meta(head, 'name', 'twitter:image') or DEFAULT_IMAGE


changed = 0
for path, page in html_files():
    text = path.read_text(encoding='utf-8')
    m = head_match(text)
    if not m:
        continue
    old_head = m.group(1)
    head = old_head
    title = get_title(head, page)
    desc = make_description(head, text, title)
    canonical = get_canonical(head, page)
    keywords = make_keywords(head, text, page, title, desc)
    image = image_value(head)

    for attr, value in [
        ('name', 'description'), ('name', 'keywords'), ('property', 'og:title'), ('property', 'og:description'), ('property', 'og:image'),
        ('name', 'twitter:card'), ('name', 'twitter:title'), ('name', 'twitter:description'), ('name', 'twitter:image')
    ]:
        head = remove_meta(head, attr, value)
    head = remove_canonical(head)
    head = remove_title(head)

    block = '\n'.join([
        f'    <title>{esc(title)}</title>',
        f'    <meta name="description" content="{esc(desc)}">',
        f'    <meta name="keywords" content="{esc(keywords)}">',
        f'    <link rel="canonical" href="{esc(canonical)}">',
        f'    <meta property="og:title" content="{esc(title)}">',
        f'    <meta property="og:description" content="{esc(desc)}">',
        f'    <meta property="og:image" content="{esc(image)}">',
        '    <meta name="twitter:card" content="summary_large_image">',
        f'    <meta name="twitter:title" content="{esc(title)}">',
        f'    <meta name="twitter:description" content="{esc(desc)}">',
        f'    <meta name="twitter:image" content="{esc(image)}">'
    ])
    head = block + '\n' + head.strip() + '\n'
    head = insert_jsonld(head, title, desc, canonical)

    if head != old_head:
        repaired = text.replace(old_head, '\n' + head, 1)
        path.write_text(repaired, encoding='utf-8')
        changed += 1
        print(f'Repaired structured/social gaps: {page}')

print(f'Changed files: {changed}')
