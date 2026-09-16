# Measurements

```bash
node scripts/measure-text-search.mjs
SWEEP=1 node scripts/measure-text-search.mjs
```

## The machine

```text
Apple M5 Pro, macOS 26.5.1, node v22.14.0
```

Nothing here is timed, so the machine does not affect a figure. It is recorded
because the run should be repeatable, not because the hardware matters.

## The fixture

A 2,400 character page, 80 columns by 30 rows, built word by word from a closed
vocabulary with a pinned generator, seed 20260916. The phrase `the machine` is
planted at three fixed fractions of the text, so the number of occurrences is a
property of the fixture rather than of the shuffle.

It is a fixture, not a sample of English. What it has to have is the letter
frequencies and word lengths of prose, and it is generated rather than quoted so
that it is reproducible forever and carries no provenance question.

Unlike the maze in VR10, this fixture is not at the dramatic end of its range.
Boyer-Moore reads 15.5 per cent of this page against a median of 15.9 across a
hundred. The number on screen is the ordinary case.

## What is counted

Two figures, and only one of them reaches a frame.

A **read** is one access to a character of the text. Comparing it against a
character of the pattern is a read, rolling a hash over it is a read, and
looking at the character just past the window to decide how far to jump is a
read. Touching the same position twice counts twice.

**Looked at** is the number of distinct positions the matcher ever touched.

Every number in the reel is `looked at`, because that is exactly the set of
cells a panel lights up: the figure and the picture are the same fact and
cannot contradict each other. An earlier cut of the verdict put a straight
scan's 2,705 reads next to Boyer-Moore's 371 looked-at and was comparing two
different things.

## The run

| Matcher     | Reads | Looked at | Never read |
| ----------- | ----- | --------- | ---------- |
| Naive       | 2,705 | 2,390     | 10         |
| KMP         | 2,400 | 2,400     | 0          |
| Rabin-Karp  | 4,822 | 2,400     | 0          |
| Horspool    | 397   | 389       | 2,011      |
| Boyer-Moore | 376   | 371       | 2,029      |
| Sunday      | 702   | 649       | 1,751      |

All six return the same three positions, which is asserted against the answer
found by the dullest possible scan of the text.

Rabin-Karp's 4,822 is the textbook rolling form, which reads the outgoing
character as well as the incoming one on every shift. An implementation that
keeps the outgoing character from when it entered the window would do about
2,411. It is reported here rather than in the reel for that reason: the figure
depends on a choice, and nothing on screen should.

## The sweep

100 fresh pages, one per seed, every matcher checked against each page's own
occurrences:

```text
share of the text Boyer-Moore reads: min 14.7%, median 15.9%, max 17.5%
naive reads against Boyer-Moore:     min 6.2x, median 6.9x, max 7.6x
```

## How it is kept honest

The script asserts all six sets of counts and that every matcher returns exactly
the occurrences the text contains. The sweep re-runs the correctness check on
all 100 pages.

`src/vertical/11-text-search/search.ts` runs its own copy of the page and the
six matchers and asserts the totals against `measurements.ts` at module load, so
a port that drifted from the script cannot reach a render.
