const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SITE = 'https://www.ashraellen.com';
const SKIP_DIRS = new Set(['.git', '.github', 'assets', 'scripts', 'node_modules']);
const SKIP_FILES = new Set(['404.html']);
const LANGUAGE_ENTRY_DIRS = new Set(['en', 'ru', 'be', 'pl', 'uk', 'pt', 'es', 'fr', 'de']);

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

function canonicalFor(file) {
  const rel = relativePath(file);
  if (rel === 'index.html') return `${SITE}/`;
  if (rel.endsWith('/index.html')) return `${SITE}/${rel.slice(0, -'index.html'.length)}`;
  return `${SITE}/${rel}`;
}

function isLanguageEntry(file) {
  const rel = relativePath(file);
  const parts = rel.split('/');
  return parts.length === 2 && parts[1] === 'index.html' && LANGUAGE_ENTRY_DIRS.has(parts[0]);
}

function setCanonical(html, canonicalUrl) {
  const tag = `  <link rel="canonical" href="${canonicalUrl}">`;

  if (/<link\s+rel=["']canonical["'][^>]*>/i.test(html)) {
    return html.replace(/\s*<link\s+rel=["']canonical["'][^>]*>/i, `\n${tag}`);
  }

  const descriptionMatch = html.match(/\s*<meta\s+name=["']description["'][^>]*>/i);
  if (descriptionMatch && descriptionMatch.index !== undefined) {
    const end = descriptionMatch.index + descriptionMatch[0].length;
    return html.slice(0, end) + `\n${tag}` + html.slice(end);
  }

  const titleMatch = html.match(/\s*<title[^>]*>[\s\S]*?<\/title>/i);
  if (titleMatch && titleMatch.index !== undefined) {
    const end = titleMatch.index + titleMatch[0].length;
    return html.slice(0, end) + `\n${tag}` + html.slice(end);
  }

  return html.replace(/<head>/i, `<head>\n${tag}`);
}

function setLanguageEntryH1(html) {
  return html
    .replace(/<div\s+class=["']brand["']>\s*Ashraellen\s*<\/div>/i, '<h1 class="brand">Ashraellen</h1>')
    .replace(/<p\s+class=["']brand["']>\s*Ashraellen\s*<\/p>/i, '<h1 class="brand">Ashraellen</h1>');
}

let changed = 0;
for (const file of walk(ROOT)) {
  const html = fs.readFileSync(file, 'utf8');
  let next = setCanonical(html, canonicalFor(file));

  if (isLanguageEntry(file)) {
    next = setLanguageEntryH1(next);
  }

  if (next !== html) {
    fs.writeFileSync(file, next);
    changed += 1;
    console.log(`updated: ${relativePath(file)} -> ${canonicalFor(file)}`);
  }
}

console.log(`Canonical/H1 updates applied to ${changed} file(s).`);
