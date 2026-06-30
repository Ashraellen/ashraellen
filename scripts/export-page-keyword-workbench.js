const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const REPORT_MD = path.join(ROOT, 'reports', 'page-keyword-workbench.md');
const REPORT_JSON = path.join(ROOT, 'reports', 'page-keyword-workbench.json');
const SKIP_DIRS = new Set(['.git', '.github', 'assets', 'scripts', 'node_modules', 'reports']);
const SKIP_FILES = new Set(['404.html']);

const STOP_WORDS = new Set([
  'the','and','or','of','to','in','a','an','for','with','by','on','as','is','are','be','from','this','that','into','not','but','page','site','home',
  'и','в','во','не','на','с','со','как','к','по','из','за','от','до','для','о','об','что','это','страница','сайт',
  'і','ў','на','з','да','для','як','што','гэта','старонка','сайт',
  'i','w','we','z','ze','na','do','od','dla','jak','to','jest','strona','site'
]);

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
function stripTags(html) {
  return clean(html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>'));
}
function textBetween(html, regex) { const match = html.match(regex); return match ? stripTags(match[1]) : ''; }
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
function headings(html, tag) {
  return [...html.matchAll(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi'))]
    .map(match => textBetween(match[0], new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i')))
    .filter(Boolean)
    .slice(0, 8);
}
function langFromPage(page) {
  const first = page.split('/')[0];
  return /^[a-z]{2}$/.test(first) ? first : 'root';
}
function sectionFromPage(page) {
  const parts = page.split('/');
  if (parts[0] && /^[a-z]{2}$/.test(parts[0])) return parts[1] || 'home';
  return parts[0] || 'home';
}
function slugTerms(page) {
  return page
    .replace(/\/index\.html$/, '')
    .replace(/\.html$/, '')
    .split('/')
    .flatMap(part => part.split(/[-_]+/))
    .map(part => part.trim())
    .filter(part => part && !/^\d+$/.test(part));
}
function candidateTerms(text) {
  const words = text.toLowerCase().match(/[\p{L}\p{N}][\p{L}\p{N}'’.-]{2,}/gu) || [];
  const counts = new Map();
  for (const raw of words) {
    const word = raw.replace(/^[-.'’]+|[-.'’]+$/g, '');
    if (!word || STOP_WORDS.has(word) || word.length < 3) continue;
    counts.set(word, (counts.get(word) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 24)
    .map(([word]) => word);
}
function compactKeywords(record) {
  const source = [
    'Ashraellen',
    record.lang !== 'root' ? record.lang : '',
    record.section,
    ...record.slugTerms,
    record.title,
    ...record.h1,
    ...record.h2,
    record.description,
    ...record.candidates.slice(0, 12)
  ].join(' ');
  const terms = [];
  const seen = new Set();
  for (const term of candidateTerms(source)) {
    if (seen.has(term)) continue;
    seen.add(term);
    terms.push(term);
    if (terms.length >= 18) break;
  }
  return terms;
}
function pageRecord(file) {
  const html = fs.readFileSync(file, 'utf8');
  const page = rel(file);
  const main = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1] || html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] || html;
  const bodyText = stripTags(main);
  const record = {
    page,
    lang: langFromPage(page),
    section: sectionFromPage(page),
    title: textBetween(html, /<title[^>]*>([\s\S]*?)<\/title>/i),
    description: attrValue(html, 'name', 'description'),
    existingKeywords: attrValue(html, 'name', 'keywords'),
    canonical: linkHref(html, 'canonical'),
    h1: headings(html, 'h1'),
    h2: headings(html, 'h2'),
    h3: headings(html, 'h3'),
    slugTerms: slugTerms(page),
    excerpt: bodyText.slice(0, 900),
    candidates: candidateTerms([textBetween(html, /<title[^>]*>([\s\S]*?)<\/title>/i), attrValue(html, 'name', 'description'), bodyText].join(' '))
  };
  record.suggestedKeywordSeed = compactKeywords(record);
  return record;
}
function mdEscape(value) { return clean(value).replace(/\|/g, '\\|'); }
function buildMarkdown(records) {
  const lines = [];
  lines.push('# Page Keyword Workbench');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`Pages: ${records.length}`);
  lines.push('');
  lines.push('## Index');
  lines.push('');
  lines.push('| Page | Lang | Section | Title | Existing keywords | Suggested seed |');
  lines.push('|---|---|---|---|---|---|');
  for (const r of records) {
    lines.push(`| ${mdEscape(r.page)} | ${mdEscape(r.lang)} | ${mdEscape(r.section)} | ${mdEscape(r.title)} | ${r.existingKeywords ? mdEscape(r.existingKeywords) : '_missing_'} | ${mdEscape(r.suggestedKeywordSeed.join(', '))} |`);
  }
  lines.push('');
  lines.push('## Page details');
  lines.push('');
  for (const r of records) {
    lines.push(`### ${r.page}`);
    lines.push('');
    lines.push(`- lang: ${r.lang}`);
    lines.push(`- section: ${r.section}`);
    lines.push(`- title: ${r.title || '_missing_'}`);
    lines.push(`- description: ${r.description || '_missing_'}`);
    lines.push(`- canonical: ${r.canonical || '_missing_'}`);
    lines.push(`- H1: ${r.h1.join(' | ') || '_missing_'}`);
    lines.push(`- H2: ${r.h2.join(' | ') || '_missing_'}`);
    lines.push(`- H3: ${r.h3.join(' | ') || '_missing_'}`);
    lines.push(`- suggested keyword seed: ${r.suggestedKeywordSeed.join(', ')}`);
    lines.push(`- candidates: ${r.candidates.join(', ')}`);
    lines.push('');
    lines.push('Excerpt:');
    lines.push('');
    lines.push(`> ${r.excerpt || '_empty_'}`);
    lines.push('');
  }
  return lines.join('\n');
}

const records = walk(ROOT).map(pageRecord).sort((a, b) => a.page.localeCompare(b.page));
fs.mkdirSync(path.dirname(REPORT_MD), { recursive: true });
fs.writeFileSync(REPORT_JSON, JSON.stringify({ generated: new Date().toISOString(), pages: records }, null, 2));
fs.writeFileSync(REPORT_MD, buildMarkdown(records));
console.log(`Wrote ${rel(REPORT_MD)} and ${rel(REPORT_JSON)} for ${records.length} pages.`);
