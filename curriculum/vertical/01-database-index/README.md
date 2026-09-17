# Vertical 01: How a database index actually works

Status: published

Both gates are passed. The understanding check is complete, and the finished
render was watched from beginning to end.

## What it claims

The same query against the same ten million rows reads all of them without an
index and four pages with one, and the index is paid for on every write.

## Why this topic

The channel's most-watched cuts are a large search space collapsing (Dijkstra
against A star) and a reference somebody wants to keep (the git command sets).
An index lookup is the first of those with a real mechanism behind it, and it
has not been covered. Nothing in the back catalogue explains a b-tree, and
almost every backend developer has been told to add an index without being
shown what one does.

## Scope

It teaches: what a sequential scan costs, that a b-tree lookup narrows the
candidate set one page read at a time, how many page reads that takes at ten
million rows, and that an index makes writes slower and the table bigger.

It does not teach: composite indexes, index-only scans and covering indexes,
partial indexes, when the planner ignores an index, other index types, or
`VACUUM`.

Index-only scans were the strongest thing left out. They are a third lane and a
better payoff than the two-lane comparison, and there is no room for them in
thirty seconds without losing the descent. They are the obvious follow-up cut.

## Files

- `learning-notes.md`: what had to be understood before the shots could be drawn
- `sources.md`: the documentation the mechanism was checked against
- `understanding-check.md`: the creator comprehension gate
- `measurements.md`: the full run, with the SQL and the raw `EXPLAIN` output
- `script.md`: the on-screen copy, in order
- `storyboard.md`: the shot plan
- `publishing.md`: the caption, the hashtags and the title

## Compositions

```text
VR01-Database-Index   1080x1920, 810 frames, 30 fps, 27 seconds
VR01-Cover            1080x1920 still
```

```bash
npm run render:reel
```
