const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SKIP_DIRS = new Set(['.git', '.github', 'assets', 'scripts', 'node_modules']);
const SKIP_FILES = new Set(['404.html']);

const FORBIDDEN = [
  'Nikolai Kostyshev',
  'ashraellen-og-home-default-1200x630'
];

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

function rel(file) {
  return path.relative(ROOT, file).replace(/\\/g, '/');
}

function countMatches(html, regex) {
  const matches = html.match(regex);
  return matches ? matches.length : 0;
}

function hasTag(html, regex) {
  return regex.test(html);
}

function titleText(html) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? match[1].replace(/\s+/g, ' ').trim() : '';
}

function descriptionText(html) {
  const match = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["'][^>]*>/i)
    || html.match(/<meta\s+content=["']([^"']*)["']\s+name=["']description["'][^>]*>/i);
  return match ? match[1].replace(/\s+/g, ' ').trim() : '';
}

function auditFile(file) {
  const html = fs.readFileSync(file, 'utf8');
  const issues = [];
  const page = rel(file);
  const title = titleText(html);
  const description = descriptionText(html);

  for (const token of FORBIDDEN) {
    if (html.includes(token)) issues.push(`FORBIDDEN_TEXT: ${token}`);
  }

  if (!hasTag(html, /<title[^>]*>[\s\S]*?<\/title>/i)) issues.push('MISSING_TITLE');
  if (!description) issues.push('MISSING_DESCRIPTION');
  if (!hasTag(html, /<meta\s+name=["']keywords["']/i)) issues.push('MISSING_KEYWORDS');
  if (!hasTag(html, /<link\s+rel=["']canonical["']/i)) issues.push('MISSING_CANONICAL');
  if (!hasTag(html, /<script\s+type=["']application\/ld\+json["']/i)) issues.push('MISSING_JSON_LD');
  if (!hasTag(html, /<meta\s+property=["']og:title["']/i)) issues.push('MISSING_OG_TITLE');
  if (!hasTag(html, /<meta\s+property=["']og:description["']/i)) issues.push('MISSING_OG_DESCRIPTION');
  if (!hasTag(html, /<meta\s+property=["']og:image["']/i)) issues.push('MISSING_OG_IMAGE');
  if (!hasTag(html, /<meta\s+name=["']twitter:card["']/i)) issues.push('MISSING_TWITTER_CARD');
  if (!hasTag(html, /<meta\s+name=["']twitter:image["']/i)) issues.push('MISSING_TWITTER_IMAGE');

  const jsonLdCount = countMatches(html, /<script\s+type=["']application\/ld\+json["'][^>]*>/gi);
  if (jsonLdCount > 1) issues.push(`MULTIPLE_JSON_LD: ${jsonLdCount}`);

  if (/Ashraellen\s+—\s+(Books|Книги|Książki)$/i.test(title) && !page.endsWith('/books/index.html')) {
    issues.push('GENERIC_TITLE_POSSIBLE');
  }

  if (description && description.length < 80) issues.push('DESCRIPTION_TOO_SHORT');
  if (description && description.length > 220) issues.push('DESCRIPTION_TOO_LONG');

  return { page, issues };
}

const results = walk(ROOT).map(auditFile).filter(item => item.issues.length > 0);

if (results.length === 0) {
  console.log('OK: all HTML pages have the required page-level metadata.');
  process.exit(0);
}

console.log('Metadata audit found issues:\n');
for (const item of results) {
  console.log(item.page);
  for (const issue of item.issues) console.log(`  - ${issue}`);
}

process.exit(1);
