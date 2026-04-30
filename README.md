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

You should not normally need to touch any `.jsx` file. Each markdown
file in `content/` has a comment at the top documenting its conventions:

| File              | Section          | What it controls                                                |
| ----------------- | ---------------- | --------------------------------------------------------------- |
| `about.md`        | The theme        | Lead callout (chunk 1) and prose body (chunk 2), split on `---` |
| `cfp.md`          | Call for papers  | Optional intro paragraph + one card per `---`-separated chunk   |
| `dates.md`        | Important dates  | A markdown table; last row is highlighted as the workshop date  |
| `topics.md`       | Topics           | One topic per chunk; trailing line of `` `#tags` `` becomes chips |
| `speakers.md`     | Invited speakers | One speaker per chunk; first paragraph after the heading = affiliation |
| `organisers.md`   | Organisers       | Markdown list (chunk 1) + committee paragraph (chunk 2)         |

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
