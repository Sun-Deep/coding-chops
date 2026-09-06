# Sources

What backs the claims this lesson makes on screen. Background reading for the
creator is separated out, because it is not the same thing.

## The problem statement

[Best Time to Buy and Sell Stock, LeetCode 121](https://leetcode.com/problems/best-time-to-buy-and-sell-stock/)

The authority for the problem text, the two examples and the constraints.
Retrieved 26 August 2026. Note that leetcode.com returns 403 to automated
fetches, so it has to be read in a browser.

[The doocs/leetcode mirror of the same problem](https://github.com/doocs/leetcode/blob/main/solution/0100-0199/0121.Best%20Time%20to%20Buy%20and%20Sell%20Stock/README_EN.md)

Used to confirm the statement and constraints without a browser. Checked against
the LeetCode page. It is a community mirror, so LeetCode remains the authority
where the two disagree.

What both give:

```text
1 <= prices.length <= 10^5
0 <= prices[i]    <= 10^4

[7,1,5,3,6,4] -> 5     buy day 2 at 1, sell day 5 at 6
[7,6,4,3,1]   -> 0     no transaction
```

Every number the episode puts on screen about the size of the problem comes from
those constraints. `10^5` prices gives `n(n-1)/2 = 4,999,950,000` pairs.

## Claims verified by computation, not citation

Two things in this lesson are checkable rather than quotable, so they were
checked. The script for both is in `learning-notes.md`.

Swapping the `minPrice` and `maxProfit` updates does not change the result.
Tested against a brute-force oracle on 200,000 random arrays of length 1 to 8.
Zero mismatches. Earlier drafts of this episode taught the swap as a bug, and it
is not one.

The brute force checks exactly `n(n-1)/2` pairs, which is 15 for six prices.
Verified by enumeration.

## Background, not cited on screen

Jon Bentley, "Programming Pearls: Algorithm Design Techniques", Communications
of the ACM 27(9), September 1984. The column that popularised the linear scan
for the maximum subarray problem and credits it to Jay Kadane. Relevant because
the array of day-to-day price changes turns 121 into that problem, which is why
this lesson sets up the next one.

Cormen, Leiserson, Rivest and Stein, Introduction to Algorithms, on the maximum
subarray problem.

Neither appears in the episode. Production rule 8 in the visual-language
contract keeps Kadane's algorithm, greedy and dynamic programming terminology
out of a beginner's first pass at this problem. They are here because the
creator should know where the problem sits, not because the video says so.
