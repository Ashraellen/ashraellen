const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SITE = 'https://www.ashraellen.com';
const SKIP_DIRS = new Set(['.git', '.github', 'assets', 'scripts', 'node_modules']);
const SKIP_FILES = new Set(['404.html', 'privacy.html']);

const LANGUAGES = {
  en: { name: 'English', label: 'Home', sections: { research: 'Research', professional: 'Professional profile', books: 'Books', public: 'Public texts', monolith: 'MONOLITH' } },
  ru: { name: 'Русский', label: 'Главная', sections: { research: 'Исследование', professional: 'Профессиональное досье', books: 'Книги', public: 'Публичное', monolith: 'МОНОЛИТ' } },
  pl: { name: 'Polski', label: 'Strona główna', sections: { research: 'Badania', professional: 'Profil zawodowy', books: 'Książki', public: 'Teksty publiczne', monolith: 'MONOLITH' } },
  de: { name: 'Deutsch', label: 'Startseite', sections: { research: 'Forschung', professional: 'Professionelles Profil', books: 'Bücher', public: 'Öffentliche Texte', monolith: 'MONOLITH' } },
  es: { name: 'Español', label: 'Inicio', sections: { research: 'Investigación', professional: 'Perfil profesional', books: 'Libros', public: 'Textos públicos', monolith: 'MONOLITH' } },
  fr: { name: 'Français', label: 'Accueil', sections: { research: 'Recherche', professional: 'Profil professionnel', books: 'Livres', public: 'Textes publics', monolith: 'MONOLITH' } },
  pt: { name: 'Português', label: 'Início', sections: { research: 'Pesquisa', professional: 'Perfil profissional', books: 'Livros', public: 'Textos públicos', monolith: 'MONOLITH' } },
  uk: { name: 'Українська', label: 'Головна', sections: { research: 'Дослідження', professional: 'Професійне досьє', books: 'Книги', public: 'Публічні тексти', monolith: 'МОНОЛІТ' } },
  be: { name: 'Беларуская', label: 'Галоўная', sections: { research: 'Даследаванне', professional: 'Прафесійнае дасье', books: 'Кнігі', public: 'Публічнае', monolith: 'МАНАЛІТ' } }
};

const KEY_SECTIONS = new Set(['research', 'professional', 'books', 'public', 'monolith']);

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walk(path.join(dir, entry.name), out);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      if (SKIP_FILES.has(entry.name)) continue;
      out.push(path.join(dir, entry.name));
    }
  }
  return out;
}

function relativePath(file) {
  return path.relative(ROOT, file).replace(/\\/g, '/');
}

function canonicalForRel(rel) {
  if (rel === 'index.html') return `${SITE}/`;
  if (rel.endsWith('/index.html')) return `${SITE}/${rel.slice(0, -'index.html'.length)}`;
  return `${SITE}/${rel}`;
}

function getLanguage(rel) {
  const first = rel.split('/')[0];
  return LANGUAGES[first] ? first : null;
}

function isTarget(rel) {
  if (rel === 'index.html') return true;

  const parts = rel.split('/');
  const lang = parts[0];
  if (!LANGUAGES[lang]) return false;

  if (parts.length === 2 && parts[1] === 'index.html') return true;
  return parts.length >= 3 && KEY_SECTIONS.has(parts[1]);
}

function textFromHtml(value) {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function extractTitle(html) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? textFromHtml(match[1]) : 'Ashraellen';
}

