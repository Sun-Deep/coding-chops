# Measurements

`node --experimental-strip-types scripts/measure-zipper.mjs`, run twice on
2026-10-09, identical output both times. It imports the reel's own
`simulation.ts`. Seeded: Apple M5 Pro, macOS 26.5.1, Node 22.14.0.

```text
2000 cars an hour arrive, half in each lane; one through the cones every 2.25 s (1600 an hour); 25% of the ending lane stay in it when the rest move over early; zipper drivers switch lanes if the other is 2 cars shorter

seed 1, the car the reel follows: #109, the first to arrive in the ending lane after 180 s who moves over early; and #111, the first after it who stays
  early  you: queue lane 0, lost 77.0 s, through at 304.2 s; cars that arrived after you and got through first 5; #111: lost 2.2 s, through at 232.2 s
  zipper you: queue lane 1, lost 63.5 s, through at 290.7 s; cars that arrived after you and got through first 0; #111: lost 69.7 s, through at 299.7 s
  queue at 180 s: early 86 m, zipper 37 m
  queue at 240 s: early 211 m, zipper 99 m
  queue at 300 s: early 253 m, zipper 113 m

20 seeds each, cars arriving from 2 to 10 minutes, early -> zipper
defaults                   lost per car: polite early 111.0 s, the same drivers zipper 95.0 s, stayers 1.8 s; everyone 98.8 -> 95.2 s; passed by later cars 7.1 -> 0.5; through in 10 min 245.05 -> 245.05
0% stay                    lost per car: polite early 95.2 s, the same drivers zipper 95.2 s, stayers - s; everyone 95.2 -> 95.2 s; passed by later cars 0.0 -> 0.5; through in 10 min 245.05 -> 245.05
10% stay                   lost per car: polite early 100.9 s, the same drivers zipper 95.2 s, stayers 1.3 s; everyone 96.8 -> 95.2 s; passed by later cars 2.5 -> 0.5; through in 10 min 245.05 -> 245.05
40% stay                   lost per car: polite early 125.0 s, the same drivers zipper 95.4 s, stayers 3.1 s; everyone 101.9 -> 95.2 s; passed by later cars 13.3 -> 0.5; through in 10 min 245.05 -> 245.05
50% stay                   lost per car: polite early 135.9 s, the same drivers zipper 95.3 s, stayers 5.0 s; everyone 104.0 -> 95.2 s; passed by later cars 18.4 -> 0.5; through in 10 min 245.05 -> 245.05
1800 cars an hour          lost per car: polite early 61.3 s, the same drivers zipper 53.5 s, stayers 1.8 s; everyone 54.6 -> 53.6 s; passed by later cars 3.5 -> 0.4; through in 10 min 243.05 -> 243.05
2400 cars an hour          lost per car: polite early 222.3 s, the same drivers zipper 182.9 s, stayers 2.2 s; everyone 197.3 -> 183.5 s; passed by later cars 17.6 -> 0.5; through in 10 min 246.1 -> 246.1
one every 2 s              lost per car: polite early 55.7 s, the same drivers zipper 48.6 s, stayers 1.5 s; everyone 49.6 -> 48.7 s; passed by later cars 3.5 -> 0.5; through in 10 min 273.4 -> 273.4
one every 2.6 s            lost per car: polite early 196.6 s, the same drivers zipper 163.7 s, stayers 2.4 s; everyone 174.8 -> 164.0 s; passed by later cars 12.7 -> 0.5; through in 10 min 212.75 -> 212.75
switch if 1 shorter        lost per car: polite early 111.0 s, the same drivers zipper 95.0 s, stayers 1.8 s; everyone 98.8 -> 95.2 s; passed by later cars 7.1 -> 0.2; through in 10 min 245.05 -> 245.05
switch if 4 shorter        lost per car: polite early 111.0 s, the same drivers zipper 95.0 s, stayers 1.8 s; everyone 98.8 -> 95.2 s; passed by later cars 7.1 -> 1.0; through in 10 min 245.05 -> 245.05

(free run from appearing to the cones: 45 s; "lost" is time past that)
```

## What the reel uses

- The followed car, #109: lost 1:17 merging early, 1:04 with the zipper;
  5 later cars got through before it merging early, 0 with the zipper.
- The first car after it that stays in the ending lane, #111: lost 2.2 s.
- The distance to the cones and the "got past you" count are read live off
  the same run.

## How the model got here

The first version let the car-following model decide how fast cars got
through the cones. Pulling away from a stop line took longer when two cars
waited side by side, so the zipper came out with less capacity than the
single queue, an artefact of how starting from rest was modelled rather
than anything about merging. The cones are now a fixed capacity, the order
is decided by turn about, and the drawn motion follows that order.

The second version had zipper drivers keep to the lane they arrived in. The
two queues drifted apart by chance, and round-robin then let cars in the
shorter one overtake: the followed car came out 11 seconds worse off with
the zipper. Real drivers drift to the shorter lane, so they now switch when
the other is 2 or more cars shorter. Switching at 1 or 4 gives the same
averages.

"Everyone" is slightly worse merging early (98.8 against 95.2 s): the
average of cars arriving in a window, not a change in how many get through.
