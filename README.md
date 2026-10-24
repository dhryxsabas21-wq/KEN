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
the résumé, or from Kennedy directly (including Java). There are no
invented awards, testimonials, client logos or skill percentages — keep it that way.

| To change | Edit in `content.ts` |
| --- | --- |
| Name, headline, intro, location | `profile` |
| Email, phone, LinkedIn, résumé link | `contact` |
| Hero photo | `subject` (see below) |
| Practice rows | `practice` |
| **Services** (websites, desktop systems, workflow tools) | `services` |
| **Stack tiles** (PHP, Java, HTML, CSS, …) | `stack` |
| Projects in the work table | `work` |
| About text, schools, certificate | `about`, `education`, `certificate` |
| Closing line | `close` |

A service only links to proof when a real shipped project exists (`proof`). Services without
a linked project say "Available to build"; add the project to `work` before setting its `proof`.

## Still to do

1. **Facebook link.** Add the actual Facebook profile or page URL to `contact.channels`
   before displaying a Facebook contact card. A search-results link is not a profile link.
2. **Telegram link.** Add `{ label: "Telegram", value: "@yourname", href: "https://t.me/yourname" }`
   to `contact.channels`.
3. **Add Java to your Word résumé** so it matches the web one.

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

### Entry loading screen

The first home-page visit in a browser tab shows a framed KP mark, an indeterminate
copper loading line, and a curtain transition. The page waits briefly for its fonts
and portrait; it does not display invented loading percentages.

- Skip with the visible button, Enter, or Escape. The button and Escape also work
  before React hydrates.
- Reduced motion, disabled JavaScript, direct résumé visits, and section deep links
  bypass the intro. Subsequent home visits in the same tab skip it when session storage
  is available.
- A slow asset is bounded by an 1800ms readiness deadline; a separate 3500ms bootstrap
  timeout releases the page if hydration fails.
- The page is inert only while the intro is active. Hero reveals begin after it exits.

Run the loading and fallback checks in Chromium and WebKit:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path (Get-Location) '.preview/browsers'
node scripts/loading-check.mjs http://127.0.0.1:3300
```

| Where | What | File |
| --- | --- | --- |
| Hero background | WebGL field of paper forms, lit and fogged, turning toward the pointer and flying at you on scroll | [`PaperField.tsx`](src/components/PaperField.tsx) |
| Hero portrait | Complete photo in a stable 4:5 frame, with a backplate and availability tag on separate depth planes | [`Portrait.tsx`](src/components/Portrait.tsx) |
| Work | Screenshots in browser / app-window frames that tilt in 3D, index tags floating in front | [`Work.tsx`](src/components/Work.tsx) |
| Practice drawing | Tilting plane with labels floating 24px above it | [`Tilt3D.tsx`](src/components/Tilt3D.tsx) |
| Services | Tilting panels with copper indices floating above the card | [`Services.tsx`](src/components/Services.tsx) |
| Stack | Two-sided flip tiles: the technology on the front, what it was used for on the back | [`Stack.tsx`](src/components/Stack.tsx) |
| Work | Project names lift off the page on hover | `.worktable .lift` |
| Footer | Extruded brand mark that tilts with the pointer or scroll | [`Footer.tsx`](src/components/Footer.tsx) |
| Everywhere | Blocks swing up into place; buttons press down onto a hard slab | `globals.css` |

How it stays fast and safe:

- **Three.js is code-split** and loads only after the page has rendered.
- **WebGL pauses** when the hero is off screen or the tab is hidden; no WebGL → no effect, nothing
  breaks.
- **Touch screens** get the 3D from scroll position instead of the pointer, so phones still see it.
  Tiles flip on tap.
- **Reduced motion** (OS setting): WebGL is hidden, with no tilting or reveals — everything is
  shown immediately.
- **No paper behind text.** The WebGL canvas's *box* starts where the copy column ends (desktop)
  or covers only the portrait band (phones), computed from the same numbers as the layout — see
  `.paper-field` in `globals.css`.

---

## What was verified

See [UI_AUDIT.md](UI_AUDIT.md) for the UI/UX findings, changes, and validation scope.

### Mobile effects

Touch devices use scroll position for the portrait, project frames, and service
panels, including the moving portrait light. Mouse devices retain pointer tilt.
The easing uses elapsed time, so it has the same duration across refresh rates.
Effects update on orientation and visible viewport changes, pause offscreen or
when the tab is hidden, and respond to reduced-motion changes without a reload.
Tiles flip on repeated taps or keyboard activation; hover styling and instructions
are limited to devices with a fine, hover-capable pointer.

Run the browser regressions against a production server:

```powershell
npm run build
npm run start -- --port 3100
# In a second terminal:
node scripts/preview-check.mjs http://127.0.0.1:3100
node scripts/ui-check.mjs http://127.0.0.1:3100
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path (Get-Location) '.preview/browsers'
node node_modules/playwright-core/cli.js install webkit
node scripts/mobile-effects-check.mjs http://127.0.0.1:3100
```

The mobile checks cover Android profiles in Chromium and iPhone/iPad profiles in
WebKit: scroll tilt and light, portrait/landscape layouts, tile taps, reduced motion
at load and while browsing, idle animation callbacks, and fast-scroll reveals.
These are browser emulations, not tests on physical phones.

### Layout and usability checks

In headless Chrome against the production build:

- **Ten viewport sizes**, from 320×740 to 1920×1080, including a 1280×600 laptop:
  no horizontal page overflow, clipped text, or overflowing technology-card faces.
- **Typography**: 16px Inter body text, serif headings, and readable mono labels and chips.
- **Navigation**: working skip link and keyboard controls, accurate active sections,
  project-specific service links, and anchor targets clear of the fixed navigation.
- **Touch targets**: navigation, primary actions, and footer links have at least 44px height.
- **Portrait**: the full photo loads and retains its 4:5 frame, with pointer and touch tilt.
- **Résumé**: responsive screen layout, working download, and a regenerated one-page A4 PDF.
- **Palette contrast** on the three page surfaces: primary 12.58:1, secondary 7.61:1,
  muted 6.04:1, and copper 5.24:1 or better.
- **Runtime**: no browser errors in the automated checks.

---

## Deploying

**Live site: https://ken-975q-theta.vercel.app**

The code lives on GitHub at **github.com/dhryxsabas21-wq/KEN**, and the Vercel project
**`ken-975q`** builds the site from it. **Every push to `main` redeploys the live site
automatically** (about a minute).

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
