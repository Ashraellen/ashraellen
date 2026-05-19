const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SITE_URL = 'https://www.ashraellen.com';
const ROOT = process.cwd();

const EXCLUDED_DIRS = new Set([
  '.git',
  '.github',
  'node_modules',
  'assets',
  'scripts'
]);

const EXCLUDED_FILES = new Set([
  '404.html'
]);

function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function walk(dir, results = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(ROOT, fullPath).replace(/\\/g, '/');

    if (entry.isDirectory()) {
      if (!EXCLUDED_DIRS.has(entry.name)) {
        walk(fullPath, results);
      }
      continue;
    }

    if (!entry.isFile()) continue;
    if (!entry.name.endsWith('.html')) continue;
    if (EXCLUDED_FILES.has(entry.name)) continue;

    results.push(relativePath);
  }

  return results;
}

function htmlPathToUrl(relativePath) {
  if (relativePath === 'index.html') return `${SITE_URL}/`;

  if (relativePath.endsWith('/index.html')) {
    const dir = relativePath.replace(/\/index\.html$/, '');
    return `${SITE_URL}/${dir}/`;
  }

  return `${SITE_URL}/${relativePath}`;
}

function getLastMod(relativePath) {
  try {
    const value = execSync(`git log -1 --format=%cI -- "${relativePath}"`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();

    if (value) return value;
  } catch (error) {
    // If git history is unavailable, omit lastmod rather than failing sitemap generation.
  }

  return null;
}

function sortUrls(a, b) {
  const normalize = (url) => url.replace(SITE_URL, '');
  const aa = normalize(a.loc);
  const bb = normalize(b.loc);

  if (aa === '/') return -1;
  if (bb === '/') return 1;

  return aa.localeCompare(bb, 'en');
}

const htmlFiles = walk(ROOT);
const urls = htmlFiles
  .map((relativePath) => ({
    loc: htmlPathToUrl(relativePath),
    lastmod: getLastMod(relativePath)
  }))
  .sort(sortUrls);

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.map(({ loc, lastmod }) => {
    const lines = [
      '  <url>',
      `    <loc>${escapeXml(loc)}</loc>`
    ];

    if (lastmod) {
      lines.push(`    <lastmod>${escapeXml(lastmod)}</lastmod>`);
    }

    lines.push('  </url>');
    return lines.join('\n');
  }),
  '</urlset>',
  ''
].join('\n');

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml, 'utf8');
console.log(`Generated sitemap.xml with ${urls.length} URLs.`);
