# Learning notes

A guess partitions the answer list by the feedback it would produce. Answers
with identical feedback remain indistinguishable after that guess.

For an outcome containing b answers, its probability is b / N under the equal
weight assumption. That outcome leaves b compatible answers. The expected
remaining count is therefore the sum of b squared divided by N. Averaging the
sizes of the nonempty buckets without weighting them would be wrong.

An all-correct result contains one known answer. This benchmark counts that
singleton as one remaining possibility, even though the game has finished.

Compute exact matches first. They consume letters before present-but-misplaced
matches. A repeated letter cannot use the same occurrence twice.

ROATE minimizes this one-step mean over all allowed guesses in this fixture.
RAISE is the best guess when restricted to words that can be answers. Neither
statement proves a complete optimal strategy or a guarantee for any one day.

The moving tickets replay sampled outcomes from the real test. The running mean
uses every target processed through that point. Each ticket gives the number of
compatible answers in the full list for that target's feedback. Playback speed
is editorial and is not a benchmark of runtime.
