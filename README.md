# Kennedy Dhryx Pronto — Portfolio

Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Three.js. A single static page,
warm dark theme, with real 3D.

```bash
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint     # eslint
```

---

## Editing the content

**Every word on the page comes from [`src/lib/content.ts`](src/lib/content.ts).** Claims come from
the résumé, or from Kennedy directly (Java, and student portals as a service). There are no
invented awards, testimonials, client logos or skill percentages — keep it that way.

| To change | Edit in `content.ts` |
| --- | --- |
| Name, headline, intro, location | `profile` |
| Email, phone, LinkedIn, résumé link | `contact` |
| Hero photo | `subject` (see below) |
| Practice rows | `practice` |
| **Services** (student portals, websites, …) | `services` |
| **Stack tiles** (PHP, Java, HTML, CSS, …) | `stack` |
| Projects in the work table | `work` |
| About text, schools, certificate | `about`, `education`, `certificate` |
| Closing line | `close` |

A service only links to proof when a real shipped project exists (`proof`). Student portals
currently say "Available to build" — if you've shipped one, add it to `work` and set its `proof`.

## Still to do

1. **Facebook link.** The Facebook card currently opens a Facebook *search* for
   "Kennedy Dhryx N Pronto". Replace its `href` in `contact.channels` with the page's own URL
   (on the page: **⋯ → Copy link**).
2. **Telegram link.** Add `{ label: "Telegram", value: "@yourname", href: "https://t.me/yourname" }`
   to `contact.channels`.
3. **Confirm the Student Portal details** in `work` — the stack (PHP, MySQL, …) and year
   (2025 — 2026) aren't visible in the screenshot, so they're marked `TODO(confirm)`.
4. **Add Java to your Word résumé** so it matches the web one.

## Adding a project with a screenshot

Put the image in `public/work/`, then give the project in `work` a `featured` block with the
image's real `width` / `height`, a `chrome` (`"browser"` for websites, `"window"` for desktop-app
captures that already show their title bar) and a short `features` list. Add `live` for a public
link — with `status: "Work in progress"` if it isn't finished. Projects without `featured` appear
in the "More work" list instead. Next.js resizes the images automatically.

## Changing the hero photo

```bash
npm run cutout -- path/to/photo.jpg
```

Works best with a studio portrait on a plain light background (like an ID photo). It removes the
backdrop, cleans the hair edges so there's no pale halo on the dark page, crops to a 4:5 bust,
fades the shoulders, and writes `public/subject.webp`. It prints the `width` / `height` to put in
`subject` in `content.ts`. The backdrop is only removed where it touches the top and sides, so a
white shirt touching the bottom edge is kept.

---

## Résumé

The Résumé buttons open **`/resume`** — a one-page A4 résumé rendered from the same data as the
portfolio ([`src/lib/resume.ts`](src/lib/resume.ts) plus `content.ts`), so the two can never
disagree. On screen it shows as a sheet with **Print** and **Download PDF**; on a phone it
reflows to one column.

**After you edit the résumé, regenerate the PDF:**

```bash
npm run dev            # terminal 1
npm run resume:pdf     # terminal 2 → writes public/resume.pdf
```

The script prints `/resume` through your installed Chrome or Edge, and **refuses to write the
file if it runs past one A4 page** — trim content rather than letting the bottom get cut off.
After regenerating, run `npm run build` again before deploying (production only serves files that
existed in `public/` at build time).

The résumé uses its own print palette (white paper, copper darkened to `#A8482A` for 5.8:1
contrast on white) and lists main content first in the document so applicant-tracking systems
read the substance before the sidebar.

---

## Theme

Defined once in the `@theme` block of [`src/app/globals.css`](src/app/globals.css).

| Token | Value | Contrast on `ground-2` |
| --- | --- | --- |
| `ground` | `#181614` | — |
| `ground-2` | `#1F1C19` | — |
| `surface` | `#27231F` | — |
| `ink` | `#EDE6DA` | 14.6:1 |
| `ink-2` | `#BDB4A6` | 8.4:1 |
| `muted` | `#918878` | 4.9:1 |
| `pigment` (copper) | `#E07A4B` | 5.7:1 |

