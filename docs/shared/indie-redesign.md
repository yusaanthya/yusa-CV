# Indie Game Redesign — Design Notes

> **Created:** 2026-10-07
> **Status:** Implemented on `feat/yusa_liu/indie-redesign`
> **Replaces:** the "Minimal + Typography" look from `proposal.md` (UI Refinement)

## Brief

Restyle the whole site so it reads as an indie game front-end rather than a
generated template. Not pixel art. Reference: Sick Games (有病製作) — refined
character illustration, clean UI, playful absurd humor. UX follows Apple's
Human Interface Guidelines.

Subject fit: the owner is a backend engineer with an MA in Computer Game
Design who showed an indie prototype at EGX Rezzed, so the home page is a
title screen and the CV is a character file.

## Tokens

| Token | Light | Dark | Role |
|---|---|---|---|
| `paper` | `#F3F1FA` | `#1A1838` | page background |
| `panel` | `#E9E6F5` | `#252352` | inline code, secondary surfaces |
| `ink` | `#22204A` | `#F3F1FA` | text, h2 tabs, focus ring |
| `mute` | `#5E5A86` | `#B2ADD6` | secondary text |
| `haze` | `#C9C4E6` | `#423E78` | dashed rules, halftone dots |
| `marker` | `#FFD447` | same | selection cursor, CTA, title slab |
| `pop` | `#FF5A87` | same | decoration only: name shadow, tag outlines, bullets |
| `on-accent` | `#22204A` | same | text on `marker` / `pop` fills |

`pop` is never used as text or as a focus ring on `paper` (2.7:1 in light mode).
All text pairs are ≥ 5:1.

Type: Dela Gothic One (display), Bricolage Grotesque (body, 17px base per HIG),
CJK falls back to PingFang TC / Noto Sans TC.

Dela Gothic One is self-hosted (`app/fonts/`, latin subset, SIL OFL) through
`next/font/local`. Through `next/font/google`, its large CJK font CSS produced a
different class hash on server and client, so the display font never applied.

## Signature device

One bold element: the **game-menu cursor** (`.menu-cursor`), a skewed marker
slab that sweeps in behind a label on hover, keyboard focus, and the current
page. It is used for header nav, the home start menu, and blog entry titles.

Motion: one orchestrated load sequence on the home page (slab sweep, then
content rises). No per-section scroll fades. `prefers-reduced-motion` disables
all animation and transitions.

## Rejected defaults

- Hard offset shadows + thick borders everywhere (neo-brutalism kit): kept to the
  single print button, where the press-down state gives feedback.
- Card grid for blog posts: replaced by a dashed-rule list with a stretched link.
- Monospace date labels, all-caps eyebrows, `→` suffixes, middle-dot meta.

## HIG checklist

- Tap targets ≥ 44px (`min-h-11` / `min-h-14`).
- Current location shown in nav (`aria-current="page"` + cursor).
- Visible focus ring (3px `ink`).
- Dark mode via `prefers-color-scheme` (previous `.dark` class was never applied).
- Header uses a translucent blurred material; logo text collapses to a badge
  below `sm` and stays available to screen readers.
- Print output strips skew and fills on the CV.

## Follow-ups

- `/portfolio` is still linked from nav and home but has no page (404).
- `npm run lint` fails on `main` too (`eslint/config` export error with ESLint 8).
- `framer-motion` is no longer imported; remove it from `package.json`.
