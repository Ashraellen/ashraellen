const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SITE = 'https://www.ashraellen.com';
const OG_IMAGE = `${SITE}/assets/og/ashraellen-og-home-default-1200x630.jpg`;
const OG_IMAGE_ALT = 'Ashraellen — dark formal image with the hand and eye symbol';
const OG_WIDTH = '1200';
const OG_HEIGHT = '630';
const LANGUAGES = new Set(['en', 'ru', 'pl', 'de', 'es', 'fr', 'pt', 'uk', 'be']);
const SKIP_DIRS = new Set(['.git', '.github', 'assets', 'scripts', 'node_modules']);
const SKIP_FILES = new Set(['404.html']);

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

function isLanguagePage(rel) {
  if (rel === 'index.html') return true;
  const first = rel.split('/')[0];
  return LANGUAGES.has(first);
}

function targetFiles() {
  return walk(ROOT).filter(file => isLanguagePage(relativePath(file)));
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

function canonicalFor(rel) {
  if (rel === 'index.html') return `${SITE}/`;
  if (rel.endsWith('/index.html')) return `${SITE}/${rel.slice(0, -'index.html'.length)}`;
  return `${SITE}/${rel}`;
}

function languageFor(rel) {
  if (rel === 'index.html') return 'en';
  const lang = rel.split('/')[0];
  return LANGUAGES.has(lang) ? lang : 'en';
}

function stripExistingOg(html) {
  return html
    .replace(/\s*<meta\s+(?:property|name)=["'](?:og:[^"']+|twitter:[^"']+)["'][^>]*>/gi, '')
    .replace(/\s*<meta\s+content=["'][^"']*["']\s+(?:property|name)=["'](?:og:[^"']+|twitter:[^"']+)["'][^>]*>/gi, '');
}

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function ogTypeFor(rel) {
  return rel.includes('/books/') ? 'book' : 'website';
}

function ogBlock({ title, description, url, lang, rel }) {
  const safeTitle = escapeAttr(title);
  const safeDescription = escapeAttr(description);
  const safeUrl = escapeAttr(url);
  const safeImage = escapeAttr(OG_IMAGE);
  const safeAlt = escapeAttr(OG_IMAGE_ALT);
  const type = ogTypeFor(rel);

  return `\n  <meta property="og:type" content="${type}">\n  <meta property="og:site_name" content="Ashraellen">\n  <meta property="og:title" content="${safeTitle}">\n  <meta property="og:description" content="${safeDescription}">\n  <meta property="og:url" content="${safeUrl}">\n  <meta property="og:image" content="${safeImage}">\n  <meta property="og:image:secure_url" content="${safeImage}">\n  <meta property="og:image:type" content="image/jpeg">\n  <meta property="og:image:width" content="${OG_WIDTH}">\n  <meta property="og:image:height" content="${OG_HEIGHT}">\n  <meta property="og:image:alt" content="${safeAlt}">\n  <meta property="og:locale" content="${lang}">\n  <meta name="twitter:card" content="summary_large_image">\n  <meta name="twitter:title" content="${safeTitle}">\n  <meta name="twitter:description" content="${safeDescription}">\n  <meta name="twitter:image" content="${safeImage}">\n  <meta name="twitter:image:alt" content="${safeAlt}">\n`;
}

function insertOg(html, block) {
  if (/<\/head>/i.test(html)) {
    return html.replace(/<\/head>/i, `${block}</head>`);
  }
  return `${block}${html}`;
}

let changed = 0;
for (const file of targetFiles()) {
  const rel = relativePath(file);
  const html = fs.readFileSync(file, 'utf8');
  const title = extractTitle(html);
  const description = extractDescription(html);
  const url = canonicalFor(rel);
  const lang = languageFor(rel);
  const next = insertOg(stripExistingOg(html), ogBlock({ title, description, url, lang, rel }));

  if (next !== html) {
    fs.writeFileSync(file, next);
    changed += 1;
    console.log(`og: ${rel}`);
  }
}

console.log(`Open Graph tags updated in ${changed} file(s).`);
