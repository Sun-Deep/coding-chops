# Script

Status: published

The creator understanding check is not passed. The composition is a review
draft, not a publish-ready cut.

There is no voiceover or music. These lines are burned into the frame.

## Narration

```text
shot 1   These two plus signs create many groupings.
shot 1   X fails, so regex tries another split.       [payoff]

shot 2   Add one a. The retry time doubles.           [payoff]

shot 3   Remove the outer plus.
shot 3   Same result. Linear time.                    [payoff]
```

Twenty-nine words in fifteen seconds.

## On-screen copy

```text
shot 1   WHY THIS REGEX FREEZES
         ^(a+)+$
         THE SAME INPUT
         a a a a a X
         SAME CHARACTERS · NEW SPLIT

shot 2   ONE MORE CHARACTER
         29 a's    2 s
         30 a's    4 s
         2.0× RETRY TIME
         Node 22.14, median of 3 runs

shot 3   REMOVE THE OUTER +
         ^(a+)+$ → ^a+$
         SAME INPUT
         ONE LINEAR SCAN
         0.0002 ms
         same accepted strings, Node 22.14
```

The 2 and 4 second figures are the rounded Node measurements at `n=29` and
`n=30`. Both sessions agree at that precision. The control measurement is
`0.0002 ms` after the first-call warm-up.

The final narration clears before the last 0.9 seconds. That interval rebuilds
frame zero for the loop and carries no new copy.

## Deliberate omission

The old ending said that Go and Rust avoid this blow-up by omitting
backreferences and lookaround. That fact is useful, but it does not explain the
rewrite on screen. The rewrite has no language tradeoff here because `^(a+)+$`
and `^a+$` accept the same strings. The cut now ends on that fact.
