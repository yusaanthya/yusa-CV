# Codex review merge gate

Native Codex reviews code; `PR CI` runs lint, types, tests and builds. This
workflow only translates the existing native review into the commit status
**Codex Review Gate**. It does not call a model, use an OpenAI API key, approve
PRs, repair code or merge PRs.

## Policy

- Only the pinned Codex bot account's summary and findings are trusted.
- A completed code review must match the PR's current full head SHA.
- Missing, running or stale reviews remain pending. Invalid data and API errors
  block rather than pass. Security reviews are separate and are not gated here.
- P0/P1 findings on that commit block. Manually resolving a thread is not a
  substitute for a fix: push a new commit and let Codex review it again.
- Recognized P2/P3 findings are advisory. Unknown priorities or summary findings
  that cannot be classified block for inspection, rather than silently pass.
- Findings use `original_commit_id`; GitHub may remap `commit_id` after pushes.
  A fresh clean review supersedes findings from previous commits.
- Review-body P0/P1 and an explicit changes-requested review also block.

The summary adapter uses the observed `codex-review-state:v1` HTML marker.
This is not a guaranteed stable API. Format changes require updating the
adapter and fixtures. No findings and no summary are different states.

## Activation (one-time, after merging this implementation)

1. Keep the existing required `PR CI` rule. Do not require the gate before the
   workflow is available on main, or the bootstrap PR cannot merge.
2. On a small open PR, wait for native review and run **Update Codex Review Gate**
   from Actions on **main**, entering its PR number. This seeds the new status
   for an already-reviewed PR without triggering another model review.
3. In Settings > Rules > Rulesets > Protect main > Require status checks to pass,
   add **Codex Review Gate**, selecting GitHub Actions as the expected source
   when offered. Preserve `PR CI`, strict/up-to-date checks and no bypass actors.
   Require the emitted commit status, NOT the job named **Update review status**.
4. Verify that a new head SHA is blocked until both required checks pass. Confirm
   a bot summary update automatically refreshes the gate. If pull_request_target
   events are blocked by repository Actions policy, enable this trusted workflow's
   event or use manual dispatch to diagnose; missing status must remain blocking.

Before activation the code alone does not enforce merges. This document does
not assert that the repository ruleset has already been changed.

## Events, permissions and recovery

PR open/synchronize/reopen/ready events initialize the status. Bot issue-comment
create/edit/delete events reevaluate it, including the sticky summary updates.
Each run fetches all pages of comments and reviews, reads the current PR, and
writes to its head SHA rather than the default branch SHA of the event.
Evaluations for a PR are serialized and recheck the head before publishing.

The privileged workflow always checks out main, never PR code, installs no
project dependencies and uses only read permissions plus `statuses: write`.
The normal PR CI runs the gate's tests with a read-only token. Do not grant
untrusted workflows permission to forge this status: this is a repository
workflow gate, not isolation from maintainers who can edit trusted workflows.

No event system provides an atomic lock between reading review state and merging.
A new commit has a new required status; a repeated review of the same SHA only
revokes a prior success once its running event is processed. Claude should still
recheck the head and current review before merging, and merge with an expected
head SHA. Do not start another same-SHA review concurrently with a merge.

If an event was missed, use manual dispatch on main with the PR number. It reads
fresh state; it does not use event text as an approval. Errors show in the status
link's run log. Do not change a failed status manually to success.

## Validation

Run `node --test scripts/codex-review-gate.test.mjs` (also in PR CI).
Fixtures cover P0/P1 blocking, P2/P3 advisory, spoofed/malformed/stale summaries,
old remapped findings, API errors and a head change while checking. Hosted event
and ruleset behavior must additionally be verified after merging and activation;
a test fixture is not evidence that branch protection is enabled.
