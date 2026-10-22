# Learning notes

## What bisect is doing

You know one commit that works and one that does not. Somewhere between
them is the first commit where the test fails. Git checks out the commit
in the middle and you test it. If it works, the bug came in later, so
everything before it is ruled out; if it fails, the bug is already there,
so everything after it is ruled out. Either way half the suspects go.

## Why 10

Halving 999 suspects: 499, 249, 124, 62, 30, 15, 7, 3, 1, 0. That is ten
tests, because 2 to the 10 is 1,024, the first power of two above 999. A
million commits would take 20.

## The catch

It needs a test that can tell good from bad on any old commit, and every
check is a fresh checkout, often a fresh build. If the test is flaky the
search goes wrong half way and lands on an innocent commit. A commit that
cannot be tested at all can be skipped (exit 125 under `bisect run`).

## Merges

With merge commits git picks the commit that best splits the remaining
graph, not the middle of a line, so a search can take more checks than log2 of
the count.
