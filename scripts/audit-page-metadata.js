const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const REPORT = path.join(ROOT, 'reports', 'page-metadata-audit.md');
const SKIP_DIRS = new Set(['.git', '.github', 'assets', 'scripts', 'node_modules']);
const SKIP_FILES = new Set(['404.html']);
const MIN_DESCRIPTION = 80;
const MAX_DESCRIPTION = 220;

const FORBIDDEN = [
  'Nikolai Kostyshev',
  'ashraellen-og-home-default-1200x630'
];

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walk(full, out);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      if (SKIP_FILES.has(entry.name)) continue;
      out.push(full);
    }
  }
  return out;
}

function rel(file) { return path.relative(ROOT, file).replace(/\\/g, '/'); }
function clean(value) { return (value || '').replace(/\s+/g, ' ').trim(); }
function textBetween(html, regex) { const match = html.match(regex); return match ? clean(match[1]) : ''; }
function attrValue(html, name, value) {
  const patterns = [
    new RegExp(`<meta\\s+${name}=["']${value}["']\\s+content=["']([^"']*)["'][^>]*>`, 'i'),
    new RegExp(`<meta\\s+content=["']([^"']*)["']\\s+${name}=["']${value}["'][^>]*>`, 'i')
  ];
  for (const pattern of patterns) { const match = html.match(pattern); if (match) return clean(match[1]); }
  return '';
}
function linkHref(html, relValue) {
  const patterns = [
    new RegExp(`<link\\s+rel=["']${relValue}["']\\s+href=["']([^"']*)["'][^>]*>`, 'i'),
    new RegExp(`<link\\s+href=["']([^"']*)["']\\s+rel=["']${relValue}["'][^>]*>`, 'i')
  ];
  for (const pattern of patterns) { const match = html.match(pattern); if (match) return clean(match[1]); }
  return '';
}
function countMatches(html, regex) { const matches = html.match(regex); return matches ? matches.length : 0; }
function canonicalIssueValue(value) { return clean(value).toLowerCase(); }
function isAllowedLocalImage(url) {
  if (!url) return false;
  return /^https:\/\/www\.ashraellen\.com\/assets\/(backgrounds|covers|og)\//.test(url)
    || /^\/assets\/(backgrounds|covers|og)\//.test(url)
    || /^\.\.\/.*assets\/(backgrounds|covers|og)\//.test(url);
}
function addDuplicateIssues(records, key, issueName, options = {}) {
  const groups = new Map();
  for (const record of records) {
    const value = canonicalIssueValue(record[key]);
    if (!value) continue;
    if (options.ignore && options.ignore(value, record)) continue;
    if (!groups.has(value)) groups.set(value, []);
    groups.get(value).push(record);
  }
  for (const [value, items] of groups) {
    if (items.length <= 1) continue;
    for (const item of items) item.issues.push(`${issueName}: shared by ${items.length} pages`);
  }
}

