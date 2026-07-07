from pathlib import Path

REPLACEMENTS = {
    'readers and professional entry': 'readers and professional context',
    'reader entry': 'for readers',
    'чытачы і прафесійны ўваход': 'чытачы і прафесійны кантэкст',
    'чытацкі ўваход': 'для чытачоў',
    'читачі й професійний вхід': 'читачі та професійний контекст',
    'читачі і професійний вхід': 'читачі та професійний контекст',
    'читацький вхід': 'для читачів',
    'Leser und professioneller Zugang': 'Leser und professionelle Zusammenarbeit',
    'Einstieg für Leser': 'für Leserinnen und Leser',
    'lecteurs et accès professionnel': 'lecteurs et contexte professionnel',
    'entrée du lecteur': 'pour les lecteurs',
    'collaborations éditoriales, traductoriales et rédactionnelles': 'collaborations dans l’édition, la traduction et le travail éditorial',
    'lectores y acceso profesional': 'lectores y colaboración profesional',
    'entrada del lector': 'para lectores',
    'colaboración editorial, traductora y de revisión': 'colaboración en edición, traducción y revisión',
    'leitores e acesso profissional': 'leitores e contexto profissional',
    'entrada do leitor': 'para leitores',
    'colaboração editorial, tradutória e de revisão': 'colaboração editorial, de tradução e de revisão',
}

paths = []
for lang in ('en', 'pl', 'be', 'uk', 'de', 'fr', 'es', 'pt'):
    base = Path(lang) / 'books' / 'monolith'
    paths.extend((base / 'index.html', base / 'beton' / 'index.html', base / 'sludge' / 'index.html'))

changed = []
for path in paths:
    source = path.read_text(encoding='utf-8')
    target = source
    for old, new in REPLACEMENTS.items():
        target = target.replace(old, new)
    if target != source:
        path.write_text(target, encoding='utf-8')
        changed.append(str(path))

if not changed:
    raise SystemExit('No editorial replacements were applied')

for path in paths:
    value = path.read_text(encoding='utf-8')
    leftovers = [old for old in REPLACEMENTS if old in value]
    if leftovers:
        raise AssertionError(f'{path}: unresolved literal labels: {leftovers}')

print('\n'.join(changed))