All clear WCAG AA. **If you change a colour, re-check its contrast** — dark themes fail quietly.

> **Tailwind v4 gotcha:** custom classes (`.display`, `.label`, `.btn` …) live in
> `@layer components`. Unlayered CSS beats every layer, so if you move them out, utilities like
> `leading-[0.82]` silently stop working.

---

## The 3D

| Where | What | File |
| --- | --- | --- |
| Hero background | WebGL field of paper forms, lit and fogged, turning toward the pointer and flying at you on scroll | [`PaperField.tsx`](src/components/PaperField.tsx) |
| Hero portrait | Framed photo with the head breaking out above the frame; frame, corner marks, photo and status tag on separate depth planes, tilting toward the pointer | [`Portrait.tsx`](src/components/Portrait.tsx) |
| Work | Screenshots in browser / app-window frames that tilt in 3D, index tags floating in front | [`Work.tsx`](src/components/Work.tsx) |
| Practice drawing | Tilting plane with labels floating 24px above it | [`Tilt3D.tsx`](src/components/Tilt3D.tsx) |
| Services | Tilting panels with extruded copper numbers floating in front | [`Services.tsx`](src/components/Services.tsx) |
| Stack | Two-sided flip tiles: the technology on the front, what it was used for on the back | [`Stack.tsx`](src/components/Stack.tsx) |
| Work | Project names lift off the page on hover | `.worktable .lift` |
| Close | Extruded wordmark that lies back as it comes into view | [`Close.tsx`](src/components/Close.tsx) |
| Everywhere | Blocks swing up into place; buttons press down onto a hard slab | `globals.css` |

How it stays fast and safe:

- **Three.js is code-split** and loads only after the page has rendered.
- **WebGL pauses** when the hero is off screen or the tab is hidden; no WebGL → no effect, nothing
  breaks.
- **Touch screens** get the 3D from scroll position instead of the pointer, so phones still see it.
  Tiles flip on tap.
- **Reduced motion** (OS setting): one still WebGL frame, no tilting, no reveals — everything is
  shown immediately.
- **No paper behind text.** The WebGL canvas's *box* starts where the copy column ends (desktop)
  or covers only the wordmark band (phones), computed from the same numbers as the layout — see
  `.paper-field` in `globals.css`.

---

## What was verified

In headless Chrome against the production build:

- **Hero, 9 viewports** (375×667 to 1920×1080, incl. 1280×600 and 1600×560): hero fills the window
  below the nav; the photo loads, stays inside the hero and never touches any text; the name is
  fully visible; side by side, the photo frame's top and bottom edges are level with the text
  column's (0px offset at every desktop size); stacked, it is exactly centred; no paper behind
  text; no sideways scroll.
- **Footer**: the brand mark is fully visible (not cropped), the footer ends the page, and the
  contact cards sit in one row on desktop.
- **WebGL** initialises and animates on desktop and phone.
- **3D**: the hero bracket rotates in 3D, service panels tilt toward the pointer, stack tiles flip.
- **Stack tiles**: no text overflows either face, on desktop or a 375px phone.
- **Reveal**: after a fast scroll pass, 0 of 55 blocks left hidden at three sizes.
- **Drawing**: bars match real pixel ratios and the scale bar, 0% error.
- **Contrast**: every measured text style ≥ 4.84:1.
- **No console errors.**

---

## Deploying

The code lives on GitHub at **github.com/dhryxsabas21-wq/KEN**, and Vercel builds the site from
it. **Every push to `main` redeploys the live site automatically** (about a minute).

To publish a change:

```bash
git add -A
git commit -m "Describe the change"
git push
```

Notes:

- Git and the GitHub CLI on this machine are portable copies in
  `%LOCALAPPDATA%\Programs\MinGit` and `%LOCALAPPDATA%\Programs\GitHubCLI` (no installer, no admin).
  To use `git` from any terminal, either install Git for Windows, or add
  `%LOCALAPPDATA%\Programs\MinGit\cmd` to your user PATH.
- `.gitignore` keeps the Word résumé (`*.docx`) and the local `.claude/` folder out of the public
  repo.
- After regenerating `public/resume.pdf` (`npm run resume:pdf`), commit and push it like any other
  change.
