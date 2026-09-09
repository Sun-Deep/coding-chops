# Script

Status: approved

The understanding check is complete. The composition, the cover, the copy,
the mix and the measurement run are finished, and the full render has been
watched end to end.

No voiceover and no music. The narration is burned into the frame and the sound
effects are the whole audio track. Frames are in
`src/vertical/03-rate-limiting/narration.tsx`; the cue map is in
`storyboard.md`.

## Narration

Nine lines, 47 words, twenty-three seconds. Payoff lines are marked.

Every line opens at least four frames after its shot starts and closes at least
six before it ends, checked against `beats.ts`.

```text
f2    A limit of 100 requests a minute.
f68   Fixed window resets on the clock.
f138  200 through. Nothing rejected.                    [payoff]

f192  A sliding window never resets.
f256  Exact, and 1,208 bytes                            [payoff]
      per user.

f360  A token bucket refills as it drains.
f420  103 through. 64 bytes.                            [payoff]

f510  One of these is not a rate limit.                 [payoff]

f606  Exact costs memory.                               [payoff]
      Cheap costs correctness.
```

## On screen

```text
FIXED WINDOW · LIMIT 100 A MINUTE
00:59.0 -> 01:00.9
100 / 100  ->  0 / 100  ->  100 / 100
COUNTER RESET
WINDOW 00:00 TO 00:59  ->  WINDOW 01:00 TO 01:59
LET THROUGH 200        REJECTED 0
the counter reset on the clock, not on the client

SLIDING WINDOW LOG · EVERY TIMESTAMP KEPT
00:59.0 -> 01:00.9
100 / 100, and it stays there
CLOCK ROLLED OVER · COUNTER DID NOT
[the log, 100 cells, full]
LET THROUGH 100        REJECTED 100
1,208 bytes per user · 115.2 mb at 100,000 users

TOKEN BUCKET · TWO NUMBERS
REFILLS AT 100 A MINUTE
[the tank, draining to nothing]
429
0 TOKENS LEFT
LET THROUGH 103        REJECTED 97
64 bytes per user · the burst is on purpose

SAME ATTACK · SAME LIMIT
                      through   bytes/user
Fixed window              200           48
Sliding window log        100        1,208
Token bucket              103           64

2× the limit
node 22 · deterministic simulation · heap measured over 100,000 users

Fixed window is two limits with a seam.
an exact limit costs 25× the memory · 115.2 mb against 4.6 mb at 100,000 users
[Coding Chops lockup]
```

## Copy notes

There is no title card. The limit is in the shot label and again as the
counter's denominator, which states the rule more clearly than a sentence about
it and does not cost two seconds of a still frame.

The end card is the tradeoff rather than the winner. A cut that stops at "fixed
window is broken" sends people to the sliding window log, and they find out
about the 115 MB in production.

No em dashes, per the channel writing rules.
