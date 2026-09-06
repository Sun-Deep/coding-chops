# Learning notes: Best Time to Buy and Sell Stock

Research questions and the explanation as it settled. Not the script.

## What the problem actually asks

From the LeetCode statement: `prices[i]` is the price of one stock on day `i`.
Choose one day to buy and a later day to sell. Return the largest profit
available, or `0` if no profitable trade exists.

The constraints matter more than they look:

```text
1 <= prices.length <= 10^5
0 <= prices[i]    <= 10^4
```

Three things fall out of them.

A one-element array is legal input, so "there is no later day" is a case the
code has to survive rather than an edge nobody hits.

Prices can be `0`, so nothing can assume a positive price.

And `10^5` is the number the complexity argument has to use. An earlier draft
said 10,000 days gives 50 million pairs. The real ceiling is 100,000 prices,
which is 4,999,950,000 pairs. Five billion, not fifty million.

Both examples in the video are LeetCode's own. `[7,1,5,3,6,4]` gives 5, and
`[7,6,4,3,1]` gives 0.

## Why the ordering rule is the whole problem

Without buy-before-sell, the answer is `max(prices) - min(prices)` and there is
no lesson. The constraint is what makes the naive answer wrong, so it has to
arrive before any attempt at a solution.

The wrong answer a beginner reaches for is exactly that subtraction. On
`[7, 6, 4, 1, 5]` the highest price is 7 and the lowest is 1, giving 6, but the
7 happens on day 1 and the 1 on day 4. That trade needs a time machine.

## Counting the brute force

Every valid pair with `buy < sell`, which is `n(n-1)/2`. For six prices that is 15. Verified by enumeration.

The sweep order is a real decision, not a detail. Two ways to count to 15:

```text
by sell day   1, 3, 6, 10, 15
by buy day    5, 9, 12, 14, 15
```

Settled on the buy-day sweep, so the counter reads 5, 9, 12, 14, 15.

These notes first argued for the sell-day sweep, on the grounds that "if I sell
today, which earlier day should I have bought on" is the exact question the one
pass answers. The Act 2 storyboard found a better route. It sweeps by buy day,
which is how a beginner actually thinks about it, and then regroups the same
paths by sell day in the closing shot. Act 3's inversion becomes a second look
at work already done rather than a new idea arriving.

Whichever sweep is on screen, the counter has to match it. An early draft used
the triangular numbers while showing buy-day examples underneath, which are two
different sweeps.

## The hinge

Freeze on day 5, where the price is `$6`. The four earlier days give:

```text
buy at $7   6 - 7 = -1
buy at $1   6 - 1 =  5
buy at $5   6 - 5 =  1
buy at $3   6 - 3 =  3
```

The sell price is the same in all four. Only the buy price changes, and a
cheaper buy price always wins. So of the four comparisons, three were thrown
away the moment they were made, and the one that mattered was the cheapest
price seen so far.

That is the whole algorithm. Everything before it exists to make it obvious and
everything after it is bookkeeping.

## Compressing the past

Having seen `[7, 1, 5, 3]`, the only thing worth remembering for any future day
is `1`. Not the other three values, not their order, not how many there were.

This is the idea that outlives the problem. Carry forward only what you would
need if you had to answer right now.

## The one pass

```ts
function maxProfit(prices: number[]): number {
  let minPrice = prices[0];
  let maxProfit = 0;

  for (let i = 1; i < prices.length; i++) {
    maxProfit = Math.max(maxProfit, prices[i] - minPrice);
    minPrice = Math.min(minPrice, prices[i]);
  }

  return maxProfit;
}
```

`minPrice` starts at `prices[0]` rather than `Infinity` because on day one the
first price is the only price seen, so it is trivially the cheapest. `Infinity`
also works and is common, but it asks a beginner to hold an extra abstraction
for no gain.

`maxProfit` starts at `0` because nobody is forced to trade. That single line is
where the "return 0" rule lives, and it is worth saying out loud rather than
letting it pass as an initialisation detail.

The loop starts at `i = 1` because day one has already been consumed by the
initialisation.

## The update order is not a bug

Several drafts of this episode had a beat where swapping these two lines breaks
the code:

```ts
minPrice = Math.min(minPrice, prices[i]);
maxProfit = Math.max(maxProfit, prices[i] - minPrice);
```

It does not. Tested against brute force on 200,000 random arrays of length 1 to
8, zero mismatches.

The reason is short. Swapping makes the loop compute
`max(prices[i] - min(prices[0..i]))` where the correct version computes
`max(prices[i] - min(prices[0..i-1]))`. The only terms the swap adds are the
ones where the buy day and the sell day are the same, and those are exactly
zero. `maxProfit` already starts at zero, so adding zero to the max changes
nothing.

The same argument covers starting the loop at `i = 0` instead of `i = 1`. Also
harmless, for the same reason.

Do not teach the swap as a failure. It would be teaching something false, and a
viewer who tests it will find out.

## Failure modes that are real

Two initialisation mistakes do break it.

Starting `maxProfit` at `-Infinity`, or at `prices[1] - prices[0]`, returns a
negative number on a falling market. The problem says return `0`. This one is
worth keeping, because Act 1 already plants "you don't have to trade at all" and
this is the same idea arriving as a bug.

Starting `minPrice` at `0` makes every profit equal to the day's price, so the
function returns the highest price in the array. On `[7,1,5,3,6,4]` it returns
`7`, as though the stock were free.

The third real failure is the one the episode opens with: taking
`max(prices) - min(prices)` and ignoring the order.

## Edge cases

```text
[7,6,4,3,1]   falling all the way        0
[5]           one day, no later day      0
[3,3,3]       flat                       0
[0,4]         a zero price is legal      4
```

The falling case and the one-day case both fall out of `maxProfit = 0` and a
loop that runs zero times. Neither needs a special branch, which is worth
pointing out rather than hiding.

## Complexity

Brute force checks `n(n-1)/2` pairs, which grows with `n²`, so `O(n²)` time and
`O(1)` extra space.

The one pass touches each price once. `O(n)` time. It keeps two numbers no
matter how long the array is, so `O(1)` extra space.

At the constraint ceiling of `10^5` prices that is 5 billion operations against
100,000.

## Deliberately not covered

Kadane's algorithm and the maximum subarray framing, even though the price-delta
array makes them the same problem. Greedy and dynamic programming as
terminology. The multi-transaction variants, 122 and 123 and 188. Floating point
and money representation.

Each of these is interesting and none is needed to solve 121. A beginner should
finish with one clear mental model, not a reading list.

## Settled

The on-screen scale number is the constraint ceiling. Act 2 says a hundred
thousand prices gives five billion pairs, because that is what the problem
allows. Ten thousand prices giving fifty million is correct arithmetic on a
figure nobody chose, and five billion is the harder number anyway.

## Still open

Nothing blocking. Acts 3 to 9 will raise their own questions.
