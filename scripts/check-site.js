const fs = require('fs');
const path = require('path');

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

const EXCLUDED_FILE_PATTERNS = [
  /^google[a-z0-9]+\.html$/i
];

const DRAFT_MARKERS = [
  'TODO',
  'PLACEHOLDER',
  'REPLACE ME',
  'LOREM IPSUM'
];

function shouldExcludeFile(fileName) {
  return EXCLUDED_FILES.has(fileName) || EXCLUDED_FILE_PATTERNS.some((pattern) => pattern.test(fileName));
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
    if (shouldExcludeFile(entry.name)) continue;

    results.push(relativePath);
  }

  return results;
}

function stripHtmlComments(html) {
  return html.replace(/<!--[\s\S]*?-->/g, '');
}

function getTagContent(html, tagName) {
  const match = html.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i'));
  return match ? match[1].replace(/<[^>]+>/g, '').trim() : '';
}

function countTags(html, tagName) {
  const matches = html.match(new RegExp(`<${tagName}(\\s|>|/)`, 'gi'));
  return matches ? matches.length : 0;
}

function hasMetaDescription(html) {
  const match = html.match(/<meta\s+[^>]*name=["']description["'][^>]*>/i);
  if (!match) return false;

  const content = match[0].match(/content=["']([^"']+)["']/i);
  return Boolean(content && content[1].trim().length >= 30);
}

function hasHtmlLang(html) {
  const match = html.match(/<html\s+[^>]*lang=["']([^"']+)["']/i);
  return Boolean(match && match[1].trim().length >= 2);
}

function hasNoindex(html) {
  return /<meta\s+[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html);
}

function findDraftMarkers(html) {
  const upper = stripHtmlComments(html).toUpperCase();
  return DRAFT_MARKERS.filter((marker) => upper.includes(marker));
}

function checkFile(relativePath) {
  const fullPath = path.join(ROOT, relativePath);
  const html = fs.readFileSync(fullPath, 'utf8');
  const errors = [];
  const warnings = [];

  if (!hasHtmlLang(html)) {
    errors.push('Missing or empty html lang attribute.');
  }

  const title = getTagContent(html, 'title');
  if (!title) {
    errors.push('Missing title tag.');
  } else if (title.length < 8) {
    warnings.push(`Very short title: "${title}".`);
  }

  if (!hasMetaDescription(html)) {
    warnings.push('Missing or too short meta description.');
  }

  const h1Count = countTags(html, 'h1');
  if (h1Count === 0) {
    warnings.push('Missing h1 tag.');
  } else if (h1Count > 1) {
    warnings.push(`Multiple h1 tags found: ${h1Count}.`);
  }

  if (hasNoindex(html)) {
    errors.push('Contains noindex directive.');
  }

  const draftMarkers = findDraftMarkers(html);
  if (draftMarkers.length > 0) {
    warnings.push(`Possible draft markers found: ${draftMarkers.join(', ')}.`);
  }

  return { relativePath, errors, warnings };
}

function printResult(result, type) {
  const messages = type === 'error' ? result.errors : result.warnings;
  if (messages.length === 0) return;

  console.log(`\n${result.relativePath}`);
  for (const message of messages) {
    console.log(`  ${type.toUpperCase()}: ${message}`);
  }
}

const htmlFiles = walk(ROOT).sort();
const results = htmlFiles.map(checkFile);
const filesWithErrors = results.filter((result) => result.errors.length > 0);
const filesWithWarnings = results.filter((result) => result.warnings.length > 0);

console.log(`Checked ${htmlFiles.length} HTML files.`);
console.log(`Files with errors: ${filesWithErrors.length}.`);
console.log(`Files with warnings: ${filesWithWarnings.length}.`);

if (filesWithErrors.length > 0) {
  console.log('\nERRORS');
  for (const result of filesWithErrors) {
    printResult(result, 'error');
  }
}

if (filesWithWarnings.length > 0) {
  console.log('\nWARNINGS');
  for (const result of filesWithWarnings) {
    printResult(result, 'warning');
  }
}

if (filesWithErrors.length > 0) {
  process.exit(1);
}
