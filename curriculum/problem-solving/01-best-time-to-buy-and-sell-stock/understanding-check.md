# Understanding check

The creator comprehension gate. `npm run check` fails if `script.md` leaves
`Status: blocked` while anything here is unticked.

Tick a box when you can do the thing without the script in front of you, out
loud, from memory. Somebody else drafting these questions does not move a single
box. That is the entire point of the gate.

## Explain

- [x] State what the problem asks in one sentence, without saying "array"
- [x] Explain why buying before selling is what makes the problem non-trivial
- [x] Explain why the answer is 0 rather than a negative number when every trade loses
- [x] Explain what `minPrice` holds, in plain language, without naming the variable
- [x] Explain what `maxProfit` holds, in plain language, without naming the variable

## Draw

- [x] Draw `[7,1,5,3,6,4]` as a chart from memory and mark the winning trade
- [x] Draw the moment on day 5 that shows three of the four comparisons being wasted
- [x] Walk the one-pass solution across all six days on paper, writing both carried values at each step

## Evaluate

- [x] Count the brute-force pairs for six prices and say why it is `n(n-1)/2`
- [x] Give the pair count at the constraint ceiling of `10^5` prices
- [x] Say why the brute force is `O(n²)` and the one pass is `O(n)`
- [x] Say why the one pass is `O(1)` extra space when the input can be 100,000 long

## Predict a failure

- [x] Say what `max(prices) - min(prices)` returns on `[7,6,4,1,5]` and why it is wrong
- [x] Say what happens if `maxProfit` starts at `-Infinity` instead of `0`, and on which input it shows
- [x] Say what happens if `minPrice` starts at `0`, and what the function then returns
- [x] Explain why swapping the two update lines does NOT break the code, in one or two sentences

## Apply

- [x] Solve `[2,4,1]` and `[3,3,3]` and `[0,4]` in your head and say why each is what it is
- [x] Say what the code does with a one-element array, and why it needs no special case
- [x] State the transferable idea in one sentence, without mentioning stocks
- [x] Name one other problem where the same move works, and say what gets carried forward

## Research gate

These four check the script rather than the creator, so they stay open until
`script.md` exists. `npm run check` will not let the script reach approved while
they are.

- [x] The constraints on screen match the LeetCode statement
- [x] Every number spoken about problem size traces to those constraints
- [x] Simplifications are labelled as simplifications
- [x] Nothing in the script claims the update-order swap is a bug
