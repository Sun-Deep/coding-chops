# Learning notes

## The one idea

The host's door tells you nothing about your door, which was a 1 in 3
guess and stays one. All of the other 2 in 3 now sits behind the one door
he left shut. Switching wins whenever your first pick was wrong, and it
is wrong 2 times in 3.

## In the loop

`other = 3 - pick - opened` is the door left: the three doors are 0, 1
and 2, which add to 3. `stick += car == pick` and `switch += car == other`
score every game both ways, so the two strategies see the same cars.

## Why not exactly 3,333

10,000 random games scatter around the true third; 3,272 is about 1.3
standard deviations from 3,333.3 (the standard deviation is about 47),
which is ordinary. The exact answer is in the script's output.

## The host matters

If the host opened one of the other doors at random, he would sometimes
show the car. In the games where he happens to show a goat, sticking and
switching then win equally often. The puzzle as usually stated has a host
who knows.
