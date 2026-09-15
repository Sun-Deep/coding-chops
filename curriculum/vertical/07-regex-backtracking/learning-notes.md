# Learning notes

What had to be understood before anything was drawn.

## Why the nesting is the bug

`^(a+)+$` and `^a+$` accept exactly the same language. Every string they match,
they both match. The difference only shows on strings they reject.

The outer `+` in `(a+)+` can split a run of a's between its iterations in many
ways. Two iterations of `a+` over five a's is `aaaa|a`, `aaa|aa`, `aa|aaa` or
`a|aaaa`. Add the third iteration and the fourth, and the number of distinct
splits of n a's into one or more non-empty groups is 2^(n-1).

For a string that matches, the engine finds one arrangement and stops, so the
cost is invisible. For a string that cannot match, there is nothing to find, and
a backtracking engine keeps trying arrangements until it has exhausted all of
them before it reports failure. Every one of those 2^(n-1) splits gets tried.

That is the doubling. Adding one character doubles the number of arrangements,
so it doubles the time. Measured ratio across n=20 to n=30 is 2.01.

`^a+$` has one quantifier and therefore one way to consume the run, so it
rejects in a single pass over the string. Measured at 0.0002 ms flat, with no
growth from n=20 to n=30.

## Why the trailing X matters

The `X` is what makes the string unmatchable. Without it, both patterns match
immediately and both are fast, which is why this bug ships: it passes every
test written with valid input and only fires on input that fails.

That is worth one line of narration if it fits. It is the reason the bug is
usually found in production rather than in review.

## Why two engines

One engine blowing up is a quirk of that engine. Node and Python share no code
and both double at the same rate, which makes it a property of backtracking
rather than of V8.

Python is roughly five times slower in absolute terms at every n. That gap is
interpreter overhead per backtracking step and carries no lesson, so it does not
go on screen as a comparison. Python is on screen only because 19.9 seconds is
a figure a person can feel and 4.2 is not.

## What the linear-time engines actually buy

Go's `regexp` and Rust's `regex` are not backtracking engines. They simulate the
automaton and run in time linear in the length of the input times the size of
the pattern, so no input can make them blow up.

They pay for it by not supporting backreferences or lookaround. Those features
are what make a pattern language stronger than a regular language, and they are
also what forces a backtracking implementation. The guarantee and the features
are the same trade seen from two sides, which is the cut's closing line.

Neither was measured, because neither runtime is installed on this machine. They
appear on the last frame as a named property with a citation in `sources.md`,
not as a number. If a figure for them is ever wanted, install the toolchain and
measure it rather than quoting a benchmark.

## The first-call artifact in the data

At n=20 the linear pattern reads 0.0136 ms and at every n after it reads 0.0002.
That first value is JIT warm-up on the first call in the process, not a property
of n=20. It is left in the committed output rather than trimmed, because
discarding the inconvenient sample is how a measurement becomes a story. It is
not used on screen.
