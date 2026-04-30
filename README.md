# Artificial Life in the Wild — ALIFE 2026 Workshop

Static site for the *Artificial Life in the Wild* workshop at the 2026
Conference on Artificial Life.

Lives at **https://alife-in-the-wild.github.io/**.

## Stack

Plain HTML, CSS, and a small bit of vanilla JS. No build step. Content
is authored in markdown files under `content/`; an inline loader fetches
them and renders them into the page on load.

```
.
├── index.html
├── content/                # ← edit these to change site content
│   ├── about.md
│   ├── cfp.md
│   ├── dates.md
│   ├── topics.md
│   ├── speakers.md
│   └── organisers.md
├── assets/
│   ├── css/style.css
│   └── js/
│       ├── background.js   # generative flow-field background canvas
│       └── content.js      # markdown loader + renderers
├── .nojekyll               # tell GitHub Pages not to run Jekyll
└── README.md
```

## Editing content

**You should not normally need to touch `index.html`.** Almost everything
visible on the site is rendered from one of the markdown files in
`content/`. Each file has a comment at the top explaining its
conventions. The short version:

| File              | Section          | What it controls                                                |
| ----------------- | ---------------- | --------------------------------------------------------------- |
| `about.md`        | The theme        | The lead callout (chunk 1) and prose body (chunk 2), split on `---` |
| `cfp.md`          | Call for papers  | Optional intro paragraph + one card per `---`-separated chunk   |
| `dates.md`        | Important dates  | A markdown table; last row is highlighted as the workshop date  |
| `topics.md`       | Topics           | One topic per chunk; trailing line of `` `#tags` `` becomes chips |
| `speakers.md`     | Invited speakers | One speaker per chunk; first paragraph after the heading = affiliation |
| `organisers.md`   | Organisers       | Markdown list of organisers (chunk 1) + committee paragraph (chunk 2) |

For example, to change a CFP track, open `content/cfp.md`, find the
relevant `## Card title` block, and edit it. The card on the page will
update next reload.

### Conventions in detail

**Chunks** — wherever a file uses `---` on its own line, that's a
separator between repeating items (cards, topics, speakers).

**Cards** — every "card" type has the same shape:

```md
## Card heading
Tagline (one short line — rendered in accent type).

Body paragraph(s).
```

**Tags** — in `topics.md`, the last line of a topic must be inline-code
spans:

```md
`#openendedness` `#noveltysearch` `#fielddeployment`
```

These render as the small pill chips at the bottom of each topic card.

**Tables** — `dates.md` is just a GitHub-flavoured markdown table. The
loader rewrites it into the styled three-column grid, with the *last*
row highlighted (so put the workshop date last).

If something doesn't render the way you expect, check the browser
console — the loader logs a warning and falls back to the static HTML
inside the placeholder div if a markdown file fails to parse.

## Local preview

Markdown loads via `fetch()`, which doesn't work on `file://` URLs in
most browsers. So you need a local server:

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

If you'd rather just edit `index.html` directly, you can — every
`<div data-md-section="…">` placeholder contains a small fallback that
shows up if the markdown fails to load.

## Deploy on GitHub Pages

1. Push this repo to `alife-in-the-wild/alife-in-the-wild.github.io`
   (the repo name must match the org name for the apex URL to work).
2. In **Settings → Pages**, set *Source* to **Deploy from branch**,
   branch `main`, folder `/ (root)`.
3. Wait ~30 seconds. The site will be live at
   <https://alife-in-the-wild.github.io/>.

The `.nojekyll` file disables Jekyll processing so files starting with
`_` are served as-is.

## Visual tuning

Most visual settings live in `:root` at the top of
`assets/css/style.css`:

- `--bg`, `--ink`, `--accent`, `--accent-2` — colour palette
- `--font-display` / `--font-sans` / `--font-mono` — type stack

## Background animation

The animated background is a flow-field particle system in
`assets/js/background.js` — meant to evoke the audio-reactive
emergent-lifeforms feeling of Universal Everything's *Ultrasound*
without shipping a multi-megabyte video.

Knobs at the top of the file:

| Constant         | What it does                                |
| ---------------- | ------------------------------------------- |
| `TARGET_DENSITY` | Particles per CSS pixel² (auto-clamped)     |
| `MAX_PARTICLES`  | Hard cap                                    |
| `FADE_ALPHA`     | Trail length — lower = longer trails        |
| `SPEED`          | Particle velocity                           |
| `NOISE_SCALE`    | Spatial frequency of the flow field         |
| `NOISE_TIME`     | How fast the field evolves over time        |

The script automatically pauses when the tab is hidden, respects
`prefers-reduced-motion`, and caps device pixel ratio at 2× on mobile.

### Swapping in a real video

If you later want to use an actual video instead of the canvas, replace
the `<canvas id="bg">` element in `index.html` with:

```html
<video id="bg" autoplay muted loop playsinline poster="poster.jpg">
  <source src="assets/video/background.webm" type="video/webm">
  <source src="assets/video/background.mp4"  type="video/mp4">
</video>
```

…and remove the `<script src="assets/js/background.js">` line. The
existing CSS rule for `#bg` will size the video correctly.

## License

Site code: MIT. Workshop content (text, programme, organiser bios) ©
the workshop organising committee.
