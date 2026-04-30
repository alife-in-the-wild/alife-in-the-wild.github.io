/* Artificial Life in the Wild — content loader.
 *
 * Reads the markdown files in /content/ and renders them into the
 * matching <div data-md-section="..."> placeholders in index.html.
 *
 * Each section type has its own renderer because we want the markdown
 * to stay editable but the HTML to keep its structured / styled layout.
 *
 * Conventions live next to each renderer below.
 */

(() => {
  const SECTIONS = {
    about:      'content/about.md',
    cfp:        'content/cfp.md',
    dates:      'content/dates.md',
    topics:     'content/topics.md',
    speakers:   'content/speakers.md',
    organisers: 'content/organisers.md',
  };

  const renderers = { about, cfp, dates, topics, speakers, organisers };

  // ---------- helpers ----------

  function splitOnHr(md) {
    // Strip HTML comments first so doc-comments at the top don't trip us up.
    const stripped = md.replace(/<!--[\s\S]*?-->/g, '').trim();
    return stripped
      .split(/^\s*---\s*$/m)
      .map(s => s.trim())
      .filter(Boolean);
  }

  function parse(md) {
    return window.marked.parse(md, { mangle: false, headerIds: false });
  }

  function htmlToFragment(html) {
    const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
    return doc.body.firstElementChild;
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  // ---------- per-section renderers ----------

  /**
   * ABOUT
   *   Chunk 1 → .big lead callout
   *   Chunk 2 → .prose paragraphs
   */
  function about(md) {
    const [lead = '', body = ''] = splitOnHr(md);
    const leadHtml = parse(lead).replace(/^<p>|<\/p>\s*$/g, '');
    return `
      <p class="big">${leadHtml}</p>
      <div class="prose">${parse(body)}</div>
    `;
  }

  /**
   * CFP
   *   First chunk = optional intro paragraph(s) (no `## ` heading).
   *   Subsequent chunks = cards. Inside each card:
   *     - `## Title`
   *     - First paragraph after the heading = tagline (.cfp-len)
   *     - Remaining paragraphs = description.
   */
  function cfp(md) {
    const chunks = splitOnHr(md);
    const cards = [];
    let intro = '';

    for (const chunk of chunks) {
      if (!chunk.startsWith('## ')) {
        intro += (intro ? '\n\n' : '') + chunk;
      } else {
        cards.push(chunk);
      }
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
   *   A markdown table with three columns: Milestone | Deadline | Notes.
   *   The LAST data row is rendered with .dates-highlight styling.
   *   An optional `> blockquote` underneath becomes the .footnote.
   */
  function dates(md) {
    const stripped = md.replace(/<!--[\s\S]*?-->/g, '').trim();
    const html = parse(stripped);
    const frag = htmlToFragment(html);
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
          const role = 'cell';
          const inner = ci === 0 ? `<strong>${td.innerHTML}</strong>` : td.innerHTML;
          rowsHtml += `<div role="${role}">${inner}</div>`;
        });
        rowsHtml += '</div>';
      });
    }

    const noteHtml = note
      ? `<p class="footnote">${note.innerHTML.replace(/^<p>|<\/p>$/g, '').trim()}</p>`
      : '';

    return `<div class="dates-table" role="table">${rowsHtml}</div>${noteHtml}`;
  }

  /**
   * TOPICS
   *   Each topic separated by `---`.
   *     ## Title
   *     Description paragraphs.
   *     `#tag1` `#tag2` ...    ← LAST line; inline-code spans become chips
   */
  function topics(md) {
    const chunks = splitOnHr(md);
    const cards = chunks.map(chunk => {
      const frag = htmlToFragment(parse(chunk));
      const h2 = frag.querySelector('h2');
      const ps = [...frag.querySelectorAll('p')];

      // Detect tags paragraph: contains only <code> children & whitespace text.
      const last = ps[ps.length - 1];
      let tagPs = null;
      if (last && [...last.childNodes].every(n =>
        (n.nodeType === 1 && n.tagName === 'CODE') ||
        (n.nodeType === 3 && !n.textContent.trim())
      ) && last.querySelectorAll('code').length > 0) {
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
   *     ## Speaker name
   *     Affiliation · Field      ← first paragraph after heading = tagline
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
   *   Chunk 1: a markdown list — one item per organiser
   *     `- **Name** — Affiliation`
   *   Chunk 2: programme-committee paragraph (free prose).
   */
  function organisers(md) {
    const chunks = splitOnHr(md);
    const list   = chunks[0] || '';
    const ctte   = chunks[1] || '';

    const frag = htmlToFragment(parse(list));
    const items = [...frag.querySelectorAll('li')].map(li => {
      const html = li.innerHTML;                    // e.g. <strong>Name</strong> — Affiliation
      const m = html.match(/^\s*<strong>(.*?)<\/strong>\s*[—–-]\s*(.*)$/);
      const name = m ? m[1] : html;
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

  // ---------- boot ----------

  async function loadMarkedIfNeeded() {
    if (window.marked) return;
    await new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js';
      s.onload = resolve;
      s.onerror = () => reject(new Error('Failed to load marked.js'));
      document.head.appendChild(s);
    });
  }

  async function fetchText(url) {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`${url}: ${res.status}`);
    return res.text();
  }

  async function init() {
    try {
      await loadMarkedIfNeeded();
    } catch (err) {
      console.warn('[content.js] marked failed to load — leaving fallback HTML in place.', err);
      return;
    }

    const targets = document.querySelectorAll('[data-md-section]');
    await Promise.all([...targets].map(async (el) => {
      const key = el.dataset.mdSection;
      const url = SECTIONS[key];
      const render = renderers[key];
      if (!url || !render) {
        console.warn(`[content.js] unknown section: ${key}`);
        return;
      }
      try {
        const md = await fetchText(url);
        el.innerHTML = render(md);
      } catch (err) {
        console.warn(`[content.js] failed to load ${url}; keeping fallback.`, err);
      }
    }));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
