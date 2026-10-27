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
- Legacy local articles remain exceptions until explicitly migrated. Check the
  migration inventory in [docs/blog/content-sync.md](docs/blog/content-sync.md)
  and actual files before editing; do not assume a local article is generated
  or already migrated. Do not migrate or delete legacy content as a side effect
  of another task.
- During an authorized migration, preserve public slugs, original publication
  dates, prose, and working assets/links, and verify the generated replacement
  before retiring its legacy source. Avoid duplicate routes and two editable
  versions.

Read [the publishing skill](.claude/skills/publish-post/SKILL.md) for article
preparation, and the content-sync document for the current implementation status.
Written ownership rules do not imply the automation has been implemented or
activated; verify that separately. These rules do not authorize a push, merge,
credential change, or live publication beyond the user's request.
