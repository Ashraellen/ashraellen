from pathlib import Path
from urllib.parse import urljoin
import re

ROOT = Path.cwd()
BASE = 'https://www.ashraellen.com/'
FALLBACK = BASE + 'assets/og/ashraellen-og-home-default-1200x630.jpg'
REPORT = ROOT / 'reports' / 'page-backgrounds.md'
SKIP_DIRS = {'.git', '.github', 'assets', 'scripts', 'node_modules', 'reports'}
SKIP_FILES = {'404.html'}


def skip_name(name):
    return name in SKIP_FILES or re.fullmatch(r'google[a-z0-9_-]*\.html', name, flags=re.I)


def html_files():
    for path in ROOT.rglob('*.html'):
        if skip_name(path.name):
            continue
        if any(part in SKIP_DIRS for part in path.parts):
            continue
        yield path, path.relative_to(ROOT).as_posix()


def clean(text):
    return re.sub(r'\s+', ' ', text or '').strip()


def esc(text):
    return clean(text).replace('&', '&amp;').replace('"', '&quot;').replace('<', '&lt;').replace('>', '&gt;')


def head_match(text):
    return re.search(r'<head[^>]*>([\s\S]*?)</head>', text, flags=re.I)


def page_url(page):
    if page == 'index.html':
        return BASE
    p = re.sub(r'/index\.html$', '/', page)
    p = re.sub(r'^index\.html$', '', p)
    return urljoin(BASE, p)


def normalize_asset(page, value):
    value = clean(value).strip('"\'')
    if value.startswith('http://') or value.startswith('https://'):
        return value
    return urljoin(page_url(page), value)


def file_exists_for_url(url):
    if not url.startswith(BASE):
        return False
    rel = url[len(BASE):]
    return (ROOT / rel).exists()


def body_classes(text):
    classes = set()
    for match in re.finditer(r'class=["\']([^"\']+)["\']', text, flags=re.I):
        classes.update(match.group(1).split())
    return classes


def linked_css(text):
    return [m.group(1) for m in re.finditer(r'<link\s+[^>]*rel=["\']stylesheet["\'][^>]*href=["\']([^"\']+)["\'][^>]*>', text, flags=re.I)]


def inline_background(text, page):
    head = head_match(text)
    haystack = head.group(1) if head else text
    patterns = [
        r'background-image\s*:\s*url\(([^)]+)\)',
        r'background\s*:\s*url\(([^)]+)\)'
    ]
    for pattern in patterns:
        for match in re.finditer(pattern, haystack, flags=re.I):
            candidate = normalize_asset(page, match.group(1))
            if file_exists_for_url(candidate):
                return candidate, 'inline style background'
    return '', ''


def css_background(text, page):
    classes = body_classes(text)
    css = ' '.join(linked_css(text))
    if 'entry' in classes and 'style.css' in css:
        candidate = BASE + 'assets/hero.webp'
        if file_exists_for_url(candidate):
            return candidate, 'assets/style.css .entry::before'
    if 'books-page' in classes:
        candidate = BASE + 'assets/backgrounds/books-bg.webp'
        if file_exists_for_url(candidate):
            return candidate, 'assets/books.css .books-page::before'
    if 'book-online' in classes:
        candidate = BASE + 'assets/backgrounds/online-bg.jpg'
        if file_exists_for_url(candidate):
            return candidate, 'assets/books.css .book-online::before'
    if 'book-whinesis' in classes:
        candidate = BASE + 'assets/backgrounds/whinesis-bg.jpg'
        if file_exists_for_url(candidate):
            return candidate, 'assets/books.css .book-whinesis::before'
    return '', ''


def best_image(text, page):
    image, source = inline_background(text, page)
    if image:
        return image, source
    image, source = css_background(text, page)
    if image:
        return image, source
    return FALLBACK, 'fallback common OG image'


def image_type(url):
    ext = url.lower().split('?')[0].rsplit('.', 1)[-1]
    if ext == 'webp':
        return 'image/webp'
    if ext == 'png':
        return 'image/png'
    return 'image/jpeg'


def remove_meta(head, attr, value):
    pattern = r'\n?\s*<meta\s+[^>]*' + attr + r'=["\']' + re.escape(value) + r'["\'][^>]*>'
    return re.sub(pattern, '', head, flags=re.I)


def upsert_image_meta(head, image):
    for attr, value in [
        ('property', 'og:image'),
        ('property', 'og:image:secure_url'),
        ('property', 'og:image:type'),
        ('property', 'og:image:alt'),
        ('name', 'twitter:image'),
        ('name', 'twitter:image:alt')
    ]:
        head = remove_meta(head, attr, value)
    alt = 'Ashraellen page background image' if image != FALLBACK else 'Ashraellen — dark formal image with the hand and eye symbol'
    block = '\n'.join([
        f'    <meta property="og:image" content="{esc(image)}">',
        f'    <meta property="og:image:secure_url" content="{esc(image)}">',
        f'    <meta property="og:image:type" content="{image_type(image)}">',
        f'    <meta property="og:image:alt" content="{esc(alt)}">',
        f'    <meta name="twitter:image" content="{esc(image)}">',
        f'    <meta name="twitter:image:alt" content="{esc(alt)}">'
    ])
    return head.rstrip() + '\n' + block + '\n'


rows = []
changed = 0
for path, page in html_files():
    text = path.read_text(encoding='utf-8')
    m = head_match(text)
    if not m:
        continue
    old_head = m.group(1)
    image, source = best_image(text, page)
    new_head = upsert_image_meta(old_head, image)
    rows.append((page, source, image))
    if new_head != old_head:
        repaired = text.replace(old_head, '\n' + new_head, 1)
        path.write_text(repaired, encoding='utf-8')
        changed += 1
        print(f'Applied OG image from background: {page} -> {image}')

REPORT.parent.mkdir(parents=True, exist_ok=True)
out = ['# Page Backgrounds for OG Images', '', f'Generated pages: {len(rows)}', f'Changed files: {changed}', '', '| Page | Source | OG image |', '|---|---|---|']
for page, source, image in rows:
    out.append(f'| `{page}` | {source} | `{image}` |')
REPORT.write_text('\n'.join(out) + '\n', encoding='utf-8')
print(f'Wrote {REPORT.relative_to(ROOT).as_posix()}')
print(f'Changed files: {changed}')
