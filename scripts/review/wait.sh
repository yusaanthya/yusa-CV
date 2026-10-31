#!/usr/bin/env bash
# Read-only handoff for an active Claude session. Requires gh, git, node.
set -euo pipefail
pr="$1"
[[ "$pr" =~ ^[0-9]+$ ]] || { echo "Usage: bash scripts/review/wait.sh PR_NUMBER" >&2; exit 1; }
repo="$(gh repo view --json nameWithOwner --jq .nameWithOwner)"
sha="$(gh pr view "$pr" --repo "$repo" --json headRefOid --jq .headRefOid)"
[[ "$(git rev-parse HEAD)" == "$sha" ]] || { echo "Checkout the PR head first." >&2; exit 1; }
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
for ((attempt=0; attempt<120; attempt++)); do
  current="$(gh pr view "$pr" --repo "$repo" --json headRefOid --jq .headRefOid)"
  [[ "$current" == "$sha" ]] || { echo "PR changed; restart the wait." >&2; exit 1; }
  run="$(gh run list --repo "$repo" --workflow pr-review.yml --event pull_request --commit "$sha" --limit 1 --json databaseId,status --jq '.[0] // {}')"
  id="$(node -e 'console.log(JSON.parse(process.argv[1]).databaseId || "")' "$run")"
  status="$(node -e 'console.log(JSON.parse(process.argv[1]).status || "")' "$run")"
  if [[ "$status" == completed ]]; then
    gh run download "$id" --repo "$repo" --name "codex-review-$sha" --dir "$tmp"
    # Exit 0 = review pass (NOT permission to merge), 2 = findings, 1 = error.
    node scripts/review/result.cjs "$tmp/result.json" "$sha"
    exit 0
  fi
  sleep 10
done
echo "Timed out waiting for review; do not infer approval." >&2
exit 1
