# Learning notes

The full notes are the episode's:
`curriculum/problem-solving/01-best-time-to-buy-and-sell-stock/learning-notes.md`.
This cut teaches the same move in under a minute, so it keeps three ideas
and drops the rest.

## Kept

- The rule that makes it a problem: sell after you buy, which is why
  subtracting the lowest price from the highest fails here.
- The waste in every pair: for a fixed sell day, every earlier price except
  the cheapest loses to the cheapest, so checking them is repeated work.
- The move: carry only what you would need to answer right now. Here that
  is the cheapest price so far and the best profit so far.

## Dropped, and why

- The edge cases (falling prices, one day). They are in the episode; here
  they would cost about ten seconds each.
- The measured times. The creator chose time and space complexity for
  that slot instead, by name: O(n²) for every pair, O(n) time and O(1)
  space for the one pass. The times stay in the measurement run.

## Simplifications

- "Five billion" is 4,999,950,000, rounded in speech and exact on screen.
- O(1) means extra space: the input itself is still n prices.
