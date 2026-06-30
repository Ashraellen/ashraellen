const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const REPORT = path.join(ROOT, 'reports', 'page-metadata-audit.md');
const SKIP_DIRS = new Set(['.git', '.github', 'assets', 'scripts', 'node_modules']);
const SKIP_FILES = new Set(['404.html']);
const MIN_DESCRIPTION = 80;
const MAX_DESCRIPTION = 220;
const REAL_NAME = 'Nikolai Kostyshev';
const DEFAULT_OG_IMAGE = 'ashraellen-og-home-default-1200x630';

function shouldSkipFileName(name) {
  return SKIP_FILES.has(name) || /^google[a-z0-9_-]*\.html$/i.test(name);
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walk(full, out);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      if (shouldSkipFileName(entry.name)) continue;
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
    || /^https:\/\/www\.ashraellen\.com\/assets\/hero\.webp$/.test(url)
    || /^\/assets\/(backgrounds|covers|og)\//.test(url)
    || /^\/assets\/hero\.webp$/.test(url)
    || /^\.\.\/.*assets\/(backgrounds|covers|og)\//.test(url)
    || /^\.\.\/.*assets\/hero\.webp$/.test(url);
}
function isFallbackImage(url) {
  return !!url && url.includes(DEFAULT_OG_IMAGE);
}
function isOrdinaryContentPage(page) {
  return /(^|\/)(books|research|public)\//.test(page);
}
function isIdentityPage(page) { return /(^|\/)(professional|about|bio|biography|author|contact)(\/|\.html|$)/.test(page); }

function recordDuplicate(map, value, page) {
  const key = canonicalIssueValue(value);
  if (!key) return;
  if (!map.has(key)) map.set(key, []);
  map.get(key).push(page);
}

const files = walk(ROOT).sort();
const pages = [];
const duplicateMaps = {
  title: new Map(),
  description: new Map(),
  keywords: new Map(),
  canonical: new Map(),
  ogTitle: new Map(),
  ogDescription: new Map(),
  ogImage: new Map(),
  twitterImage: new Map()
};

