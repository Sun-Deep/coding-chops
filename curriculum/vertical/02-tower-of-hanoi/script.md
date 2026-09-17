# Script

Status: published

The understanding check is complete. The composition, the cover, the copy,
the mix and the measurement run are finished, and the full render has been
watched end to end.

There is no voiceover and no music. The narration is burned into the frame.

## Narration

```text
f0    Line 4 moves one plate at a time.
f80   Each call changes the peg arguments.
f154  The active call keeps changing depth.
f228  Line 3 solves the smaller left tower.
f287  Line 4 reaches the largest plate.
f333  Line 5 rebuilds on the target.
f407  Only line 4 changes the towers.
f481  Every call repeats the same three steps.
f618  Four plates. Fifteen moves.            [payoff]
f682  One more plate.                        [payoff]
      Twice the work, plus one.
```

## Persistent visual

```text
TOP HALF
MOVE 1 OF 15
[three pegs and four 2.5D weight plates]

BOTTOM HALF
1  function hanoi(n, from, to, spare) {
2    if (n === 0) return;
3    hanoi(n - 1, from, spare, to);
4    move(n, from, to);
5    hanoi(n - 1, spare, to, from);
6  }

depth 4 · hanoi(1, A, B, C)
L4 · move disk 1 · A -> B
```

The active code line and moving plate share the orange execution signal. The
base case, left recursion, move and right recursion each state their job in the
trace line under the code.

At frame 0, disk one is already lifting and line 4 is active. There is no hook
card.