function extractDescription(html) {
  const match = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["'][^>]*>/i)
    || html.match(/<meta\s+content=["']([^"']*)["']\s+name=["']description["'][^>]*>/i);
  return match ? textFromHtml(match[1]) : 'Ashraellen is an independent multilingual literary-philosophical and artistic research practice.';
}

function pageType(rel) {
  const parts = rel.split('/');
  if (rel === 'index.html') return 'WebPage';
  if (parts.length === 2 && parts[1] === 'index.html') return 'WebPage';

  const section = parts[1];
  if (section === 'professional') return 'ProfilePage';
  if (section === 'books' || section === 'public' || section === 'research') return 'CollectionPage';
  return 'WebPage';
}

function slugTitle(slug) {
  const known = {
    monolith: 'MONOLITH',
    beton: 'BETON',
    sludge: 'SLUDGE',
    gas: 'GAS',
    posts: 'Posts',
    archive: 'Archive',
    method: 'Method',
    projects: 'Projects',
    sources: 'Sources'
  };
  if (known[slug]) return known[slug];
  return slug
    .split('-')
    .map(part => part ? part[0].toUpperCase() + part.slice(1) : part)
    .join(' ');
}

function breadcrumbItems(rel, url, title) {
  const parts = rel.replace(/\/index\.html$/, '').split('/').filter(Boolean);
  const items = [{ '@type': 'ListItem', position: 1, name: 'Ashraellen', item: `${SITE}/` }];

  let current = '';
  let position = 2;
  for (let i = 0; i < parts.length; i += 1) {
    const part = parts[i];
    current += `${part}/`;

    let name = slugTitle(part);
    if (i === 0 && LANGUAGES[part]) name = LANGUAGES[part].name;
    if (i === 1 && LANGUAGES[parts[0]] && LANGUAGES[parts[0]].sections[part]) {
      name = LANGUAGES[parts[0]].sections[part];
    }
    if (i === parts.length - 1 && parts.length > 1) {
      name = title.split('—')[0].split('|')[0].trim() || name;
    }

    items.push({ '@type': 'ListItem', position, name, item: `${SITE}/${current}` });
    position += 1;
  }

  if (items.length === 1) {
    items[0].item = url;
  }

  return items;
}

function bookEntity(rel, url, lang, title, description) {
  const parts = rel.split('/');
  const bookSlug = parts.includes('beton') ? 'beton'
    : parts.includes('sludge') ? 'sludge'
    : parts.includes('gas') ? 'gas'
    : null;

  if (!bookSlug) return null;

  const bookNames = {
    beton: 'BETON',
    sludge: 'SLUDGE',
    gas: 'GAS'
  };

  return {
    '@type': 'Book',
    '@id': `${url}#book`,
    name: bookNames[bookSlug] || title,
    description,
    url,
    inLanguage: lang,
    author: { '@id': `${SITE}/#person` },
    isPartOf: {
      '@type': 'BookSeries',
      '@id': `${SITE}/${lang}/books/monolith/#series`,
      name: 'MONOLITH'
    }
  };
}

function mainEntityFor(rel, url, lang, title, description) {
  const book = bookEntity(rel, url, lang, title, description);
  if (book) return book;

  if (rel.includes('/books/monolith/')) {
    return {
      '@type': 'BookSeries',
      '@id': `${url}#series`,
      name: 'MONOLITH',
      description,
      url,
      creator: { '@id': `${SITE}/#person` }
    };
  }

  return { '@id': `${SITE}/#person` };
}

function jsonLdFor(rel, html) {
  const url = canonicalForRel(rel);
  const lang = getLanguage(rel);
  const title = extractTitle(html);
  const description = extractDescription(html);
  const mainEntity = mainEntityFor(rel, url, lang || 'en', title, description);
  const graph = [
    {
      '@type': 'Person',
      '@id': `${SITE}/#person`,
      name: 'Ashraellen',
      alternateName: 'Nikolai Kostyshev',
      url: `${SITE}/`,
      knowsAbout: [
        'literary-philosophical research',
        'artistic research',
        'public philosophy',
        'inner observation',
        'language and meaning',
        'digital autonomy',
        'systems and consciousness',
        'satire',
        'MONOLITH'
      ]
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE}/#website`,
      name: 'Ashraellen',
      url: `${SITE}/`,
      publisher: { '@id': `${SITE}/#person` },
      inLanguage: Object.keys(LANGUAGES)
    },
    {
      '@type': pageType(rel),
      '@id': `${url}#webpage`,
      url,
      name: title,
      description,
      isPartOf: { '@id': `${SITE}/#website` },
      about: { '@id': `${SITE}/#person` },
      creator: { '@id': `${SITE}/#person` },
      mainEntity,
      breadcrumb: { '@id': `${url}#breadcrumb` }
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: breadcrumbItems(rel, url, title)
    }
  ];

  if (lang) graph[2].inLanguage = lang;
  if (mainEntity && mainEntity['@type']) graph.push(mainEntity);

  return {
    '@context': 'https://schema.org',
    '@graph': graph
  };
}

function stripJsonLd(html) {
  return html.replace(/\s*<script\s+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, '');
}

function insertJsonLd(html, data) {
  const json = JSON.stringify(data, null, 2).replace(/<\/script/gi, '<\\/script');
  const block = `\n  <script type="application/ld+json">\n${json}\n  </script>\n`;

  if (/<\/head>/i.test(html)) {
    return html.replace(/<\/head>/i, `${block}</head>`);
  }

  return `${block}${html}`;
}

let changed = 0;
for (const file of walk(ROOT)) {
  const rel = relativePath(file);
  if (!isTarget(rel)) continue;

  const html = fs.readFileSync(file, 'utf8');
  const next = insertJsonLd(stripJsonLd(html), jsonLdFor(rel, html));

  if (next !== html) {
    fs.writeFileSync(file, next);
    changed += 1;
    console.log(`jsonld: ${rel}`);
  }
}

console.log(`JSON-LD updated in ${changed} file(s).`);
