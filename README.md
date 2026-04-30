# Artificial Life in the Wild — ALIFE 2026 Workshop

Static Next.js site for the *Artificial Life in the Wild* workshop at the
2026 Conference on Artificial Life.

Lives at **https://alife-in-the-wild.github.io/**.

## How it works

- Next.js 14 App Router, exported as a fully static site (`output: 'export'`).
- Content lives in plain markdown (`content/*.md`).
- Each section is a server component that reads its `.md` at build time
  via `lib/content.js` and renders JSX. No client-side markdown.
- The animated background is a single `'use client'` component using
  vanilla `<canvas>` — no animation library.
- GitHub Actions runs `next build` on every push to `main` and deploys
  the resulting `out/` directory to GitHub Pages.

```
.
├── app/
│   ├── layout.jsx          # <html>, fonts, header, canvas, footer
│   ├── page.jsx            # composes the sections
│   └── globals.css
├── components/
│   ├── About.jsx · Cfp.jsx · Dates.jsx · Topics.jsx
│   ├── Speakers.jsx · Organisers.jsx
│   ├── Header.jsx · Hero.jsx · Footer.jsx · Section.jsx
│   └── Background.jsx      # 'use client' canvas
├── lib/content.js          # markdown parsing helpers (build-time)
├── content/                # ← edit these to change site copy
│   ├── about.md · cfp.md · dates.md
│   ├── topics.md · speakers.md · organisers.md
├── public/                 # static files served at site root
├── next.config.mjs
├── package.json
└── .github/workflows/deploy.yml
```

## Editing content

You should not normally need to touch any `.jsx` file — every section's
copy comes from one of the markdown files in `content/`. Workflow:

```sh
# 1. edit the markdown file you want to change
$EDITOR content/cfp.md

# 2. (optional) preview locally with hot reload
npm run dev          # http://localhost:3000

# 3. commit and push — GitHub Actions builds and deploys automatically
git add content/cfp.md
git commit -m "Update CFP: add field-reports track"
git push
```

The deploy takes ~60 s after push. Watch it at
<https://github.com/alife-in-the-wild/alife-in-the-wild.github.io/actions>.

Each markdown file has a comment at the top documenting its convention,
but here's the cheat sheet:

| File              | Section          | Format                                                          |
| ----------------- | ---------------- | --------------------------------------------------------------- |
| `about.md`        | The theme        | Lead callout (chunk 1) and prose body (chunk 2), split on `---` |
| `cfp.md`          | Call for papers  | Optional intro paragraph + one card per `---`-separated chunk   |
| `dates.md`        | Important dates  | A markdown table; the last row is highlighted as the workshop date |
| `topics.md`       | Topics           | One topic per chunk; trailing line of `` `#tags` `` becomes chips |
| `speakers.md`     | Invited speakers | One speaker per chunk; first paragraph after the heading = affiliation |
| `organisers.md`   | Organisers       | Markdown list (chunk 1) + committee paragraph (chunk 2)         |

Common rule: `---` on its own line is a separator between repeating
items. Inline markdown (`*italic*`, `**bold**`, `[links](url)`) works
everywhere.

### `content/cfp.md` — call for papers

The first chunk (before the first `---`) is the optional intro
paragraph. Each subsequent chunk is one card and follows this exact
shape:

```md
## Card title
Tagline shown in accent type — one short line (length / format / template).

Body paragraph.

A second body paragraph if you want one.
```

To **add a new track**, copy a card block, paste it after a `---`, and
edit. To **remove one**, delete it together with its leading `---`.

### `content/about.md` — the theme

Two chunks separated by a single `---`. Chunk 1 is the big callout
(short, italics get the accent colour). Chunk 2 is the regular prose.

```md
*In the wild* means leaving the petri dish. …

---

Artificial life has always been a discipline of *as it could be*. …

Second paragraph of body prose.
```

### `content/dates.md` — important dates

A standard GFM table. The build script highlights the **last row**, so
keep the workshop itself at the bottom.

```md
| Milestone           | Deadline      | Notes                              |
| ------------------- | ------------- | ---------------------------------- |
| Submissions open    | 15 Apr 2026   | OpenReview portal goes live        |
| Submission deadline | 19 Jun 2026   | Extended abstracts and artefacts   |
| Workshop            | Oct 2026      | Co-located with ALIFE 2026         |

> Optional blockquote underneath becomes the small footnote line.
```

### `content/topics.md` — topics grid

One topic per chunk. The **last** line of each chunk must be a row of
inline-code spans starting with `#` — those become the tag chips:

```md
## Open-ended systems, outdoors

Description paragraph that explains the topic.

`#openendedness` `#noveltysearch` `#fielddeployment`

---

## Embodied & situated agents

Description …

`#embodiment` `#softrobotics`
```

### `content/speakers.md` — invited speakers

One speaker per chunk. First paragraph after the heading is the
affiliation line; everything after that is the bio.

```md
## Anna Example
Some University · Field of work

Bio paragraph.

Optional second bio paragraph.
```

### `content/organisers.md` — organisers + committee

Two chunks. Chunk 1 is a markdown list of organisers — each item must
follow `- **Name** — Affiliation` (em-dash or hyphen both work). Chunk
2 is free prose for the programme committee paragraph.

```md
- **Amber Example** — University of Oxford
- **Pat Example** — Some Institute

---

The committee will be drawn from … [Get in touch](mailto:foo@bar.com)
if you would like to review.
```

## Local development

```sh
npm install
npm run dev          # http://localhost:3000  with hot reload
```

## Build a static export locally

```sh
npm run build        # produces ./out/
npx serve out        # or: python3 -m http.server -d out 8000
```

## Deploy

Just push to `main`. The `Deploy Next.js static export to GitHub Pages`
workflow runs on every push and publishes `out/` via Pages. The repo
Pages source is set to **GitHub Actions** (not branch deploy).

You can watch deployments at:
<https://github.com/alife-in-the-wild/alife-in-the-wild.github.io/actions>

## Visual tuning

Most visual settings live in `:root` at the top of `app/globals.css`:

- `--bg`, `--ink`, `--accent`, `--accent-2` — colour palette
- `--font-display` / `--font-sans` / `--font-mono` — type stack

## Background animation

The animated background is `components/Background.jsx` — a flow-field
particle system meant to evoke the audio-reactive emergent-lifeforms
feeling of Universal Everything's *Ultrasound* without shipping a
multi-megabyte video.

The component pauses when the tab is hidden, respects
`prefers-reduced-motion`, and caps device pixel ratio at 2× on mobile.
The tunable constants are at the top of the `useEffect` body.

## License

Site code: MIT. Workshop content (text, programme, organiser bios) ©
the workshop organising committee.
