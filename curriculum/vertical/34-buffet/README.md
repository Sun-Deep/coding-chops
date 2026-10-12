# Vertical 34: should you skip ahead in a buffet line

Status: built for review, not posted

Two identical buffets run from the first frame. The same 60 people arrive in
the same order, wanting the same food and taking the same time to serve it.
Above, nobody passes. Below, people bypass unwanted dishes and queue only
at a dish they want. A slow person at salad makes the dessert-only diner
wait above and lets them walk past below.

Across 100 simulated crowds, average arrival-to-filled-plate time falls
from 139.18 to 51.35 seconds, a ratio of 2.71. About 3.43% take longer under
skipping. Those people lose 10.38 seconds on average. These are model
results, not observations from a restaurant.

The race stays on screen for all 14 seconds. The top has a crowd at the
counter while the bottom keeps clearing. Orange marks slow diners and the
people blocked behind them. The final narration names head-of-line blocking.

The creator's rough run used different assumptions and reported about
3 minutes versus 1 minute, with 10 to 19% worse off. Its code was not
supplied. This cut uses its own recorded run and does not claim to reproduce
that fairness percentage or a fixed speedup at every crowd level.
