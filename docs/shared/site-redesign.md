# Site Redesign — Design Notes

> **Created:** 2026-10-07
> **Status:** Implemented on `feat/yusa_liu/indie-redesign`
> **Replaces:** the "Minimal + Typography" look from `proposal.md` (UI Refinement)

## Brief

Modern, elegant typography (the first pass with Dela Gothic One read as too
playful; a serif pass with Instrument Serif was rejected as unattractive). Reference: the owner's earlier e-book site, keeping its hairline
frames and crisp headings, not its wine-red palette. The owner's painted
self-portrait is the main visual asset. UX follows Apple's HIG; human-factors
problems are fixed directly.

## Tokens

Palette is sampled from the portrait (hair, skirt, shadow) and cooled down.

| Token | Light | Dark | Role |
|---|---|---|---|
| `paper` | `#F6F5F8` | `#141218` | page background |
| `surface` | `#FFFFFF` | `#1C1922` | framed sheets and rows |
| `ink` | `#1E1A24` | `#EEEBF2` | text, frames, interactive borders |
| `mute` | `#625B6B` | `#A9A2B3` | secondary text |
| `line` | `#D8D4DE` | `#3A3542` | decorative hairlines only |
| `accent` | `#C41E3A` | `#FF5F73` | primary button, current page, focus ring, bullets |
| `plum` | `#6E2C55` | `#C98AB4` | primary button hover |

All text pairs are ≥ 5.4:1. `line` (1.3:1) is never the only boundary of an
interactive control; buttons use `ink` borders.

Type: Sora for both headings (`font-display`: weight 500, tracking down to
-0.045em on the hero) and body (17px base per HIG). Chosen from a side-by-side
of Instrument Serif, Montserrat, Manrope, Sora and Righteous. CJK falls back to
system PingFang / Noto Sans TC, which also avoids the `next/font/google`
server/client hash mismatch hit earlier by a CJK display font. The home hero
shows the Latin name only.

## Signature device

The **diamond rule** (`.rule`): a hairline with diamond terminals, taken from the
e-book site. It appears under the home name, under page titles, and as the tail
of every section heading. The portrait rises out of a hairline circle; a CSS
mask lets it break out above the circle's centre and crops it to the circle
below, hiding the flat edge of the source image.

## Home: hero and projects

Hero: an outlined "Yusa / Liu" fills the left side like a backdrop (the hollow
treatment echoes the outlined percentage on the e-book shelf) and the portrait
overlaps it from the right. Below the name, the intro is plain text under a
diamond rule; there are no hero buttons (the header nav covers wayfinding).
Sora's overlapping contours show seams under a plain stroke, so the name uses a
3px stroke under a background-coloured fill (`paint-order: stroke fill`);
`prefers-contrast: more` falls back to solid type.

Projects (`/#projects`, replacing the missing `/portfolio` page): full-bleed
panels with the key art as background and the copy shown directly, without a
card or dates. A page-coloured linear wash at 45° (solid to 36%, 80% at 48%,
clear at 70%) keeps the copy on a clean ground in the bottom left and blends
the art into the site; on phones it rises from below the art. Zone Wallet's art
is cropped from the right (`100% center`) so its own headline lettering stays
out from behind the title. Measured: 0% of sampled pixels behind the copy under
4.5:1 in light mode, ≤7% (title edges) in dark.

Halftone variants were tried and rejected: page-coloured dot screens over the
art read as a stencil; a sampled-colour tile mosaic and a 45° colour-halftone
clipping mask both looked right but left small text looking soft wherever dots
sat behind it. Per the apple-design vibrancy guidance, copy over a changing
background gets a solid ground; boldness stays with the art.

Key art is the 2000px source at WebP quality 92. Parallax overscan is kept to
12% (±9% travel) because every extra percent enlarges the image and softens it
on 2x screens; truly sharp full-bleed art on retina needs ~3200px+ sources.

Motion, modelled on mediatonicgames.com:

