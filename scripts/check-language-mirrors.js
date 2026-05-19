const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const LANGUAGES = ['ru', 'en', 'pl', 'de', 'es', 'fr', 'pt', 'uk'];

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

const OPTIONAL_PATHS = new Set([
  // Add language-relative paths here if a page is intentionally missing in some languages.
  // Example: 'public/special-local-page/'
]);

function shouldExcludeFile(fileName) {
  return EXCLUDED_FILES.has(fileName) || EXCLUDED_FILE_PATTERNS.some((pattern) => pattern.test(fileName));
}

function walk(dir, results = []) {
  if (!fs.existsSync(dir)) return results;

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
    if (!entry.name.endsWith('.html')) continue;
    if (shouldExcludeFile(entry.name)) continue;

    results.push(path.relative(ROOT, fullPath).replace(/\\/g, '/'));
  }

  return results;
}

function toLanguageRelativePath(filePath, language) {
  const prefix = `${language}/`;
  if (!filePath.startsWith(prefix)) return null;

  let relative = filePath.slice(prefix.length);

  if (relative === 'index.html') return '/';

  if (relative.endsWith('/index.html')) {
    return relative.replace(/\/index\.html$/, '/');
  }

  return relative;
}

function fromLanguageRelativePath(language, relativePath) {
  if (relativePath === '/') return path.join(ROOT, language, 'index.html');

  if (relativePath.endsWith('/')) {
    return path.join(ROOT, language, relativePath, 'index.html');
  }

  return path.join(ROOT, language, relativePath);
}

const pagesByLanguage = new Map();

for (const language of LANGUAGES) {
  const languageDir = path.join(ROOT, language);
  const files = walk(languageDir);
  const pages = new Set();

  for (const file of files) {
    const relativePath = toLanguageRelativePath(file, language);
    if (relativePath) pages.add(relativePath);
  }

  pagesByLanguage.set(language, pages);
}

const allRelativePaths = new Set();
for (const pages of pagesByLanguage.values()) {
  for (const page of pages) {
    allRelativePaths.add(page);
  }
}

const problems = [];

for (const relativePath of [...allRelativePaths].sort()) {
  if (OPTIONAL_PATHS.has(relativePath)) continue;

  const existing = [];
  const missing = [];

  for (const language of LANGUAGES) {
    const filePath = fromLanguageRelativePath(language, relativePath);
    if (fs.existsSync(filePath)) {
      existing.push(language);
    } else {
      missing.push(language);
    }
  }

  if (existing.length > 0 && missing.length > 0) {
    problems.push({ relativePath, existing, missing });
  }
}

console.log(`Checked language mirrors for ${LANGUAGES.length} languages.`);
console.log(`Unique language-relative paths: ${allRelativePaths.size}.`);
console.log(`Mirror problems found: ${problems.length}.`);

for (const problem of problems) {
  console.log(`\n${problem.relativePath}`);
  console.log(`  EXISTS: ${problem.existing.join(', ')}`);
  console.log(`  MISSING: ${problem.missing.join(', ')}`);
}

if (problems.length > 0) {
  process.exit(1);
}
