const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SITE = 'https://www.ashraellen.com';
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

function canonicalFor(file) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  if (rel === 'index.html') return `${SITE}/`;
  if (rel.endsWith('/index.html')) return `${SITE}/${rel.slice(0, -'index.html'.length)}`;
  return `${SITE}/${rel}`;
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

let changed = 0;
for (const file of walk(ROOT)) {
  const html = fs.readFileSync(file, 'utf8');
  const next = setCanonical(html, canonicalFor(file));
  if (next !== html) {
    fs.writeFileSync(file, next);
    changed += 1;
    console.log(`canonical: ${path.relative(ROOT, file)} -> ${canonicalFor(file)}`);
  }
}

console.log(`Canonical links updated in ${changed} file(s).`);
