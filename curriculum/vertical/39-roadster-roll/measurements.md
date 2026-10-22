# Measurements

`node --experimental-strip-types scripts/measure-roadster-roll.mjs`, run twice on
2026-10-18, identical output both times. It imports the reel's own
`simulation.ts`. Nothing in it is random: Apple M5 Pro, macOS 26.5.1, Node 22.14.0.

```text
A 4.4 x 2 x 1.15 m box lets go upside down with its roof 5 m up, moving 4 m/s. Off: no thrusters. On: it rolls half a turn while falling freely, then thrust underneath of 2 times its weight brakes it to 1 m/s at the ground. The roof crushes 0.2 m as it stops; the suspension gives 0.1 m. On the ramp the fan pulls 2 g. Forces are what an accelerometer in the car reads: 1 g parked, 0 g falling.

Defaults
defaults               off: roof down at 1.01 s, 9.9 m/s (35.7 km/h), 26.0 g as the roof crushes. on: roll done by 0.72 s, braking from 7.0 m/s at 2.0 g, wheels down at 1.33 s, 1.5 g in the suspension; lowest corner 2.5 m up mid-roll; a backflip in the same time takes 3.9x the twist as a box, 4.8x with the weight in the floor

Roof height when it lets go
3 m                    off: roof down at 0.78 s, 7.7 m/s (27.6 km/h), 16.0 g as the roof crushes. on: roll done by 0.56 s, braking from 5.5 m/s at 2.0 g, wheels down at 1.01 s, 1.5 g in the suspension; lowest corner 1.5 m up mid-roll; a backflip in the same time takes 3.9x the twist as a box, 4.8x with the weight in the floor
4 m                    off: roof down at 0.90 s, 8.9 m/s (31.9 km/h), 21.0 g as the roof crushes. on: roll done by 0.64 s, braking from 6.3 m/s at 2.0 g, wheels down at 1.18 s, 1.5 g in the suspension; lowest corner 2.0 m up mid-roll; a backflip in the same time takes 3.9x the twist as a box, 4.8x with the weight in the floor
6 m                    off: roof down at 1.11 s, 10.8 m/s (39.1 km/h), 31.0 g as the roof crushes. on: roll done by 0.79 s, braking from 7.7 m/s at 2.0 g, wheels down at 1.47 s, 1.5 g in the suspension; lowest corner 3.0 m up mid-roll; a backflip in the same time takes 3.9x the twist as a box, 4.8x with the weight in the floor
8 m                    off: roof down at 1.28 s, 12.5 m/s (45.1 km/h), 41.0 g as the roof crushes. on: roll done by 0.91 s, braking from 8.9 m/s at 2.0 g, wheels down at 1.71 s, 1.5 g in the suspension; lowest corner 4.0 m up mid-roll; a backflip in the same time takes 3.9x the twist as a box, 4.8x with the weight in the floor

Thrust underneath, times the car's weight
1.5x                   off: roof down at 1.01 s, 9.9 m/s (35.7 km/h), 26.0 g as the roof crushes. on: roll done by 0.59 s, braking from 5.8 m/s at 1.5 g, wheels down at 1.56 s, 1.5 g in the suspension; lowest corner 3.3 m up mid-roll; a backflip in the same time takes 3.9x the twist as a box, 4.8x with the weight in the floor
3x                     off: roof down at 1.01 s, 9.9 m/s (35.7 km/h), 26.0 g as the roof crushes. on: roll done by 0.83 s, braking from 8.1 m/s at 3.0 g, wheels down at 1.19 s, 1.5 g in the suspension; lowest corner 1.6 m up mid-roll; a backflip in the same time takes 3.9x the twist as a box, 4.8x with the weight in the floor
4x                     off: roof down at 1.01 s, 9.9 m/s (35.7 km/h), 26.0 g as the roof crushes. on: roll done by 0.88 s, braking from 8.6 m/s at 4.0 g, wheels down at 1.13 s, 1.5 g in the suspension; lowest corner 1.2 m up mid-roll; a backflip in the same time takes 3.9x the twist as a box, 4.8x with the weight in the floor

Speed at touchdown
0.5 m/s                off: roof down at 1.01 s, 9.9 m/s (35.7 km/h), 26.0 g as the roof crushes. on: roll done by 0.71 s, braking from 7.0 m/s at 2.0 g, wheels down at 1.38 s, 1.1 g in the suspension; lowest corner 2.5 m up mid-roll; a backflip in the same time takes 3.9x the twist as a box, 4.8x with the weight in the floor
2 m/s                  off: roof down at 1.01 s, 9.9 m/s (35.7 km/h), 26.0 g as the roof crushes. on: roll done by 0.73 s, braking from 7.1 m/s at 2.0 g, wheels down at 1.25 s, 3.0 g in the suspension; lowest corner 2.4 m up mid-roll; a backflip in the same time takes 3.9x the twist as a box, 4.8x with the weight in the floor

Roof crush
0.1 m                  off: roof down at 1.01 s, 9.9 m/s (35.7 km/h), 51.0 g as the roof crushes. on: roll done by 0.72 s, braking from 7.0 m/s at 2.0 g, wheels down at 1.33 s, 1.5 g in the suspension; lowest corner 2.5 m up mid-roll; a backflip in the same time takes 3.9x the twist as a box, 4.8x with the weight in the floor
0.3 m                  off: roof down at 1.01 s, 9.9 m/s (35.7 km/h), 17.7 g as the roof crushes. on: roll done by 0.72 s, braking from 7.0 m/s at 2.0 g, wheels down at 1.33 s, 1.5 g in the suspension; lowest corner 2.5 m up mid-roll; a backflip in the same time takes 3.9x the twist as a box, 4.8x with the weight in the floor
0.5 m                  off: roof down at 1.01 s, 9.9 m/s (35.7 km/h), 11.0 g as the roof crushes. on: roll done by 0.72 s, braking from 7.0 m/s at 2.0 g, wheels down at 1.33 s, 1.5 g in the suspension; lowest corner 2.5 m up mid-roll; a backflip in the same time takes 3.9x the twist as a box, 4.8x with the weight in the floor

Suspension travel
0.05 m                 off: roof down at 1.01 s, 9.9 m/s (35.7 km/h), 26.0 g as the roof crushes. on: roll done by 0.72 s, braking from 7.0 m/s at 2.0 g, wheels down at 1.33 s, 2.0 g in the suspension; lowest corner 2.5 m up mid-roll; a backflip in the same time takes 3.9x the twist as a box, 4.8x with the weight in the floor
0.2 m                  off: roof down at 1.01 s, 9.9 m/s (35.7 km/h), 26.0 g as the roof crushes. on: roll done by 0.72 s, braking from 7.0 m/s at 2.0 g, wheels down at 1.33 s, 1.3 g in the suspension; lowest corner 2.5 m up mid-roll; a backflip in the same time takes 3.9x the twist as a box, 4.8x with the weight in the floor

Car size
4.0 x 1.9 x 1.25 m     off: roof down at 1.01 s, 9.9 m/s (35.7 km/h), 26.0 g as the roof crushes. on: roll done by 0.72 s, braking from 7.0 m/s at 2.0 g, wheels down at 1.33 s, 1.5 g in the suspension; lowest corner 2.5 m up mid-roll; a backflip in the same time takes 3.4x the twist as a box, 4.4x with the weight in the floor
4.7 x 2.1 x 1.1 m      off: roof down at 1.01 s, 9.9 m/s (35.7 km/h), 26.0 g as the roof crushes. on: roll done by 0.72 s, braking from 7.0 m/s at 2.0 g, wheels down at 1.33 s, 1.5 g in the suspension; lowest corner 2.5 m up mid-roll; a backflip in the same time takes 4.1x the twist as a box, 5.0x with the weight in the floor
3.9 x 2.1 x 1.3 m      off: roof down at 1.01 s, 9.9 m/s (35.7 km/h), 26.0 g as the roof crushes. on: roll done by 0.72 s, braking from 7.0 m/s at 2.0 g, wheels down at 1.33 s, 1.5 g in the suspension; lowest corner 2.5 m up mid-roll; a backflip in the same time takes 2.8x the twist as a box, 3.4x with the weight in the floor
```

## What the reel uses

- Roof down with no thrusters: 1.01 s after letting go, at 35.7 km/h, and
  26.0 g as the roof crushes 0.2 m.
- Roll done by 0.72 s, when the braking has to start; 2.0 g while the jets
  brake; wheels down at 1.33 s; 1.5 g in the suspension.
- The instruments in each panel read the same model on every frame: the
  force on the car (what an accelerometer in it reads: 1 g held on the ramp
  or parked, 0 g falling), the most it has felt, the gap under it, how fast
  it is falling and how far it has turned over.
- A backflip in the same time: 3.9 times the twist as a solid box, 4.8 with
  the weight in the floor (caption: about 4 times).

Tesla published no drop height, size, weight, thrust or crush, so each is
an assumption swept above. The roll has to be done in 0.56 s from 3 m and in
0.91 s from 8 m. The roof's force is 1 + drop / crush: 11 g with 0.5 m of
crush and 51 g with 0.1 m, against at most 4 g with the jets at any setting
tried. The car's weight cancels out of every figure. The fan's 2 g is
Tesla's figure; the car reads 1 g on the ramp whatever the fan pulls, as
long as it pulls more than 1 g.
