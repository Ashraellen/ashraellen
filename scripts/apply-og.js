const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SITE = 'https://www.ashraellen.com';
const OG_IMAGE = `${SITE}/assets/og/ashraellen-og-home-default-1200x630.jpg`;
const OG_IMAGE_ALT = 'Ashraellen — dark formal image with the hand and eye symbol';
const OG_WIDTH = '1200';
const OG_HEIGHT = '630';
const LANGUAGES = new Set(['en', 'ru', 'pl', 'de', 'es', 'fr', 'pt', 'uk', 'be']);

function relativePath(file) {
  return path.relative(ROOT, file).replace(/\\/g, '/');
}

function targetFiles() {
  const files = [path.join(ROOT, 'index.html')];
  for (const lang of LANGUAGES) {
    files.push(path.join(ROOT, lang, 'index.html'));
  }
  return files.filter(file => fs.existsSync(file));
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

function ogBlock({ title, description, url, lang }) {
  const safeTitle = escapeAttr(title);
  const safeDescription = escapeAttr(description);
  const safeUrl = escapeAttr(url);
  const safeImage = escapeAttr(OG_IMAGE);
  const safeAlt = escapeAttr(OG_IMAGE_ALT);

  return `\n  <meta property="og:type" content="website">\n  <meta property="og:site_name" content="Ashraellen">\n  <meta property="og:title" content="${safeTitle}">\n  <meta property="og:description" content="${safeDescription}">\n  <meta property="og:url" content="${safeUrl}">\n  <meta property="og:image" content="${safeImage}">\n  <meta property="og:image:secure_url" content="${safeImage}">\n  <meta property="og:image:type" content="image/jpeg">\n  <meta property="og:image:width" content="${OG_WIDTH}">\n  <meta property="og:image:height" content="${OG_HEIGHT}">\n  <meta property="og:image:alt" content="${safeAlt}">\n  <meta property="og:locale" content="${lang}">\n  <meta name="twitter:card" content="summary_large_image">\n  <meta name="twitter:title" content="${safeTitle}">\n  <meta name="twitter:description" content="${safeDescription}">\n  <meta name="twitter:image" content="${safeImage}">\n  <meta name="twitter:image:alt" content="${safeAlt}">\n`;
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
  const next = insertOg(stripExistingOg(html), ogBlock({ title, description, url, lang }));

  if (next !== html) {
    fs.writeFileSync(file, next);
    changed += 1;
    console.log(`og: ${rel}`);
  }
}

console.log(`Open Graph tags updated in ${changed} file(s).`);
