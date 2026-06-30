const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const LT = String.fromCharCode(60);
const GT = String.fromCharCode(62);
const SKIP_DIRS = new Set(['.git', '.github', 'assets', 'scripts', 'node_modules', 'reports']);
const SKIP_FILES = new Set(['404.html']);
const STOP = new Set('the and or of to in a an for with by on as is are be from this that into not but page site home и в во не на с со как к по из за от до для о об что это і ў з да як што гэта i w we ze jest strona'.split(/\s+/));

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walk(full, out);
    } else if (entry.isFile() && entry.name.endsWith('.html') && !SKIP_FILES.has(entry.name)) {
      out.push(full);
    }
  }
  return out;
}
function clean(s) { return String(s || '').replace(/\s+/g, ' ').trim(); }
function esc(s) { return clean(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function rel(file) { return path.relative(ROOT, file).replace(/\\/g, '/'); }
function tag(name, attrs) { return LT + name + (attrs ? ' ' + attrs : '') + GT; }
function tagRe(name, close) { return LT + (close ? '/' : '') + name + '[^' + GT + ']*' + GT; }
function plain(html) { return clean(html.replace(new RegExp(tagRe('[a-zA-Z0-9]+', false), 'g'), ' ')); }
function between(html, name) {
  const re = new RegExp(tagRe(name, false) + '([\\s\\S]*?)' + tagRe(name, true), 'i');
  const m = html.match(re);
  return plain(m ? m[1] : '');
}
function desc(html) {
  const re = new RegExp(LT + 'meta[^' + GT + ']+name=["\\']description["\\'][^' + GT + ']+content=["\\']([^"\\']*)["\\'][^' + GT + ']*' + GT, 'i');
  const m = html.match(re);
  return clean(m ? m[1] : '');
}
function headings(html) {
  const re = new RegExp(LT + 'h[1-3][^' + GT + ']*' + GT + '([\\s\\S]*?)' + LT + '/h[1-3]' + GT, 'gi');
  return [...html.matchAll(re)].map(x => plain(x[1])).join(' ');
}
function slugs(page) { return page.replace(/\/index\.html$/, '').replace(/\.html$/, '').split(/[\/\-_]+/).filter(Boolean).join(' '); }
function terms(text) {
  const words = clean(text).toLowerCase().match(/[\p{L}\p{N}][\p{L}\p{N}'’.-]{2,}/gu) || [];
  const out = [];
  const seen = new Set();
  for (const raw of words) {
    const w = raw.replace(/^[-.'’]+|[-.'’]+$/g, '');
    if (!w || w.length < 3 || STOP.has(w) || seen.has(w)) continue;
    seen.add(w);
    out.push(w);
    if (out.length >= 18) break;
  }
  return out.join(', ');
}
function keywords(html, page) {
  return terms(['Ashraellen', slugs(page), between(html, 'title'), desc(html), headings(html), plain(html).slice(0, 2500)].join(' '));
}
function headMatch(html) {
  const re = new RegExp(tagRe('head', false) + '([\\s\\S]*?)' + tagRe('head', true), 'i');
  return html.match(re);
}
function hasKeywords(head) {
  const re = new RegExp(LT + 'meta[^' + GT + ']+name=["\\']keywords["\\'][^' + GT + ']*' + GT, 'i');
  return re.test(head);
}

let changed = 0;
for (const file of walk(ROOT)) {
  const page = rel(file);
  const html = fs.readFileSync(file, 'utf8');
  const m = headMatch(html);
  if (!m || hasKeywords(m[1])) continue;
  const line = '    ' + tag('meta', 'name="keywords" content="' + esc(keywords(html, page)) + '"');
  let newHead = m[1];
  const descRe = new RegExp('(' + LT + 'meta[^' + GT + ']+name=["\\']description["\\'][^' + GT + ']*' + GT + ')', 'i');
  if (descRe.test(newHead)) newHead = newHead.replace(descRe, '$1\n' + line);
  else newHead = newHead + '\n' + line;
  fs.writeFileSync(file, html.replace(m[1], newHead));
  changed += 1;
  console.log('Added keywords: ' + page);
}
console.log('Changed files: ' + changed);
