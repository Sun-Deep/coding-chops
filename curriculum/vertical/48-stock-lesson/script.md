# Script

Status: blocked

The first voiced vertical cut. The creator reads it, and the recording is
the timing: every shot is cut to the stems, not the other way round. The
same words are burned into the frame from the transcription, so the cut
still works muted.

Written in full, connected sentences, the way the creator explains things,
after two drafts were turned down: the first read like notes, the second
like ad copy, short fragments such as "Easy. Know the future." The hook is
built on the creator's own line, buy low and sell high but how would you
know when, and it stays honest because the cut looks back at prices that
are already known rather than promising a way to trade.

The creator may say it in their own words instead. The captions come from
the transcription, so what is said is what is shown, and this file is
updated to match the recording. Only the facts below have to stay exact.

Recorded on 24 October 2026 as six stems, `audio/master/stem-0N-enhanced-v2.wav`.
The text below is what was said, from the transcription with the
corrections in `audio/caption-corrections.json`; the reel runs 100.4
seconds.

## Facts that must stay exact

- The prices: 7, 1, 5, 3, 6, 4. The answer: buy at 1, sell at 6, profit 5.
- Every pair: 15 checks for six days, about five billion for a hundred
  thousand.
- The complexity: every pair is O(n²) time; one pass is O(n) time and O(1)
  extra space, because it keeps two numbers whatever the length.

## stem-01: the hook

Everyone says, buy when the price is low and sell when it's high. But how would you actually know which day is the lowest and which day is the highest? Let's say we already have a stock's prices for six days and we want to find the best day to buy and the best day to sell.

## stem-02: the obvious way

The first idea is to take the lowest price and the highest price. But here, the highest comes before the lowest, and you cannot sell before you buy. So the safe way is to compare every day with every day that comes after it. With six days, that's only 15 checks, but with 100,000 days, it's 5 billion.

## stem-03: the trick

But think about it this way, if you sell on a certain day, the best day to have bought is just the cheapest day before it. So we only need to remember the cheapest price we have seen so far.

## stem-04: the walk

So let's go day by day, seven is the cheapest so far, then one is even cheaper. So we remember one, selling at five would make four, at three only two, at six we would make five, which is our new best. And at four only three, so the most we can make is $5.

## stem-05: time and space

In terms of time complexity, checking every pair is O(n²). Because for every day, we look at all the days after it. But this way is O(n), since we go through the prices only once. And for space, it's O(1), because no matter how many prices there are, we only keep two numbers, the cheapest price and the best profit.

## stem-06: what to keep

So whenever you are stuck on a problem like this, ask yourself what you actually need to remember. Keep only that and let go of the rest.

## On screen

```text
headline   Buy low, sell high. / But which day?  The problem name,
           Best Time to Buy and Sell Stock, as the label
code       stems 1 to 3: the six prices as an array; stem 2: the nested
           loop with a pair counter; stems 4 and 5: the one-pass loop, the
           running line lit, minPrice and maxProfit beside it; stem 5:
           O(n²) beside the nested loop, O(n) and O(1) beside the one pass
scene      six price pillars at eye level, 7 1 5 3 6 4, rendered in
           Blender, and a walker who carries the cheapest price as a lit
           line; see storyboard.md
captions   the spoken words, from the transcription, one phrase at a time
numbers    15 and 4,999,950,000 checks, from measurements.ts
```

## Where the numbers come from

Every number spoken or shown is in `src/vertical/48-stock-lesson/measurements.ts`,
from `scripts/measure-stock.mjs`. "Five billion" is 4,999,950,000 pairs,
n(n-1)/2 for n = 100,000. The run also times both ways (about 2.65 s against
0.07 ms on an Apple M5 Pro); the creator cut that line for complexity, so
the times are recorded but not on screen.
