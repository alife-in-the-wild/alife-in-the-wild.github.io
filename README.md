# Artificial Life in the Wild — ALIFE 2026 Workshop

Static site for the *Artificial Life in the Wild* workshop at the 2026
Conference on Artificial Life.

Lives at **https://alife-in-the-wild.github.io/**.

## How it works

Two-stage static site. Content lives in markdown, layout lives in an
HTML template, and a small Node build script bakes them together into a
single fully-static `index.html` that GitHub Pages serves directly. No
runtime markdown loading, no client-side parsing, no flash of empty
content.

```
.
├── template.html           # source layout (edit for structure)
├── content/                # source content (edit for words)
│   ├── about.md
│   ├── cfp.md
│   ├── dates.md
│   ├── topics.md
│   ├── speakers.md
│   └── organisers.md
├── build.js                # markdown → HTML build script
├── package.json
├── index.html              # ← GENERATED. do not edit by hand.
├── assets/
│   ├── css/style.css
│   └── js/background.js    # generative flow-field background canvas
├── .nojekyll
└── README.md
```

`index.html` is a build artifact, but it **is** committed to git so
GitHub Pages can serve it without running a build action.

## Editing content

You should not normally need to touch `template.html` or `index.html`.
Almost everything visible on the site is rendered from one of the
markdown files in `content/`:

| File              | Section          | What it controls                                                |
| ----------------- | ---------------- | --------------------------------------------------------------- |
| `about.md`        | The theme        | Lead callout (chunk 1) and prose body (chunk 2), split on `---` |
| `cfp.md`          | Call for papers  | Optional intro paragraph + one card per `---`-separated chunk   |
| `dates.md`        | Important dates  | A markdown table; last row is highlighted as the workshop date  |
| `topics.md`       | Topics           | One topic per chunk; trailing line of `` `#tags` `` becomes chips |
| `speakers.md`     | Invited speakers | One speaker per chunk; first paragraph after the heading = affiliation |
| `organisers.md`   | Organisers       | Markdown list of organisers (chunk 1) + committee paragraph (chunk 2) |

Each file has a comment at the top documenting its convention. The
short version:

- **Chunks** — `---` on its own line separates repeating items.
- **Cards** — `## Heading`, then a one-line tagline, then body paragraphs.
- **Tags** — in `topics.md`, end the topic with a line of inline-code spans:
  `` `#openendedness` `#fielddeployment` ``.
- **Tables** — `dates.md` is a GFM markdown table; put the workshop date
  *last* (the build script highlights the last row).

## Build

One-time setup:

```sh
npm install
```

Whenever you change `content/*.md` or `template.html`:

```sh
npm run build      # regenerates index.html
```

There's also a convenience script that builds and starts a local server:

```sh
npm run dev        # build + python3 -m http.server 8000
```

Open <http://localhost:8000>.

The build pulls every `<div data-md-section="X">` placeholder out of
`template.html`, runs the matching markdown file through its renderer,
and writes the result back into the DOM. The output is plain HTML —
open `index.html` directly with `file://` and the content is all there.

## Deploy on GitHub Pages

The repo is already wired up to deploy from the `main` branch:

1. Edit content (`content/*.md`).
2. `npm run build`
3. `git add -A && git commit -m "Update CFP" && git push`
4. Pages rebuilds in ~30s.

Don't forget step 2 — pushing without rebuilding will leave the live
site showing stale content. (If you'd rather have CI run the build,
swap to a GitHub Actions Pages workflow; ask if you want it set up.)

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
the `<canvas id="bg">` element in `template.html` with:

```html
<video id="bg" autoplay muted loop playsinline poster="poster.jpg">
  <source src="assets/video/background.webm" type="video/webm">
  <source src="assets/video/background.mp4"  type="video/mp4">
</video>
```

…remove the `<script src="assets/js/background.js">` line, then
`npm run build`. The existing CSS rule for `#bg` will size the video
correctly.

## License

Site code: MIT. Workshop content (text, programme, organiser bios) ©
the workshop organising committee.
