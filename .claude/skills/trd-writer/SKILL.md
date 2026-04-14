---
name: trd-writer
description: This skill should be used when the user wants to plan a new page, redesign a section, add a new feature, or discuss the structure and layout of the portfolio, CV, or blog pages in this Next.js project.
---

# TRD Writer — yusa-CV Project

Guide the user through planning frontend page and feature work for this Next.js portfolio site. Keep documents lean — this is a personal project, not a team codebase.

## Project Context

- **Stack:** Next.js 14, TypeScript, Tailwind CSS, Framer Motion
- **Main pages being built:** Portfolio, CV, Blog (tech docs)
- **Content:** Markdown files in `content/`, parsed via gray-matter
- **Docs location:** `docs/<page-or-feature>/`

## Module Categories

| Directory | Covers |
|-----------|--------|
| `docs/portfolio/` | Portfolio page, project cards, filtering |
| `docs/cv/` | CV page, timeline, skills section |
| `docs/blog/` | Blog listing, article page, MDX rendering |
| `docs/shared/` | Layout, navigation, shared components |

## Mode Selection

| Size | Criteria | Output |
|------|----------|--------|
| **Quick** | Tweak layout, add a section, small component | `proposal.md` + `tasks.md` |
| **Full** | New page, major redesign, new content type | proposal + tasks + page-structure |

## Interactive Flow

### Phase 0: Scan (automatic)

Glob `docs/` for related existing documents. Read `app/` and `features/` to understand current structure before proposing anything new.

### Phase 1: Requirements

Ask only what isn't already clear from context:

1. What page or feature? What's the goal?
2. Scope — new page, new section, or rework of existing?
3. Any reference designs or inspiration?
4. Does it affect the content schema in `content/`?

Confirm Quick or Full mode based on scope.

### Phase 2: Proposal (`proposal.md`)

```markdown
# [Feature Name] — Proposal

> **Created:** YYYY-MM-DD
> **Status:** Draft

## Goal
[What this achieves and why]

## Scope
[What changes, what stays the same]

## Acceptance Criteria
- [ ] ...
- [ ] ...

## Related Docs
- [Tasks](./tasks.md)
- [Page Structure](./page-structure.md)  ← Full mode only
```

> **Quick mode:** after Phase 2, go directly to Phase 4 (tasks).

### Phase 3: Page / Component Structure (Full mode only)

Produce `page-structure.md` covering:

- Page URL and file path (`app/portfolio/page.tsx`, etc.)
- Component breakdown (which components, where they live under `features/` or `app/`)
- Data flow — what props, what comes from `content/`, what's static
- Responsive behavior notes
- Animation notes if Framer Motion is involved

### Phase 4: Tasks (`tasks.md`)

```markdown
# [Feature Name] — Tasks

> **Proposal:** [link](./proposal.md)
> **Created:** YYYY-MM-DD

## Overview

| # | Task | File | Done |
|---|------|------|------|
| 1 | ... | `app/...` | ☐ |

## Detailed Tasks

### 1. [Task]
- **File:** `features/.../Component.tsx`
- **Description:** ...
- [ ] sub-step
```

Order tasks: content schema → data layer → shared components → page layout → interactions/animations → responsive pass.

## Style Notes

- Document language: match existing project docs (English or 中文, your call)
- No DB schema, no API spec — this is a frontend-only project
- If a change touches `content/` markdown structure, note the schema change in the proposal
