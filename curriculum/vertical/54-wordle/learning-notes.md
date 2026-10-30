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

## The replay

The hidden answer is TRACE, taken from the historical list. ADIEU produces
10010, using absent = 0, present elsewhere = 1 and correct place = 2. That
feedback group contains 187 answers. ROATE produces 10212, a group of three:
STARE, TRACE and TRADE. TRACE then produces 22222.

The keyboard starts fresh for the alternate opening. A later yellow cannot
downgrade a known green. A gray duplicate cannot erase another occurrence's
green or yellow status. This replay contains no repeated-letter guess, but the
scorer checks those cases.

The example is selected to show elimination. It is not the evidence for the
average claim. The complete benchmark, checked by two scorers and repeated an
hour later, supplies the means. Never imply that the opener guarantees the
number shown for this particular puzzle on every day.
