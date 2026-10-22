# Vertical 43: git bisect

Status: built, not posted

## What it claims

A repository of 1,000 commits. v1.0, the first commit, works; HEAD does
not: a $50 order no longer ships free. `git bisect run node test.mjs`
finds the commit that broke it in 10 checks, each one a checkout and one
run of the test. Testing back from HEAD one commit at a time would have
taken 362 checks this time, and up to 998. Bisect needs at most 10 for any
of the 999 places the bug could be, and 9.97 on average.

The commit it names changed `total >= 50` to `total > 50`, and the reel
ends on that line.

## Why this topic

The page's biggest reels are Git (10 Git commands, 2.4M) and a big search
collapsing (Dijkstra against A\* on a real map, 1.6M), and coding reels
bring 8 follows per 1,000 viewers against 0.8 for the everyday
simulations. This is both shapes at once: Git, and 1,000 suspects
collapsing to one. Bisect is a tool most developers have heard of and
never used, so the open lock is there: everyone has hunted a regression
by hand.

## Scope and honesty

Nothing is timed. A real test suite takes seconds to minutes per check,
which is the whole reason the count matters, but this one takes
milliseconds, so the reel counts checks rather than claiming a time.

One at a time is counted by the rule the run used: test back from HEAD
until a commit passes, stopping at v1.0, which is known good. For the
worst case that is 998. Bisect was run for real for all 999 possible bad
commits: 974 needed 10 checks and 25 needed 9.

The history is linear. With merges git bisect still works, but the
counts are not this tidy.

## Files

- `src/vertical/43-git-bisect/`: the transcript, the overlays and the reel
- `scripts/measure-git-bisect.mjs`: the committed run
- `scripts/blender/bisect/`: the field of commits and the render
