# Wordle's best first guess

VR54 is a fourteen-second, silent 1080 x 1920 reel at 30 fps. It compares
ADIEU with the opener that minimizes average answers remaining after one guess.

The benchmark uses the 2022 list frozen in 3Blue1Brown's repository. It tests
all 12,972 allowed guesses against all 2,309 answers, with equal weight per
answer. This is not a claim about today's edited NYT answer pool.

ROATE wins this metric. It is an allowed guess but is absent from this answer
list, so it cannot solve a puzzle immediately on this fixture. RAISE is the
best opener restricted to words on the answer list.

The reel does not teach entropy, optimize a complete solving policy, or claim
that the best first partition produces the fewest guesses to finish.

Status: review render. The creator's understanding check and phone review remain
open. Generated renders live under `out/vertical/` and stay out of Git.
