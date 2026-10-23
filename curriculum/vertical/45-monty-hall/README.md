# Vertical 45: Monty Hall, stick or switch

Status: built, not posted

## What it claims

Three doors, a car behind one and goats behind the others. You take
door 1, the host opens a goat door, and you can stick or switch. Played
10,000 times in Python, seeded, sticking won 3,272 and switching won
6,728. Exactly, it is 1/3 against 2/3: switching wins whenever your
first pick was wrong, and a first pick is wrong 2 times in 3.

## Why this topic

The everyday slot in the month plan, with the code on screen. A puzzle
nearly everyone has argued about, settled by running it.

## Scope and honesty

The host knows where the car is and always opens a goat door. When door
1 is the car he has two goats to choose from and picks one at random.
Those are the rules of the puzzle as usually stated; with a host who
opens a door at random, the answer changes, and the reel does not cover
that version.

You always take door 1. By symmetry that is the same as picking at
random, and it keeps the picture readable: in every game YOU is on the
left door.

The first game shown is game 1 of the seeded run; it happens to be a
switch win. The field shows the first 300 games (94 stick wins, 206
switch wins); the tallies count all 10,000.

## Files

- `scripts/measure-monty-hall.py`: the committed run, and the loop on screen
- `src/vertical/45-monty-hall/`: the overlays and the reel
- `scripts/blender/monty/`: the doors, the car, the goats and the render
