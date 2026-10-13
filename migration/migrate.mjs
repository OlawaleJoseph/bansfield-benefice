// One-off migration: converts the snapshot of the old site (migration/source) into
// content files (src/content/pages/**.html with YAML front matter).
// Run with `npm run migrate`. Re-running overwrites src/content/pages.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'migration/source');
const OUT = path.join(ROOT, 'src/content/pages');
const CHURCHES = ['cowlinge', 'denston', 'lidgate', 'ousden', 'stansfield', 'stradishall', 'wickhambrook'];

// Pages rebuilt from the design; their old content isn't migrated.
const DESIGNED = new Set([
  'index.html', 'services/index.html', 'visits/index.html', 'events/index.html',
  'benefice/index.html', 'benefice/lifeevents.html', 'benefice/contact.html',
  'benefice/search.html', 'benefice/sitemap.html', 'news/index.html', 'notices/safeguarding.html',
  ...CHURCHES.map((c) => `${c}/index.html`),
]);

const decode = (s) => s
  .replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#39;|&rsquo;|&lsquo;/g, "'")
  .replace(/&hellip;/g, '…').replace(/&pound;/g, '£').replace(/&ndash;/g, '–').replace(/&mdash;/g, '—')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const stripTags = (s) => decode(s.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    return d.isDirectory() ? walk(p) : d.name.endsWith('.html') ? [p] : [];
  });
}

function between(s, a, b) {
  const i = s.indexOf(a);
  if (i < 0) return '';
  const j = s.indexOf(b, i + a.length);
  return s.slice(i + a.length, j < 0 ? undefined : j);
}

function parseNav(nav) {
  nav = nav.replace(/<!--[\s\S]*?-->/g, '');
  const pm = nav.match(/<div class="picture">\s*<img[^>]*src="([^"]+)"[^>]*?(?:alt="([^"]*)")?[^>]*>/);
  const picture = pm ? { src: pm[1], alt: decode(pm[2] || '') } : undefined;
  const groups = [];
  let cur = null;
  for (const [, kind, body] of nav.matchAll(/<div (?:class|id)="(button|barhead|button2)"[^>]*>([\s\S]*?)<\/div>/g)) {
    const links = [...body.matchAll(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].map((m) => ({ href: m[1], label: stripTags(m[2]) }));
    if (kind === 'button') continue;
    if (kind === 'barhead') {
      cur = { head: links[0], links: [] };
      groups.push(cur);
    } else {
      if (!cur) groups.push((cur = { links: [] }));
      cur.links.push(...links);
    }
  }
  return { picture, groups };
}

function fixImg(tag) {
  const sm = tag.match(/style="([^"]*)"/);
  const attrs = {};
  const cls = [];
  if (sm) {
    let style = sm[1];
    for (const k of ['width', 'height']) {
      const v = style.match(new RegExp(`(?<![-\\w])${k}\\s*:\\s*(\\d+)px`));
      if (v) attrs[k] = v[1];
    }
    if (/float\s*:\s*left/.test(style)) cls.push('inline-left');
    if (/float\s*:\s*right/.test(style)) cls.push('inline-right');
    style = style.replace(/(?<![-\w])(width|height|float)\s*:[^;]*;?/g, '').trim();
    tag = tag.replace(sm[0], style ? `style="${style}"` : '');
  }
  for (const [k, v] of Object.entries(attrs)) if (!new RegExp(`\\s${k}="`).test(tag)) tag = tag.replace('<img', `<img ${k}="${v}"`);
  if (cls.length) tag = tag.includes('class="') ? tag.replace('class="', `class="${cls.join(' ')} `) : tag.replace('<img', `<img class="${cls.join(' ')}"`);
  if (!tag.includes('loading=')) tag = tag.replace('<img', '<img loading="lazy"');
  return tag.replace(/\s+\/?>$/, '>');
}

const ALT = {
  '/images/jamclub/2000_poster1.jpg': 'JAM Club Easter 2000 poster 1',
  '/images/jamclub/2000_poster2.jpg': 'JAM Club Easter 2000 poster 2',
  '/images/jamclub/2001_banner.jpg': 'JAM Club Easter 2001 banner',
  '/images/jamclub/2001_banner2.jpg': 'JAM Club Easter 2001 banner 2',
  '/images/jamclub/2001_banner3.jpg': 'JAM Club Easter 2001 banner 3',
  '/images/jamclub/2001_banner4.jpg': 'JAM Club Easter 2001 banner 4',
  '/images/jamclub/2001_easter_garden.jpg': 'The Easter garden made at JAM Club, 2001',
  '/images/jamclub/2001_poster1.jpg': 'JAM Club Easter 2001 poster',
};

