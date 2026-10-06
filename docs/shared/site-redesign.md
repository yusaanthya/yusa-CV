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

## Projects showcase

The `/portfolio` page is replaced by a Projects section on the home page
(`/#projects`, linked from the nav and the hero). Each project is a full-bleed
panel with its key art as the background, moved with a framer-motion
`useScroll` parallax (static under reduced motion). A hairline text panel sits
over the art; on phones the art shows above the panel instead of under it.
Panels link to the live product in a new tab.

Copy lives in `features/projects/projects.ts` and is derived from the canonical
CV and bullet bank in `career-prep`; keep its claims in sync with them.

## CV content

`content/cv/yusa-liu.md` mirrors `career-prep/resume/cv/source/yusa-liu-cv.md`.
Website-only differences: phone and email are omitted on the public page, the
GitHub handle is a link, and the Skills / Education lines are list items so
Markdown does not merge them into one paragraph.

## Human-factors fixes

- Measure capped at 68ch (CV lines were ~95 characters); post header matches it.
- Mobile CV sheet goes edge to edge so lines are ~40 characters instead of ~32.
- Prose leading 1.75 for mixed CJK/Latin text.
- Clear action hierarchy on home: one filled primary button, outlined secondaries.
- Press feedback on `:active` (scale 0.97, 100ms); none under reduced motion.
- Current page marked by an underline plus weight, not color alone.
- Tags are flat labels, not button-shaped, because they are not interactive.
- Whole blog row is the tap target; it shows a focus ring via `:has(:focus-visible)`.
- Project summaries appear on hover only where hover exists (`@media (hover: hover)`)
  and on keyboard focus; touch screens always show them.
- Tap targets ≥ 44px; `prefers-reduced-motion` keeps a cross-fade only;
  `prefers-reduced-transparency` makes the header solid; `prefers-contrast: more`
  darkens secondary text and lines.

## Follow-ups

- `npm run lint` fails on `main` too (`eslint/config` export error with ESLint 8).
- framer-motion adds ~46 kB to the home page for the parallax. CSS scroll-driven
  animations would remove it but are not yet supported in Firefox.
- `career-prep/resume/cv/README.md` still says the website CV is not synced.
- The sign-key post references images that are missing from the content.
