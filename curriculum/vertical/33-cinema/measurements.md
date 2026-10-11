# Measurements

`node --experimental-strip-types scripts/measure-cinema.mjs`, run twice on
2026-10-11, identical output both times. It imports the reel's own
`simulation.ts`. Seeded: Apple M5 Pro, macOS 26.5.1, Node 22.14.0.

```text
6 rows of 10 seats; groups of 1 to 4 people in shares 20%, 45%, 15%, 20%

seed 1, the group the reel follows: #16, the first group of four that cannot sit together when people keep a gap; 16 groups before it
  spread free seats 23, longest free run 3; together: false; seats row 4 seat 4, row 4 seat 7, row 3 seat 4, row 3 seat 7
         at the full house, 24 groups of 57 people: groups split #16 of 4, #19 of 4, #23 of 2; people beside a stranger 36
  pack   free seats 23, longest free run 10; together: true; seats row 6 seat 1, row 6 seat 2, row 6 seat 3, row 6 seat 4
         at the full house, 24 groups of 57 people: groups split none; people beside a stranger 33
  spread at the full house, front row first:
    22.4444333
    4444224122
    333Y22Y333
    422Y22Y224
    2214224444
    .2222221.1
  pack at the full house, front row first:
    4444222222
    4444444422
    2222444422
    2222222222
    3333331111
    YYYY333...

200 full houses each, groups arriving until the next would not fit, spread -> pack
defaults                       seats free when the first group is split 18.6 -> 0.7; groups split 4.64 -> 0.20; people beside a stranger 42.0 -> 36.5
50% keep a gap                 seats free when the first group is split 13.8 -> 0.7; groups split 2.85 -> 0.20; people beside a stranger 41.2 -> 36.5
75% keep a gap                 seats free when the first group is split 15.6 -> 0.7; groups split 3.67 -> 0.20; people beside a stranger 41.5 -> 36.5
more pairs                     seats free when the first group is split 17.8 -> 0.8; groups split 5.70 -> 0.24; people beside a stranger 44.3 -> 38.3
more people alone              seats free when the first group is split 19.0 -> 0.3; groups split 5.05 -> 0.09; people beside a stranger 44.4 -> 38.9
more groups of four            seats free when the first group is split 20.8 -> 1.3; groups split 3.97 -> 0.31; people beside a stranger 38.6 -> 31.3
8 rows of 14 seats             seats free when the first group is split 35.4 -> 0.5; groups split 9.54 -> 0.14; people beside a stranger 84.1 -> 73.7
```

## What the reel uses

- The followed group, #16: 23 seats free in both rooms as it arrives; the
  longest free run 3 where people keep a gap, 10 where they pack. It splits
  up in the first and sits together in the second.
- The full house in seed 1, 24 groups of 57 people: three groups split up
  where people keep a gap (the four friends, a later four and a pair), none
  where they pack; 36 people beside a stranger against 33.
- The free count, the longest gap and the groups split above each room are
  read live off the same run.
