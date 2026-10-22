# Measurements

Output of `node --experimental-strip-types scripts/measure-roundabout.mjs`,
run twice on 2026-10-21 with identical output.

```text
One junction of two single-lane roads, 450/450/450/450 cars an hour on the four arms, 20% turning left and 15% right. Lights: two phases, actuated (green 8 to 32 s, gives up green when no car is within 30 m), amber 3.5 s, all-red 1.5 s, a left-turn lane on each arm, lefts wait for a 4.5 s gap in oncoming traffic. Roundabout: single lane, a driver goes when the next car coming round is at least 3.25 s from the merge and 1.5 s behind the driver getting there. "Through in" is seconds from appearing 150 m out to leaving 150 m out on the other side; "still" is seconds standing still; delay is time lost against driving the same way through alone. 20 seeded hours per line, after 5 minutes of warm-up.

Calibration
lights: cars leave a standing queue every 2.00 s (1800 an hour a lane; HCM base saturation flow 1,900)
roundabout: with nothing going round, a queue goes in every 2.35 s (HCM 6 follow-up headway: 2.61)
roundabout entry capacity, cars an hour, against the flow actually going round:
   315 going round: model 1115, HCM 6 1000
   653 going round: model 698, HCM 6 707
   960 going round: model 387, HCM 6 516

Defaults
defaults                 lights: through in 37.4 s, still 6.9 s, delay 14.3 s, 58% stop | roundabout: through in 32.4 s, still 1.0 s, delay 6.1 s, 21% stop | 1798 cars

Traffic, cars an hour on every arm
30 each                  lights: through in 25.0 s, still 0.8 s, delay 1.9 s, 12% stop | roundabout: through in 26.6 s, still 0.0 s, delay 0.2 s, 0% stop | 118 cars
60 each                  lights: through in 26.7 s, still 1.4 s, delay 3.6 s, 22% stop | roundabout: through in 26.7 s, still 0.0 s, delay 0.4 s, 1% stop | 244 cars
150 each                 lights: through in 30.1 s, still 2.7 s, delay 7.0 s, 41% stop | roundabout: through in 27.4 s, still 0.1 s, delay 1.1 s, 2% stop | 600 cars
300 each                 lights: through in 33.3 s, still 4.1 s, delay 10.1 s, 51% stop | roundabout: through in 29.1 s, still 0.3 s, delay 2.8 s, 8% stop | 1203 cars
525 each                 lights: through in 42.6 s, still 11.0 s, delay 19.5 s, 63% stop | roundabout: through in 36.2 s, still 2.0 s, delay 9.9 s, 33% stop | 2099 cars
600 each                 lights: through in 64.4 s, still 25.4 s, delay 41.3 s, 75% stop | roundabout: through in 46.6 s, still 4.6 s, delay 20.3 s, 52% stop | 2397 cars
650 each                 lights: through in 157.2 s, still 49.3 s, delay 134.1 s, 88% stop | roundabout: through in 74.5 s, still 9.6 s, delay 48.1 s, 73% stop | 2601 cars

A busy main road and a quiet side road
main 600, side 100       lights: through in 33.8 s, still 4.3 s, delay 10.6 s, 46% stop | roundabout: through in 29.9 s, still 0.3 s, delay 3.6 s, 8% stop | 1397 cars
main 700, side 150       lights: through in 36.2 s, still 5.8 s, delay 13.1 s, 50% stop | roundabout: through in 31.6 s, still 0.5 s, delay 5.2 s, 12% stop | 1694 cars
main 800, side 200       lights: through in 40.9 s, still 8.8 s, delay 17.8 s, 56% stop | roundabout: through in 34.8 s, still 1.0 s, delay 8.5 s, 20% stop | 1990 cars

Turning
40% left                 lights: through in 40.0 s, still 8.7 s, delay 16.4 s, 61% stop | roundabout: through in 35.8 s, still 2.0 s, delay 8.9 s, 32% stop | 1798 cars
no turns                 lights: through in 36.1 s, still 5.5 s, delay 13.7 s, 53% stop | roundabout: through in 31.8 s, still 0.8 s, delay 5.6 s, 18% stop | 1798 cars

Roundabout: seconds to spare drivers want at the merge
1 s                      lights: through in 37.4 s, still 6.9 s, delay 14.3 s, 58% stop | roundabout: through in 32.2 s, still 0.9 s, delay 5.9 s, 20% stop | 1798 cars
2 s                      lights: through in 37.4 s, still 6.9 s, delay 14.3 s, 58% stop | roundabout: through in 32.8 s, still 1.2 s, delay 6.5 s, 23% stop | 1798 cars
2.5 s                    lights: through in 37.4 s, still 6.9 s, delay 14.3 s, 58% stop | roundabout: through in 33.5 s, still 1.5 s, delay 7.2 s, 27% stop | 1798 cars

Lights
fixed time, 25 s greens  lights: through in 42.3 s, still 11.3 s, delay 19.1 s, 62% stop | roundabout: through in 32.4 s, still 1.0 s, delay 6.1 s, 21% stop | 1798 cars
max green 45 s           lights: through in 37.4 s, still 6.8 s, delay 14.2 s, 58% stop | roundabout: through in 32.4 s, still 1.0 s, delay 6.1 s, 21% stop | 1798 cars
gives up green at 15 m   lights: through in 39.2 s, still 7.8 s, delay 16.0 s, 66% stop | roundabout: through in 32.4 s, still 1.0 s, delay 6.1 s, 21% stop | 1798 cars
```
