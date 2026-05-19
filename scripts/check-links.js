const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

const EXCLUDED_DIRS = new Set([
  '.git',
  '.github',
  'node_modules',
  'scripts'
]);

const EXCLUDED_HTML_FILES = new Set([
  '404.html'
]);

const EXCLUDED_HTML_PATTERNS = [
  /^google[a-z0-9]+\.html$/i
];

const IGNORED_SCHEMES = [
  'http:',
  'https:',
  'mailto:',
  'tel:',
  'javascript:',
  'data:',
  'blob:'
];

function shouldExcludeHtml(fileName) {
  return EXCLUDED_HTML_FILES.has(fileName) || EXCLUDED_HTML_PATTERNS.some((pattern) => pattern.test(fileName));
}

function walk(dir, results = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!EXCLUDED_DIRS.has(entry.name)) {
        walk(fullPath, results);
      }
      continue;
    }

    if (!entry.isFile()) continue;
    results.push(path.relative(ROOT, fullPath).replace(/\\/g, '/'));
  }

  return results;
}

function getHtmlFiles() {
  return walk(ROOT)
    .filter((file) => file.endsWith('.html'))
    .filter((file) => !shouldExcludeHtml(path.basename(file)))
    .sort();
}

function stripHtmlComments(html) {
  return html.replace(/<!--[\s\S]*?-->/g, '');
}

function extractLinks(html) {
  const clean = stripHtmlComments(html);
  const links = [];
  const attrRegex = /\b(?:href|src)\s*=\s*(["'])(.*?)\1/gi;
  let match;

  while ((match = attrRegex.exec(clean)) !== null) {
    const raw = match[2].trim();
    if (raw) links.push(raw);
  }

  const srcsetRegex = /\bsrcset\s*=\s*(["'])(.*?)\1/gi;
  while ((match = srcsetRegex.exec(clean)) !== null) {
    const candidates = match[2].split(',').map((item) => item.trim()).filter(Boolean);
    for (const candidate of candidates) {
      const url = candidate.split(/\s+/)[0];
      if (url) links.push(url);
    }
  }

  return links;
}

function normalizeLink(rawLink) {
  let link = rawLink.trim();

  if (!link || link === '#') return null;

  if (link.startsWith('//')) return null;

  try {
    const parsed = new URL(link, 'https://www.ashraellen.com/');
    if (IGNORED_SCHEMES.includes(parsed.protocol) && parsed.origin !== 'https://www.ashraellen.com') {
      return null;
    }
  } catch (error) {
    // Continue with filesystem-style resolution below.
  }

  link = link.split('#')[0].split('?')[0];
  if (!link) return null;

  return decodeURIComponent(link);
}

function fileExistsForUrlPath(urlPath) {
  let relative = urlPath.replace(/^\/+/, '');

  if (relative === '') {
    return fs.existsSync(path.join(ROOT, 'index.html'));
  }

  const directPath = path.join(ROOT, relative);
  if (fs.existsSync(directPath)) return true;

  const indexPath = path.join(ROOT, relative, 'index.html');
  if (fs.existsSync(indexPath)) return true;

  if (!path.extname(relative)) {
    const htmlPath = path.join(ROOT, `${relative}.html`);
    if (fs.existsSync(htmlPath)) return true;
  }

  return false;
}

function resolveInternalLink(sourceFile, link) {
  const normalized = normalizeLink(link);
  if (!normalized) return null;

  if (/^[a-z][a-z0-9+.-]*:/i.test(normalized)) {
    try {
      const parsed = new URL(normalized);
      if (parsed.origin !== 'https://www.ashraellen.com') return null;
      return parsed.pathname;
    } catch (error) {
      return null;
    }
  }

  if (normalized.startsWith('/')) {
    return normalized;
  }

  const sourceDir = path.dirname(sourceFile);
  return '/' + path.normalize(path.join(sourceDir, normalized)).replace(/\\/g, '/');
}

const htmlFiles = getHtmlFiles();
const problems = [];
let checkedLinks = 0;

for (const file of htmlFiles) {
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const links = extractLinks(html);

  for (const rawLink of links) {
    const urlPath = resolveInternalLink(file, rawLink);
    if (!urlPath) continue;

    checkedLinks += 1;

    if (!fileExistsForUrlPath(urlPath)) {
      problems.push({ file, rawLink, resolved: urlPath });
    }
  }
}

console.log(`Checked ${htmlFiles.length} HTML files.`);
console.log(`Checked ${checkedLinks} internal links and assets.`);
console.log(`Broken internal links/assets: ${problems.length}.`);

for (const problem of problems) {
  console.log(`\n${problem.file}`);
  console.log(`  BROKEN: ${problem.rawLink}`);
  console.log(`  RESOLVED AS: ${problem.resolved}`);
}

if (problems.length > 0) {
  process.exit(1);
}
