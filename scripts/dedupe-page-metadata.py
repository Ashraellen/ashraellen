from pathlib import Path
import re

ROOT = Path.cwd()
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


def strip_tags(text):
    text = re.sub(r'<[^>]+>', ' ', text)
    return clean(text.replace('&amp;', '&').replace('&nbsp;', ' '))


def head_match(text):
    return re.search(r'<head[^>]*>([\s\S]*?)</head>', text, flags=re.I)


def get_title(head):
    m = re.search(r'<title[^>]*>([\s\S]*?)</title>', head, flags=re.I)
    return strip_tags(m.group(1)) if m else ''


def get_meta(head, attr, value):
    p1 = r'<meta\s+[^>]*' + attr + r'=["\']' + re.escape(value) + r'["\'][^>]*content=["\']([^"\']*)["\'][^>]*>'
    p2 = r'<meta\s+[^>]*content=["\']([^"\']*)["\'][^>]*' + attr + r'=["\']' + re.escape(value) + r'["\'][^>]*>'
    m = re.search(p1, head, flags=re.I) or re.search(p2, head, flags=re.I)
    return clean(m.group(1)) if m else ''


def remove_meta(head, attr, value):
    p = r'\n?\s*<meta\s+[^>]*' + attr + r'=["\']' + re.escape(value) + r'["\'][^>]*>'
    return re.sub(p, '', head, flags=re.I)


def replace_title(head, title):
    tag = f'<title>{esc(title)}</title>'
    if re.search(r'<title[^>]*>[\s\S]*?</title>', head, flags=re.I):
        return re.sub(r'<title[^>]*>[\s\S]*?</title>', tag, head, count=1, flags=re.I)
    return tag + '\n' + head


def upsert_meta(head, attr, value, content):
    head = remove_meta(head, attr, value)
    tag = f'    <meta {attr}="{value}" content="{esc(content)}">'
    return head.rstrip() + '\n' + tag + '\n'


def page_label(page):
    raw = page.replace('/index.html', '').replace('.html', '')
    parts = [p for p in re.split(r'[/_-]+', raw) if p]
    if not parts:
        return 'home'
    if len(parts) >= 5:
        parts = parts[-4:]
    return ' / '.join(parts)


def path_terms(page):
    raw = page.replace('/index.html', '').replace('.html', '')
    parts = [p for p in re.split(r'[/_-]+', raw.lower()) if p and len(p) > 1]
    return ', '.join(parts[:18])


def desc_with_label(desc, label):
    suffix = f' Page context: {label}.'
    base = clean(desc)
    if label.lower() in base.lower():
        return base
    if len(base) + len(suffix) <= 220:
        return base + suffix
    keep = max(80, 220 - len(suffix) - 1)
    cut = base[:keep]
    pos = max(cut.rfind('.'), cut.rfind(','), cut.rfind(' '))
    base = clean(cut[:pos if pos > 80 else len(cut)])
    return base + '…' + suffix


records = []
for path, page in html_files():
    text = path.read_text(encoding='utf-8')
    m = head_match(text)
    if not m:
        continue
    head = m.group(1)
    records.append({
        'path': path,
        'page': page,
        'text': text,
        'head': head,
        'title': get_title(head),
        'desc': get_meta(head, 'name', 'description'),
        'keywords': get_meta(head, 'name', 'keywords'),
        'og_title': get_meta(head, 'property', 'og:title'),
        'og_desc': get_meta(head, 'property', 'og:description')
    })


def dup_set(field):
    counts = {}
    for r in records:
        val = clean(r[field]).lower()
        if val:
            counts[val] = counts.get(val, 0) + 1
    return {val for val, count in counts.items() if count > 1}

DUP_TITLE = dup_set('title')
DUP_DESC = dup_set('desc')
DUP_KEYWORDS = dup_set('keywords')
DUP_OG_TITLE = dup_set('og_title')
DUP_OG_DESC = dup_set('og_desc')

changed = 0
for r in records:
    head = r['head']
    label = page_label(r['page'])
    title = r['title'] or 'Ashraellen — ' + label
    desc = r['desc'] or f'Ashraellen page context: {label}.'
    keywords = r['keywords'] or 'Ashraellen'

    if title.lower() in DUP_TITLE or r['og_title'].lower() in DUP_OG_TITLE:
        if label.lower() not in title.lower():
            title = title + ' — ' + label

    if desc.lower() in DUP_DESC or r['og_desc'].lower() in DUP_OG_DESC:
        desc = desc_with_label(desc, label)

    if keywords.lower() in DUP_KEYWORDS:
        extra = path_terms(r['page'])
        if extra and extra.lower() not in keywords.lower():
            keywords = clean(keywords + ', ' + extra)

    head = replace_title(head, title)
    head = upsert_meta(head, 'name', 'description', desc)
    head = upsert_meta(head, 'property', 'og:title', title)
    head = upsert_meta(head, 'property', 'og:description', desc)
    head = upsert_meta(head, 'name', 'twitter:title', title)
    head = upsert_meta(head, 'name', 'twitter:description', desc)
    head = upsert_meta(head, 'name', 'keywords', keywords)

    if head != r['head']:
        repaired = r['text'].replace(r['head'], '\n' + head, 1)
        r['path'].write_text(repaired, encoding='utf-8')
        changed += 1
        print(f'Deduped metadata: {r["page"]}')

print(f'Changed files: {changed}')
