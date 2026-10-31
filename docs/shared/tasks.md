# Shared UI — Current Status and Superseded Tasks

> Original plan: [proposal.md](./proposal.md) and [page-structure.md](./page-structure.md), created 2026-04-15.
> Audited: 2026-10-31 against `d961784d5c73accbf0f022a109b8b97ee740f7d1`.

The April amber/`AnimateIn` plan is superseded by the October
[site redesign](./site-redesign.md). Its old all-complete overview and unchecked
implementation list described a design that is no longer in the code. Do not
restore those components or tokens merely to clear the old checklist.

## Disposition of the original implementation tasks

| April tasks | Status and current evidence |
| --- | --- |
| Add light/dark `--brand` values and a Tailwind `brand` token (3 items) | Superseded. `app/globals.css` and `tailwind.config.ts` define RGB `paper`, `surface`, `ink`, `mute`, `line`, `accent`, and `plum` tokens. |
| Create the `AnimateIn` client wrapper with reduced-motion handling, variants, delay, and `whileInView` (5 items) | Superseded. That file is absent. `scroll-lag.tsx` and `project-panel.tsx` use Framer Motion and reduced-motion checks; `hero-name.tsx` and CSS implement the hero reveal. |
| Wrap hero content in `AnimateIn` and add an amber hero CTA (2 items) | Superseded. `app/page.tsx` uses `HeroName`, `ScrollLag`, and CSS load fades; the documented redesign removes hero buttons. |
| Add stagger wrappers to blog cards and fade wrappers to blog/CV articles (3 items) | Superseded. The current listing and article routes render without those wrappers. |
| Change header hover to `hover:text-brand` (1 item) | Superseded. `nav-links.tsx` uses ink text and accent underlines, with `aria-current` for active routes. |

## Verification

- [x] Build the current site successfully:
  [Pages run 41187047616](https://github.com/yusaanthya/yusa-CV/actions/runs/41187047616)
  at the audited revision.
- [ ] Recheck current motion behavior in a browser, including reduced-motion
  preferences. The old `AnimateIn` behavior is no longer the validation target.
- [ ] Recheck light/dark readability and contrast for the current palette. The
  [design notes](./site-redesign.md) retain earlier measurements; this source
  audit does not constitute a new visual or accessibility test.

There is no remaining implementation task to add amber tokens or recreate
`AnimateIn`. The two manual checks remain unverified in this audit.