- `ScrollLag` (`features/ui/components/scroll-lag.tsx`): scroll *velocity*
  drives an offset, so layers trail the page and ease back once it stops.
  Springs use Apple's response/damping model converted to framer-motion
  physics, critically damped (ratio 1.0) per the apple-design guidance that
  bounce belongs only to motion the user flicks. Wheel input is stepped, so the
  velocity first passes a 0.3s critically damped smoothing spring (like
  Mediatonic's scroll-delta history) before the 0.45s output spring. Measured
  over ~1s of wheel scrolling: direction reversals 22 -> 4, no visible
  overshoot, settles in ~1.9s. Layers: name and the Projects heading 0.5; intro and portrait share
  layer 2 so they move as one group; project panel 1 with its button +1.
  Disabled under reduced motion.
- Key-art parallax: position-linked, ±9% of the panel height.
- `.btn-rollover`: pill outline whose skewed fill sweeps in from the left and
  out to the right (520ms), using two transition layers so the exit also
  animates. The home load fade runs 780ms.

Copy in `features/projects/projects.ts` is derived from the canonical CV and
bullet bank in `career-prep`; keep its claims in sync with them.

Side projects & earlier work: a text list after Projects for older or
non-production work (`OTHER_WORK` in `features/projects/projects.ts`), newest
first, with no visible heading (an `sr-only` h2 keeps the section named), no
rules between rows and no arrows. Rows show only a right-aligned title with a
small mark below it: a hairline ending in a ring (the portrait frame's
language), right-aligned and 30% of that title's width. The mark stays put when
the title shifts, so it anchors the right edge. The section's top spacing is
about one row high, so it follows Projects closely. Hovering or focusing
a title sweeps it to accent (`.text-sweep`, the text form of the Projects
rollover), shifts it 0.75rem left, and unfolds year, kind and summary below.
Every row behaves the same; only rows with a `url` are links (pointer cursor,
new tab), the others are focusable `div`s so keyboard users can reveal them.
Per WCAG 1.4.13 nothing is hover-only: on `(hover: none)` devices the details
stay open. Rows trail the scroll at 1, 1.25 and 1.5. NiCE2's repository is
private and its event site now shows a retirement page, so it is not linked.
Diablo II links to the Blizzard article on the Taiwan / HK / Macau launch film;
EGX Rezzed has no public reference and deliberately omits the game name.

## Appearance

Dark follows the system until the visitor uses the header toggle; the choice is
stored in `localStorage` and applied by an inline head script before first
paint. Tokens are defined for `prefers-color-scheme: dark` (unless
`data-theme="light"`) and for `data-theme="dark"`.

## CV content

`content/cv/yusa-liu.md` mirrors `career-prep/resume/cv/source/yusa-liu-cv.md`.
Website-only differences: phone and email are omitted on the public page, the
GitHub handle is a link, and the Skills / Education lines are list items so
Markdown does not merge them into one paragraph. Without a one-page limit, the
website also carries bullet-bank alternates ZW-07 (calendar fallback) and
HTC-05 (texture prototype), plus a Selected Achievements section (MWC 2024,
Diablo II launch campaign) carried over from main's earlier CV. The canonical
source is intentionally not updated with these.

## Human-factors fixes

- Measure capped at 68ch (CV lines were ~95 characters); post header matches it.
- Mobile CV sheet goes edge to edge so lines are ~40 characters instead of ~32.
- Prose leading 1.75 for mixed CJK/Latin text.
- Clear action hierarchy on home: one filled primary button, outlined secondaries.
- Press feedback on `:active` (scale 0.97, 100ms); none under reduced motion.
- Current page marked by an underline plus weight, not color alone.
- Tags are flat labels, not button-shaped, because they are not interactive.
- Whole blog row is the tap target; it shows a focus ring via `:has(:focus-visible)`.
- Project summaries are always visible; only the button is the link, so the
  tap target is explicit and the text stays selectable.
- Tap targets ≥ 44px; `prefers-reduced-motion` keeps a cross-fade only;
  `prefers-reduced-transparency` makes the header solid; `prefers-contrast: more`
  darkens secondary text and lines.

## Follow-ups

- `npm run lint` fails on `main` too (`eslint/config` export error with ESLint 8).
- framer-motion adds ~46 kB to the home page for the parallax. CSS scroll-driven
  animations would remove it but are not yet supported in Firefox.
- `career-prep/resume/cv/README.md` still says the website CV is not synced.
- The sign-key post references images that are missing from the content.
- Project key art is limited to 2000px wide; supply ~3200px+ originals for crisp
  retina rendering. Converting to SVG would not help: the art is raster.
