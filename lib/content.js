/* Markdown helpers used by the section components.
 *
 * These run at BUILD time (Next.js static export) — never in the browser.
 * Each helper returns plain data the matching component renders with JSX.
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { marked } from 'marked';

marked.setOptions({ mangle: false, headerIds: false, gfm: true });

const CONTENT_DIR = path.join(process.cwd(), 'content');

export async function readMd(name) {
  const file = path.join(CONTENT_DIR, `${name}.md`);
  return readFile(file, 'utf8');
}

export function stripComments(md) {
  return md.replace(/<!--[\s\S]*?-->/g, '').trim();
}

export function splitOnHr(md) {
  return stripComments(md)
    .split(/^\s*---\s*$/m)
    .map(s => s.trim())
    .filter(Boolean);
}

export function parseMd(md) {
  return marked.parse(md ?? '');
}

/** Strip a wrapping <p>…</p> from a single-paragraph render. */
export function unwrapP(html) {
  return html.trim().replace(/^<p>([\s\S]*)<\/p>$/, '$1');
}

/* ---- token-walking helpers (no DOM) ----
 *
 * We use marked.lexer to get a structured token tree so each component can
 * pick the bits it needs without parsing HTML again. For inline rich text
 * (italics, links, code), we re-render the relevant tokens to HTML and let
 * the component drop them in via dangerouslySetInnerHTML — content is fully
 * trusted (we author it ourselves).
 */

export function lex(md) {
  return marked.lexer(stripComments(md));
}

/** Render an array of inline tokens (or a single token's `tokens` field) to HTML. */
export function renderInline(tokens) {
  return marked.parser(
    [{ type: 'paragraph', raw: '', text: '', tokens: tokens ?? [] }]
  ).replace(/^<p>|<\/p>\s*$/g, '').trim();
}

/** Render a single paragraph token's inline content to HTML. */
export function renderParagraphHtml(tok) {
  if (!tok || tok.type !== 'paragraph') return '';
  return renderInline(tok.tokens);
}

/* ---------- Per-section parsers ---------- */

/**
 * ABOUT
 *   Chunk 1 → lead callout (single block; the renderer wraps it in <p class="big">)
 *   Chunk 2 → prose paragraphs (rendered as raw HTML)
 */
export function parseAbout(md) {
  const [lead = '', body = ''] = splitOnHr(md);
  return {
    leadHtml: unwrapP(parseMd(lead)),
    bodyHtml: parseMd(body),
  };
}

/**
 * CFP
 *   First chunk that doesn't start with `## ` is the optional intro.
 *   Each subsequent `## …` chunk becomes a card { title, taglineHtml, bodyHtml }.
 */
export function parseCfp(md) {
  const chunks = splitOnHr(md);
  const cards = [];
  let intro = '';

  for (const chunk of chunks) {
    if (!chunk.startsWith('## ')) intro += (intro ? '\n\n' : '') + chunk;
    else cards.push(parseCfpCard(chunk));
  }

  return { introHtml: intro ? parseMd(intro) : '', cards };
}

function parseCfpCard(chunk) {
  const tokens = lex(chunk);
  const heading = tokens.find(t => t.type === 'heading' && t.depth === 2);
  const paragraphs = tokens.filter(t => t.type === 'paragraph');
  const tagline = paragraphs[0];
  const body = paragraphs.slice(1);
  return {
    title: heading ? renderInline(heading.tokens) : '',
    taglineHtml: tagline ? renderParagraphHtml(tagline) : '',
    bodyHtml: body.map(p => `<p>${renderParagraphHtml(p)}</p>`).join(''),
  };
}

/**
 * DATES
 *   GFM table → array of rows (the last row gets the highlight style).
 *   Optional blockquote underneath becomes `footnoteHtml`.
 */
export function parseDates(md) {
  const tokens = lex(md);
  const table = tokens.find(t => t.type === 'table');
  const quote = tokens.find(t => t.type === 'blockquote');

  let header = [];
  let rows = [];
  if (table) {
    header = table.header.map(h => renderInline(h.tokens));
    rows = table.rows.map(r => r.map(c => renderInline(c.tokens)));
  }

  let footnoteHtml = '';
  if (quote) {
    const inner = quote.tokens
      .filter(t => t.type === 'paragraph')
      .map(p => renderParagraphHtml(p))
      .join(' ');
    footnoteHtml = inner;
  }

  return { header, rows, footnoteHtml };
}

/**
 * TOPICS
 *   Each `---`-separated chunk becomes a topic { title, bodyHtml, tags[] }.
 *   The tag row (last paragraph of inline-code spans) is detected and pulled out.
 */
export function parseTopics(md) {
  return splitOnHr(md).map(chunk => {
    const tokens = lex(chunk);
    const heading = tokens.find(t => t.type === 'heading' && t.depth === 2);
    const paragraphs = tokens.filter(t => t.type === 'paragraph');

    let tags = [];
    let bodyParas = paragraphs;
    const last = paragraphs[paragraphs.length - 1];
    if (last && isTagParagraph(last)) {
      tags = last.tokens.filter(t => t.type === 'codespan').map(t => t.text);
      bodyParas = paragraphs.slice(0, -1);
    }

    return {
      title: heading ? renderInline(heading.tokens) : '',
      bodyHtml: bodyParas.map(p => `<p>${renderParagraphHtml(p)}</p>`).join(''),
      tags,
    };
  });
}

function isTagParagraph(p) {
  if (!p.tokens?.length) return false;
  const codes = p.tokens.filter(t => t.type === 'codespan');
  if (codes.length === 0) return false;
  return p.tokens.every(t =>
    t.type === 'codespan' || (t.type === 'text' && !t.raw.trim())
  );
}

/**
 * ORGANISERS
 *   Chunk 1 → list items: `- **Name** — Affiliation`
 *   Chunk 2 → committee paragraph (free prose, rendered as HTML)
 */
export function parseOrganisers(md) {
  const chunks = splitOnHr(md);
  const list   = chunks[0] || '';
  const ctte   = chunks[1] || '';

  const tokens = lex(list);
  const listTok = tokens.find(t => t.type === 'list');
  const people = (listTok?.items ?? []).map(item => {
    const html = renderInline(item.tokens?.[0]?.tokens ?? []);
    const m = html.match(/^\s*<strong>(.*?)<\/strong>\s*[—–-]\s*(.*)$/);
    return {
      name: m ? m[1] : html,
      affiliation: m ? m[2] : '',
    };
  });

  return { people, committeeHtml: parseMd(ctte) };
}
