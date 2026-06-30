from pathlib import Path
import re

ROOT = Path.cwd()
PUBLIC = 'Ashraellen'
BASE = 'https://www.ashraellen.com'
SKIP_DIRS = {'.git', '.github', 'assets', 'scripts', 'node_modules', 'reports'}
SKIP_FILES = {'404.html'}
MIN_DESC = 80
MAX_DESC = 220
LANG_NAMES = {
    'be': 'Belarusian', 'en': 'English', 'pl': 'Polish', 'ru': 'Russian',
    'uk': 'Ukrainian', 'de': 'German', 'fr': 'French', 'es': 'Spanish'
}


def html_files():
    for path in ROOT.rglob('*.html'):
        if path.name in SKIP_FILES:
            continue
        if any(part in SKIP_DIRS for part in path.parts):
            continue
        yield path, path.relative_to(ROOT).as_posix()


def clean(text):
    return re.sub(r'\s+', ' ', text or '').strip()


def strip_tags(text):
    text = re.sub(r'<script[\s\S]*?</script>', ' ', text, flags=re.I)
    text = re.sub(r'<style[\s\S]*?</style>', ' ', text, flags=re.I)
    text = re.sub(r'<[^>]+>', ' ', text)
    return clean(text.replace('&nbsp;', ' ').replace('&amp;', '&'))


def get_head(text):
    match = re.search(r'<head[^>]*>([\s\S]*?)</head>', text, flags=re.I)
    return match


def get_title(head):
    match = re.search(r'<title[^>]*>([\s\S]*?)</title>', head, flags=re.I)
    return strip_tags(match.group(1)) if match else ''


def get_meta(head, attr, value):
    pattern = r'<meta\s+[^>]*' + attr + r'=["\']' + re.escape(value) + r'["\'][^>]*content=["\']([^"\']*)["\'][^>]*>'
    match = re.search(pattern, head, flags=re.I)
    if match:
        return clean(match.group(1))
    pattern = r'<meta\s+[^>]*content=["\']([^"\']*)["\'][^>]*' + attr + r'=["\']' + re.escape(value) + r'["\'][^>]*>'
    match = re.search(pattern, head, flags=re.I)
    return clean(match.group(1)) if match else ''


def remove_meta(head, attr, value):
    pattern = r'\n?\s*<meta\s+[^>]*' + attr + r'=["\']' + re.escape(value) + r'["\'][^>]*>'
    return re.sub(pattern, '', head, flags=re.I)


def replace_or_add_title(head, title):
    tag = f'<title>{escape(title)}</title>'
    if re.search(r'<title[^>]*>[\s\S]*?</title>', head, flags=re.I):
        return re.sub(r'<title[^>]*>[\s\S]*?</title>', tag, head, count=1, flags=re.I)
    return '\n    ' + tag + head


def escape(text):
    return clean(text).replace('&', '&amp;').replace('"', '&quot;').replace('<', '&lt;').replace('>', '&gt;')


def lang(page):
    first = page.split('/')[0]
    return first if re.fullmatch(r'[a-z]{2}', first) else ''


def section(page):
    parts = page.split('/')
    return parts[1] if lang(page) and len(parts) > 1 else (parts[0] if parts else '')


def slug_terms(page):
    page = re.sub(r'/index\.html$', '', page)
    page = re.sub(r'\.html$', '', page)
    return [p for p in re.split(r'[/_-]+', page) if p and not p.isdigit()]


def body_text(text):
    match = re.search(r'<main[^>]*>([\s\S]*?)</main>', text, flags=re.I) or re.search(r'<body[^>]*>([\s\S]*?)</body>', text, flags=re.I)
    return strip_tags(match.group(1) if match else text)


def headings(text):
    return [strip_tags(m.group(1)) for m in re.finditer(r'<h[1-3][^>]*>([\s\S]*?)</h[1-3]>', text, flags=re.I)][:8]


def canonical(page):
    url_path = re.sub(r'/index\.html$', '/', page)
    url_path = re.sub(r'^index\.html$', '', url_path)
    return BASE + '/' + url_path


def make_title(old_title, page):
    base = old_title or ' — '.join([PUBLIC, 'Archive page'])
    page_lang = lang(page)
    label = LANG_NAMES.get(page_lang, page_lang.upper() if page_lang else '')
    slugs = slug_terms(page)
    tail = ' / '.join(slugs[-2:]) if slugs else ''
    if label and label.lower() not in base.lower():
        return f'{base} — {label}'
    if tail and tail.lower() not in base.lower():
        return f'{base} — {tail}'
    return base


def make_desc(old_desc, text, page, title):
    if MIN_DESC <= len(old_desc) <= MAX_DESC:
        return old_desc
    source = clean(' '.join([old_desc, ' '.join(headings(text)), body_text(text)[:600]]))
    if not source:
        source = f'{title} is part of the {PUBLIC} multilingual public archive of literary, artistic and research work.'
    if len(source) < MIN_DESC:
        source = clean(source + f' This page belongs to the {PUBLIC} archive and presents page-specific material in the project context.')
    if len(source) > MAX_DESC:
        cut = source[:MAX_DESC - 1]
        pos = max(cut.rfind('.'), cut.rfind(','), cut.rfind(' '))
        source = clean(cut[:pos if pos > 80 else len(cut)]) + '…'
    return source


def record(path, page):
    text = path.read_text(encoding='utf-8')
    m = get_head(text)
    head = m.group(1) if m else ''
    return {'path': path, 'page': page, 'text': text, 'head': head, 'title': get_title(head), 'desc': get_meta(head, 'name', 'description'), 'ogt': get_meta(head, 'property', 'og:title'), 'ogd': get_meta(head, 'property', 'og:description')}


records = [record(path, page) for path, page in html_files()]

def duplicate_values(key):
    counts = {}
    for item in records:
        val = clean(item.get(key, '')).lower()
        if val:
            counts[val] = counts.get(val, 0) + 1
    return {val for val, count in counts.items() if count > 1}

DUP_TITLES = duplicate_values('title')
DUP_OGT = duplicate_values('ogt')
DUP_OGD = duplicate_values('ogd')

changed = 0
for item in records:
    if not item['head']:
        continue
    page = item['page']
    text = item['text']
    head = item['head']
    title = item['title']
    desc = item['desc']
    needs_title = (not title) or (title.lower() in DUP_TITLES) or (item['ogt'].lower() in DUP_OGT)
    new_title = make_title(title, page) if needs_title else title
    new_desc = make_desc(desc, text, page, new_title)
    if head != item['head'] or new_title != title:
        pass
    head = replace_or_add_title(head, new_title)
    for attr, value in [('name', 'description'), ('property', 'og:title'), ('property', 'og:description'), ('name', 'twitter:title'), ('name', 'twitter:description')]:
        head = remove_meta(head, attr, value)
    block = '\n'.join([
        f'    <meta name="description" content="{escape(new_desc)}">',
        f'    <meta property="og:title" content="{escape(new_title)}">',
        f'    <meta property="og:description" content="{escape(new_desc)}">',
        f'    <meta name="twitter:title" content="{escape(new_title)}">',
        f'    <meta name="twitter:description" content="{escape(new_desc)}">'
    ])
    head = head.rstrip() + '\n' + block + '\n'
    if head != item['head']:
        repaired = text.replace(item['head'], head, 1)
        item['path'].write_text(repaired, encoding='utf-8')
        changed += 1
        print(f'Repaired title/description/OG: {page}')

print(f'Changed files: {changed}')
