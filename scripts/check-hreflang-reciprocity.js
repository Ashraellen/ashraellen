const fs = require('fs');
const { execFileSync } = require('child_process');

const origin = 'https://www.ashraellen.com';
// Use tracked source files rather than a generated sitemap, which may lag a PR.
const files = execFileSync('git', ['ls-files', '--', '*.html'], { encoding: 'utf8' }).trim().split('\n');
const pages = new Map();
const issues = [];
// These passports describe different editions; their shared fallback needs
// editorial review before the language relationship can be changed safely.
const reviewedExceptions = new Set([
  `${origin}/en/books/samizdat/monolith/beton/|ru|${origin}/ru/books/samizdat/monolith/beton/`,
  `${origin}/en/books/samizdat/monolith/beton/|x-default|${origin}/samizdat/`,
  `${origin}/ru/books/samizdat/monolith/beton/|x-default|${origin}/samizdat/`,
  `${origin}/fi/books/samizdat/monolith/beton/|x-default|${origin}/samizdat/`,
  `${origin}/pl/books/samizdat/monolith/beton/|x-default|${origin}/samizdat/`,
]);
const seenExceptions = new Set();

function attribute(tag, name) {
  return tag.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, 'i'))?.[1];
}
function links(html) {
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] || '';
  return [...head.replace(/<!--[\s\S]*?-->/g, '').matchAll(/<link\b[^>]*>/gi)]
    .map(m => m[0]).filter(t => /(?:^|\s)alternate(?:\s|$)/i.test(attribute(t, 'rel') || '') && attribute(t, 'hreflang'))
    .map(t => [attribute(t, 'hreflang').toLowerCase(), attribute(t, 'href')]);
}

for (const file of files) {
  if (!file || /^(?:Recovery|docs|\.tmp|focus-group)\//i.test(file) || file === '404.html') continue;
  const html = fs.readFileSync(file, 'utf8');
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] || '';
  const metas = [...head.matchAll(/<meta\b[^>]*>/gi)].map(m => m[0]);
  if (metas.some(t => /^(robots|googlebot)$/i.test(attribute(t, 'name') || '') && /\bnoindex\b/i.test(attribute(t, 'content') || '') || /^refresh$/i.test(attribute(t, 'http-equiv') || ''))) continue;
  const url = `${origin}/${file.replace(/(^|\/)index\.html$/, '$1')}`;
  pages.set(url, links(html));
}
for (const [url, alternates] of pages) {
  const seen = new Set();
  for (const [language, target] of alternates) {
    const edge = `${url}|${language}|${target}`;
    if (reviewedExceptions.has(edge)) { seenExceptions.add(edge); continue; }
    if (seen.has(language)) issues.push(`${url}: duplicate hreflang ${language}`);
    seen.add(language);
    if (!pages.has(target)) { issues.push(`${url}: target is not an indexable source page: ${target}`); continue; }
    if (!pages.get(target).some(([, back]) => back === url)) issues.push(`${url}: ${language} target ${target} has no return link`);
  }
}
console.log(`Checked ${pages.size} indexable source pages; ${issues.length} new hreflang issues; ${seenExceptions.size} exceptions awaiting editorial review.`);
for (const issue of issues) console.error(issue);
if (issues.length) process.exitCode = 1;