export function cleanContent(c) {
  c = c.replace(/<div style="float:right;margin:0 0 10px 10px;">\s*<!--news start-->[\s\S]*?<!--news end-->\s*<\/div>/g, '');
  c = c.replace(/<!--news start-->[\s\S]*?<!--news end-->/g, '');
  c = c.replace(/<!--(?!\[)[\s\S]*?-->/g, '');
  c = c.replace(/https?:\/\/(?:www\.)?bansfieldbenefice\.org\.uk(?=[/"'])/g, '');
  c = c.replace(/<img\b[^>]*>/g, fixImg);
  // Images must load over https on an https page
  c = c.replace(/(<img\b[^>]*\ssrc=")http:\/\//g, '$1https://');
  // Images the old site left without alt text (hand-written alt for the few that matter)
  c = c.replace(/<img\b(?![^>]*\salt=)([^>]*\ssrc="([^"]+)")/g, (_, rest, src) => `<img alt="${ALT[src] ?? ''}"${rest}`);
  // Fixed pixel widths from the old 740px table layout
  const sized = /(<(?:table|td|th|p|div|caption|iframe|ul)\b[^>]*?)\s(?:width|height)="\d+%?"/g;
  c = c.replace(sized, '$1').replace(sized, '$1');
  c = c.replace(/<(table|td|th|p|div|caption|iframe|ul|span)(\s[^>]*?)?style="([^"]*)"/g, (_, tag, pre = ' ', style) => {
    style = style.replace(/(?<![-\w])width\s*:\s*[\d.]+px;?/g, tag.toLowerCase() === 'iframe' ? 'width:100%;' : '').trim();
    return style ? `<${tag}${pre}style="${style}"` : `<${tag}${pre}`.trimEnd();
  });
  c = c.replace(/<table\b/g, '<div class="tscroll"><table').replace(/<\/table>/g, '</table></div>');
  c = c.replace(/<iframe(?![^>]*loading=)/g, '<iframe loading="lazy"');
  return c.trim();
}

function popH1(c) {
  const m = c.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  return m ? [stripTags(m[1]), (c.slice(0, m.index) + c.slice(m.index + m[0].length)).trim()] : [null, c];
}

// Content from each church home page that the design doesn't already cover.
function churchExtras(raw) {
  let c = between(raw, '<!--content start-->', '<!--content end-->');
  c = c.replace(/<!--(news|services|daily) start-->[\s\S]*?<!--\1 end-->/g, '').replace(/<!--(?!\[)[\s\S]*?-->/g, '');
  const map = (c.match(/<iframe[^>]*src="(https:\/\/www\.google\.com\/maps\/embed[^"]+)"/) || [])[1] || '';
  c = cleanContent(c)
    .replace(/<h1[^>]*>[\s\S]*?<\/h1>/, '')
    .replace(/<div class="figleft">\s*<a href="https:\/\/www\.parishgiving[^"]*">[\s\S]*?<\/div>/, '')
    .replace(/<h3>Welcome<\/h3>\s*<p>[\s\S]*?<\/p>/, '')
    .replace(/<h3>[^<]*Map[^<]*<\/h3>/g, '')
    .replace(/<h3>Plan your route to a benefice church<\/h3>\s*<div[^>]*>\s*<form[\s\S]*?<\/form>\s*<\/div>/, '')
    .replace(/<iframe[^>]*google\.com\/maps\/embed[\s\S]*?<\/iframe>/g, '')
    .replace(/(<br clear="all"\s*\/?>\s*)+/g, '')
    .replace(/<div[^>]*>\s*<\/div>/g, '')
    .trim();
  return { map, notes: stripTags(c) ? c : '' };
}

fs.rmSync(OUT, { recursive: true, force: true });
let count = 0;
const extras = {};
for (const file of walk(SRC)) {
  const rel = path.relative(SRC, file).split(path.sep).join('/');
  const raw = fs.readFileSync(file, 'utf8');
  const { picture, groups } = parseNav(between(raw, '<!--navigator start-->', '<!--navigator end-->'));
  const church = rel.split('/')[0];
  if (CHURCHES.includes(church) && rel === `${church}/index.html`) {
    extras[church] = { ...churchExtras(raw), pages: groups.flatMap((g) => g.links) };
  }
  if (DESIGNED.has(rel)) continue;
  const [h1, body] = popH1(cleanContent(between(raw, '<!--content start-->', '<!--content end-->')));
  const docTitle = stripTags((raw.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '');
  const description = decode((raw.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '');
  const front = { title: h1 || docTitle, description: description || undefined, picture, nav: groups.length ? groups : undefined };
  const out = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, `---\n${YAML.stringify(JSON.parse(JSON.stringify(front)), { lineWidth: 0 })}---\n${body}\n`);
  count++;
}
fs.writeFileSync(path.join(ROOT, 'migration/church-extras.json'), JSON.stringify(extras, null, 2));
console.log(`Migrated ${count} pages into src/content/pages`);
