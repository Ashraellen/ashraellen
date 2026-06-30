from pathlib import Path

ROOT = Path.cwd()
REAL = 'Nikolai Kostyshev'
PUBLIC = 'Ashraellen'
SKIP_DIRS = {'.git', '.github', 'assets', 'scripts', 'node_modules', 'reports'}
SKIP_FILES = {'404.html'}
LT = chr(60)
GT = chr(62)


def is_ordinary(page: str) -> bool:
    normalized = '/' + page
    if any(token in normalized for token in ['/professional/', '/about/', '/bio/', '/biography/', '/author/', '/contact/']):
        return False
    return any(token in normalized for token in ['/books/', '/research/', '/public/'])


def html_files():
    for path in ROOT.rglob('*.html'):
        rel = path.relative_to(ROOT).as_posix()
        if path.name in SKIP_FILES:
            continue
        if any(part in SKIP_DIRS for part in path.parts):
            continue
        yield path, rel


changed = 0
for path, rel in html_files():
    if not is_ordinary(rel):
        continue
    text = path.read_text(encoding='utf-8')
    lower = text.lower()
    start = lower.find(LT + 'head')
    if start < 0:
        continue
    start = lower.find(GT, start)
    end = lower.find(LT + '/head' + GT, start)
    if start < 0 or end < 0:
        continue
    head = text[start + 1:end]
    if REAL not in head:
        continue
    repaired = text[:start + 1] + head.replace(REAL, PUBLIC) + text[end:]
    path.write_text(repaired, encoding='utf-8')
    changed += 1
    print(f'Cleaned public identity in head: {rel}')

print(f'Changed files: {changed}')
