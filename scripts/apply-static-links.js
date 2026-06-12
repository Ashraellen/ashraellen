const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SITE = 'https://www.ashraellen.com';
const SKIP_DIRS = new Set(['.git', '.github', 'assets', 'scripts', 'node_modules']);
const SKIP_FILES = new Set(['404.html']);
const LANGUAGES = new Set(['en', 'ru', 'pl', 'de', 'es', 'fr', 'pt', 'uk', 'be']);

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

function languageFor(rel) {
  const first = rel.split('/')[0];
  return LANGUAGES.has(first) ? first : null;
}

function replaceAttrById(html, tagName, id, attr, value) {
  const tagRegex = new RegExp(`<${tagName}\\b(?=[^>]*\\bid=["']${id}["'])[^>]*>`, 'gi');

  return html.replace(tagRegex, tag => {
    const attrRegex = new RegExp(`\\s${attr}=["'][^"']*["']`, 'i');
    if (attrRegex.test(tag)) {
      return tag.replace(attrRegex, ` ${attr}="${value}"`);
    }
    return tag.replace(/>$/, ` ${attr}="${value}">`);
  });
}

function replaceHrefById(html, id, value) {
  return replaceAttrById(html, 'a', id, 'href', value);
}

function replaceSrcById(html, id, value) {
  return replaceAttrById(html, 'img', id, 'src', value);
}

function applyStaticLinks(html, lang) {
  if (!lang) return html;

  const urls = {
    entry: `${SITE}/${lang}/`,
    research: `${SITE}/${lang}/research/`,
    public: `${SITE}/${lang}/public/`,
    books: `${SITE}/${lang}/books/`,
    professional: `${SITE}/${lang}/professional/`,
    monolith: `${SITE}/${lang}/books/monolith/`,
    symbol: `${SITE}/assets/symbol.png`
  };

  let next = html;

  next = replaceHrefById(next, 'toEntry', urls.entry);
  next = replaceHrefById(next, 'toResearch', urls.research);
  next = replaceHrefById(next, 'toPublic', urls.public);
  next = replaceHrefById(next, 'toBooks', urls.books);
  next = replaceHrefById(next, 'toProfessional', urls.professional);
  next = replaceHrefById(next, 'goResearch', urls.research);
  next = replaceHrefById(next, 'goPublic', urls.public);
  next = replaceHrefById(next, 'goBooks', urls.books);
  next = replaceHrefById(next, 'goProfessional', urls.professional);
  next = replaceHrefById(next, 'backSeries', urls.monolith);
  next = replaceHrefById(next, 'bookMonolith', urls.monolith);
  next = replaceHrefById(next, 'thumbLinkMonolith', urls.monolith);
  next = replaceSrcById(next, 'sealImg', urls.symbol);

  return next;
}

let changed = 0;
for (const file of walk(ROOT)) {
  const rel = relativePath(file);
  const lang = languageFor(rel);
  if (!lang) continue;

  const html = fs.readFileSync(file, 'utf8');
  const next = applyStaticLinks(html, lang);

  if (next !== html) {
    fs.writeFileSync(file, next);
    changed += 1;
    console.log(`static-links: ${rel}`);
  }
}

console.log(`Static links updated in ${changed} file(s).`);
