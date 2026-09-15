# Vertical 07: Regex backtracking

Status: approved

## What it teaches

`^(a+)+$` can divide the same run of `a` characters between the inner and
outer `+` in many ways. When a trailing `X` makes the match fail, a backtracking
engine tries those divisions again before it rejects the string.

Adding one `a` roughly doubles the retry time. On this machine, Node took about
2 seconds at 29 `a` characters and 4 seconds at 30. Rewriting the pattern as
`^a+$` accepts the same strings and rejects the test input in linear time.

## Why the first implementation was replaced

The first cut opened on a binary tree and moved from that tree into a measured
curve. Both were accurate. Neither showed what one retry did, so a viewer had
to know backtracking before the reel explained backtracking.

The new cut keeps one input on screen and shows four concrete groupings fail at
`X`. The measured doubling comes after the mechanism. The rewrite then acts on
the same pattern and collapses the failed groupings into one linear scan.

## Format

Fifteen seconds, three shots, 29 words. No hook card. Frame zero carries the
headline, the pattern, the input, and the first attempt already moving.

The final 0.9 seconds rebuild that opening state. The last frame matches frame
zero and the audio is silent across the boundary, so platform replay reads as
continued motion instead of a restart.

The Go and Rust capability note no longer appears in the reel. It is correct,
but it starts a second lesson at the moment this lesson should finish. The
source stays in `sources.md` for a caption or pinned comment.