function auditFile(file) {
  const html = fs.readFileSync(file, 'utf8');
  const page = rel(file);
  const record = {
    page,
    title: textBetween(html, /<title[^>]*>([\s\S]*?)<\/title>/i),
    description: attrValue(html, 'name', 'description'),
    keywords: attrValue(html, 'name', 'keywords'),
    canonical: linkHref(html, 'canonical'),
    jsonLdCount: countMatches(html, /<script\s+type=["']application\/ld\+json["'][^>]*>/gi),
    ogTitle: attrValue(html, 'property', 'og:title'),
    ogDescription: attrValue(html, 'property', 'og:description'),
    ogImage: attrValue(html, 'property', 'og:image'),
    twitterCard: attrValue(html, 'name', 'twitter:card'),
    twitterImage: attrValue(html, 'name', 'twitter:image'),
    issues: []
  };

  for (const token of FORBIDDEN) if (html.includes(token)) record.issues.push(`FORBIDDEN_TEXT: ${token}`);

  if (!record.title) record.issues.push('MISSING_TITLE');
  if (!record.description) record.issues.push('MISSING_DESCRIPTION');
  if (!record.keywords) record.issues.push('MISSING_KEYWORDS');
  if (!record.canonical) record.issues.push('MISSING_CANONICAL');
  if (record.jsonLdCount === 0) record.issues.push('MISSING_JSON_LD');
  if (record.jsonLdCount > 1) record.issues.push(`MULTIPLE_JSON_LD: ${record.jsonLdCount}`);
  if (!record.ogTitle) record.issues.push('MISSING_OG_TITLE');
  if (!record.ogDescription) record.issues.push('MISSING_OG_DESCRIPTION');
  if (!record.ogImage) record.issues.push('MISSING_OG_IMAGE');
  if (record.ogImage && !isAllowedLocalImage(record.ogImage)) record.issues.push(`OG_IMAGE_NOT_LOCAL_BACKGROUND_COVER_OR_OG: ${record.ogImage}`);
  if (!record.twitterCard) record.issues.push('MISSING_TWITTER_CARD');
  if (!record.twitterImage) record.issues.push('MISSING_TWITTER_IMAGE');
  if (record.twitterImage && !isAllowedLocalImage(record.twitterImage)) record.issues.push(`TWITTER_IMAGE_NOT_LOCAL_BACKGROUND_COVER_OR_OG: ${record.twitterImage}`);

  if (record.description && record.description.length < MIN_DESCRIPTION) record.issues.push(`DESCRIPTION_TOO_SHORT: ${record.description.length}`);
  if (record.description && record.description.length > MAX_DESCRIPTION) record.issues.push(`DESCRIPTION_TOO_LONG: ${record.description.length}`);

  return record;
}

function issueSummary(records) {
  const counts = new Map();
  for (const record of records) {
    for (const issue of record.issues) {
      const key = issue.replace(/:.*/, '');
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}
function markdownTable(rows) {
  if (!rows.length) return '_No issues._\n';
  return ['| Issue | Count |', '|---|---:|', ...rows.map(([issue, count]) => `| ${issue} | ${count} |`)].join('\n') + '\n';
}
function buildReport(records) {
  const problemRecords = records.filter(record => record.issues.length > 0);
  const totalIssues = problemRecords.reduce((sum, record) => sum + record.issues.length, 0);
  const lines = [];
  lines.push('# Page Metadata Audit');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');
  lines.push(`Pages checked: ${records.length}`);
  lines.push(`Pages with issues: ${problemRecords.length}`);
  lines.push(`Total issues: ${totalIssues}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(markdownTable(issueSummary(problemRecords)));
  lines.push('');
  lines.push('## Pages with issues');
  lines.push('');
  if (!problemRecords.length) {
    lines.push('_No issues found._');
  } else {
    for (const record of problemRecords.sort((a, b) => a.page.localeCompare(b.page))) {
      lines.push(`### ${record.page}`);
      lines.push('');
      lines.push(`- title: ${record.title || '_missing_'}`);
      lines.push(`- description length: ${record.description ? record.description.length : 0}`);
      lines.push(`- canonical: ${record.canonical || '_missing_'}`);
      lines.push(`- og:image: ${record.ogImage || '_missing_'}`);
      lines.push(`- twitter:image: ${record.twitterImage || '_missing_'}`);
      lines.push('');
      for (const issue of record.issues) lines.push(`- ${issue}`);
      lines.push('');
    }
  }
  return lines.join('\n');
}

const records = walk(ROOT).map(auditFile);

addDuplicateIssues(records, 'title', 'DUPLICATE_TITLE');
addDuplicateIssues(records, 'description', 'DUPLICATE_DESCRIPTION');
addDuplicateIssues(records, 'keywords', 'DUPLICATE_KEYWORDS');
addDuplicateIssues(records, 'canonical', 'DUPLICATE_CANONICAL');
addDuplicateIssues(records, 'ogTitle', 'DUPLICATE_OG_TITLE');
addDuplicateIssues(records, 'ogDescription', 'DUPLICATE_OG_DESCRIPTION');
addDuplicateIssues(records, 'ogImage', 'DUPLICATE_OG_IMAGE', { ignore: value => /^https:\/\/www\.ashraellen\.com\/assets\/(backgrounds|covers|og)\//.test(value) });
addDuplicateIssues(records, 'twitterImage', 'DUPLICATE_TWITTER_IMAGE', { ignore: value => /^https:\/\/www\.ashraellen\.com\/assets\/(backgrounds|covers|og)\//.test(value) });

const report = buildReport(records);
fs.mkdirSync(path.dirname(REPORT), { recursive: true });
fs.writeFileSync(REPORT, report);
console.log(report);

const problemCount = records.filter(record => record.issues.length > 0).length;
if (process.env.STRICT_METADATA_AUDIT === '1' && problemCount > 0) process.exit(1);
process.exit(0);
