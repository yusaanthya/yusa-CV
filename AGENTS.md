# Repository guidance

Before each task, read `~/.claude/CLAUDE.md` in full as the canonical shared
harness instructions. Resolve `~` to the current user's home directory. If the
file cannot be read, report that missing instruction source. Keep shared policy
there rather than duplicating it here. Shared harness rules in that file take
precedence; the repository rules below are additive.

## Article ownership and publishing

- `blog-post` is the editable source for new and migrated articles. Make article
  text, metadata, image, and withdrawal changes there on a feature branch.
- `yusa-CV` owns site code and renders published snapshots. Do not hand-edit
  synchronized article copies here, create a second editable copy, or implement
  reverse synchronization. Correct the source and regenerate the snapshot.
- Publishing originates in the private source repository, from committed `main`
  and only articles explicitly marked `published: true`. Export only approved
  articles and their required public assets; never export draft/planning files,
  credentials, or private source history.
- This public repository must not hold credentials that can read the private
  source, including in Actions secrets, or check out private source content in
  its workflows. Cross-repository publishing credentials belong in the private
  source repository and should be scoped to the public destination.
- The website reads articles only from the generated snapshot. The legacy
  `content/posts/` reader was retired on 2026-11-12 after all local articles
  were migrated; do not add local articles here. See
  [docs/blog/content-sync.md](docs/blog/content-sync.md).

Read [the publishing skill](.claude/skills/publish-post/SKILL.md) for article
preparation, and the content-sync document for the snapshot contract.
Written ownership rules do not imply the automation has been implemented or
activated; verify that separately. These rules do not authorize a push, merge,
credential change, or live publication beyond the user's request.

## CV ownership

- `career-prep` owns the CV's story selection, order, and wording. The website
  CV follows the "Public website" row and "Output boundaries" of its
  `resume/selection.md`: each story's default bullet in `resume/bullet-bank.md`
  unless that row names an alternative. Never use a private-submission version
  on this public site.
- Change selection, order, or wording in `career-prep` first, then copy the
  result into `content/cv/yusa-liu.md`. This repository owns presentation and
  the website-only content listed in
  [the design notes](docs/shared/site-redesign.md#cv-content).
- When a figure quoted on the home page changes, update
  `features/projects/projects.ts` in the same pull request.
- After changing the bank, the selection, or `content/cv/yusa-liu.md`, run the
  drift check from `career-prep` (`npm --prefix resume/cv run check:website`).
  It compares the Experience and Projects bullets here with the selected bank
  bullets; it does not check other text on the page.
