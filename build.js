/* Artificial Life in the Wild — static-site build.
 *
 * Reads template.html and content/*.md, runs each markdown file through
 * the section-specific renderer, and writes a fully baked index.html.
 *
 * Usage:  node build.js  (or `npm run build`)
 */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { marked } from 'marked';
import { parseHTML } from 'linkedom';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;

const SECTIONS = {
  about:      'content/about.md',
  cfp:        'content/cfp.md',
  dates:      'content/dates.md',
  topics:     'content/topics.md',
  speakers:   'content/speakers.md',
  organisers: 'content/organisers.md',
};

// ---------- helpers ----------

marked.setOptions({ mangle: false, headerIds: false, gfm: true });

function splitOnHr(md) {
  const stripped = md.replace(/<!--[\s\S]*?-->/g, '').trim();
  return stripped.split(/^\s*---\s*$/m).map(s => s.trim()).filter(Boolean);
}

function parse(md) {
  return marked.parse(md ?? '');
}

function htmlToFragment(html) {
  const { document } = parseHTML(`<!doctype html><html><body><div id="__root">${html}</div></body></html>`);
  return document.getElementById('__root');
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

// ---------- per-section renderers ----------

const renderers = { about, cfp, dates, topics, speakers, organisers };

/**
 * ABOUT
 *   Chunk 1 → .big lead callout
 *   Chunk 2 → .prose paragraphs
 */
function about(md) {
  const [lead = '', body = ''] = splitOnHr(md);
  // Strip wrapping <p>…</p> from the lead so it can render inside <p class="big">
  const leadHtml = parse(lead).trim().replace(/^<p>|<\/p>$/g, '');
  return `
    <p class="big">${leadHtml}</p>
    <div class="prose">${parse(body)}</div>
  `;
}

/**
 * CFP
 *   First chunk = optional intro paragraph(s).
 *   Subsequent chunks = cards (## title + tagline + body).
 */
function cfp(md) {
  const chunks = splitOnHr(md);
  const cards = [];
  let intro = '';

  for (const chunk of chunks) {
    if (!chunk.startsWith('## ')) intro += (intro ? '\n\n' : '') + chunk;
    else cards.push(chunk);
  }

  const introHtml = intro ? `<div class="cfp-intro">${parse(intro)}</div>` : '';

  const cardsHtml = cards.map(chunk => {
    const frag = htmlToFragment(parse(chunk));
    const h2 = frag.querySelector('h2');
    const ps = [...frag.querySelectorAll('p')];
    const tagline = ps[0];
    const rest = ps.slice(1);
    return `
      <article class="cfp-card">
        ${h2 ? `<h3>${h2.innerHTML}</h3>` : ''}
        ${tagline ? `<p class="cfp-len">${tagline.innerHTML}</p>` : ''}
        ${rest.map(p => p.outerHTML).join('')}
      </article>
    `;
  }).join('');

  return `
    ${introHtml}
    <div class="cfp-grid">${cardsHtml}</div>
    <div class="cfp-actions">
      <a class="btn primary" href="#" aria-disabled="true">Submission portal — opens 15 Apr 2026</a>
      <a class="btn ghost" href="mailto:alife.in.the.wild@gmail.com">Contact the organisers ↗</a>
    </div>
  `;
}

/**
 * DATES
 *   GFM table with three columns. Last data row gets the highlight style.
 *   Optional `> blockquote` becomes the .footnote.
 */
function dates(md) {
  const stripped = md.replace(/<!--[\s\S]*?-->/g, '').trim();
  const frag = htmlToFragment(parse(stripped));
  const table = frag.querySelector('table');
  const note  = frag.querySelector('blockquote');

  let rowsHtml = '';
  if (table) {
    const headCells = [...table.querySelectorAll('thead th')].map(th => th.textContent.trim());
    rowsHtml += '<div class="dates-row dates-head" role="row">'
              + headCells.map(t => `<div role="columnheader">${escapeHtml(t)}</div>`).join('')
              + '</div>';

    const bodyRows = [...table.querySelectorAll('tbody tr')];
    bodyRows.forEach((tr, i) => {
      const cells = [...tr.querySelectorAll('td')];
      const isLast = i === bodyRows.length - 1;
      const cls = `dates-row${isLast ? ' dates-highlight' : ''}`;
      rowsHtml += `<div class="${cls}" role="row">`;
      cells.forEach((td, ci) => {
        const inner = ci === 0 ? `<strong>${td.innerHTML}</strong>` : td.innerHTML;
        rowsHtml += `<div role="cell">${inner}</div>`;
      });
      rowsHtml += '</div>';
    });
  }

  const noteHtml = note
    ? `<p class="footnote">${note.innerHTML.replace(/^\s*<p>|<\/p>\s*$/g, '').trim()}</p>`
    : '';

  return `<div class="dates-table" role="table">${rowsHtml}</div>${noteHtml}`;
}

/**
 * TOPICS
 *   Each topic separated by `---`.
 *     ## Title
 *     Description paragraph(s).
 *     `#tag1` `#tag2` ...    ← LAST line; inline-code spans become chips
 */
function topics(md) {
  const chunks = splitOnHr(md);
  const cards = chunks.map(chunk => {
    const frag = htmlToFragment(parse(chunk));
    const h2 = frag.querySelector('h2');
    const ps = [...frag.querySelectorAll('p')];

    const last = ps[ps.length - 1];
    let tagPs = null;
    if (last && last.querySelectorAll('code').length > 0
        && [...last.childNodes].every(n =>
          (n.nodeType === 1 && n.tagName === 'CODE') ||
          (n.nodeType === 3 && !n.textContent.trim())
        )) {
      tagPs = last;
    }

    const descPs = tagPs ? ps.slice(0, -1) : ps;

    const tagsHtml = tagPs
      ? `<ul class="tags">${[...tagPs.querySelectorAll('code')]
          .map(c => `<li>${c.innerHTML}</li>`).join('')}</ul>`
      : '';

    return `
      <article class="topic">
        ${h2 ? `<h3>${h2.innerHTML}</h3>` : ''}
        ${descPs.map(p => p.outerHTML).join('')}
        ${tagsHtml}
      </article>
    `;
  }).join('');

  return `<div class="topics-grid">${cards}</div>`;
}

/**
 * SPEAKERS
 *   Each speaker separated by `---`.
 *     ## Name
 *     Affiliation · Field             ← first paragraph after the heading
 *     Bio paragraph(s).
 */
function speakers(md) {
  const chunks = splitOnHr(md);
  const items = chunks.map(chunk => {
    const frag = htmlToFragment(parse(chunk));
    const h2 = frag.querySelector('h2');
    const ps = [...frag.querySelectorAll('p')];
    const affil = ps[0];
    const bio   = ps.slice(1);
    return `
      <article class="speaker">
        <div class="speaker-portrait" aria-hidden="true"><span>TBA</span></div>
        ${h2 ? `<h3>${h2.innerHTML}</h3>` : ''}
        ${affil ? `<p class="speaker-affil">${affil.innerHTML}</p>` : ''}
        ${bio.map(p => p.outerHTML).join('')}
      </article>
    `;
  }).join('');
  return `<div class="speakers-grid">${items}</div>`;
}

/**
 * ORGANISERS
 *   Chunk 1: list — `- **Name** — Affiliation`
 *   Chunk 2: programme-committee paragraph (free prose).
 */
function organisers(md) {
  const chunks = splitOnHr(md);
  const list   = chunks[0] || '';
  const ctte   = chunks[1] || '';

  const frag = htmlToFragment(parse(list));
  const items = [...frag.querySelectorAll('li')].map(li => {
    const html = li.innerHTML;
    const m = html.match(/^\s*<strong>(.*?)<\/strong>\s*[—–-]\s*(.*)$/);
    const name  = m ? m[1] : html;
    const affil = m ? m[2] : '';
    return `
      <article class="organiser">
        <h3>${name}</h3>
        ${affil ? `<p class="org-affil">${affil}</p>` : ''}
      </article>
    `;
  }).join('');

  return `
    <div class="organisers-grid">${items}</div>
    <h3 class="subhead">Programme committee</h3>
    <div class="committee">${parse(ctte)}</div>
  `;
}

// ---------- build ----------

async function readMd(name) {
  const path = join(ROOT, SECTIONS[name]);
  return readFile(path, 'utf8');
}

async function build() {
  const tplPath = join(ROOT, 'template.html');
  const outPath = join(ROOT, 'index.html');

  const tplHtml = await readFile(tplPath, 'utf8');
  const { document } = parseHTML(tplHtml);

  const placeholders = [...document.querySelectorAll('[data-md-section]')];
  if (placeholders.length === 0) {
    throw new Error('No <... data-md-section="..."> placeholders found in template.html.');
  }

  for (const el of placeholders) {
    const key = el.getAttribute('data-md-section');
    const render = renderers[key];
    if (!render) {
      console.warn(`[build] unknown section "${key}" — skipping.`);
      continue;
    }
    const md = await readMd(key);
    el.innerHTML = render(md);
    el.removeAttribute('data-md-section');
  }

  // Stamp build metadata into the footer-mono span if present.
  const stamp = document.querySelector('.footer-mono');
  if (stamp) {
    const date = new Date().toISOString().slice(0, 10);
    stamp.textContent = `built ${date} · static`;
  }

  const out = '<!doctype html>\n' + document.documentElement.outerHTML + '\n';
  await writeFile(outPath, out, 'utf8');
  console.log(`[build] wrote ${outPath} (${out.length.toLocaleString()} bytes, ${placeholders.length} sections)`);
}

build().catch(err => {
  console.error('[build] FAILED:', err);
  process.exit(1);
});