for (const file of files) {
  const page = rel(file);
  const html = fs.readFileSync(file, 'utf8');
  const title = textBetween(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const description = attrValue(html, 'name', 'description');
  const keywords = attrValue(html, 'name', 'keywords');
  const canonical = linkHref(html, 'canonical');
  const ogTitle = attrValue(html, 'property', 'og:title');
  const ogDescription = attrValue(html, 'property', 'og:description');
  const ogImage = attrValue(html, 'property', 'og:image');
  const twitterCard = attrValue(html, 'name', 'twitter:card');
  const twitterImage = attrValue(html, 'name', 'twitter:image');
  const jsonLdCount = countMatches(html, /<script\s+type=["']application\/ld\+json["'][^>]*>/gi);

  const data = { page, title, description, keywords, canonical, ogTitle, ogDescription, ogImage, twitterCard, twitterImage, jsonLdCount, issues: [], reviewNotes: [] };

  if (!title) data.issues.push('MISSING_TITLE');
  if (!description) data.issues.push('MISSING_DESCRIPTION');
  if (!keywords) data.issues.push('MISSING_KEYWORDS');
  if (!canonical) data.issues.push('MISSING_CANONICAL');
  if (jsonLdCount === 0) data.issues.push('MISSING_JSON_LD');
  if (jsonLdCount > 1) data.issues.push('MULTIPLE_JSON_LD');
  if (!ogTitle) data.issues.push('MISSING_OG_TITLE');
  if (!ogDescription) data.issues.push('MISSING_OG_DESCRIPTION');
  if (!ogImage) data.issues.push('MISSING_OG_IMAGE');
  if (ogImage && !isAllowedLocalImage(ogImage)) data.issues.push(`OG_IMAGE_NOT_LOCAL_BACKGROUND_COVER_OR_OG: ${ogImage}`);
  if (isFallbackImage(ogImage)) data.reviewNotes.push('FALLBACK_OG_IMAGE_USED: approved fallback; verify intentional use');
  if (!twitterCard) data.issues.push('MISSING_TWITTER_CARD');
  if (!twitterImage) data.issues.push('MISSING_TWITTER_IMAGE');
  if (twitterImage && !isAllowedLocalImage(twitterImage)) data.issues.push(`TWITTER_IMAGE_NOT_LOCAL_BACKGROUND_COVER_OR_OG: ${twitterImage}`);
  if (isFallbackImage(twitterImage)) data.reviewNotes.push('FALLBACK_TWITTER_IMAGE_USED: approved fallback; verify intentional use');
  if (description && description.length < MIN_DESCRIPTION) data.issues.push(`DESCRIPTION_TOO_SHORT: ${description.length}`);
  if (description && description.length > MAX_DESCRIPTION) data.issues.push(`DESCRIPTION_TOO_LONG: ${description.length}`);
  if (isOrdinaryContentPage(page) && !isIdentityPage(page) && html.includes(REAL_NAME)) data.issues.push(`REAL_NAME_ON_ORDINARY_CONTENT_PAGE: ${REAL_NAME}`);

  pages.push(data);
  recordDuplicate(duplicateMaps.title, title, page);
  recordDuplicate(duplicateMaps.description, description, page);
  recordDuplicate(duplicateMaps.keywords, keywords, page);
  recordDuplicate(duplicateMaps.canonical, canonical, page);
  recordDuplicate(duplicateMaps.ogTitle, ogTitle, page);
  recordDuplicate(duplicateMaps.ogDescription, ogDescription, page);
  recordDuplicate(duplicateMaps.ogImage, ogImage, page);
  recordDuplicate(duplicateMaps.twitterImage, twitterImage, page);
}

function addDuplicateIssues(kind, map, issueName, reviewNote = false) {
  for (const [value, sharedPages] of map.entries()) {
    if (sharedPages.length < 2) continue;
    for (const page of sharedPages) {
      const target = pages.find(item => item.page === page);
      if (!target) continue;
      const message = `${issueName}: shared by ${sharedPages.length} pages`;
      if (reviewNote) target.reviewNotes.push(message);
      else target.issues.push(message);
    }
  }
}

addDuplicateIssues('title', duplicateMaps.title, 'DUPLICATE_TITLE');
addDuplicateIssues('description', duplicateMaps.description, 'DUPLICATE_DESCRIPTION');
addDuplicateIssues('keywords', duplicateMaps.keywords, 'DUPLICATE_KEYWORDS');
addDuplicateIssues('canonical', duplicateMaps.canonical, 'DUPLICATE_CANONICAL');
addDuplicateIssues('ogTitle', duplicateMaps.ogTitle, 'DUPLICATE_OG_TITLE');
addDuplicateIssues('ogDescription', duplicateMaps.ogDescription, 'DUPLICATE_OG_DESCRIPTION');
addDuplicateIssues('ogImage', duplicateMaps.ogImage, 'DUPLICATE_OG_IMAGE_REVIEW', true);
addDuplicateIssues('twitterImage', duplicateMaps.twitterImage, 'DUPLICATE_TWITTER_IMAGE_REVIEW', true);

const pagesWithIssues = pages.filter(item => item.issues.length > 0);
const pagesWithReviewNotes = pages.filter(item => item.reviewNotes.length > 0);
const issueSummary = new Map();
const reviewSummary = new Map();
for (const item of pages) {
  for (const issue of item.issues) {
    const key = issue.split(':')[0];
    issueSummary.set(key, (issueSummary.get(key) || 0) + 1);
  }
  for (const note of item.reviewNotes) {
    const key = note.split(':')[0];
    reviewSummary.set(key, (reviewSummary.get(key) || 0) + 1);
  }
}
function sortedSummary(map) {
  return Array.from(map.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

fs.mkdirSync(path.dirname(REPORT), { recursive: true });
const out = [];
out.push('# Page Metadata Audit');
out.push('');
out.push(`Generated: ${new Date().toISOString()}`);
out.push('');
out.push(`Pages checked: ${pages.length}`);
out.push(`Pages with issues: ${pagesWithIssues.length}`);
out.push(`Total issues: ${pagesWithIssues.reduce((sum, item) => sum + item.issues.length, 0)}`);
out.push(`Pages with review notes: ${pagesWithReviewNotes.length}`);
out.push(`Total review notes: ${pagesWithReviewNotes.reduce((sum, item) => sum + item.reviewNotes.length, 0)}`);
out.push('');
out.push('## Issue summary');
out.push('');
out.push('| Item | Count |');
out.push('|---|---:|');
for (const [key, count] of sortedSummary(issueSummary)) out.push(`| ${key} | ${count} |`);
out.push('');
out.push('');
out.push('## Review note summary');
out.push('');
out.push('| Item | Count |');
out.push('|---|---:|');
for (const [key, count] of sortedSummary(reviewSummary)) out.push(`| ${key} | ${count} |`);
out.push('');
out.push('');
out.push('## Pages with issues');
out.push('');
for (const item of pagesWithIssues) {
  out.push(`### ${item.page}`);
  out.push('');
  out.push(`- title: ${item.title || '_missing_'}`);
  out.push(`- description length: ${item.description ? item.description.length : 0}`);
  out.push(`- canonical: ${item.canonical || '_missing_'}`);
  out.push(`- og:image: ${item.ogImage || '_missing_'}`);
  out.push(`- twitter:image: ${item.twitterImage || '_missing_'}`);
  out.push('');
  for (const issue of item.issues) out.push(`- ${issue}`);
  out.push('');
}
out.push('');
out.push('## Pages with review notes');
out.push('');
for (const item of pagesWithReviewNotes) {
  out.push(`### ${item.page}`);
  out.push('');
  out.push(`- title: ${item.title || '_missing_'}`);
  out.push(`- og:image: ${item.ogImage || '_missing_'}`);
  out.push(`- twitter:image: ${item.twitterImage || '_missing_'}`);
  out.push('');
  for (const note of item.reviewNotes) out.push(`- ${note}`);
  out.push('');
}
fs.writeFileSync(REPORT, out.join('\n'), 'utf8');
console.log(`Wrote ${path.relative(ROOT, REPORT)}`);
console.log(`Pages checked: ${pages.length}`);
console.log(`Pages with issues: ${pagesWithIssues.length}`);
console.log(`Total issues: ${pagesWithIssues.reduce((sum, item) => sum + item.issues.length, 0)}`);
console.log(`Pages with review notes: ${pagesWithReviewNotes.length}`);
console.log(`Total review notes: ${pagesWithReviewNotes.reduce((sum, item) => sum + item.reviewNotes.length, 0)}`);
